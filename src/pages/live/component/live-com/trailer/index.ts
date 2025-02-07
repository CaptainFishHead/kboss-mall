import { IRoomInfo } from '../../../models/types/live'
import {formatCountdown} from '../../../utils/index'
// 直播前页面 预告
Component({
    properties: {
      roomInfo: {
        type: Object,
        value: <IRoomInfo>{
          startTimePlan: ''
        },
        observer (newVal: any) {
          let time = new Date().valueOf()
          let startTime = new Date(newVal.startTimePlan.replaceAll('-', '/')).valueOf()
          if (newVal.liveState != 0) {
            this.setData({countdownText: '已开播'})
          } else {
            if (time > startTime) {
              this.setData({countdownText: '0分钟后开播'})
            } else {
              this.setData({countdown: startTime - time})
              this.start()
            }
          }
        }
      }
    },
    data: {
      countdown: 0,
      countdownText: '',
      timer: 0,
      statusBarHeight: 0
    },
    lifetimes: {
      ready() {
        wx.getSystemInfo().then((res) => {
          this.setData({
            statusBarHeight: res.statusBarHeight
          })
        })
      }
    },
    methods: {
      btnHandler(e: any) {
        // this.triggerEvent('btntap', e)
        // 小程序暂不支持订阅
        // wx.requestSubscribeMessage({
        //   tmplIds: ['填上选用的模板id'],
        //   success(res) {
        //     console.log("订阅成功", res)
        //   },
        //   fail(err) {
        //     console.log("订阅失败", err)
        //   }
        // })
        wx.showToast({
          title: '暂不支持消息订阅',
          icon: 'none',
          duration: 2000
        })
      },
      start() {
        let dateText = formatCountdown(this.data.countdown)
        this.setData({countdownText: this.data.countdown > 0 ? dateText + '后开播' : '0分钟后开播'})
        if (this.data.timer) clearInterval(this.data.timer)
        this.data.timer = setInterval(() => {
          this.setData({countdown: this.data.countdown - 1000})
          if (this.data.countdown <= 0) {
            this.setData({countdownText: '0分钟后开播'})
            this.setData({countdown: 0})
            clearInterval(this.data.timer)
            this.setData({timer: 0})
          } else {
            let dateText = formatCountdown(this.data.countdown)
            this.setData({countdownText: dateText + '后开播'})
          }
        }, 1000)
        this.setData({timer: this.data.timer})
      },
      videoErrorCallback() {
        wx.showToast({title: '视频播放错误', icon: 'none'})
      }
    }
  })
