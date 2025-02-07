import * as API_AfterSale from '../../../models/afterSaleModel'
import {STORAGE_USER_FOR_KEY, TOAST_TYPE} from "../../../const/index"
import {hideToast, showToast} from "../../../components/toast/index"

const app = getApp()

Page({
  data: {
    list: [],
    currPage: 1, // 当前页数
    totalPage: 1, // 总页数
    isLogged: true,
    currentIndex: 0,
    tabsList: [{
      text: '处理中',
      type: '1'
    }, {
      text: '申请记录',
      type: '2'
    }]
  },
  onLoad() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    if (user && user.userId) {
      this.setData({isLogged: true});
    } else {
      this.setData({isLogged: false});
    }
  },
  onShow() {
    if (this.data.isLogged) {
      this.findOmsRefundList()
    }
  },
  //tabs切换
  tabChange({detail}) {
    this.setData({currentIndex: detail.index})
    if (this.data.isLogged) {
      this.findOmsRefundList({page: 1})
    }
  },
  // 获取列表
  findOmsRefundList(params) {
    const {currentIndex} = this.data
    showToast({type: TOAST_TYPE.LOADING})
    API_AfterSale.findOmsRefundList({
      type: currentIndex === 0 ? '1' : '2',
      ...params
    }).then(({result}) => {
      hideToast().then(() => {
        const {list, totalPage, currPage} = result || {};
        this.setData({
          totalPage,
          currPage,
          list: currPage !== 1 ? [...this.data.list, ...list] : list
        });
      })
    }).catch((error) => {
      if (error && error.msg) {
        showToast({type: TOAST_TYPE.WARNING, title: error.msg || '网络请求错误'})
      }
    });
  },
  //登录成功后操作
  bindSuccess(e) {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    if (user && user.userId) {
      this.setData({isLogged: true});
      this.findOmsRefundList()
    }
  },
  bindFail(err) {
    this.setData({isLogged: false});
    showToast({type: TOAST_TYPE.WARNING, title: err.msg || '网络请求错误'})
  },
  bindClose() {},
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
  goBack(e) {
    return wx.switchTab({url: '/pages/mine/index'})
  },
  onReachBottom(){
    const {totalPage, currPage} = this.data;
    if(currPage < totalPage){
      this.findOmsRefundList({
        page: currPage+1
      })
    }
  }
})
