import { IRoomInfo } from "../../../models/types/live"
import "@utils/dateFormat"

let timers: number | null = null
const BASR_DATA = new Date(`2023/01/01 00:00:00`).getTime()
const ONE_HOURS = 60 * 60 * 1000
// plugin/components/live/pause/index.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    roomInfo: {
      type: Object,
      value: <IRoomInfo>{},
      observer: function (newVal: any) {
        this.clearCountdown()
        this.countdown(newVal.livePausedTime)
        // if (newVal.livePausedTime) {
        //   let time = new Date().valueOf()
        //   let livePausedTime = Number(newVal.livePausedTime)
        //   this.setData({ timeLength: time - livePausedTime })
        // }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // timeLength: 0, // 暂停时间长度，毫秒
    time: '00:00', // 展示时间
    // timer: <number>0
  },

  lifetimes: {
    // created() {
    //   let timer = setInterval(() => {
    //     this.data.timeLength += 1000
    //     this.setData({ timeLength: this.data.timeLength })
    //     if (this.data.timeLength >= 60 * 60 * 1000) {
    //       this.setData({ time: dateFormat(new Date(this.data.timeLength), 'hh:mm:ss') })
    //     } else {
    //       this.setData({ time: dateFormat(new Date(this.data.timeLength), 'mm:ss') })
    //     }
    //   }, 1000)
    //   this.setData({ timer })
    // },
    // detached() {
    //   clearInterval(this.data.timer)
    // }
  },
  pageLifetimes: {
    show() {
      this.countdown((this.data.roomInfo || {}).livePausedTime)
    },
    hide() {
      this.clearCountdown()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clearCountdown() {
      if (timers) {
        clearTimeout(timers)
        timers = null
      }
    },
    countdown(startTime?: string) {
      if (!startTime && timers) {
        this.clearCountdown()
        return
      }
      const timeDifference = Date.now() - Number(startTime)
      const _format = ['mm', 'ss']
      if (timeDifference > ONE_HOURS) _format.unshift('HH')
      this.setData({
        time: new Date(BASR_DATA + timeDifference).dateFormat(_format.join(':'))
      })
      timers = setTimeout(() => {
        this.countdown(startTime)
      }, 1000)
    }
  }
})
