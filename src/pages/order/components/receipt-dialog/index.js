// pages/order/components/receipt-dialog/index.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    // 是否弹出确认收货提醒弹窗
    visible: false,
    receiptBtns: [
      {text: '未收货', extClass: 'cancel', type: '0'},
      {text: '已收货', extClass: 'ok', type: '1'},
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 打开提示弹窗
    show(){
      this.setData({visible: true})
    },
    // 关闭提示弹窗
    close(){
      this.setData({visible: false})
    },
    receiptDlgHandle({detail}){
      const {index} = detail;
      if(!index) return this.close();
      this.triggerEvent('confirm')
    }
  }
})
