// components/recommend/live-tag/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    state: {
      type: Number,
      value: 0, // 直播状态 0未开播 1 直播中 2 直播结束 3直播取消 4 暂停直播
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    stateClass: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
