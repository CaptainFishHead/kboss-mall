

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text:{
      type:String,
      value:''
    },
    type:{
      type:String,//0.消息，1.购物车,2:地址,3.网络错误,4.订单,5.物流
      value:'0'
    },
    styleStr:{
      type:String,
      value:''
    }
  },
  // 组件生命周期
  lifetimes:{

  },
  /**
   * 组件的初始数据
   */
  data: {
      //0.消息，1.购物车,2:地址,3.网络错误,4.订单,5.物流
    imgLink:{
      "0":`https://static.tojoyshop.com/images/wxapp-obh/error/icon-msg.png?t=${new Date().getTime()}`,
      "1": ` https://static.tojoyshop.com/images/wxapp-obh/error/icon-cart.png?t=${new Date().getTime()}`,
      "2": ` https://static.tojoyshop.com/images/wxapp-obh/error/icon-addr.png?t=${new Date().getTime()}`,
      "3": `https://static.tojoyshop.com/images/wxapp-obh/error/icon-network.png?t=${new Date().getTime()}`,
      "4": `https://static.tojoyshop.com/images/wxapp-obh/error/icon-order.png?t=${new Date().getTime()}`,
      "5": ` https://static.tojoyshop.com/images/wxapp-obh/error/icon-wuliu.png?t=${new Date().getTime()}`,
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
