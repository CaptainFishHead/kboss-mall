import back from "../../behaviors/back";
import {queryMemberLevelChange} from "../../models/userModel";
import {TOAST_TYPE, ORDER_SOURCE_PAGE} from "../../const/index";
import {hideToast, showToast} from "../../components/toast/index";
import {queryOrderAmount, queryServiceDetail} from "../../models/orderModel";
import {reqCounselor} from "../../models/healthWaiter";
import {getAdviserHead} from "../../models/healthConsultModel"

Page({
  data: {
    totalAmount: '',
    orderType: 0,
    orderCode: '',
    source:'',
    sdkPayCallback:'',
    serviceOrderCode: '', // 温暖医生服务单号
    rewardBean:0, //下单后康豆奖励
    beansDialog: false,
    beansButtons: [{
      text: '开心收下',
      extClass: 'only-one-btn'
    }],
    ORDER_SOURCE_PAGE,
    successDesc: {
      '3': '兑换成功',
      '6': '预约成功'
    },
    warmDoctorReserInfo: {}, // 温暖医生预约信息
    serviceAdAvatar: 'https://static.tojoyshop.com/images/wxapp-boss/healthConsult/adviser.png'
  },
  behaviors: [back],
  //返回订单列表页
  goOrder() {
    wx.redirectTo({
      url: '/pages/order/index?storeType=1'
    })
  },
  //去康豆明细
  toBeanDetail() {
    wx.redirectTo({url: '/pages/healthBean/index?backToPage=/pages/mine/index'})
  },
  onLoad() {
    const serviceOrderCode = wx.getStorageSync('serviceOrderCode') // 温暖医生 服务单号
    const orderType = wx.getStorageSync('orderType') //--1:单个商品，2:购物车商品，3:商品卡兑换 5:温暖医生服务卡核销 (注：空值是从订单列表、订单详情直接支付)
    const orderCode = wx.getStorageSync('orderCode') //订单ID
    const source = wx.getStorageSync('source') //跳转来源
    const sdkPayCallback = wx.getStorageSync('sdkPayCallback') //sdk 回调
    if(serviceOrderCode || orderType === ORDER_SOURCE_PAGE.WARMDOCTORCARD) {
      this.queryWarmDoctor(serviceOrderCode);
      this.queryMyHealthWaiter();
    }
    this.setData({
      orderType,
      orderCode,
      source,
      sdkPayCallback,
      serviceOrderCode
    })
    try {
      wx.removeStorageSync('orderType')
      wx.removeStorageSync('orderCode')
      wx.removeStorageSync('source')
      wx.removeStorageSync('sdkPayCallback')
      wx.removeStorageSync('serviceOrderCode')
    } catch (e) {
      console.log(e)
    }
    showToast({
      title: '支付中……',
      type: TOAST_TYPE.CIRCLE_LOADING,
      iconClassName: "loading-circle-img",
      imgMode: "aspectFit",
      duration: 100000
    })
    //下单成功返豆弹窗
    setTimeout(() => {
      queryOrderAmount({orderCode:this.data.orderCode}).then(({result}) => {
        const {rewardBean,totalAmount} = result
        this.setData({rewardBean,totalAmount})
        if (rewardBean > 0) {
          hideToast().then(()=>{
            this.setData({beansDialog: true})
          })
        } else {
          this.queryMemberLevel()
        }
      }).catch(() => {
        hideToast()
      })
    }, 3000)
  },
  launchAppError(e) {
    console.log(e.detail.errMsg);
  },
  closeBeadsDialog() {
    this.setData({beansDialog: false})
    this.queryMemberLevel()
  },

  /* 获取温暖医生预约信息 */
  queryWarmDoctor(serviceOrderCode){
    queryServiceDetail({ serviceOrderCode})
      .then(({result}) => {
        this.setData({warmDoctorReserInfo: result});
      }).catch(err => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
  },
  /* 查询我的健康顾问 */
  queryMyHealthWaiter(){
    reqCounselor()
      .then(({ result }) => {
        if (result && result.consultantAvatar) this.setData({ serviceAdAvatar: result.consultantAvatar || '' })
      })
      .catch(err => {
        showToast({
          title: err.msg || "获取信息失败",
          type: TOAST_TYPE.WARNING,
          duration: 2000,
        });
      });
  },
  /* 查询完成下单后会员是否升级 */
  queryMemberLevel() {
    queryMemberLevelChange({}).then(({result}) => {
      const {isLevelUp, afterLevelName, afterBadgeUrl, createTime} = result
      let _time
      if (createTime) {
        _time = parseInt((new Date(createTime).getTime() - new Date().getTime()) / 1000 / 60) || 0
      }
      if (isLevelUp === 1 && _time <= 2) {
        this.selectComponent("#upgradeComponents").showDialog({url: afterBadgeUrl, name: afterLevelName||''})
      }
    }).finally(() => {
      hideToast()
    })
  },

  /* 跳转首页 */
  goHome(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  /* 跳转温暖医生列表页 */
  goWarmDoctorHome(){
    const pages = getCurrentPages()
    const {orderType, serviceOrderCode} = this.data;
    if(orderType === ORDER_SOURCE_PAGE.WARMDOCTORCARD) { // 有预约卡时 预约成功返回
      return wx.navigateBack()
    } else if(serviceOrderCode) { // 无预约卡 购买成功后返回
      return wx.navigateBack({
        delta: 2
      })
    }
  },

  /* 跳转预约 */
  onReservation(){
    wx.redirectTo({
      url: '/pages/services/index',
    })
  },

  /**关闭会员升级弹窗*/
  upgradeClosed: function () {},
  touchMove() {
    return // 解决蒙层下页面滚动问题
  }
})
