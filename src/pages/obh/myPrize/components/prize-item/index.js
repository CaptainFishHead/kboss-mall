import { countTimeDown } from "@utils/index";
import { PRIZE_PLAT } from "@const/index";
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    prizeInfo: {
      type: Object,
      value: {},
      observer(val) {
        this.setData({prizeInfoData: val})
        this.setInfo()
      }
    }
  },
  data: {
    prizeInfoData: {},
    platformMap: PRIZE_PLAT,
    statusTextMap: {
      '1': '待兑奖',
      '2': '待兑奖',
      '3': '待兑奖',
      '4': '兑奖中',
      '5': '已兑奖',
      '6': '已失效',
      '7': '已失效'
    },
    colorMap: {
      '1': 'danger',
      '2': 'danger',
      '3': 'danger',
      '4': 'default',
      '5': 'close',
      '6': 'close',
      '7': 'close'
    },
    colorMap2: {
      '1': 'default',
      '2': 'default',
      '3': 'default',
      '4': 'default',
      '5': 'default',
      '6': 'close',
      '7': 'close'
    },
    timeObj: {day: '', hours: '00', minutes: '00', seconds: '00'}
  },
  pageLifetimes:{
    show() {
      // this.setData({prizeInfoData: this.data.prizeInfo})
      // 页面被展示
      this.setInfo()
    }
  },
  lifetimes: {
    ready () {
      // this.setData({prizeInfoData: this.data.prizeInfo})
      this.setInfo()
    },
  },
  _timer: null,
  methods: {
    setInfo () {
      // claimStatus说明
      // 待兑奖: 1 奖品伴侣待购买、2奖品伴侣待收货、3待兑奖;
      // 兑奖中: 4 兑奖中、
      // 已兑奖: 5 已兑奖、
      // 过期: 6 已过期、7已作废
      const { prizeInfoData } = this.data
      if (this._timer) {
        clearInterval(this._timer)
      }
      if (prizeInfoData.claimStatus === 1) {
        this.setTime()
        this._timer = setInterval(() => this.setTime(), 1000)
      }
    },
    setTime() {
      const { prizeInfoData } = this.data
      const seconds = (new Date(prizeInfoData.failureDateTime).getTime() - new Date().getTime()) / 1000
      if (seconds <= 0) {
        clearInterval(this._timer)
        this._timer = null
        prizeInfoData.claimStatus = 6
        this.setData({prizeInfoData: { ...prizeInfoData }})
        this.setData({timeObj: {day: '-1', hours: '00', minutes: '00', seconds: '00'}})
      } else {
        this.setData({timeObj: countTimeDown(seconds)})
      }
    },
    toDetails () {
      const id = this.data.prizeInfoData.id
      wx.navigateTo({
        url: `detail/index?prizeLogId=${id}`,
      })
    }
  }
})
