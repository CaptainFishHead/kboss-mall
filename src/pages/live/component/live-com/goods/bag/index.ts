import {findCarCount} from "@models/newCartModel"
import {PageContainer} from "../../../../models/types/common"
import {IRoomProduct} from "../../../../models/types/live"
import {SCENE_TYPE, track, TrackEventName} from "@utils/sa"
import {EVENT as TLS_EVENT} from '../../../../utils/tls'
import { getRoomProductList } from "../../../../models/live"

// 直播购物袋
Component({
	externalClasses: ['class'],
	properties: {
		productList: {
			type: Object,
			value: <IRoomProduct[]>[],
			observer: function (newVal: any) {
				this.setData({productList: newVal})
			}
		},
		style: String,
		activeId: String,
		prefix: {type: String, value: 'product_card_'}
	},
	options: {virtualHost: true},
	data: {
		bagModel: false,
		cartCount: 0,
		starttime: 0
	},
	lifetimes: {
		created() {
			this.setData({starttime: new Date().valueOf()})
			this.getCartCount()
		},
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
			if (wx.$tls) {
				track(TrackEventName.Sdk_Live_ShopperDetail, {
					detail_id: wx.$tls.liveId,
					starttime: this.data.starttime,
					endtime: new Date().valueOf(),
					sceneType: SCENE_TYPE.LIVE
				});
			}
		}
	},
	methods: {
		onMessageEvent() {
			// 讲解商品
			wx.$tls.on(TLS_EVENT.START_EXPLAIN, this.getRoomProductList.bind(this))
			// 结束讲解
			wx.$tls.on(TLS_EVENT.FINISH_EXPLAIN, this.getRoomProductList.bind(this))
			// 商品置顶
			wx.$tls.on(TLS_EVENT.OPEN_TOP, this.getRoomProductList.bind(this))
			// 取消商品置顶
			wx.$tls.on(TLS_EVENT.CLOSE_TOP, this.getRoomProductList.bind(this))
		},
		showBag() {
			this.setData({bagModel: true})
		},
		hideBag() {
			this.triggerEvent('close')
		},
		toCart() {
			// pageToTojoyPage({url: `/pages/plugins/cart/index`, pluginUrl: '/pages/cart/index'})
			this.triggerEvent('go-cart')
		},
		toOrder() {
			// pageToTojoyPage({url: `/pages/order/index`})
			this.triggerEvent('go-order')
		},
		nextAction(e: { detail: PageContainer }) {
			const {skuId: sku_id = '', spuId: spu_id, spuName: commodity_name = ''} = e.detail.payload || {}
			track(TrackEventName.Sdk_ShopperCommodity, {
				detail_id: wx.$tls.liveId,
				sku_id, spu_id, commodity_name,
				sceneType: SCENE_TYPE.LIVE
			})
			this.triggerEvent('go-buy', e.detail)
		},
		async getCartCount() {
			const {result} = await findCarCount({})
			this.setData({cartCount: result.count})
		},
		async getRoomProductList() {
			const {result} = await getRoomProductList({roomId: wx.$tls.liveId})
			let productList: IRoomProduct[] = result.filter(item => item.isHidden === 0)
			this.setData({productList})
		},
		createGoodsObserver({detail}: any) {
			this.createIntersectionObserver({}).relativeTo('.bag-goods', {bottom: -130}).observe(`.o_${detail.spuId}`, (res) => {
				// console.log(detail.spuId, res.intersectionRatio, res.intersectionRect)
				if (res.intersectionRatio > 0) {
					track(TrackEventName.Sdk_CommodityEposure, {
						detail_id: wx.$tls.liveId,
						spu_id: detail.spuId, sku_id: detail.skuId, commodity_name: detail.spuName,
						sceneType: SCENE_TYPE.LIVE
					});
				}
			})
		}
	}
})
