import {findLogistics, findExpress} from '../../../models/orderModel'
import {findOmsRefundLogistics, findRefundLogisInfo} from '../../../models/afterSaleModel'
import {TOAST_TYPE} from "../../../const/index"
import {hideToast, showToast} from "../../../components/toast/index"
import {wxFuncToPromise} from "../../../utils/wxUtils";

const app = getApp()

Page({
  data: {
    refundCode: '', // 逆向订单 -- 售后订单编码
    logisticsList: [],
    expressCompanyName: '',
    expressNumber: '',
    expressList: [],
    prefix:'logistics_card_',
    activedIndex: 0
  },
  onLoad(options) {
    this.setData({refundCode: options.refundCode || ''})
  },
  onShow() {
    this.queryReturnLogistics();
  },
  // 切换包裹
  changeLogistics(e) {
    const {index} = e.currentTarget.dataset;
    const {logisticsList} = this.data;
    this.setData({activedIndex: index})
    this.findReturnExpress({logisticsCode: logisticsList[index].logisticsCode})
  },

  // 逆向订单 -- 查询快递单号
  queryReturnLogistics(){
    const {refundCode} = this.data;
    showToast({type: TOAST_TYPE.LOADING})
    findOmsRefundLogistics({refundCode})
    .then(({result}) => {
      hideToast().then(() => {
        if(result.logisticList && result.logisticList.length) {
          const {logisticsCode} = result.logisticList[0] || {};
          logisticsCode && this.findReturnExpress({logisticsCode});
        }
        this.setData({logisticsList: result.logisticList || []})
      })
    })
  },
  // 逆向订单 -- 查询物流信息
  findReturnExpress(params){
    findRefundLogisInfo(params)
    .then(({result}) => {
      const {expressNumber, expressCompanyName, dataList: expressList} = result || {};
      this.setData({
        expressNumber,
        expressCompanyName,
        expressList
      })
    })
  },
 
  
  // 复制按钮
  bindCopy(e) {
    const {expnum: data} = e.currentTarget.dataset
    wxFuncToPromise(`setClipboardData`, {data}).then(() => {
      return wxFuncToPromise(`getClipboardData`)
    }).then(() => {
      wx.hideToast()
      showToast({type: TOAST_TYPE.SUCCESS, title: '已复制'})
    })
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  }
})