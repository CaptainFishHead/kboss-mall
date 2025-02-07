// plugin/components/live-goods-card.js
import {getRoomProductList} from "../../../../models/live"
import {IRoomProduct} from "../../../../models/types/live"
import {EVENT as TLS_EVENT} from '../../../../utils/tls'
import { SCENE_TYPE, track,TrackEventName } from "@utils/sa";

// 直播商品卡片
Component({
	externalClasses: ['class'],
	properties: {
		productList: {
			type: Object,
			value: <IRoomProduct[]>[],
			observer: function (newVal: any) {
				let product = newVal.find((item: IRoomProduct) => item.isExplain === 1)
				product && this.setData({product})
				if (product) {
					this.setData({product})
					// 讲解商品增加一次曝光
					track(TrackEventName.Sdk_CommodityEposure, {
						detail_id: wx.$tls.liveId,
						spu_id: product.spuId,
						sku_id: product.skuId,
						commodity_name: product.spuName,
						sceneType: SCENE_TYPE.LIVE
					})
				}
			}
		},
		btnText: {
			type: String,
			value: '去购买'
		}
	},

	data: {
		product: <IRoomProduct>{}
	},

	lifetimes: {
		ready() {
			if (wx.$tls) {
				this.onMessageEvent()
			} else {
				wx.$bus.on(TLS_EVENT.SDK_READY, () => {
					this.onMessageEvent()
				})
			}
		},
		detached() {
		}
	},
	methods: {
		onMessageEvent() {
			// 讲解商品
			wx.$tls.on(TLS_EVENT.START_EXPLAIN, this.onGoodsSpeak.bind(this))
			// 结束讲解
			wx.$tls.on(TLS_EVENT.FINISH_EXPLAIN, this.onGoodsSpeakEnd.bind(this))
			// 商品置顶
			wx.$tls.on(TLS_EVENT.OPEN_TOP, this.onGoodsOpenTop.bind(this))
			// 取消商品置顶
			wx.$tls.on(TLS_EVENT.CLOSE_TOP, this.onGoodsCloseTop.bind(this))
		},
		btnHandler() {
			track(TrackEventName.Sdk_Live_ReadCard, {
				detail_id: wx.$tls.liveId,
				sku_id: this.data.product.skuId,
				spu_id: this.data.product.spuId,
				commodity_name: this.data.product.spuName,
				sceneType: SCENE_TYPE.LIVE
			});
			track(TrackEventName.Sdk_ShopperCommodity, {
				detail_id: wx.$tls.liveId,
				sku_id: this.data.product.skuId,
				spu_id: this.data.product.spuId,
				commodity_name: this.data.product.spuName,
				sceneType: SCENE_TYPE.LIVE
			});
			const {spuId,skuId} = this.data.product
			this.triggerEvent('go-buy', {
				// payload: { spuId: this.data.product.spuId, skuId:'' }, key:'pack', next:true
				payload: {spuId, skuId}, key: 'sku', next: true
			})
		},
		onGoodsOpenTop({data}: any) {
			let spuId = data.extInfo.detailId
			if (spuId === this.data.product.spuId) {
				this.setData({product: {...this.data.product, isTop: 1}})
			}
		},
		onGoodsCloseTop({data}: any) {
			let spuId = data.extInfo.detailId
			if (spuId === this.data.product.spuId) {
				this.setData({product: {...this.data.product, isTop: 0}})
			}
		},
		onGoodsSpeakEnd() {
			this.setData({product: {} as IRoomProduct})
		},
		onGoodsSpeak({data}: any) {
			// let spuId = data.extInfo.detailId
			let goodInfo = data.extInfo.info
			this.setData({
				product: {
					isExplain: 1, isHidden: 0, natureVal: '', recordId: '', roomId: '', ruleVal: '', skuName: '', stockNum: 0,
					spuName: goodInfo.name,
					spuId: goodInfo.spuId,
					skuId: goodInfo.skuId,
					isTop: goodInfo.isTop,
					serialNo: goodInfo.serialNo,
					sort: goodInfo.sort,
					spuImgUrl: goodInfo.url,
					skuPrice: goodInfo.price
				}
			})
			// 讲解商品增加一次曝光
			track(TrackEventName.Sdk_CommodityEposure, {
				detail_id: wx.$tls.liveId,
				spu_id: goodInfo.spuId,
				sku_id: goodInfo.skuId,
				commodity_name: goodInfo.name,
				sceneType: SCENE_TYPE.LIVE
			})
		},
		async loadProduct(spuId: string) {
			// 直接根据商品id获取商品详情 或者直接查询直播商品列表，根据id筛选出讲解商品 isExplain
			let roomProduct = this.data.productList.find((item: IRoomProduct) => item.spuId === spuId) // 直播间商品详情
			this.setData({product: roomProduct})
		},
		async getRoomProductList(spuId: string) {
			const {result} = await getRoomProductList({roomId: wx.$tls.liveId})
			let product = result.find((item: IRoomProduct) => item.spuId === spuId)
			this.setData({product})
		},
	}
})
