import { countTimeDown } from "@utils/index";
import { STORAGE_USER_FOR_KEY } from "@const/index"
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
      '0': '好运爆棚，祝贺您抽中$name。您需要购买下方任一【氧吧产品】即可获得奖品哦～',
      '1': '好运爆棚，祝贺您抽中$name。您需要',
      '2': '您已成功购买氧吧产品，1-3个工作日联系您为您邮寄奖品，请耐心等待。',
      '3': '好运爆棚，祝贺您抽中$name。1-3个工作日联系您为您邮寄奖品，请耐心等待。',
      '4': '平台已邮寄奖品，请耐心等待快递包裹。',
      '5': '兑奖已完成，如有疑问请联系平台客服处理。',
      '6': '太遗憾了，您未在规定时间内兑奖，奖品已失效。',
      '7': '已作废' // 已作废 读取后台作废原因
    },
    classMap: {
      '1': 'donghua',
      '2': 'donghua',
      '3': 'big-margin donghua',
      '6': 'big-margin',
      '7': 'big-margin'
    },
    imgMap: {
      '1': 'ddj',
      '2': 'ddj',
      '3': 'ddj',
      '4': 'djz',
      '5': 'ydj',
      '6': 'ysx',
      '7': 'ysx'
    },
    nickname: '',
    tips: ''
  },
  pageLifetimes:{
    show() {
      // 页面被展示
      this.setInfo()
    }
  },
  ready() {
    this.setInfo()
    this.setName()
  },
  _timer: null,
  methods: {
    // 获取文本宽度
    getTextWidth(text, fontStyle) {
      // 创建一个离屏画布，用于测量文本宽度
      const offscreenCanvas = wx.createOffscreenCanvas({type: '2d'});
      // 获取画布的上下文
      const context = offscreenCanvas.getContext('2d');
      // 设置字体风格
      context.font = fontStyle;
      // 测量文本宽度（单位为px）
      const textWidth = context.measureText(text).width;
      // 返回文本宽度（单位为rpx）
      return textWidth;
    },
    // 获取用户昵称, 超出后中间显示省略号
    setName() {
      const font = '40px FZYANS_CUJW, PingFangSC, Microsoft YaHei, Arial, sans-serif'
      const user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
      let nickname = user.nickName || user.nickname || user.mobile || '' //客户昵称
      let nameWidth = this.getTextWidth(nickname, font)
      if (nameWidth<= 300) {
        this.setData({nickname: nickname})
        return
      }
      let startName = '', endName = ''
      for (let index = 1; index < nickname.length; index++) {
        let startStr = nickname.substring(0, index)
        let startStrWidth = this.getTextWidth(startStr, font)
        if (startStrWidth >= 200 && !startName) {   
          startName = startStr
        }
        let endStr = nickname.substring(nickname.length - index, nickname.length)
        let endStrWidth = this.getTextWidth(endStr, font)
        if (endStrWidth >= 40 && !endName) {
          endName = endStr
        }
      }
      this.setData({nickname: startName + '...' + endName})
    },
    setInfo () {
      // claimStatus说明
      // 待兑奖: 1 奖品伴侣待购买(有奖品伴侣待购买待兑奖)、2奖品伴侣待发货(有奖品伴侣待发货待兑奖)、3待兑奖(无奖品伴侣待发货待兑奖);
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
      this.setTips()
    },
    setTips() {
      const { prizeInfoData, timeObj, statusPressMap } = this.data
      let tips
      if (prizeInfoData.claimStatus === 7) {
        tips = prizeInfoData.cancelReason
      } else {
        let key = prizeInfoData.claimStatus == 1 && timeObj.day != '00' ? 0 : prizeInfoData.claimStatus
        tips = statusPressMap[key||0].replace('$name', prizeInfoData.rafflePrizeName)
      }
      this.setData({tips})
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
    // 查看奖品说明
    prizeDes() {
      const id = this.data.prizeInfoData.rafflePrizeId
      wx.navigateTo({
        url: `/pages/obh/myPrize/prizeDes/index?prizeId=${id}&tab=1`,
      })
    },
  }
})
