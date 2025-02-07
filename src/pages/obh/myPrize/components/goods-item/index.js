import { checkShare, getPrizeProductPath } from "../../../models/myPrize"
import { TOAST_TYPE } from "@const/index";
import { hideToast, showToast } from "@components/toast/index";
// import {moneyFormat} from "@utils/index";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 中奖记录详情
    prizeInfo: {
      type:Object,
      value:{}
    },
    // 商品详情
    goodsInfo:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // PRODUCT_TYPE
    showCheck: false,
    buttons: [
      {
        type:'cancel',
        text: '取消'
      },{
      extClass: {border: 'none'},
      text: '先看看商品'
    }],
    errMsg: '您还未达成分享要求，购买该商品后无法获得奖品，请知悉'
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  pageLifetimes:{
    show() {
      // 页面被展示
    }
  },
  lifetimes: {
    ready () {
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击弹窗操作按钮
    buttontap(e) {
      this.setData({ showCheck: false })
      if(e.detail.index === 1) { // 点击去看商品
        this.toProdInfo()
      }
    },
    // 点击商品卡片
    checkShareFn(){
      const {goodsInfo, prizeInfo} = this.data
      if(goodsInfo.shareFlag === 1) {
        // 需要分享的商品 校验是否达成分享条件
        checkShare({raffleUserLogId: prizeInfo.id}).then(res => {
          // 已达成 跳转商品详情
          this.toProdInfo()
        }).catch(err => {
          if(err.code===400) {
            // 未达成 弹窗提示
            this.setData({ errMsg: err.msg })
            this.setData({ showCheck: true })
          } else {
            // 其他错误
            // showToast({
            //   title: err.msg,
            //   type: TOAST_TYPE.WARNING
            // })
          }
        })
      } else {
        // 不需要达成分享条件的商品 直接跳转商品详情
        this.toProdInfo()
      }
    },
    //去商品详情
    toProdInfo () {
      const {goodsInfo, prizeInfo} = this.data
      getPrizeProductPath({raffleUserLogId: prizeInfo.id, spuId: goodsInfo.productId}).then(({result}) => {
        wx.navigateTo({ 
          url: `${result.innerPath}&page_id=${prizeInfo.rafflePrizeId}&page_name=${prizeInfo.rafflePrizeName}&hotel_id=${prizeInfo.hotelId}&hotel_name=${prizeInfo.hotelName}&activity_id=${prizeInfo.activityId}&activity_name=${prizeInfo.activityName}`
          // &deviceId=${prizeInfo.deviceId}
        })
      })
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
})
