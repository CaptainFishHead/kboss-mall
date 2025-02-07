Component({
  properties: {
    orderPayInfo: {
      type: Object,
      value: {
        orderBeanPrice: 0, // 康豆总优惠金额
        orderCouponPrice: 0, // 优惠券总优惠金额
        orderDiscountPrice: 0, // 总优惠金额（活动+抵扣）
        orderPayPrice: 0, // 实付总价
        orderPostagePrice: 0, // 总邮费
        orderProductPrice: 0, // 商品总价（无优惠）
      }
    },
    orderCouponInfo: {
      type: Object,
      value: {
        couponUsedStatus: 1,//优惠券使用状态 1:没有优惠券 2:无可用优惠券 3:已使用优惠 4:不使用优惠券
        usedCouponList: [],//已使用优惠券集合
        orderCouponPriceFormat: 0, //总优惠券金额-格式化
        availableList: [],//可用优惠券集合
        unavailableList: [],//不可用优惠券集合
      }
    },
    orderBeanInfo: {
      type: Object,
      value: {
        orderBeanPrice: 0, // 康豆总优惠
        orderBeans: 0, //康豆数量 弹窗展示时候使用
      }
    },
    orderPayPrice: {//需付款-格式化
      type: Number,
      value: 0
    },
    type: {
      type: Number,
      value: 0
    },
    productList: {
      type: Array,
      value: []
    },
    systemInfo: {
      type: Object,
      value: {}
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {
    beanVisbale: false,
    beanFlagVal: 1,//是否使用康豆-单选val 0 否 1 是
    sortSkuActivityList: []
  },
  methods: {
    /**显示优惠券列表弹层*/
    showCouponList() {
      const {availableList, unavailableList, usedCouponList, couponUsedStatus} = this.data.orderCouponInfo;
      const couponIdList = usedCouponList.map((item) => item.promotionId)
      availableList.forEach((coupon) => {
        if (couponIdList.includes(coupon.id)) {
          coupon.isChecked = true;
        } else {
          coupon.isChecked = false
        }
      })
      this.selectComponent("#couponComponents").showOrderCouponList({
        availableList,
        unavailableList,
        couponUsedStatus,
        productList: this.data.productList
      })
      this.triggerEvent('showCouponDialog')
    },
    /** 关闭优惠券列表弹层 用来处理预下单页面浏览输入框错位问题*/
    closeCouponDialog(){
      this.triggerEvent('closeCouponDialog')
    },
    /**确定选择优惠券*/
    async checkedCoupon(e) {
      const {availableCouponList, productList} = e.detail
      await this.updateCoupon(availableCouponList)
      await this.triggerEvent('checkedcoupon', {sortSkuActivityList: this.data.sortSkuActivityList, productList})
      await this.selectComponent("#couponComponents").close()
    },
    updateCoupon(availableCouponList) {
      //activityType 活动类型 0 默认 1 秒杀 2 商品活动 3优惠券
      //usedCouponList 每次查询订单商品使用优惠券的商品数据集合
      // couponFree 如果更新了优惠券选则项每次查询预下单接口后 couponFree传1 未更新传0
      // sortSkuActivityList 使用优惠券的sku商品集合
      const checkedCouponIdList = []
      const sortSkuActivityList = [];
      const orderGoodsMaps = {}
      const {orderCouponInfo: {usedCouponList}, productList} = this.data
      productList.forEach(item => {
        if (orderGoodsMaps[item.spuId]) {
          orderGoodsMaps[item.spuId].push(item)
        } else {
          orderGoodsMaps[item.spuId] = [item]
        }
      })
      //判断优惠券勾选是否 取消 新增 替换 availableCouponList 有可能全部没有选中
      availableCouponList.forEach(item => {
        if (item.isChecked) {
          checkedCouponIdList.push(item.id)
          if (orderGoodsMaps[item.spuId]) {
            let updateGoodsCoupon = orderGoodsMaps[item.spuId].find(item => {
              return item.promotionType === 3 && item.promotionId
            })
            if (updateGoodsCoupon) {
              sortSkuActivityList.push({
                promotionId: item.id,
                promotionType: 3,
                spuId: updateGoodsCoupon.spuId,
                moneyLimit: item.moneyLimit
              })
            } else {
              sortSkuActivityList.push({
                promotionId: item.id,
                promotionType: 3,
                spuId: orderGoodsMaps[item.spuId][0].spuId,
                moneyLimit: item.moneyLimit
              })
            }
          }
        }
      })
      this.setData({sortSkuActivityList})
    },
    /** show康豆抵扣弹窗*/
    selectBean() {
      this.setData({beanVisbale: true})
    },
    /** 确认是否使用康豆抵扣金额*/
    handleDeduction() {
      this.setData({beanVisbale: false})
      this.triggerEvent('handlededuction', {beanFlag: this.data.beanFlagVal})
    },
    /** 选择是否使用康豆抵扣金额*/
    handleUseBeans(e) {
      const beanFlagVal = e.currentTarget.dataset.flag
      this.setData({beanFlagVal})
    },
    closeBeanDialog() {
      this.setData({beanFlagVal: this.data.orderBeanInfo.beanFlag})
    },
    
  }
})
