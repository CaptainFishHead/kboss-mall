// pages/obh/promotion/components/checkinPopup/index.ts
import { unixToDate } from '@utils/index'

Component({
  /**
   * 组件的属性列表
   */
  properties: {

    visible: {
      type: Boolean,
      value: false,

      observer(val) {
        if (val) this.init()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [],
    weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    currentIndex: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    changeIndex(e) {
      this.setData({
        currentIndex: e.currentTarget.dataset.index
      })
    },


    close() {
      this.triggerEvent('close')
    },

    onCheckin() {
      let { currentIndex, list } = this.data
      this.triggerEvent('onCheckin', {index: currentIndex})
    },

    init() {
      let { weekDays } = this.data
      let timestamp = new Date().getTime()
      let tomorrow = unixToDate(timestamp + 86400000, 'MM月dd日')
      let acquired = unixToDate(timestamp + 86400000 * 2, 'MM月dd日')
      let threeDays = unixToDate(timestamp + 86400000 * 3, 'MM月dd日')
      this.setData({
        list: [{title: '住1晚', des: `明天离店（${tomorrow}${weekDays[new Date(timestamp + 86400000).getDay()]}）`, timestamp: timestamp + 86400000}
        , {title: '住2晚', des: `后天离店（${acquired}${weekDays[new Date(timestamp + 86400000 * 2).getDay()]}）`, timestamp: timestamp + 86400000 * 2}
        , {title: '住3晚', des: `大后天离店（${threeDays}${weekDays[new Date(timestamp + 86400000 * 3).getDay()]}）`, timestamp: timestamp + 86400000 * 3}],
        currentIndex: 0
      })

    }
  },


  lifetimes: {
  }
})
