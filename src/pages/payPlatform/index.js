import {templatePushAuthorization, wxPay} from "../../utils/wxUtils";
import {
	MESSAGE_TEMPLATE,
	ORDER_COUNT_DOWN,
	PRODUCT_TYPE,
	STORAGE_USER_FOR_KEY,
	TOAST_TYPE,
	WX_PAY_CANCEL,
	orderStatusMap
} from "../../const/index";
import {hideToast, showToast} from "../../components/toast/index";
import {findOrder, updateOrderPayStatus} from "../../models/orderModel";
import {getEnterOptions, moneyFormat} from "../../utils/index";
import '../../utils/dateFormat';
import {authorizePushTemp} from "../../models/messageModel";
import {loginByCodeMap} from "@models/commonModels";
import back from "../../behaviors/back";

Page({
	data: {
		orderInfo: {},
		orderId: '',
		visible: false,
		orderCashPrice: 0,
		countDown: 0,
		orderStatus: 0,
		orderSource: 0,
		payCallback: {},
		orderStatusMap,
		baseTime: new Date("2022/02/06 00:00:00").getTime(),
		startTimer: null,
		appIsChanged: false,
	},
	behaviors:[back],
	onLoad(options) {
    options.source && this.setData({orderSource: options.source})
		getEnterOptions(options)
			.then(this.initialization)
	},
	onShow() {
		if (this.data.appIsChanged) {
			this.findOrderFn()
			this.setData({appIsChanged: false})
		}
	},
	onHide() {
		clearTimeout(this.data.startTimer)
		this.setData({appIsChanged: true})
	},
	async initialization(params) {
		if (!params.orderId && params.code) {
			try {
				const result = await loginByCodeMap({code: params.code, source: params.source, type: 'payment'})
				params = Object.assign({}, params, result || {})
				const {token} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {token: ''}
				if (!token && result.token) {
					// 防止接口响应慢
					wx.setStorageSync(STORAGE_USER_FOR_KEY, {token: result.token})
				}
			} catch (e) {
				showToast({type: TOAST_TYPE.ERROR, title: e.msg || '服务器错误'})
				return null
			}
		}
		this.setData({orderId: params.orderId})
		this.findOrderFn()
	},
	findOrderFn() {
		const params = {
			orderCode: this.data.orderId,
		}
		showToast({type: TOAST_TYPE.LOADING})
		findOrder(params).then(res => {
			hideToast().then(() => {
				this.setData({
					orderCashPrice: moneyFormat(res.result.orderPayPrice),
					orderInfo: res.result || {},
					orderStatus: res.result.orderStatus
				})
				if (res.result.orderStatus === 10 && res.result.orderDate) {
          this.startTimout(res.result.countDown*1000)
				}
			})
		}).catch((err) => {
			if (err && err.msg) {
				showToast({
					title: err.msg || '订单信息获取失败',
					type: TOAST_TYPE.WARNING
				})
			}
		})
	},
  // 订单倒计时
  startTimout(timeLeft) {
    this._timer = setTimeout(() => {
      const countDown = new Date(timeLeft).dateFormat('mm分ss秒')
      wx.nextTick(() => {
        this.setData({countDown})
      })
      timeLeft -= 1000  //时间差 减1000毫秒
      if (timeLeft > 0) {
        this.startTimout(timeLeft)
      } else {
        wx.nextTick(() => {
          this.setData({countDown: 0})
          clearTimeout(this._timer);
          this.triggerEvent('refresh') // 重新加载数据
        })
      }
    }, 1000)
  },
	//下单成功后支付处理
	wxPayHandle() {
		wxPay(this.data.orderId)
			.then(() => {
				if (this.data.orderInfo.productType === PRODUCT_TYPE.REAL) {
					// 实体商品授权发货通知
					return templatePushAuthorization([MESSAGE_TEMPLATE.SHIPPING_NOTICE.TEMPLATE_ID])
						.then(() => authorizePushTemp({
							pushType: MESSAGE_TEMPLATE.SHIPPING_NOTICE.TEMPLATE_TYPE, businessCode: this.data.orderId
						}))
						.catch(err => {
							console.error(err)
						})
				}
			})
			.then(async () => {
				await hideToast()
				const {scene} = wx.getEnterOptionsSync()
				if (scene === 1069) { //sdk进入场景-返回app回调参数
					wx.setStorageSync('sdkPayCallback', JSON.stringify({
						status: '1',
						orderId: this.data.orderId,
						from: 'tjshopsdk'
					}));
					this.setData({payCallback: JSON.stringify({status: '1', orderId: this.data.orderId, from: 'tjshopsdk'})})
				}
				wx.setStorageSync('orderCode', this.data.orderId);
				wx.setStorageSync('source', scene);
				await updateOrderPayStatus({orderCode:this.data.orderId})
				// 跳转成功页面
				wx.reLaunch({
					url: `/pages/paySuccess/index`
				})
			})
			.catch(({code, msg}) => {
				// 取消支付
				if (code === WX_PAY_CANCEL) {
					// 授权通知
					templatePushAuthorization([MESSAGE_TEMPLATE.TO_BE_PAID_NOTICE.TEMPLATE_ID])
						.then(() => {
							return authorizePushTemp({
								pushType: MESSAGE_TEMPLATE.TO_BE_PAID_NOTICE.TEMPLATE_TYPE, businessCode: this.data.orderId
							})
						})
						.finally(async () => {
							await hideToast()
							// 跳转订单列表
							wx.redirectTo({
								url: '/pages/order/index'
							})
						})
				} else {
					showToast({
						title: msg || '支付失败!',
						type: TOAST_TYPE.WARNING
					})
				}
			})
	},
	close() {
		this.setData({visible: false})
	},
	goBackCustomize() {
		const {scene} = wx.getEnterOptionsSync()
		console.log(scene, 'scene')
		// 场景一sdk进入
		if (scene === 1069) {
			this.setData({
				visible: true,
				payCallback: JSON.stringify({status: '3', orderId: this.data.orderId, from: 'tjshopsdk'})
			})
		} else { // 场景二api进入 scene === 1047扫描小程序码 1048图片识别小程序码
			if (this.data.orderStatus === 10) {
				this.restart()
			} else {
				wx.redirectTo({url: '/pages/order/index'})
			}
		}
	},
	launchAppError(e) {
		console.log(e.detail.errMsg);
		this.setData({visible: false})
	},
	toOrderList() {
		// 跳转订单列表
		wx.redirectTo({
			url: '/pages/order/index'
		})
	}
})
