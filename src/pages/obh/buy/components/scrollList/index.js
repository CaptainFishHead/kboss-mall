// 弹幕滚动组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 滚动数据
    data: {
      type: Array,
      value: [],
      observer(val) {
        this.setData({list: val})
      }
    },
    // 滚动速度，50像素每秒
    speed: {
      type: Number,
      value: 50
    },
    // 延迟
    delay: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [],
    show1: true,
    show2: false,
    timer: null,
    onceTime: 20,
    playState: 'paused'
  },

  /**
   * 组件的方法列表
   */
  methods: {

    init() {

    }
  },


  lifetimes: {
    attached() {
      if (this.data.timer) clearInterval(this.data.timer)
      setTimeout(() => {
        var query = this.createSelectorQuery();
        query.select('.wrap1').boundingClientRect( rect => {
          let systemInfo = wx.getSystemInfoSync()
          let onceTime = (rect.width + systemInfo.windowWidth) / this.data.speed
          let onceScreenTime = systemInfo.windowWidth / this.data.speed
          this.setData({onceTime})
          this.setData({playState: 'running'})
          let timer = setInterval(() => {
              let key1 = this.data.show1 ? 'show1' : 'show2'
              let key2 = this.data.show1 ? 'show2' : 'show1'
              this.setData({[key2]: true})
              setTimeout(() => this.setData({[key1]: false}), onceScreenTime * 1000)
          }, (onceTime - onceScreenTime) * 1000)
          this.setData({timer})
        }).exec()
      }, this.data.delay * 1000)
    },
  }
})
