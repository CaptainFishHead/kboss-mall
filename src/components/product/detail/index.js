import {queryProductById, querySuitById, queryLiveListBySpu, queryVideoBySpu} from "../../../models/productModel";
import { PRODUCT_TYPE, TOAST_TYPE, SOURCE,CHARGEOFF_TYPE } from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import {wxFuncToPromise} from "../../../utils/wxUtils";
import { htmlToWxml, checkHistoryOpenedPage } from "@utils/index"
import {track, TrackEventName} from "../../../utils/sa";

Component({
	data: {
		product: {},
		productImages: [],
		skuList: [],
		isReal: true,
		productliveState: [],
		productVideo: {}
	},
	properties: {
		extClass: {
			type: String,
			value: ''
		},
		sku: {
			type: Object,
			value: {}
		},
		totalPrice: {
			type: String,
			value: ''
		},
		isPage: {
			type: Boolean,
			value: false
		},
		isSuit: {
			type: Boolean,
			value: false
		},
		pointParamsBase: {
			type: Object,
			value: {}
		},
		pointParamsSubmit: {
			type: Object,
			value: {}
		},
		isLogged: {
			type: Boolean,
			value: false
		},
		isWarpGoods: {
			type: Boolean,
			value: false
		}
	},
	ready() {
		//计算图片高度
		wxFuncToPromise('getSystemInfo').then(({windowWidth: picHeight}) => this.setData({picHeight}))
	},
	options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
	methods: {
		//获取详情 单品
		getProduct(params) {
			const {skuId, isRefresh = true, action} = params
			showToast({type: TOAST_TYPE.LOADING})
			return queryProductById(params)
				.then(async ({result}) => {
					result.content = htmlToWxml(result.content) //富文本图片自适应
					const attribute = result.attribute //是否虚拟商品
					const chargeOffType = (result.virtualData&&result.virtualData.chargeOffType)||'' //虚拟商品-核销方式
					const subSkuDtoList = (result.combinationData && result.combinationData.subSkuList)||[] // 子商品列表
					let skuList = []
					//spuKind 1：组合商品、2：单品
					//--- 默认选中的sku
					let _sku = null
					if (result.spuKind===1){ //组合品
						 skuList = [{...result.combinationData,spuKind:result.spuKind,id:result.combinationData.skuId,imgurl:result.combinationData.imageUrl}]
						_sku = result.combinationData
					}else{
						 skuList = result.skuList.map(item=>({...item,id:item.skuId,imgurl:item.imageList[0].source})) // 规格列表
						if (skuId) { //指定sku进入商详
							_sku = skuList.find(item => item.skuId === skuId)
							const nextSku = skuList.find(item=>{
								return item.stockNums >0 || item.stockNums>=item.sinceMin
							})
							//如果当前sku库存不足顺延展示下一sku
							if ((_sku&&(_sku.stockNums <= 0||_sku.stockNums < _sku.sinceMin))|| !_sku ){
								_sku = nextSku||_sku
							}
						} else { //spu进入商详
							_sku = skuList.find(item => item.stockNums && item.stockNums>=item.sinceMin)||skuList[0]
						}
					}
					const sku = {..._sku,id:_sku.skuId}
					let productImages = result.imageList
					if (result.videoUrl) {
						productImages = [
							{
								...productImages[0],
								id: '0',
								videoUrl: result.videoUrl
							},
							...productImages
						]
						this.setData({productImages})
						this.selectComponent("#productSwiper").createVideo() //swiper组件 视频初始化
					}

					const pointParamsBase = {
						...this.data.pointParamsBase,
						spu_id: result.spuId,
						sku_id: sku.skuId,
						product_type: result.spuKind === 1 ? '组合品' : '单品',
						commodity_id: result.code||'',
						commodity_name: result.name,
						commodity_type: attribute === PRODUCT_TYPE.REAL ? '真实' : '虚拟',
						commodity_Typ: CHARGEOFF_TYPE[chargeOffType]||'',
						first_commodity: result.firstCategoryName,
						second_commodity: result.secondCategoryName,
						store_id: result.sellStoreId,
						store_name: result.sellStoreName,
						sku_price:sku.sellPrice
					}
					const pointParamsSubmit = {
						...this.data.pointParamsSubmit,
						commodity_specification: sku.ruleVal && sku.natureVal && (sku.ruleVal + ' ' + sku.natureVal),
					}
					const newData = {
						product:{...result,id:result.spuId} ,
						subSkuDtoList,
						productImages,
						skuList,
						sku,
						isReal: attribute === PRODUCT_TYPE.REAL,
						pointParamsBase,
						pointParamsSubmit,
						isRefresh, //是否重新加载详情
						action, //进入详情页后触发的动作
					}
					this.getEntryInfo(result.spuId)
					this.setData(newData)
					this.triggerEvent('success', newData)
					hideToast()
				})
				.catch((err) => {
					console.error(err, '商品信息获取失败')
					if (err && err.msg) {
						showToast({
							title: err.msg || '商品信息获取失败',
							type: TOAST_TYPE.WARNING
						})
						if (err.code !== 402) {
							this.triggerEvent('empty', {})
						}
					} else {
						const errData = {
							showEmpty: true,
							errMsg: err && err.msg ? err.msg : ''
						}
						this.triggerEvent('error', errData)
						hideToast()
					}
				})
		},
		//获取详情 随心配
		getSuit(params) {
			showToast({type: TOAST_TYPE.LOADING})
			querySuitById(params)
				.then(async ({result}) => {
					if (!result.id) {
						this.triggerEvent('success', {product: result})
						hideToast()
						return false
					}
					result.content = htmlToWxml(result.content) //富文本图片自适应
					const subSkuDtoList = result.subSkuDtoList //子商品列表

					//--- productImages
					let productImages = result.omsProductImages
					if (result.videoUrl) {
						productImages = [
							{
								...productImages[0],
								id: '0',
								videoUrl: result.videoUrl
							},
							...productImages
						]
						this.setData({productImages})
						this.selectComponent("#productSwiper").createVideo() //swiper组件 视频初始化
					}

					const pointParamsBase = {
						...this.data.pointParamsBase,
						spu_id: result.id,
						commodity_name: result.name,
						first_commodity: result.firstCategoryName,
						second_commodity: result.secondCategoryName,
						store_id: result.sellStoreId,
						store_name: result.sellStoreName
					}
					const newData = {
						product: result,
						productImages,
						subSkuDtoList,
						pointParamsBase
					}
					this.setData(newData)
					this.triggerEvent('success', newData)
					hideToast()
				})
				.catch((err) => {
					console.error(err, '商品信息获取失败')
					if (err && err.msg) {
						showToast({
							title: err.msg || '商品信息获取失败',
							type: TOAST_TYPE.WARNING
						})
						if (err.code !== 402) {
							this.triggerEvent('empty', {})
						}
					} else {
						const errData = {
							showEmpty: true,
							errMsg: err && err.msg ? err.msg : ''
						}
						this.triggerEvent('error', errData)
						hideToast()
					}
				})
		},
		richTextTap() {
			wx.createSelectorQuery()
				.selectAll('.class_img')
				.fields({rect: true})
				.exec(res => {
					console.log(res)
				})
		},
		// 获取讲解视频和直播入口信息
		getEntryInfo(spuId) {
			// 获取该商品直播状态
      queryLiveListBySpu({ spuId }).then(data => {
        this.setData({ productliveState: data.result })
      })
      // 获取该商品讲解视频
      queryVideoBySpu({ spuId }).then(data => {
        this.setData({ productVideo: data.result })
      })
		},
		// 进入直播间
		onJoinRoom() {
			// const [live] = this.data.productliveState.sort((live1, live2) => live2.querySource - live1.querySource)
			const live = this.data.productliveState[this.data.productliveState.length - 1]
			const url = `/pages/live/player/index?roomId=${live.roomId}&source=${SOURCE.BH_MALL}&targetId=${live.roomId}&position=live&page_id=${this.data.product.id}&page_name=${this.data.product.name}`
			const zIndex = checkHistoryOpenedPage(`pages/live/player/index`, { roomId: live.roomId })
			if (zIndex === 0) {
				wx.reLaunch({ url: `/pages/index/index?redirect=${encodeURIComponent(url)}` })
			} else {
				wx.navigateBack({ delta: zIndex })
			}
		},
		// 进入讲解中视频
		onJoinVideo() {
			track(TrackEventName.Boss_LiveExplanation, {
        commodity_name: this.data.product.name, commodity_id: this.data.product.id
      })
			wx.navigateTo({ url: `/pages/product/explanVideo/index?spuId=${this.data.product.id}&page_id=${this.data.product.id}&page_name=${this.data.product.name}` })
		},
		onVideoPause(){
			this.selectComponent("#productSwiper").videoOpreation('pause')
		}
	}
});
