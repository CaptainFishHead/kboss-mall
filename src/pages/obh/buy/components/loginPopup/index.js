
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    msg: {
      type: String,
      value: '用户状态异常，请点击重新登录。'
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
    onLogin() {
      this.triggerEvent('onLogin')
    },

  }
})
