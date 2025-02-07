import {findPreBuyOrder} from "@models/newCartModel";
import {wxFuncToPromise} from "../../../utils/wxUtils";
import {
  PRODUCT_TYPE,
  TOAST_TYPE,
  STORAGE_USER_FOR_KEY,
  RECEIVER_ADDRESS
} from "../../../const/index";
import {formatDate, formatDateTime, moneyFormat} from "../../../utils/index";
import {hideToast, showToast} from "../../../components/toast/index";
import {checkSkuStatus} from '@models/productModel'
import {queryScene, queryYasumeByScene} from "@models/commonModels";
import {queryCouponOrderList} from "@models/voucherModel";
import confirm from "../behaviors/confirm";
import back from "../../../behaviors/back";
import {queryDefaultAddress} from "../../../models/addressModel";
import { getDoctorDetail } from "@models/healthConsultModel"

const app = getApp()

Page({
  behaviors: [confirm, back],
  data: {
    barHeight: '',
    // 下单类型（1：直接下单、2：购物车下单 3 商品卡兑换）
    type: 1,
    // 兑换卡Id type = 3de 时候有值
    cardId: '',
    // 收货地址ID
    addressInfo: {},
    // 商品列表
    skuList: [],
    // 购买商品顺序，用于康老板拆单使用
    sortSkuList: [],
    extra: {}, // 订单数据来源
    // 用户留言列表
    userMessageList: [],
    // 商家列表
    storeList: [],
    // 商品列表 Sku商品集合
    productList: [], //商品JSON集合
    // 解决onload中的setData未执行完毕 取不到skuList数据 防止重复请求
    isExecuteOnShow: false,
    // 商品属性 （真实商品、虚拟商品）
    isReal: false,
    //康豆使用场景ID
    sceneId: '',
    // 商品不在配送范围内弹窗展示
    showBuyDialog: false,
    errorCase: 0,
    errorGoodsName: '海参肽复合果饮8盒装',
    errorCodeMaps: {
      errorAddress: -8016,
      errorStockNums: -4032,
    },
    countDown: 5,
    loading: true, // 优化展示美观度
    showMsg: true, // 是否展示留言 解决留言输入框错位问题
    
    //订单金额相关
    orderPayInfo: {
      orderCouponPrice: 0, // 优惠券总优惠金额
      orderDiscountPrice: 0, // 总优惠金额（活动+抵扣）
      orderPayPrice: 0, // 实付总价
      orderPostagePrice: 0, // 总邮费
      orderProductPrice: 0, // 商品总价（无优惠）
      orderPromotionPrice: 0 // 活动总优惠
    },
    //优惠券相关字段
    orderCouponInfo: {
      availableList: [],//可用优惠券集合
      unavailableList: [],//不可用优惠券集合
      couponUsedStatus: 1,//优惠券使用状态 1:没有优惠券 2:无可用优惠券 3:已使用优惠 4:不使用优惠券
      usedCouponList: [],//已使用优惠券集合 用于优惠券列表默认选中
      orderCouponPriceFormat: 0, //总优惠券金额-格式化
      couponFree: 0,//是否变更商品优惠券
    },
    //康豆相关
    orderBeanInfo: {
      beanFlag: 1, //是否使用康豆-默认使用康豆 参数
      orderBeanPrice: 0, // 康豆总优惠
      beanBalance: 0, //可用康豆余额
      orderBeans: 0, //康豆数量 弹窗展示时候使用
      orderMaxOrderPoint: 0 // 最大可食用康豆总数
    },
    // 温暖医生相关
    timeVisible: false,
    doctorInfo: {
      scheduleId: '', //预约时间ID
      tmBegin: '', // 可约起始日期
      tmEnd: '' // 可约结束日期
    }, // 温暖医生详情
    doctorId: '', // 医生ID
    reducibleDateInfo: {}, // 暂存选择的预约时间
    isReducibleTime: false, // 是否有预约时间
    reducibleDateParams: {
      reducibleDate: '', // 预约日期
      reducibleTime: '', // 预约时间
      scheduleId: '', // 预约时间ID
      tmBegin: '', // 可约起始日期
      tmEnd: '', // 可约结束日期
    }
    
  },
  onLoad(options) {
    this.updateContentHeight()
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据

    eventChannel.on('products', data => {
      console.log('页面传递参数', data);
      const {type, skuList, sortSkuList, extra = {}, cardId, doctorId, reducibleDate, reducibleTime, scheduleId, tmBegin, tmEnd, serviceOrderCode} = data || {};
      this.setData({
        type, skuList, sortSkuList, extra, cardId, doctorId, serviceOrderCode,
        reducibleDateParams: {
          reducibleDate, reducibleTime, scheduleId, tmBegin, tmEnd
        } 
      }, () => {
        if (doctorId){
          this.queryDoctorDetail(doctorId)
          return;
        };
        this.queryPreBuyOrder()
      });
    })
    
  },
  updateContentHeight() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#navbar').boundingClientRect((res) => {
      if (res.height) {
        this.setData({
          barHeight: res.height
        })
      }
    }).exec()
  },
  async onShow() {
    await this.queryAddress()
    this.data.isExecuteOnShow && this.queryPreBuyOrder()
  },
  /* 查询地址信息 */
  queryAddress() {
    return new Promise(resolve => {
      const latelyAddress = wx.getStorageSync(RECEIVER_ADDRESS);
      if (latelyAddress) {
        this.setData({
          addressInfo: latelyAddress
        }, () => {
          resolve();
        })
        return;
      }
      queryDefaultAddress({}).then(({result}) => {
        wx.setStorageSync(RECEIVER_ADDRESS, result || {})
        this.setData({
          addressInfo: result || {}
        }, () => {
          resolve();
        })
        
      })
    })
    
  },
  /**新增/编辑地址*/
  onEditAddress() {
    wxFuncToPromise('navigateTo', {
      url: '/pages/address/index',
    })
    this.setData({isExecuteOnShow: true})
  },
  /**返回购物车*/
  onBackCart() {
    wx.navigateTo({url: '/pages/cart/index'})
  },
  /** 查询或预览订单信息 */
  async queryPreBuyOrder() {
    showToast({type: TOAST_TYPE.LOADING});
    await this.queryKangDouBySceneId()
    const {
      type,
      cardId,
      addressInfo,
      skuList,
      userMessageList,
      orderCouponInfo,
      orderBeanInfo,
      sortSkuList,
      doctorId
    } = this.data;
    const {couponFree} = orderCouponInfo || {};
    const {beanFlag, beanBalance,} = orderBeanInfo || {};
    const {addressId} = addressInfo || {};
    let params = {type, cardId, skuList, couponFree, beanFlag, userMessageList, sortSkuList};
    if (!doctorId) params.addressId = addressId; // 如果是温暖医生 不需要传地址
    findPreBuyOrder(params).then(({result}) => {
      hideToast().then(() => {
        const {
          orderBeanPrice,
          orderCouponPrice,
          orderDiscountPrice,
          orderPayPrice,
          orderPostagePrice,
          orderProductPrice,
          orderPromotionPrice,
          storeList,
          type,
          beanFlag,
          orderMaxOrderPoint
        } = result || {};
        // 获取预订单下所有商品信息
        const productList = storeList.reduce((total, item) => {
          return [...total, ...item.skuList]
        }, [])
        // 判断商品类型（真实商品、虚拟商品）
        const isReal = productList.find(prod => prod.spuAttribute === PRODUCT_TYPE.REAL) || false;
        // 获取所有商品列表 用于二次查询预下单信息入参
        const skuActiveList = productList.map(item => ({
          promotionId: item.promotionId || '',
          promotionType: item.promotionType || '',
          skuId: item.skuId,
          skuNum: item.skuNum,
          splitFlag: item.splitFlag
        }));
        // 已使用优惠券集合 用于优惠券列表默认选中
        const usedCouponList = productList.filter(item => item.promotionType === 3);
        // 获取优惠券列表
        const spuIdAndPriceList = productList.map(item => ({
          spuId: item.spuId,
          orderPrice: item.sellPrice,
          activityId: item.promotionId,
          activityType: item.promotionType
        }));
        this.queryCouponList(spuIdAndPriceList);
        
        // 获取康豆信息
        let orderBeans = 0;
        if (beanFlag === 1) {
          orderBeans = orderBeanPrice;
        } else {
          const maxTotalBeanPrice = productList.reduce((total, item) => {
            return item.maxOrderPoint ? total + (item.maxOrderPoint*10) : 0
          }, 0);
          orderBeans = beanBalance < (maxTotalBeanPrice/10) ? beanBalance : (maxTotalBeanPrice/10);
        }
        this.setData({
          productList,
          type,
          skuList: skuActiveList,
          orderPayInfo: {
            orderBeanPrice,
            orderCouponPrice,
            orderDiscountPrice,
            orderPayPrice,
            orderPostagePrice,
            orderProductPrice,
            orderPromotionPrice
          },
          storeList,
          isReal,
          showBuyDialog: false,
          "orderCouponInfo.usedCouponList": usedCouponList,
          "orderCouponInfo.orderCouponPriceFormat": moneyFormat(orderCouponPrice || 0),
          "orderBeanInfo.beanFlag": beanFlag,
          "orderBeanInfo.orderBeanPrice": orderBeanPrice,
          "orderBeanInfo.orderBeans": Math.floor(orderBeans*10)/10,
          "orderBeanInfo.orderMaxOrderPoint": orderMaxOrderPoint || 0
        })
      });
      
    }).catch((err) => {
      if (err.code === this.data.errorCodeMaps.errorAddress || err.code === this.data.errorCodeMaps.errorStockNums) {
        hideToast().then(() => {
          this.setData({showBuyDialog: true, errorCase: err.code, errorGoodsName: err.msg});
          if (err.code === this.data.errorCodeMaps.errorStockNums) {
            this.startTimout(5)
          }
        })
      } else if (err.msg) {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      }
    }).finally(() => {
      this.setData({loading: false})
    })
  },
  startTimout(timeLeft) {
    this._timer = setTimeout(() => {
      wx.nextTick(() => {
        this.setData({countDown: timeLeft})
      })
      timeLeft -= 1  //时间差 减1秒
      if (timeLeft > 0) {
        this.startTimout(timeLeft)
      } else {
        wx.nextTick(() => {
          this.setData({countDown: 0})
          clearTimeout(this._timer);
          this.onBackCart() // 重新加载数据
        })
      }
    }, 1000)
  },
  /* 查询医生详情 */
  queryDoctorDetail(doctorId){
    getDoctorDetail({doctorId}).then(({result})=>{
       this.setData({ doctorInfo:result })
       this.queryPreBuyOrder()
    })
  },

  /* 打开时间预约弹窗 */
  openDatePopup(){
    const {doctorId, reducibleDateParams} = this.data;
    this.selectComponent(`#appttime`).initData({
      doctorId, // 必填
      scheduleId: reducibleDateParams.scheduleId// 时间ID 非必填（不填默认选中第一个）
    }).then(data => {
      this.setData({timeVisible: true})
      if (data && data.length) this.setData({isReducibleTime: true});
    });
    
  },

  /* 关闭时间预约弹窗 */
  closeTimeDialog(){
    this.setData({timeVisible: false})
  },

  /* 选择时间回调 */
  handleChildEvent(e){
    this.setData({reducibleDateInfo: e.detail || {}});
  },

  /* 确定修改预约时间 */
  onConfirmTime(){
    const {doctorInfo} = this.data;
    const {startTime, endTime, selectedDate, selectedTime, selectedTimeId} = this.data.reducibleDateInfo || {};
    this.setData({
      reducibleDateParams: {
        reducibleDate: selectedDate,
        reducibleTime: selectedTime,
        scheduleId: selectedTimeId,
        tmBegin: startTime,
        tmEnd: endTime
      }
    });
    this.closeTimeDialog();
  },
  
  /* 编辑所有的留言 */
  onEditMessage({detail}) {
    const {userMessageList} = this.data;
    const {storeId, userMessage} = detail;
    const msgUnit = userMessageList.find(item => item.storeId === storeId);
    msgUnit ? msgUnit.userMessage = userMessage : userMessageList.push(detail);
    this.setData({userMessageList});
  },
  
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
  /** 获取康豆数据 */
  async queryKangDouBySceneId() {
    const {result: {sceneId}} = await queryScene()
    const {token} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {token: ''}
    if (sceneId) {
      try {
        const {result = []} = await queryYasumeByScene({sceneId, token})
        const data = result.find(item => item.sceneId === sceneId)
        if (data) {
          this.setData({"orderBeanInfo.beanBalance": data.surplusPoint});
        } else {
          this.setData({
            "orderBeanInfo.beanBalance": 0,//可用康豆余额
            sceneId: undefined,
            "orderBeanInfo.beanFlag": 0
          });
        }
      } catch (e) {
        this.setData({
          "orderBeanInfo.beanBalance": 0,
          "orderBeanInfo.beanFlag": 0,
          sceneId: undefined
        });
      }
    }
  },
  /** 确认是否使用康豆抵扣金额*/
  handleDeduction({detail}) {
    this.setData({"orderBeanInfo.beanFlag": Number(detail.beanFlag)})
    this.queryPreBuyOrder()
  },
  /**获取优惠券列表*/
  queryCouponList(spuIdAndPriceList) {
    queryCouponOrderList({spuIdAndPriceList})
    .then(({result}) => {
      //couponUsedStatus 优惠券使用状态 1:没有优惠券 2:无可用优惠券 3:已使用优惠 4:不使用优惠券
      let {couponUsedStatus, usedCouponList} = this.data.orderCouponInfo
      const availableList = [];
      const unavailableList = [];
      if (result.length > 0) {
        result.forEach(item => {
          const _startTime = formatDateTime(item.startTime).getTime()
          const _endTime = formatDateTime(item.endTime).getTime()
          item.startTime = formatDate(_startTime, '.').dateTimeMM
          item.endTime = formatDate(_endTime, '.').dateTimeMM
          item.couponAmount = Number(item.couponAmount)
          if (item.isAvailable === 1) {
            availableList.push(item)
          } else {
            unavailableList.push(item)
          }
        })
        if (availableList.length === 0 && unavailableList.length > 0) {
          couponUsedStatus = 2;
        } else if (usedCouponList.length > 0) {
          couponUsedStatus = 3;
        } else if (availableList.length > 0 && usedCouponList.length === 0) {
          couponUsedStatus = 4;
        }
      } else {
        couponUsedStatus = 1;
      }
      this.setData({
        "orderCouponInfo.couponUsedStatus": couponUsedStatus,
        "orderCouponInfo.availableList": availableList,
        "orderCouponInfo.unavailableList": unavailableList
      })
    })
    .catch((err) => {
      console.log(err)
    })
  },
  /** 展示\关闭优惠券弹层 解决留言输入框错位问题 */
  toggleCouponDialog(){
    const {showMsg} = this.data;
    this.setData({showMsg: !showMsg})
  },
  /**确定选择优惠券*/
  async checkedCoupon({detail}) {
    const {productList: skuList} = this.data;
    const {productList: useCouponSku} = detail || {};
    const skus = skuList.map(item => ({
      skuId: item.skuId,
      skuNum: item.skuNum,
      splitFlag: item.splitFlag,
      spuId: item.spuId,
      promotionId: item.promotionType === 2 ? item.promotionId : '', // 活动商品不能取消活动ID
      promotionType: item.promotionType === 2 ? item.promotionType : '' // 活动商品不能取消活动ID
    }));
    let promotionIds = []; // 储存已经分配给sku的promotionId
    skus.forEach(item => {
      useCouponSku.forEach(useItem => {
        if (useItem.skuId === item.skuId && !promotionIds.includes(useItem.promotionId) && useItem.promotionType === 3) {
          promotionIds.push(useItem.promotionId);
          item.promotionId = useItem.promotionId;
          item.promotionType = useItem.promotionType || 3;
        }
      })
    })
    this.setData({
      'orderCouponInfo.couponFree': 1,
      skuList: skus
    }, () => {
      //重新请求预下单接口
      this.queryPreBuyOrder()
    })
  },
  /** 康豆余额不足弹窗操作*/
  tapCloseDialog(e) {
    this.setData({"orderBeanInfo.visibleBalance": false})
    this.queryPreBuyOrder()
  },
  /** 立即支付 */
  onPay(){
    const {extra} = this.data;
    this.orderPayHandle(extra).catch(err => {
      hideToast()
      this.setData({showBuyDialog: true, errorCase: err.code, errorGoodsName: err.msg});
      this.startTimout(5)
    })
  }
})