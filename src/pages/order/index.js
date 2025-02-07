import {findOrderList, queryOrderCount} from "../../models/orderModel";
import {STORAGE_USER_FOR_KEY, TOAST_TYPE} from "../../const/index";
import {hideToast, showToast} from "../../components/toast/index";
import back from "../../behaviors/back";
import { isLogged } from "@utils/index";

const app = getApp()

Page({
  data: {
    isLoading: false,
    current: 0,
    list: [{
      text: '全部',
    }, {
      text: '待付款',
    }, {
      text: '待发货',
    }, {
      text: '待收货',
    }, {
      text: '已完成',
    }],
    pageIndex: 1,
    orderData: {
      list: [],
      currPage: 0,
      pageSize: 0,
		  totalCount: 0,
		  totalPage: 0
    },
    isLogged: true,
    storeType:''
  },
  behaviors: [back],
  onLoad (options) {
    if (options.current) {
      this.setData({current: options.current})
    }
    if(options.storeType){
      this.setData({storeType:options.storeType})
    }
    this.setData({isLogged: isLogged()});
  },
  onShow () {
    this.setData({isLoading: true, orderData: {}})
    if (isLogged()) {
      showToast({type: TOAST_TYPE.LOADING})
      this.queryOrderList({page: 1})
      this.queryOrderNumers()
    }
  },
  //切换订单状态
  tabChange (data) {
    const {detail} = data;
    this.setData({
      current: detail.index, // 更新tab下标
      orderData: {},
      isLoading: true
    })
    showToast({type: TOAST_TYPE.LOADING})
    this.queryOrderList({page: 1});
    this.queryOrderNumers()
  },
  //加载更多
  onReachBottom () {
    const {currPage, totalPage} = this.data.orderData;
    if (currPage + 1 <= totalPage) {
      this.queryOrderList({page: currPage + 1});
    }
  },
  //查询订单列表数据
  queryOrderList(params) {
    const {current} = this.data;
    const status = {1: 10, 2: 20, 3: 30, 4: 50};
    findOrderList({
      orderStatus: status[current] || 0,
      ...params
    }).then(({result}) => {
      const {list} = this.data.orderData;
      this.setData({
        orderData: {
          ...result,
          list: result.currPage === 1 ? result.list : [...list, ...result.list]
        }
      });
    }).catch((err) => {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }).finally(() => {
      this.setData({isLoading: false})
      hideToast()
    })
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
  // 返回
  goBackCustomize(e) {
    wx.switchTab({url: '/pages/mine/index'})
  },
  // 刷新订单列表
  onRefresh(){
    this.queryOrderList({page: 1});
    this.queryOrderNumers()
  },
  //不同状态订单数量
  queryOrderNumers() {
    queryOrderCount().then(({result}) => {
      let orderCount = {}
      result.forEach(item => {
        orderCount[item.orderStatus] = item.total
      })
      let list = this.data.list;
      list[1].badge = this.handleNums(orderCount[10]);
      list[2].badge = this.handleNums(orderCount[20]);
      list[3].badge = this.handleNums(orderCount[30]);
      this.setData({list})
    })
  },
  handleNums(num) {
    return num ? num > 99 ? '99+' : num : undefined
  },
  bindSuccess(e) {
    if (isLogged()) {
      this.setData({isLogged: true});
      const params = {
        type: this.data.current
      }
      this.setData({isLoading: true})
      showToast({type: TOAST_TYPE.LOADING})
      this.queryOrderList(params)
      this.queryOrderNumers()
    }
  },
  bindFail(err) {
    this.setData({isLogged: false});
    showToast({type: TOAST_TYPE.WARNING, title: err.msg || '网络请求错误'})
  },
  bindClose() {
  },
});
