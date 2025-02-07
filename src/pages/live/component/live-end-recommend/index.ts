
import { SOURCE } from '@const/index'
import { formatCountdown } from '../../utils/index'
import { liveRecommendList } from "../../models/live"
import { IRoomInfo } from "../../models/types/live";

// 直播提醒卡片
Component({
  options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
    properties: {
      roomId: {
        type: String,
        value: ''
      }
    },
    data: {
      countdown: 0,
      countdownText: '',
      timer: 0,
      liveInfo: <IRoomInfo>{
        startTimePlan: ''
      }
    },
    lifetimes: {
      ready() {
        this.getList()
      }
    },
    methods: {
      btnHandler(e: any) {
        wx.showToast({
          title: '暂不支持消息订阅',
          icon: 'none',
          duration: 2000
        })
      },
      getList() {
        liveRecommendList({livingStatus: 2, platformRoomId: this.data.roomId}).then(res => {
          let liveInfo = res.result[0] || {startTimePlan: ''}
          this.setData({liveInfo})
          this.changeInfo(liveInfo)

        })
      },
      changeInfo (newVal: any) {
        let time = new Date().valueOf()
        let startTime = new Date(newVal.startTimePlan.replaceAll('-', '/')).valueOf()
        if (newVal.liveState != 0) {
          this.setData({countdownText: '已开播'})
        } else {
          if (time >= startTime) {
            this.setData({countdownText: '0分钟后开播'})
          } else {
            this.setData({countdown: startTime - time}, () => {
              this.start()
            })
          }
        }
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
      joinRoom() {
        // app.reset()
        // const detailId = this.data.liveInfo.roomId
        // app.setData({sceneId: '0', sceneType: SCENE_TYPE.LIVE, detailId, shareId: '0'})
        const platformRoomId = this.data.liveInfo.platformRoomId
        wx.navigateTo({
          url: `/pages/live/player/index?roomId=${platformRoomId}&source=${SOURCE.BH_MALL}&targetId=${platformRoomId}&position=live`
        })
      }
    }
  })
