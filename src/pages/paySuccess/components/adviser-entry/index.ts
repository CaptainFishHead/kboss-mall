// pages/paySuccess/components/adviser-entry/index.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    avatar: {
      type: String,
      value: ''
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
    goWaiter(){
      wx.navigateTo({
        url: '/pages/healthArchives/healthWaiter/index?str=1',
      })
    }
  }
})