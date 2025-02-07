
Component({
  data: {
    reasonForUnavailabMaps: {
      1: '不在可用时间范围内',
      2: '该商品规格单价未达到使用门槛',
      3: 'used',
      4: 'overdue',
      5: '该优惠券仅新用户可用'
    },
  },
  properties: {
    voucher: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: 0
    },
    scene: { //场景值-必传 1：商品详情页 2：订单确认页 3：优惠券列表 4：历史优惠券
      type: String,
      value: ''
    },
  },
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true,
  },
  methods: {
    onTap() {
      const { voucher, index } = this.data
      this.triggerEvent('tapCurItem', { voucher, index })
    },
    //show 使用规则 
    onShowUseRule(e) {
      const { voucher, index } = this.data
      this.triggerEvent('showCurCouponRule', { voucher, index })
    }
  }
})