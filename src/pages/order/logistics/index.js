import {findLogistics, findExpress} from '../../../models/orderModel'
import {findOmsRefundLogistics, findRefundLogisInfo} from '../../../models/afterSaleModel'
import {TOAST_TYPE} from "../../../const/index"
import {hideToast, showToast} from "../../../components/toast/index"
import {wxFuncToPromise} from "../../../utils/wxUtils";

const app = getApp()

Page({
  data: {
    storeOrderCode: '', // 正向订单 --- 商家订单编码
    logisticsList: [],
    expressCompanyName: '',
    expressNumber: '',
    expressList: [],
    prefix:'logistics_card_',
    activedIndex: 0
  },
  onLoad(options) {
      this.setData({storeOrderCode: options.storeOrderCode || ''})
  },
  onShow() {
    const {type} = this.data;
    this.queryLogistics()
  },

  // 正向订单 -- 查询快递单号
  queryLogistics() {
    showToast({type: TOAST_TYPE.LOADING})
    findLogistics({storeOrderCode: this.data.storeOrderCode}).then(({result}) => {
      hideToast().then(() => {
        this.setData({logisticsList: result || []})
        if(result && result.length) {
          const {expressNumber, expressCompanyCode} = result[0] || {};
          this.findExpress({expressNumber, expressCompanyCode});
        }
      })
    }).catch((err) => {
      console.log(err)
    })
  },

  // 正向订单 -- 查询物流信息
  findExpress(params) {
    findExpress({...params}).then(({result}) => {
      const {expressNumber, expressCompanyName, dataList: expressList} = result || {};
      this.setData({expressNumber, expressCompanyName, expressList})
    })
  },

  // 切换包裹
  changeLogistics(e) {
    const {index, expnum, companycode} = e.currentTarget.dataset
    this.setData({activedIndex: index})
    this.findExpress({expressNumber: expnum, expressCompanyCode: companycode})
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
  tapAllSku(e) {
    const {skulist:skuList} = e.currentTarget.dataset;
    this.selectComponent("#logisticsGoods").show({skuList})
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  }
})