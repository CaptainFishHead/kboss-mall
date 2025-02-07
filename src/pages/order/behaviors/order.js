import { orderRemind, cancelOrder, confirmReceipt, deleteOrder } from "../../../models/orderModel";
import {cartAdd,findPreBuyOrder} from "@models/newCartModel";
import {showToast, hideToast} from "../../../components/toast/index";
import { wxFuncToPromise } from "../../../utils/wxUtils";
import { ORDER_SOURCE_PAGE, PRODUCT_TYPE, TOAST_TYPE } from "../../../const/index";
import env from "../../../config/env";
export default Behavior({
  data: {},
  methods: {

    // 逆向订单查看物流
    toReverseLogistics(orderCode) {
      wx.navigateTo({
        url: `/pages/afterSale/orderTrack/orderTrack?storeOrderCode=${orderCode}`
      })
    },
    
    // 正向订单查看物流
    toLogistics(orderCode) {
      wx.navigateTo({
        url: `/pages/order/logistics/index?storeOrderCode=${orderCode}`
      })
    },

    /**
     * 提醒发货
     * @param orderCode 订单编码
     */
    onReShipment({orderCode}) {
      orderRemind({
        orderCode
      }).then(({
        msg
      }) => {
        showToast({
          title: msg || '已提醒',
          type: TOAST_TYPE.SUCCESS
        })
      })
    },

    // 打开取消原因列表弹窗
    showCancelReason() {
      this.selectComponent("#cancelReason").show();
    },
    // 关闭取消原因列表弹窗
    closeCancelReason() {
      this.selectComponent("#cancelReason").close();
    },
    /**
     * 取消订单
     * @param orderCode 订单编码
     * @param cancelRemark 取消原因
     */
    onCancelOrder({orderCode, cancelRemark}) {
      return new Promise((resolve, reject) => {
        cancelOrder({
          orderCode,
          cancelRemark
        }).then((res) => {
          showToast({
            title: '取消成功',
            type: TOAST_TYPE.SUCCESS
          })
          resolve(res);
        }).catch((err) => {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
          reject(err)
        })
      })
    },

    // 打开确认收货弹窗
    showConfirmReceipt(){
      this.selectComponent('#receiptDialog').show();
    },
    // 打开确认收货弹窗
    closeConfirmReceipt(){
      this.selectComponent('#receiptDialog').close();
    },
    /**
     * 确认收货
     * @param orderCode 订单编码
     */
    onConfirmReceipt({orderCode}) {
      return new Promise((resolve, reject) => {
        confirmReceipt({
          orderCode
        }).then((res) => {
          showToast({
            title: '收货成功',
            type: TOAST_TYPE.SUCCESS
          })
          resolve(res)
        }).catch((err) => {
          reject(err)
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
      })
    },

    // 打开提示弹窗
    showTipsDialog(txt){
      this.selectComponent('#tipsDialog').show(txt);
    },
    // 关闭提示弹窗
    closeTipsDialog(){
      this.selectComponent('#tipsDialog').close();
    },
    /**
     * 删除订单
     * @param orderCode 订单编码
     */
    onDelOrder({orderCode}){
      return new Promise((resolve, reject) => {
        deleteOrder({
          orderCode
        }).then(res => {
          showToast({
            title: '已删除',
            type: TOAST_TYPE.SUCCESS
          })
          resolve(res)
        }).catch((err) => {
          reject(err)
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
      })
    },

    /**
     * 再次购买
     * @param type 商品类型
     * @param skuList 商品列表
     */
    onBuyAgain({type, skuList }){
      return new Promise((resolve, reject) => {
        if (type === PRODUCT_TYPE.VIRTUAL) { //虚拟订单
          findPreBuyOrder({
            type, skuList
          }).then(({result}) => {
            wxFuncToPromise(`navigateTo`, {url: `/pages/order/confirm/index`})
            .then(({eventChannel}) => {
              eventChannel.emit(`products`, {
                skuList,
                type: ORDER_SOURCE_PAGE.PRODUCT
              })
            })
          }).catch((err) => {
            showToast({
              title: err.msg || '暂无信息',
              type: TOAST_TYPE.WARNING
            })
          })
          
        } else { //实体品-直接加购
          showToast({type: TOAST_TYPE.LOADING})
          cartAdd({cartList: skuList}).then((res) => {
            hideToast().then(() => {
              if(res.msg) {
                showToast({
                  title: res.msg || '暂无信息',
                  type: TOAST_TYPE.WARNING
                })
                setTimeout(() => {
                  wx.navigateTo({url: '/pages/cart/index'})
                }, 2000)
              } else {
                wx.navigateTo({url: '/pages/cart/index'})
              }
              resolve();
            }).catch((err) => {
              console.log(4444, err)
            })
          })
          .catch((err) => {
            showToast({
              title: err.msg || '暂无信息',
              type: TOAST_TYPE.WARNING
            })
            if (String(err.code) === '-4024') {
              setTimeout(() => {
                reject();
              }, 2000)
            }
          })
        }
      })
    },

    /**
     * 打开售后记录弹窗
     * @param orderCode 商家订单号
     * @param skuList sku列表,
     * @param title 弹窗标题
     */
    showAfterRecord({orderCode, skuList, title}){
      this.selectComponent('#afterRecord').show({orderCode, skuList, title});
    }




  }
})