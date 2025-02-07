import { TOAST_TYPE } from "../../const/index";
import { hideToast, showToast } from "../../components/toast/index";
import { queryCouponUserList } from "../../models/voucherModel";
import { formatDate, formatDateTime } from "../../utils/index";

Page({
  data: {
    reLoad: false,
    isLoading: false,
    page: 1,
    totalCount: 0,
    voucherList: [],
    explainDialog: false,
    buttons: [{
      text: '我知道了',
      extClass: 'only-one-btn'
    }],
    useExplain: {
      title: '使用规则',
      rules: [
        '1. 优惠券领取成功后，会自动发放至相应账户，可在【我的-优惠券】中查看；',
        '2. 优惠券可用于【康老板商城】指定商品现金抵扣；',
        '3. 优惠券设有有效期，请在有效期前使用，过期未使用作废，且无法补发；',
        '4. 若订单申请退货、退款，如优惠券在有效期内，则平台将已使用的优惠券退回您的账户；',
        '5. 新人专享优惠券仅限对应新人首单使用，当用户不满足新人身份后，新人专享优惠券将失效；',
        '6. 如有任何问题，可在线客服咨询，或拨打客服电话 400-101-0505.'
      ]
    },
    isHideLoadMore: false
  },
  onLoad() {

  },
  onShow() {
    const params = {
      isAvailable: 1,//用户优惠券状态 1可用/不可用 2历史
    }
    this.getVoucherList(params)
  },
  //加载更多-暂时不分页，下期可能分页
  /* onReachBottom() {
     this.setData({isHideLoadMore: true})
     this.setData({page: this.data.page + 1})
     const params = {
       isAvailable:1,
       page: this.data.page,
       isBottom: true
     }
     this.getVoucherList(params) //更新卡片列表
   },*/
  /**获取优惠券列表*/
  getVoucherList(params) {
    this.setData({ isLoading: true })
    showToast({ type: TOAST_TYPE.LOADING })
    queryCouponUserList(params).then(({ result }) => {
      hideToast().then(() => {
        result.forEach(item => {
          const _startTime = formatDateTime(item.startTime).getTime()
          const _endTime = formatDateTime(item.endTime).getTime()
          item.startTime = formatDate(_startTime, '.').dateTimeMM
          item.endTime = formatDate(_endTime, '.').dateTimeMM
          item.couponAmount = Number(item.couponAmount)
          item.isWrap = Math.trunc(item.moneyLimit).toString().length >= 5
        })
        this.setData({ voucherList: [...result], isLoading: false })
        /* if (params.isBottom) {
           const list = [...this.data.voucherList, ...result.list]
           this.setData({voucherList: list})
         } else {
           this.setData({voucherList: result.list})
         }*/
        // this.setData({totalCount: result.totalCount, isLoading: false})
      })
    })
      .catch((err) => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
    /* .finally(() => {
       this.setData({isHideLoadMore: false})
     })*/
  },

  /**历史优惠券*/
  toRecordPage() {
    wx.navigateTo({
      url: '/pages/voucher/record/index',
    })
  },
  /**使用说明*/
  showExplain() {
    this.setData({
      explainDialog: true
    })
  },
  closeExplain() {
    this.setData({
      explainDialog: false
    })
  },
  /**展示优惠券规则*/
  onShowCurCouponRule(e) {
    const { voucherList } = this.data;
    const { index, voucher } = e.detail;
    voucherList[index].isShowRule = !voucher.isShowRule
    this.setData({ voucherList })
  },
  /**使用优惠券*/
  onTapCurItem(e) {
    const { index, voucher } = e.detail
    if (voucher.isAvailable === 1) {
      wx.navigateTo({
        url: `/pages/product/index?spuId=${voucher.spuId}&skuId=none`,
      })
    }
  },
  touchMove() {
    return // 解决蒙层下页面滚动问题
  }

});
