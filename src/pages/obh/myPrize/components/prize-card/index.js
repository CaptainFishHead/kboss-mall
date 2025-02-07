import { countTimeDown } from "@utils/index";

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    // 兑奖记录详情
    prizeInfo: {
      type: Object,
      value: {},
      observer(val) {
        this.setData({prizeInfoData: val})
      }
    },
    // 记录类型
    prizeType: {
      type: String,
      value: 'ok' // ing 奖品伴侣待购买， ok 奖品伴侣已购买或者没有奖品伴侣的，banlv 伴侣奖品，timeout 未兑奖的过期奖品
    }
  },
  data: {
    prizeInfoData: {},
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
    setInfo () {},
    // 查看奖品说明
    prizeDes() {
      const id = this.data.prizeInfoData.rafflePrizeId
      wx.navigateTo({
        url: `/pages/obh/myPrize/prizeDes/index?prizeId=${id}&tab=1`,
      })
    },
    // 查看兑奖说明
    prizeIngDes() {
      const id = this.data.prizeInfoData.rafflePrizeId
      wx.navigateTo({
        url: `/pages/obh/myPrize/prizeDes/index?prizeId=${id}&tab=2`,
      })
    },
    // 查看奖品伴侣订单
    viewOrder(){
      const orderCode = this.data.prizeInfoData.orderNo
      wx.navigateTo({
        url: `/pages/order/detail/index?orderCode=${orderCode}`,
      })
    }
  }
})
