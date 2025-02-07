import { TOAST_TYPE, PRODUCT_TYPE } from "../../../../const/index"
import '../../../../utils/dateFormat';
import {hideToast, showToast} from "../../../../components/toast/index";
import {track, TrackEventName} from "../../../../utils/sa";
import {authorizePushTemp} from "../../../../models/messageModel";
import confirm from "../../behaviors/confirm";
import order from "../../behaviors/order";

Component({
  behaviors: [confirm, order],
  data: {},
  properties: {
    orderInfo: {
      type: Object,
      value: {}
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  methods: {

    // 立即支付
    orderPayHandle(){
      const {orderCode, orderPayPrice, channelName} = this.data.orderInfo;
      this.wxPayHandle({orderCode, price: orderPayPrice, channelName});
    },
    // 提醒发货
    handleRemind () {
      const {storeList} = this.data.orderInfo;
      this.onReShipment({orderCode: storeList[0].storeOrderCode});
    },

     // 确认收货
    onReceipt(){
      const {storeList} = this.data.orderInfo;
      this.onConfirmReceipt({orderCode: storeList[0].storeOrderCode})
      .then(() => {
        this.triggerEvent('refresh');
      }).finally(() => {
        this.closeConfirmReceipt()
      })
    },
   
    // 查看物流
    onLogistics(){
      const {storeList} = this.data.orderInfo;
      this.toLogistics(storeList[0].storeOrderCode)
    },

    // 再次购买
    handleAgain() {
      const {storeList, orderAttribute} = this.data.orderInfo;
      let type = 1;
      const cartList = storeList[0].skuList.map(item => {
        type = item.spuAttribute;
        return {
          skuId: item.skuId,
          skuNum: item.skuNum
        }
      })
      this.onBuyAgain({skuList: cartList, type }).catch(res => {
        this.handleDelete();
      })
    },
    // 删除订单
    handleShowTips(){
      this.showTipsDialog('确认要删除订单？')
    },

    /**详情页客服埋点*/
    onService() {
      track(TrackEventName.Boss_CustomerService, {customer_service_type: '售后在线客服'});
    },

    /**去卡包*/
    goCardPackage() {
      wx.navigateTo({url: '/pages/coupon/index'})
    },
    handleService(){
      wx.navigateTo({url: '/pages/services/index'})
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
})
