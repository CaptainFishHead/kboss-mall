import {PRODUCT_PARAMS_MAP, SOURCE} from "../../../const/index";
import {getEnterOptions, parseQuery} from "../../../utils/index";
import {queryPidByDirectSupplyShareId, queryPidByShareId} from "../../../models/commissionModel";

const app = getApp()
const tripartite = Behavior({
	data: {
		// 订单附加参数（三方、来源）
		additionalParams: {
			// shareUniId->distributionId
			// roomLiveId（固定，如直播间则带此id，为空时值为“”）
			// member_userId（固定，等于加密老板云用户userid）；
			// source=laobanyunmp（固定，小程序端）；
			// skipScene（运营配置，取位置代码12……）；1.1老板云APP访问康老板：banner位（1）、金刚区（2）、push推送（3）、开屏（4）、信息流（5）、直播间（6）、直播预告页（7），外部投放（8）跳转到康老板小程序
		},
		//埋点参数（浏览页面）
		pointParamsDetail: {
			// source: undefined, //来源
			starttime: undefined, //访问时间
			endtime: undefined, //退出时间
			cycle_time: undefined, //时间周期
		},
	},
	methods: {
		// 来源是否是码小宝，老板帮 或者 直供分佣
		isSourceShareCode(options) {
			// 参数：shareUniId和s来源老板帮
			const {
				scene = '', shareUniId: _shareUniId, s: _s,
			} = options
			const _scene = decodeURIComponent(scene)
			const queryStr = scene.startsWith('uid=') ? _scene : `uid=${_scene}`
			const shareUniId = _shareUniId || parseQuery('uid', queryStr)
			// 参数s为来源
			const source = _s || parseQuery('s', queryStr)
			if ([SOURCE.CODE_XIAO_BAO, SOURCE.BH_MALL].includes(source) && shareUniId) {
				const {additionalParams, pointParamsDetail} = this.data
				this.setData({
					additionalParams: {...additionalParams, distributionId: shareUniId, channelName: source},
					pointParamsDetail: {...pointParamsDetail}
				})
				return {shareUniId, source}
			}
			return false
		},
		// 老板云订单来源初始化
		bossCloudOrderSourceInitialization() {
			const {additionalParams, pointParamsDetail} = this.data
			// 老板云附加参数处理，用于提交订单
			if (SOURCE.BOSS_CLOUD.includes(this.data.additionalParams.source)) {
				const {roomLiveId, source, skipScene, tjid: distributionId} = additionalParams
				this.setData({
					additionalParams: {
						...additionalParams, distributionId,
						channelId: roomLiveId, channelName: `${source}${skipScene ? '_' + skipScene : ''}`
					},
					pointParamsDetail: {...pointParamsDetail}
				})
			}
		},
		// 返回商品详情页商品查询参数
		async initializeProductQueryParameters(options) {
			const {id, pid, skuId, scene = ''} = options
			const {extra, marketExtra} = app.globalData
			const product = {}
			try {
				return await this.initializeProductQueryParametersV2(options)
			} catch (e) {
				if (marketExtra && (id || skuId)) {
					const {channelName, channelId, hotelId, pageId, source} = marketExtra
					const {pointParamsDetail} = this.data
					this.setData({
						additionalParams: {channelName, channelId},
						pointParamsDetail: {...pointParamsDetail, hotelId, pageId, source}
					})
					return {id, skuId}
				}

				const shareCode = this.isSourceShareCode(options)

				// 小程序自己的(排除老板帮和老板云)
				if ((id || skuId || scene) && !shareCode.shareUniId) {
					product.id = id || scene
					product.skuId = skuId
					return product
				}
				// 老板云
				if (SOURCE.BOSS_CLOUD.includes(extra.source)) {
					this.setData({
						additionalParams: extra || {}
					})
					product.id = pid || extra.pid || extra.id
				} else if (shareCode.shareUniId && shareCode.source === SOURCE.BH_MALL) {
					// 直供分享
					const {result} = await queryPidByDirectSupplyShareId({shareId: shareCode.shareUniId})
					product.id = result.spuId
					product.skuId = result.skuId
				} else if (shareCode.shareUniId && shareCode.source === SOURCE.CODE_XIAO_BAO) {
					// 码小宝 获取商品id
					const {result: {statistics: {goodsId}}} = await queryPidByShareId({shareUniId: shareCode.shareUniId})
					product.id = goodsId
				}

				this.bossCloudOrderSourceInitialization()
			}

			return product
		},
		// v2
		/**
		 * source,position,targetId,shareId
		 * scene:preview=*&shareId=*&id=*
		 * params = {id, pid, skuId,preview,source,position,targetId,ssid}
		 * @returns {Promise<{preview}|*>}
		 * @param options
		 */
		async initializeProductQueryParametersV2(options) {
      const {id,spuId} = options
			const query = await getEnterOptions({ ...options,id:spuId||id }, PRODUCT_PARAMS_MAP)
			if (query.skuId === 'none') {
				delete query.skuId
			}
			const additionalParams = {
				// 分佣
				distributionId: query.ssid,
				// 订单来源
				channelName: query.source
			}
			if (query.position) {
				// 订单来源 + 运营位
				additionalParams.channelName += `_${query.position}`
			}
			if (query.targetId) {
				// 订单目标渠道
				additionalParams.channelId = query.targetId
			}
			this.setData({additionalParams})
			return query
			// if (query.preview) {
			// 	// 预览
			// 	return query
			// } else if (query.mid) {
			// 	// // TODO:在参数长度受限的情况处理方案
			// 	const result = await queryBdsNeedsParamsByMid({mid: query.mid, source: query.source, type: 'product'})
			// 	const temp = parameterMergeMapping(
			// 		Object.assign({}, query, result),
			// 		{...BASE_COMMON_PARAMS, ...PRODUCT_PARAMS_MAP}
			// 	)
			// 	this.updateAdditionalParams(query)
			// 	return query
			// } else if (query.id || query.skuId) {
			// 	this.updateAdditionalParams(query)
			// 	return query
			// }
			// return Promise.reject()
		},
		// 订单来源提交处理
		// updateAdditionalParams(arg = {}) {
		// 	let query = {...arg}
		// 	if (!query.source && !query.position && !query.targetId) {
		// 		query = getEnterOptions(BASE_COMMON_PARAMS)
		// 	}
		// 	const additionalParams = {
		// 		// 分佣
		// 		distributionId: query.ssid,
		// 		// 订单来源
		// 		channelName: query.source
		// 	}
		// 	if (query.position) {
		// 		// 订单来源 + 运营位
		// 		additionalParams.channelName += `_${query.position}`
		// 	}
		// 	if (query.targetId) {
		// 		// 订单目标渠道
		// 		additionalParams.channelId = query.targetId
		// 	}
		// 	this.setData({additionalParams})
		// }
	}
})
export default tripartite