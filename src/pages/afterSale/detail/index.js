import {
  findOmsRefundDetails,
  findOmsRefundLogistics,
  cancelRefund,
  sendOmsOrderRefundSms
} from "../../../models/afterSaleModel";
import {moneyFormat, unixToDate} from '../../../utils/index'
import {TOAST_TYPE} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import {track, TrackEventName} from "../../../utils/sa";

const app = getApp()

Page({
  data: {
    refundCode: '', // 退款订单编号
    orderCode: '', // 商家订单编号
    from: '', // 页面来源
    showEmpty: false,
    errMsg: '',
    buttons: [{
      text: '取消'
    }, {
      text: '确定'
    }],
    sessionFrom: '', // 保存联系客服所需数据
    list: [],
    detailInfo: {},
    logisticsName: '',
    dialogShow: false,
    refundStatusMap: {
      '10': {
        title: '审核中',
        desc: '商家正在加急审核，请您耐心等待'
      },
      '20': {
        title: '平台处理中',
        desc: '平台正在处理您的售后单，请耐心等候'
      },
      '30': {
        title: '退款完成',
        desc: ''
      },
      '40': {
        title: '退款驳回',
        desc: ''
      },
      '50': {
        title: '退款取消',
        desc: ''
      },
      '60': {
        title: '平台处理中',
        desc: '平台正在处理您的售后单，请耐心等候'
      },
      '70': {
        title: '待退货',
        desc: ''
      },
      '80': {
        title: '商家处理中',
        desc: '商家正在加急处理，请您耐心等待'
      },
    }
  },
  onLoad: function (options) {

    this.setData({
      refundCode: options.refundCode || '',
      from: options.from
    })
  },
  onShow: function () {
    let sessionFrom = app.getContactInfo({title: '售后/退款'})
    this.setData({sessionFrom})
    // let pages = getCurrentPages()
    // let options = pages[pages.length - 1].options
    this.getDetail()
  },
  reloadHandler() {
    this.setData({
      showEmpty: false
    })
    this.getDetail()
  },
  //去提醒
  goRemind() {
    const {refundCode, list, detailInfo} = this.data;
    if (detailInfo.refundStatus === 10 || detailInfo.refundStatus === 70 || detailInfo.refundStatus === 80) {
      showToast({type: TOAST_TYPE.LOADING});
      const skuIdList = list.map(item => item.skuId);
      sendOmsOrderRefundSms({
        refundCode,
        orderType: list[0].spuKind,
        skuIdList
      }).then(({result}) => {
        const title = result.resultType === 1 ? '提醒成功' : '已提醒'
        showToast({
          type: TOAST_TYPE.SUCCESS,
          title,
        })
      }).catch((error) => {
        if (error && error.msg) {
          showToast({
            type: TOAST_TYPE.WARNING,
            title: error.msg || '网络请求错误',
          })
        }
      });
    } else {
      showToast({
        type: TOAST_TYPE.SUCCESS,
        title: '已提醒',
      });
    }
    
  },
  //取消确认
  goCancel() {
    this.setData({
      dialogShow: true
    })
  },
  //取消申请售后
  goCancelConfirm(e) {
    const {refundCode, from} = this.data
    const _btn = e.detail.item.text;
    if (_btn === '确定') {
      showToast({type: TOAST_TYPE.LOADING})
      cancelRefund({refundCode}).then(res => {
        showToast({
          type: TOAST_TYPE.SUCCESS,
          title: '申请取消成功',
        });
        setTimeout(() => {
          if (from === 'list') {
            wx.redirectTo({
              url: `/pages/afterSale/applyList/index`,
            })
          } else {
            wx.navigateBack({
              delta: 1,
            })
          }
        }, 1500)
      }).catch((error) => {
        if (error && error.msg) {
          showToast({
            type: TOAST_TYPE.WARNING,
            title: error.msg || '网络请求错误',
          })
        }
      });
    }
    this.setData({
      dialogShow: false,
    })
  },
  //货物寄回
  goFill() {
    const {refundCode, orderCode} = this.data
    wx.navigateTo({
      url: `/pages/afterSale/fill/index?refundCode=${refundCode}&orderCode=${orderCode}&from=detail`
    })
  },
  //查看物流按钮跳转
  goLogistics() {
    const {orderCode} = this.data
    wx.navigateTo({
      url: `/pages/logistics/index?storeOrderCode=${orderCode}`
    })
  },
  // 获取寄回后-获取物流信息
  findOrderProductPackList({currentTarget}) {
    const {refundcode} = currentTarget.dataset
    wx.navigateTo({
      url: `/pages/afterSale/orderTrack/orderTrack?refundCode=${refundcode}`
    })
  },
  getDetail() {
    const {refundCode} = this.data
    showToast({type: TOAST_TYPE.LOADING})
    findOmsRefundDetails({refundCode}).then(({result}) => {
      hideToast().then(() => {
        let orderCodeStr = result.orderCode;
        if(result.orderCode && result.orderCode.indexOf('-') !== -1) {
          const index = result.orderCode.indexOf('-');
          orderCodeStr = result.orderCode.slice(0, index);
        }
        this.setData({
          list: result.refundSkuList,
          detailInfo: {
            ...result,
            refundProductPrice: moneyFormat(result.refundProductPrice),
            refundRealPrice: moneyFormat(result.refundRealPrice),
          },
          orderCode: orderCodeStr || ''
        })
        
      })
    }).catch((error) => {
      if (error && error.msg) {
        showToast({
          type: TOAST_TYPE.WARNING,
          title: error.msg,
        })
      }
      this.setData({
        showEmpty: true,
        errMsg: error && error.msg ? error.msg : ''
      })
    });
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
  onService() {
    track(TrackEventName.Boss_CustomerService, {customer_service_type: '售后客服'});
  },
  // 复制服务单号
  copyServeNum(){
    const {refundCode} = this.data.detailInfo || {}
    wx.setClipboardData({
      data: refundCode,
      success() {
        wx.hideToast()
        showToast({
          title: '复制成功',
          type: TOAST_TYPE.SUCCESS
        })
      }
    })
  },
  // 复制订单编号
  copyOrderNum(){
    const {orderCode} = this.data || {}
    wx.setClipboardData({
      data: orderCode,
      success() {
        wx.hideToast()
        showToast({
          title: '复制成功',
          type: TOAST_TYPE.SUCCESS
        })
      }
    })
  },
  
})
