import {TOAST_TYPE} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import {queryCouponUserList} from "../../../models/voucherModel";
import {formatDate, formatDateTime} from "../../../utils/index";

Page({
  data: {
    isLoading: false,
    page: 1,
    voucherList: [],
    isHideLoadMore: false
  },
  onLoad() {
  
  },
  onShow() {
    const params = {
      isAvailable: 2,//用户优惠券状态 1可用/不可用 2历史
    }
    this.getVoucherList(params)
  },
  //加载更多
 /* onReachBottom() {
    this.setData({isHideLoadMore: true})
    this.setData({page: this.data.page + 1})
    const params = {
      page: this.data.page,
      isBottom: true
    }
    this.getVoucherList(params) //更新卡片列表
  },*/
  /**获取历史优惠券列表*/
  getVoucherList(params) {
    this.setData({isLoading: true})
    showToast({type: TOAST_TYPE.LOADING})
    queryCouponUserList(params)
    .then(({result}) => {
      hideToast().then(() => {
        result.forEach(item=>{
          const _startTime = formatDateTime(item.startTime).getTime()
          const _endTime = formatDateTime(item.endTime).getTime()
          item.startTime = formatDate(_startTime, '.').dateTimeMM
          item.endTime = formatDate(_endTime, '.').dateTimeMM
          item.couponAmount = Number(item.couponAmount)
          item.isWrap = Math.trunc(item.moneyLimit).toString().length >= 5
        })
        this.setData({voucherList: result, isLoading: false})
        /* if (params.isBottom) {
           const list = [...this.data.voucherList, ...result.list]
           this.setData({voucherList: list})
         } else {
           this.setData({voucherList: result.list})
         }
         this.setData({totalCount: result.totalCount, isLoading: false})*/
      })
    })
    .catch((err) => {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    })
    /*.finally(() => {
      this.setData({
        isHideLoadMore: false
      })
    })*/
  },
  /**使用优惠券*/
  onTapCurItem(e) {
    const {index, voucher} = e.detail
  }
  
});
