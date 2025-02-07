import {findOmsRefundBrandAddress, findOmsRefundDetails, saveRefundLogisticsCode, cancelRefund} from "../../../models/afterSaleModel";
import {countTimeDown} from '../../../utils/index'
import {TOAST_TYPE} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import {track, TrackEventName} from "../../../utils/sa";

const app = getApp()

Page({
  data: {
    refundCode: '',
    orderCode: '',
    showEmpty: false,
    errMsg: '',
    sessionFrom: '', // 保存联系客服所需数据
    brandInfo: {},
    list: [],
    logisticsParams: {},
    countDown: '',
    from: '',
    dialogShow: false,
    buttons: [{
      text: '取消'
    }, {
      text: '确定'
    }]
  },
  _timer: null,
  onLoad: function (options) {
    this.setData({
      from: options.from || '',
      refundCode: options.refundCode || '',
      orderCode: options.orderCode || ''
    }, () => {
      this.getDetail()
    })
  },
  onShow: function () {
    let sessionFrom = app.getContactInfo({title: '售后/退款'})
    this.setData({sessionFrom})
  },
  reloadHandler() {
    this.setData({showEmpty: false})
    this.getDetail()
  },

  // 获取页面详情
  getDetail() {
    const {refundCode, logisticsParams} = this.data
    showToast({type: TOAST_TYPE.LOADING})
    findOmsRefundBrandAddress({refundCode}).then(({result}) => {
      hideToast().then(() => {
        this.startTimout(result.uploadLogisticsDifferTime - Date.now())
        // 初始化物流数据
        result.brandList.forEach(item => {
          logisticsParams[item.brandId] = [];
        })
        this.setData({brandInfo: result, logisticsParams});
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

  // 剩余时间倒计时
  startTimout(timeLeft) {
    this._timer = setTimeout(() => {
      const countDown = this.formatTime(timeLeft)
      timeLeft -= 1000;  //时间差 减1000毫秒
      this.setData({countDown})
      if (timeLeft > 0) {
        this.startTimout(timeLeft)
      } else {
        wx.nextTick(() => {
          this.setData({countDown: 0})
          clearTimeout(this._timer);
        })
      }
    }, 1000)
  },
  formatTime(timestamp) {
    const second = Math.floor(timestamp/ 1000);
    const day = Math.floor(second / 3600 / 24);
    const hr = Math.floor(second / 3600 % 24);
    const min = Math.floor(second / 60 % 60);
    const sec = Math.floor(second % 60);
    return (day?day + "天":'') + (hr?hr+ "小时":'') + ( min?min + "分钟":'') + sec + "秒";
  },
//取消确认
goCancel() {
  this.setData({
    dialogShow: true
  })
},
  // 取消申请
  goCancelConfirm(e){
    const _btn = e.detail.item.text;
    if (_btn === '确定') {
      const {refundCode} = this.data.brandInfo || {}
      cancelRefund({refundCode}).then(res => {
        showToast({
          type: TOAST_TYPE.SUCCESS,
          title: '申请取消成功',
        });
        setTimeout(() => {
          if (this.data.from === 'list') {
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
      }).finally(() => {
        this.setData({
          dialogShow: false
        })
      });
    } else {
      this.setData({
        dialogShow: false
      })
    }
    
  },
  
  /**提交申请*/
  submitHandler() {
    const {logisticsParams, from, brandInfo} = this.data;
    let params = [];
    for (let brand in logisticsParams) {
      const refundOrder = brandInfo.brandList.find(item => item.brandId === brand);
      if(!logisticsParams[brand].length) {
        return showToast({
            type: TOAST_TYPE.WARNING,
            title: '请填写全部物流单号',
          });
      } else {
        if (logisticsParams[brand].includes("")) {
          return showToast({
            type: TOAST_TYPE.WARNING,
            title: '请填写全部物流单号',
          });
        }
        logisticsParams[brand].forEach(item => {
          params.push({
            brandId: brand,
            logisticsCode: item,
            refundCode: refundOrder.refundCode
          })
        })
      }
    }
    if (params.length) {
      const {refundCode, refundId} = this.data.brandInfo;
      showToast({type: TOAST_TYPE.LOADING})
      saveRefundLogisticsCode({
        refundCode,
        refundId,
        brandParam: params
      }).then(res => {
        hideToast().then(() => {
          if (from === 'detail') {
            wx.navigateBack({delta: 1})
          } else {
            wx.redirectTo({url: `/pages/afterSale/applyList/index`})
          }
        })
      }).catch((error) => {
        if (error && error.msg) {
          showToast({
            type: TOAST_TYPE.WARNING,
            title: error.msg || '申请失败',
          })
        }
      });
    } else {
      showToast({
        type: TOAST_TYPE.WARNING,
        title: '请填写全部物流单号',
      })
    }
  },
  
  bindFillCode({detail}) {
    const {logisticsParams} = this.data;
    const {brandId, logistics} = detail || {};
    logisticsParams[brandId] = logistics || [];
    this.setData({logisticsParams});
  },
  // 复制服务单号
  copyServeNum(){
    const {refundCode} = this.data.brandInfo || {}
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
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
  /**客服埋点*/
  onService() {
    track(TrackEventName.Boss_CustomerService, {customer_service_type: '售后客服'});
  },
})