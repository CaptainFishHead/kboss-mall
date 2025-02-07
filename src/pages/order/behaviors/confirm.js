import { buyOrder, buyWarmDoctorService } from "@models/newCartModel";
import {
  TOAST_TYPE, MESSAGE_TEMPLATE, WX_PAY_CANCEL, SDK_APPLET
} from "../../../const/index";
import { templatePushAuthorization, wxPay } from "../../../utils/wxUtils";
import { hideToast, showToast } from "../../../components/toast/index";
import { authorizePushTemp } from "@models/messageModel";
import { updateOrderPayStatus } from "@models/orderModel";

export default Behavior({
  data: {},
  methods: {
    /** 确认订单 -- 生成订单*/
    orderPayHandle(extra) {
      return new Promise((resolve, reject) => {
        const { type, cardId, addressInfo, orderBeanInfo, orderCouponInfo, skuList, sortSkuList, userMessageList, orderPayInfo, extra, isReal, doctorId, reducibleDateParams, serviceOrderCode} = this.data;
        const {scheduleId, tmBegin, tmEnd} = reducibleDateParams || {};
        const { beanFlag } = orderBeanInfo || {};
        const { couponFree } = orderCouponInfo || {};
        const { addressId } = addressInfo || {};
        if (isReal && !addressId && !doctorId) {
          return showToast({
            title: '请添加收货地址!',
            type: TOAST_TYPE.WARNING
          })
        }
        showToast({type: TOAST_TYPE.LOADING})
        let params = { type, cardId, beanFlag, couponFree, skuList, sortSkuList, userMessageList, ...extra}
        if(isReal) {
          params.addressId = addressId;
        }
        if (cardId) {
          params.cardId = cardId;
          params.skuList = [];
        }
        if (doctorId) Object.assign(params, {doctorId, scheduleId, tmBegin, tmEnd, serviceOrderCode}); // 增加温暖医生下单入参
        buyOrder(params).then(({ result }) => {
          if (type === "3") {
            hideToast()
            wx.setStorageSync('orderType', type);
            wx.redirectTo({ url: `/pages/paySuccess/index` })
          } else {
            let datas = {price: orderPayInfo.orderPayPrice, type, ...extra };
            if (params.doctorId ) { // 温暖医生支付参数
              datas.orderCode = result.tradeCode;
              datas.serviceOrderCode = result.serviceOrderCode;
            } else {
              datas.orderCode = result;
            }
            this.wxPayHandle(datas);
          }
          resolve(result);
        }).catch((err) => {
          //抵扣康豆余额不足
          if (err.code === -8029) {
            hideToast().then(() => {
              this.setData({
                "orderBeanInfo.visibleBalance": true,
                "orderBeanInfo.orderPointCost": 0,
              })
            })
            return
          }
          //校验是否有库存
          if (err.code === -4032) {
            return reject(err);
          }
          showToast({
            title: err.msg || '暂无信息!',
            type: TOAST_TYPE.ERROR
          })
        })
        
      })
    },
    //下单成功后支付处理
    wxPayHandle({ orderCode, price, type, ...params }) {
      showToast({ type: TOAST_TYPE.LOADING })
      wxPay(orderCode)
        .then(() => {
          console.log('下单成功数据', this)
          if (this.data.isReal) {
            // 实体商品授权发货通知
            return templatePushAuthorization([MESSAGE_TEMPLATE.SHIPPING_NOTICE.TEMPLATE_ID])
              .then(() => authorizePushTemp({
                pushType: MESSAGE_TEMPLATE.SHIPPING_NOTICE.TEMPLATE_TYPE, businessCode: orderCode
              }))
              .catch(err => {
                console.error(err)
              })
          }
        })
        .then(async () => {
          await hideToast()
          // wx.setStorageSync('totalAmount', price);
          if(params.serviceOrderCode) wx.setStorageSync('serviceOrderCode', params.serviceOrderCode); // 温暖医生服务单号 用于获取成功页预约详情
          wx.setStorageSync('orderCode', orderCode);
          type && wx.setStorageSync('orderType', type);
          if ((params && params.channelName === SDK_APPLET) && wx.$tls) {
            // 购买商品 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
            this.data.storeList.forEach(store => {
              store.skuList.forEach(producItem => {
                //console.log('~~~~~~购买了商品', product)
                let product = producItem
                // 延迟发送消息，保证在收到消息时获取到最新的下单数据
                setTimeout(() => {
                  wx.$tls.buy({ name: product.spuName, spuId: product.spuId, skuId: product.skuId })
                }, 2500)
              })
            })
          }
          await updateOrderPayStatus({ orderCode: orderCode })
          // 跳转成功页面
          wx.redirectTo({ url: `/pages/paySuccess/index` })
        })
        .catch(({ code, msg }) => {
          console.log(msg, 'catch')
          // wx.removeStorageSync('rewardBean')//清除奖励康豆
          // 取消支付
          if (code === WX_PAY_CANCEL) {
            // 授权通知
            templatePushAuthorization([MESSAGE_TEMPLATE.TO_BE_PAID_NOTICE.TEMPLATE_ID])
              .then(() => {
                return authorizePushTemp({
                  pushType: MESSAGE_TEMPLATE.TO_BE_PAID_NOTICE.TEMPLATE_TYPE, businessCode: orderCode
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

  }
})