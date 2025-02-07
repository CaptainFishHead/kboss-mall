import { countTimeDown } from "@utils/index";

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
    timeObj: {day: '', hours: '00', minutes: '00', seconds: '00'},
    statusPressMap: {
      '0': '成功购买氧吧产品后将舒适安睡和大奖抱回家',
      '1': '成功购买氧吧产品后\n将舒适安睡和大奖抱回家',
      '2': '您已成功购买氧吧产品，已激活奖品权益，1-3个工作日联系您为您邮寄奖品，请耐心等待',
      '3': '1-3个工作日联系您为您邮寄奖品，请耐心等待',
      '4': '平台已邮寄奖品，请耐心等待快递包裹',
      '5': '兑奖已完成，如有疑问请联系平台客服处理',
      '6': '太遗憾了，您未在规定时间内兑奖，奖品权益失效',
      '7': '已作废' // 已作废 读取后台作废原因
    },
    nameMap: {
      '1': '待兑奖',
      '2': '待兑奖',
      '3': '待兑奖',
      '4': '兑奖中',
      '5': '已兑奖',
      '6': '已失效',
      '7': '已失效'
    },
  },
  pageLifetimes:{
    show() {
      // 页面被展示
      this.setInfo()
    }
  },

  ready() {
    this.setInfo()
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
        this.setData({prizeInfoData: {...prizeInfoData}})
        this.setData({timeObj: {day: '00', hours: '00', minutes: '00', seconds: '00'}})
        this.triggerEvent('timeout')
      } else {
        this.setData({timeObj: countTimeDown(seconds)})
      }
    },
  }
})
