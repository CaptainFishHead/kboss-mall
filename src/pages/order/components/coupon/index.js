import {
  moneyFormat
} from "../../../../utils/index";

Component({
  properties: {
    systemInfo: {
      type: Object,
      value: {}
    }
  },
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared',
  },
  data: {
    couponVisbale: false,
    currentTab: 0, //当前优惠券tab下标 0可用 1不可用
    tabList: [{
      text: '可用优惠券',
    }, {
      text: '不可用优惠券',
    }],
    couponList: [],
    availableCouponList: [], //可用优惠券列表
    unavailableCouponList: [], //不可用优惠券列表
    usedCouponTotalPrice: 0, //使用优惠券金额
    usedCouponTotalPriceFormat: '0',
    systemInfo: '', //当前设备 iOS/安卓
    couponUsedStatus: 0,
    productList: [],
    isRest: false 
  },
  lifetimes: {
    attached() {
      const that = this;
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            systemInfo: res
          });
        }
      })
    }
  },
  methods: {
    //切换优惠券状态
    tabChange: function (data) {
      const { detail } = data;
      const { availableCouponList, unavailableCouponList } = this.data
      this.setData({
        currentTab: detail.index, // 更新tab下标
        couponList: detail.index === 1 ? unavailableCouponList : availableCouponList,
      })
    },
    //获取优惠券列表
    showOrderCouponList({ availableList, unavailableList, couponUsedStatus, productList }) {
      const _this = this
      this.setData({
        productList: this.filterProduct(productList, availableList),
        couponList: couponUsedStatus === 2 ? unavailableList : availableList,
        availableCouponList: availableList,
        unavailableCouponList: unavailableList,
        'tabList[0].text': `可用优惠券（${availableList.length}）`,
        'tabList[1].text': `不可用优惠券（${unavailableList.length}）`,
        couponVisbale: true,
        currentTab: couponUsedStatus === 2 ? 1 : 0,
        couponUsedStatus,
        isRest: false
      })
      this.calcUsedCouponTotalPrice(availableList)
    },
    // 过滤商品列表中重复的sku
    filterProduct(data, couponList) {
      let result = [];
      const skuList = JSON.parse(JSON.stringify(data));
      // 先过滤有优惠券的商品
      const haveCouponGoods = skuList.filter(item => item.promotionId);
      haveCouponGoods.forEach(item => {
        const coupon = couponList.find(val => item.promotionId === val.id);
              if(coupon) {
                item.couponId = coupon.couponId
                item.couponAmount = coupon.couponAmount
                item.promotionId = coupon.id || ''
                item.promotionType = 3
                result.push(item);
              }
      })
      // 再过滤没有优惠券的商品
      const noCouponGoods = skuList.filter(item => !item.promotionId);
      const isSku = result.map(val => val.skuId)
      noCouponGoods.forEach(item => {
        if (!isSku.includes(item.skuId)) {
          result.push(item);
        }
      })

      return result;
    },
    //勾选优惠券
    onTapCurItem(e) {
      const { index, voucher } = e.detail;
      const { availableCouponList, productList, isRest } = this.data;
      let needResetCouponIndex = -1
      availableCouponList[index].isChecked = !voucher.isChecked;
      if (voucher.isAvailable === 1) {
        if (availableCouponList[index].isChecked) {
          const noCouponSkuList = productList.filter(item => item.spuId === voucher.spuId).filter(item => !item.couponId)

          let needReplace = false
          if (!noCouponSkuList.length) {
            // 全部sku都已经有比配的优惠券了，此时再选择新的优惠券，需要替换一个已经匹配了的sku
            needReplace = true
          } else {
            // 剩余未匹配的sku列表里，没有可以直接匹配的sku {新选优惠券为无门槛 或者 不满足满减条件}
            needReplace = noCouponSkuList.filter(item => voucher.useType === 1 || (voucher.useType === 2 && item.sellPrice >= parseFloat(voucher.moneyLimit))).length == 0;
            // 没有可无法弥补了...
            if (needReplace && isRest) {
              availableCouponList[index].isChecked = false
              this.setData({
                couponList: availableCouponList,
                isRest : false
              })

              this.calcUsedCouponTotalPrice(availableCouponList)

              return
            }
          }

          // 如果新选的优惠券ID和已选的有重复的，则需要把之前匹配了的解除，并匹配新的
          const useSku = productList.filter(item => item.couponId === voucher.couponId)
          if (useSku.length) {
            const firstSku = useSku.find(item => item.couponId === voucher.couponId);
            availableCouponList.forEach(item => {
              if (voucher.couponId == item.couponId) {
                item.isChecked = false;
              }
            })
            firstSku.couponId = voucher.couponId;
            firstSku.couponAmount = voucher.couponAmount;
            firstSku.promotionId = voucher.id || "";
            firstSku.promotionType = 3;
            availableCouponList[index].isChecked = true

          } else {
            
            if (needReplace) {
              // 从已选的优惠券中匹配一个最优的选择（将减免最低的替换掉）
              const skus = productList.filter(item => item.spuId === voucher.spuId);
              const skuSort = skus.sort((a, b) => a.couponAmount - b.couponAmount);
              const firstSku = skuSort.find(item => {
                if (voucher.useType === 1) {
                  return item;
                } else {
                  return item.sellPrice >= parseFloat(voucher.moneyLimit);
                }
              })


              // 将被替换的优惠券的勾选状态恢复
              const replacedCoupon = availableCouponList.find(item => item.id === firstSku.promotionId);
              if (replacedCoupon) replacedCoupon.isChecked = false;

              // 此时替换掉已经匹配好了的券，需要将这个被替换了的重新匹配一下
                if (noCouponSkuList.length) {
                  needResetCouponIndex = availableCouponList.findIndex(item => replacedCoupon.id === item.id)
                  const lastSku = productList.find(item => firstSku.promotionId === item.promotionId)
                  lastSku.couponId = 0
                  lastSku.couponAmount = 0.0
                  lastSku.promotionId = ""
                  lastSku.promotionType = "";
                }
                firstSku.couponId = voucher.couponId
                firstSku.couponAmount = voucher.couponAmount
                firstSku.promotionId = voucher.id || ""
                firstSku.promotionType = 3;
                availableCouponList[index].isChecked = true
            } else {
              if (voucher.useType == 1) { // 无门槛券 选个售价最高的匹配，这样可以尽量多减免些
                const skus = productList.filter(item => item.spuId === voucher.spuId && !item.couponId);
                const maxBy = skus.sort((a, b) => b.sellPrice - a.sellPrice);

                maxBy[0].couponId = voucher.couponId
                maxBy[0].couponAmount = voucher.couponAmount
                maxBy[0].promotionId = voucher.id || ""
                maxBy[0].promotionType = 3;
              } else { // 选出第一个达到门槛标准的sku
                const skus = productList.filter(item => item.spuId === voucher.spuId && !item.couponId);
                const firstSku = skus.find(item => item.sellPrice >= parseFloat(voucher.moneyLimit));
                firstSku.couponId = voucher.couponId
                firstSku.couponAmount = voucher.couponAmount
                firstSku.promotionId = voucher.id || ""
                firstSku.promotionType = 3;
              }
            }
          }
          availableCouponList[index].isChecked = true
        } else {
          const skus = productList.find(item => item.spuId === voucher.spuId && item.couponId === voucher.couponId)
          if (skus) {
            skus.couponId = 0
            skus.couponAmount = 0.0
            skus.promotionId = ""
            skus.promotionType = "";
          }
          availableCouponList[index].isChecked = false
        }

        this.setData({
          productList,
          couponList: availableCouponList,
        })

        this.calcUsedCouponTotalPrice(availableCouponList)


        if (needResetCouponIndex >= 0) {
          this.setData({isRest: true})
          e.detail.index = needResetCouponIndex
          e.detail.voucher = availableCouponList[needResetCouponIndex]
          this.onTapCurItem(e)
        }

      }
    },
    /**计算使用优惠券总价格*/
    calcUsedCouponTotalPrice(couponList) {
      const {productList} = this.data;
      const usedCouponTotalPrice = productList.reduce((total, item) => {
        const coupon = couponList.find(val => item.couponId === val.couponId);
        if(coupon) {
          const price = coupon.useType === 1 && coupon.couponAmount > item.sellPrice ? item.sellPrice : coupon.couponAmount;
          return total = (total * 100 + price * 100) / 100
        }
        return total
      }, 0)
      this.setData({
        usedCouponTotalPrice,
        usedCouponTotalPriceFormat: moneyFormat(usedCouponTotalPrice || 0),
      })
    },
    /**确定选择优惠券*/
    confrimCoupon(e) {
      const {availableCouponList, productList} = this.data;
      this.triggerEvent('success', {
        availableCouponList,
        productList
      })
    },
    //展示优惠券规则
    onShowCurCouponRule(e) {
      const { availableCouponList } = this.data;
      const { index, voucher } = e.detail;
      availableCouponList[index].isShowRule = !voucher.isShowRule
      this.setData({
        couponList: availableCouponList
      })
    },
    close() {
      this.setData({
        couponVisbale: false,
        isRest: false
      })
      this.triggerEvent('close')
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  },

});