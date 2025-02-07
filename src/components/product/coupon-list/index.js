import {hideToast, showToast} from "../../../components/toast/index";
import {TOAST_TYPE} from "../../../const/index";
import {queryCouponPopList} from "../../../models/voucherModel";
import { formatDate, formatDateTime, isLogged } from "../../../utils/index";

Component({
  properties: {},
  options: {
    multipleSlots: true,
  },
  data: {
    couponList: [],
    visible: false,
    receiveInfo: {}
  },
  methods: {
    //获取优惠券列表
    getCouponList({spuId,skuId}) {
      const params = {
        spuId,skuId,
        filterUserGroup: 1 //是否过滤客群 1：是 0：否
      }
      showToast({type: TOAST_TYPE.LOADING})
      queryCouponPopList(params)
      .then(({result}) => {
        hideToast().then(() => {
          if (result.couponList.length) {
            result.couponList.forEach(item => {
              item.couponAmount = Number(item.couponAmount)
              item.receiveStatus = item.receiveCount >= item.receiveLimit?1:0
              item.isWrap = Math.trunc(item.moneyLimit).toString().length >= 5
              if (item.timeType === 2) {
                item.startTime = formatDate(Date.now(),'.').dateTimeMM
                item.endTime = formatDate(Date.now() + item.validityDays * 24 * 60 * 60,'.').dateTimeMM
              } else {
                const _startTime = formatDateTime(item.startTime).getTime()
                const _endTime = formatDateTime(item.endTime).getTime()
                item.startTime = formatDate(_startTime, '.').dateTimeMM
                item.endTime = formatDate(_endTime, '.').dateTimeMM
              }
            })
          }
          this.setData({
            couponList: result.couponList,
            visible: true
          })
        })
      })
      .catch((err) => {
        showToast({
          title: err.msg || '列表获取失败',
          type: TOAST_TYPE.WARNING
        })
      })
    },
    //领取优惠券，使用
    onTapCurItem(e) {
      const {index, voucher} = e.detail
      if (isLogged()) {
        this.triggerEvent('tapCurCoupon', {voucher, index})
      } else {
        this.setData({receiveInfo: e.detail})
        this.selectComponent("#authCouponComp").openAuthorize(true)
      }
    },
    //领取优惠券登录后操作
    onReceive() {
      this.triggerEvent('tapCurCoupon', this.data.receiveInfo) // {voucher, index}
    },
    //更新优惠券状态 receiveStatus 0:未领取 1:已领取 2:已抢光
    updateListCouponStatus({index, receiveStatus}) {
      const {couponList} = this.data;
      couponList[index].receiveStatus = receiveStatus;
      if (receiveStatus === 1 && couponList[index].timeType === 2) {
        couponList[index].startTime = formatDate(Date.now()).dateTimeMM
        couponList[index].endTime = formatDate(Date.now() + couponList[index].validityDays * 24 * 60 * 60).dateTimeMM
      }
      this.setData({couponList})
    },
    //展示优惠券规则
    onShowCurCouponRule(e) {
      const {couponList} = this.data;
      const {index, voucher} = e.detail;
      couponList[index].isShowRule = !voucher.isShowRule
      this.setData({couponList})
    },
    close() {
      this.setData({visible: false})
    },
  },
  touchMove() {
    return // 解决蒙层下页面滚动问题
  }
});
