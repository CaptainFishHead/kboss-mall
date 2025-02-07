import {findRefundOrderPrice, confirmRefund, confirmRefundPre} from "../../../models/afterSaleModel";
import {TOAST_TYPE} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import {track, TrackEventName} from "../../../utils/sa";
import {moneyFormat} from "../../../utils/index";

const app = getApp()

Page({
  data: {
    // 网络错误所需的信息
    showEmpty: false,
    errMsg: '',
    // 保存联系客服所需数据
    sessionFrom: '',
    //补充描述
    remark: '',
    //退款原因内容
    reasonText: '',
    //其他原因
    otherReasonChecked: false,
    // 售后商品列表
    afterGoodsList: [],
    // 售后类型
    serviceType: 0,
    // 店铺信息
    storeInfo: {},
    // 订单编号
    orderCode: '',
    // 退款商品价格信息 start
    totalRefundFormat: 0, //退款总额格式化
    amoutRefundFormat: 0, //退款金额格式化
    beanRefundFormat: 0, //退款康豆格式化
    PostagePriceFormat:0, //退还邮费格式化
    // 退款商品价格信息 end


  },
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('afterSale', result => {
      console.log('页面传递参数', result);
      this.setData({
        afterGoodsList: result.checkedGoods || [],
        serviceType: result.serviceType || 1,
        storeInfo: result.storeInfo || {}
      }, () => {
        this.getAfterPriceInfo()
      })
    })
  },
  // 获取退款订单价格信息
  getAfterPriceInfo() {
      const {afterGoodsList, storeInfo} = this.data;
      showToast({type: TOAST_TYPE.LOADING});
      // reSaleNum 为未售后/选择的售后数量数量 不存在表示全部售后  reSaleNum存在表示其中有已售后的数量
      const goods = afterGoodsList.map(item => ({
        bhOrderSkuId: item.bhOrderSkuId,
        skuNum: item.reSaleNum || item.skuNum,
        subSkuList: item.subSkuList ? item.subSkuList.map(val => ({
          bhOrderSkuId: val.bhOrderSkuId,
          // skuNum: val.refundNum ? val.skuNum * (item.reSaleNum || item.skuNum) - val.refundNum : val.skuNum * (item.reSaleNum || item.skuNum)
          skuNum: val.reSaleNum >= 0 ? val.reSaleNum : val.skuNum * (item.reSaleNum || item.skuNum)
        })).filter(item => item.skuNum) : []
      }));
      findRefundOrderPrice({
        orderCode: storeInfo.storeOrderCode,
        orderSkuList: goods,
        orderType: afterGoodsList[0].spuKind
      }).then(({result}) => {
        hideToast().then(() => {
          const {refundBeanNum, refundProductPrice, totalRefundPrice, refundPostagePrice} = result;
          this.setData({
            totalRefundFormat: totalRefundPrice,
            amoutRefundFormat: refundProductPrice,
            beanRefundFormat: refundBeanNum,
            PostagePriceFormat: refundPostagePrice
          })
        })
      }).catch(error => {
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

  onShow: function () {
    let sessionFrom = app.getContactInfo({title: '申请退款'})
    this.setData({sessionFrom})
  },
  reloadHandler() {
    this.setData({
      showEmpty: false
    })
    this.getAfterPriceInfo()
  },
  
  /**确定退款原因*/
  checkedReason(e){
    const {reasonText,otherReasonChecked} = e.detail
    this.setData({reasonText,otherReasonChecked})
  },
  /**提交退款申请*/
  submitHandler() {
    const {list, remark, reasonText, otherReasonChecked, info, type} = this.data
    if (!reasonText) {
      showToast({
        type: TOAST_TYPE.WARNING,
        title: '请选择退款原因',
      })
    } else {
      const {storeInfo, afterGoodsList, beanRefundFormat, PostagePriceFormat, totalRefundFormat, amoutRefundFormat, serviceType} = this.data;
      const goods = afterGoodsList.map(item => ({
        bhOrderSkuId: item.bhOrderSkuId,
        isShipped: item.shipNum > 0 ? 1: 0,
        skuNum: item.reSaleNum || item.skuNum,
        subSkuList: item.subSkuList ? item.subSkuList.map(val => ({
          bhOrderSkuId: val.bhOrderSkuId,
          isShipped: val.shipNum > 0 ? 1: 0,
          skuNum: val.reSaleNum >= 0 ? val.reSaleNum : val.skuNum * (item.reSaleNum || item.skuNum)
        })).filter(item => item.skuNum) : []
      }));
      confirmRefund({
        orderCode: storeInfo.storeOrderCode,
        customerRemark: remark,
        orderSkuList: goods,
        orderType: afterGoodsList[0].spuKind,
        refundCause: reasonText,
        refundType: serviceType
      }).then(() => {
        hideToast().then(() => {
          wx.redirectTo({
            url: `/pages/afterSale/applyList/index`,
          })
        })
      }).catch((error) => {
        if (error && error.msg) {
          showToast({
            type: TOAST_TYPE.WARNING,
            title: error.msg || '网络请求错误',
          })
        }
      });
    }
  },

  // 补充描述
  inputDes(event) {
    let {remark} = event.detail
    this.setData({remark})
  },

  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
  /** 客服埋点 */
  onService() {
    track(TrackEventName.Boss_CustomerService, {customer_service_type: '售后客服'});
  },

})
