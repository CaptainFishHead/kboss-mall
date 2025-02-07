Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPopup: {
      type: Boolean,
      value: false,
    },
    //html方式渲染
    tipTxt: {
      type: String,
      value: '',
    },
    tipTxtStyle: {
      type: String,
      value: '',
    },
    //title
    title: {
      type: String,
      value: '',
    },
    btnCancelText: {
      type: String,
      value: '取消',
    },
    btnConfirmText: {
      type: String,
      value: '确认',
    },
    //true：showCancel false或不传：alert
    showCancel: {
      type: Boolean,
      value: true,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    callback() {
      this.triggerEvent("callBack")
    },
    cancelFuc() {
      this.triggerEvent("cancelHandler")
    }
  }
})