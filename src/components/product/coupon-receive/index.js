import {hideToast, showToast} from "../../../components/toast/index";
import {TOAST_TYPE,STORAGE_USER_FOR_KEY} from "../../../const/index";
import {queryCouponPopList} from "../../../models/voucherModel";
import { isLogged } from "@utils/index";
// import {formatDate} from "../../../utils/index";

Component({
  properties: {
    isLogged: {
      type: Boolean,
      value: isLogged()
    }
  },
  options: {
    multipleSlots: true,
  },
  data: {
    couponList: [],
    visible: false,
    totalCouponAmount: 0,
    spuId: '',
    skuId: ''
  },
  ready() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    // console.log(user)
  },
  methods: {
    //获取优惠券列表
    getDialogCouponList({spuId, isInit,skuId}) {
      if (!skuId) return null
      this.setData({skuId,spuId})
      const params = {
        spuId,skuId,
        filterUserGroup: 1 //是否过滤客群 1：是 0：否
      }
      queryCouponPopList(params)
      .then(({result}) => {
        const couponList = result.couponList
        if (couponList.length) {
          couponList.forEach(item => {
            item.couponAmount = Number(item.couponAmount)
            if (item.timeType === 2) { // 目前不走这里，类型等于2的优惠券 即使领取完毕仍然显示领取之日起多少天内可用
              // item.startTime = formatDate(Date.now(), '.').date
              // item.endTime = formatDate(Date.now() + item.validityDays * 24 * 60 * 60, '.').date
            } else {
              // const _startTime = item.startTime.split(' ')[0].replaceAll('-', '/')
              // const _endTime = item.endTime.split(' ')[0].replaceAll('-', '/')
              item.startTime = item.startTime.split(' ')[0].replaceAll('-', '.')
              item.endTime = item.endTime.split(' ')[0].replaceAll('-', '.')
            }
          })
        }

        //初始化登录后再次查询
        if (isInit && couponList.length) {
          this.setData({
            totalCouponAmount: result.totalCouponAmount,
            couponList: result.couponList,
            visible: isLogged()
          })
          return
        }
        //手动领券后再次查询
        if (!isInit) {
          //登录后一张券都未匹配到
          if (!couponList.length) {
            showToast({
              title: '很抱歉，您不符合领取条件',
              type: TOAST_TYPE.SUCCESS
            })
            this.setData({
              totalCouponAmount: 0,
              couponList: [],
              visible: false
            })
          } else {
            //登陆前与登录后的券不一致提示用户
            if (this.data.totalCouponAmount > result.totalCouponAmount) {
              showToast({
                title: '已为您匹配最佳优惠券',
                type: TOAST_TYPE.SUCCESS
              })
            }
            this.setData({
              totalCouponAmount: result.totalCouponAmount,
              couponList: result.couponList,
              visible: true
            })
          }
        }
      })
      .catch((err) => {
        console.log(err.msg)
      })
    },
    /**领取优惠券*/
    onTapCurItem(e) {
      const {index, couponItem} = e.detail
      if (isLogged()) {
        this.triggerEvent('receiveCurCoupon', {index, couponItem})
      } else {
        this.selectComponent("#authCouponComp").openAuthorize(true)
      }
    },
    //领取优惠券登录后操作
    onReceive() {
      console.log(this.data.sku)
      //比对登录前后 优惠券总金额变化 如果登录钱金额大于登录后 重新请求优惠券接口
      this.getDialogCouponList({spuId: this.data.spuId, isInit: false,skuId:this.data.sku.id})
    },
    //更新优惠券状态
    updateCouponStatus({index, isReceived}) {
      const {couponList} = this.data;
      couponList[index].isReceived = isReceived;
      if (couponList[index].timeType === 2) { // 目前不走这里，类型等于2的优惠券 即使领取完毕仍然显示领取之日起多少天内可用
        // couponList[index].startTime = formatDate(Date.now(), '.').date
        // couponList[index].endTime = formatDate(Date.now() + couponList[index].validityDays * 24 * 60 * 60, '.').date
      } else {
        couponList[index].startTime = couponList[index].startTime.split(' ')[0].replaceAll('-', '.')
        couponList[index].endTime = couponList[index].endTime.split(' ')[0].replaceAll('-', '.')
      }
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