import {STORAGE_USER_FOR_KEY, TOAST_TYPE} from "@const/index";
import {hideToast, showToast} from "@components/toast/index";
import back from "@behaviors/back";
import { myPrizeList } from "../models/myPrize"
import { track } from "@utils/sa";

const app = getApp()

Page({
  data: {
    isLoading: false,
    pageIndex: 1,
    prizeList: [],
    list: [{
      text: '已中奖',
    }, {
      text: '代兑奖',
    }, {
      text: '兑奖中',
    }, {
      text: '已兑奖',
    },],
    isLogged: true,
    userId: '',
    isNotMore: false
  },
  behaviors: [back],
  _starttime: 0,
  onLoad (options) {
    this._starttime = Date.now()
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    if (user && user.userId) {
      this.setData({userId: user.userId})
      this.setData({isLogged: true});
    } else {
      this.setData({isLogged: false});
    } 
    this.initData()
  },
  onShow (e) {
    this._starttime = Date.now()
    // this.initData()
  },
  initData() {
    if (this.data.isLogged) {
      showToast({type: TOAST_TYPE.LOADING})
      this.setData({pageIndex: 1, prizeList: []})
      this.queryPrizeList()
    }
  },
  onPullDownRefresh() {
    this.initData()
    // wx.stopPullDownRefresh()
  },
  //加载更多
  onReachBottom () {
    if (this.data.isLoading || this.data.isNotMore){
      return
    }
    this.setData({
      pageIndex: this.data.pageIndex + 1
    })
    this.queryPrizeList(this.data.prizeList)
  },
  //查询我的奖品列表数据
  queryPrizeList(prizeList = []) {
    this.setData({isLoading: true})
    myPrizeList({page: {size: 10, index: this.data.pageIndex}}).then(res => {
      const list = [...prizeList, ...res.result]
      this.setData({prizeList: list})
      if (res.result.length < 10) {
        this.setData({isNotMore: true})
      }
    }).catch((err) => {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }).finally(() => {
      wx.stopPullDownRefresh()
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
    this.goBack(undefined, '/pages/mine/index')
  },
  handleNums(num) {
    return num ? num > 99 ? '99+' : num : undefined
  },
  bindSuccess(e) {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    if (user && user.userId) {
      this.setData({isLogged: true});
      this.initData()
    }
  },
  bindFail(err) {
    this.setData({isLogged: false});
    showToast({type: TOAST_TYPE.WARNING, title: err.msg || '网络请求错误'})
  },
  bindClose() {
  },
  // 设置埋点
  setPoint(){
    const endtime = Date.now();
    const cycle_time = Math.floor((endtime - this._starttime) / 1000)
    const { hotelId, hotelName, activityId, activityName } = this.options;
    let trackOptions = {
      starttime: this._starttime,
      endtime,
      cycle_time,
      hotel_id: hotelId,
      hotel_name: hotelName,
      activity_id: activityId,
      activity_name: activityName
    };
    track('Boss_PrizeList', trackOptions)
  },
  onHide() {
    this.setPoint()
  },
  onUnload(){
    this.setPoint();
  },
});
