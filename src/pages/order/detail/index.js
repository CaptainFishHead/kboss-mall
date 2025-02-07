import {findOrder,serviceOrderDetail} from "../../../models/orderModel";
import {TOAST_TYPE, PRODUCT_TYPE} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import back from "@behaviors/back";
import mapNav from "@behaviors/mapNav";

const app = getApp()

Page({
  data: {
    orderInfo: {}, // 订单详情信息
    serviceList:[], // 服务列表
  },
  behaviors: [back,mapNav],
  onShow: function () {
    this.findOrderFn()
  },
  // 订单信息
  findOrderFn() {
    showToast({type: TOAST_TYPE.LOADING})
    findOrder({
      orderCode: this.options.orderCode
    }).then(({result}) => {
      hideToast();
      if (result.storeList && result.storeList.length) {
        result.storeList.forEach(item => {
          if (item.skuList && item.skuList.length) {
            result.isReal = item.skuList[0].spuAttribute === PRODUCT_TYPE.REAL;
            if(item.skuList[0].spuAttribute === PRODUCT_TYPE.VIRTUAL){
              result.chargeOffType = item.skuList[0].chargeOffType;
              result.spuId = item.skuList[0].spuId;
              result.storeType = this.options.storeType
            }
          }
        })
      }
      this.setData({orderInfo: result});
      //虚拟品-线上线下服务商品
      if(result.chargeOffType===4||result.chargeOffType===5){
        this.getServiceOrderDetail()
        this.getLocation({})
  
      }
    }).catch((err) => {
      hideToast().then(() => {
        if (err && err.msg) {
          showToast({
            title: err.msg || '订单信息获取失败',
            type: TOAST_TYPE.WARNING
          })
        }
      });
    })
  },
  // 商品服务数据
  getServiceOrderDetail(){
    if(this.data.orderInfo.orderStatus === 50 ){
      serviceOrderDetail({
        orderCode : this.options.orderCode
      }).then(({result}) => {
        this.setData({serviceList: result});
      }).catch((err)=>{
        console.log(err)
      })
    }else{
      serviceOrderDetail({
        serviceOrderCode: this.options.orderCode
      }).then(({result}) => {
        this.setData({serviceList: result});
      }).catch((err)=>{
        console.log(err)
      })
    }
   
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
});
