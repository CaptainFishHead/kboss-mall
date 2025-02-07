import confirm from "../../behaviors/confirm";
import order from "../../behaviors/order";

Component({
  behaviors: [confirm, order],
  properties: {
    orderInfo: {
      type: Object,
      value: {}
    },
    storeType: {
			type: String,
			value: ''
		}
  },
  options: {
    styleIsolation: 'apply-shared'
  },

  methods: {
    // 跳转详情
    toDetails () {
      const {orderCode} = this.data.orderInfo;
      wx.navigateTo({
        url: `detail/index?orderCode=${orderCode}&storeType=${this.data.storeType}`,
      })
    },

    // 查看物流
    onLogistics() {
      const {orderCode} = this.data.orderInfo;
      this.toLogistics(orderCode);
    },

    // 继续支付
    orderPayHandle(){
      const {orderCode, orderPayPrice} = this.data.orderInfo;
      this.wxPayHandle({orderCode, price: orderPayPrice});
    },

    // 提醒发货
    handleRemind () {
      const {orderCode} = this.data.orderInfo;
      this.onReShipment({orderCode});
    },

    //订单取消
    cancelOrder({detail}){
      const {reasonVal} = detail;
      const {orderCode} = this.data.orderInfo;
      this.onCancelOrder({
          orderCode,
          cancelRemark: reasonVal
      }).then(() => {
        this.triggerEvent('refresh');
      }).finally(() => {
        this.closeCancelReason();
      })
    },

    // 确认收货
    onReceipt(){
      const {orderCode} = this.data.orderInfo;
      this.onConfirmReceipt({orderCode})
      .then(() => {
        this.triggerEvent('refresh');
      }).finally(() => {
        this.closeConfirmReceipt()
      })
    },

    // 删除订单
    handleShowTips(){
      this.showTipsDialog('确认要删除订单？')
    },
    handleDelete() {
      this.onDelOrder({
        orderCode: this.data.orderInfo.orderCode
      }).then(() => {
        this.triggerEvent('refresh');
      })
    },
    
    // 再次购买
    handleAgain() {
      const {skuList, orderAttribute} = this.data.orderInfo;
      const cartList = skuList.map(item => ({
        skuId: item.skuId,
        skuNum: item.skuNum
      }))
      this.onBuyAgain({skuList: cartList, type: orderAttribute}).catch(res => {
        this.handleDelete();
      })
    },
    // 客服
    onService(){
      track(TrackEventName.Boss_CustomerService, {customer_service_type: '售后在线客服'});
    }
  }
})
