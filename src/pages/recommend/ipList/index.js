import {STORAGE_USER_FOR_KEY, TOAST_TYPE} from "@const/index";
import {hideToast, showToast} from "@components/toast/index";
import { track, TrackEventName } from "@utils/sa";
import carrier from "@behaviors/carrier";
import {ipList} from "../models/ipModel";

Page({
	behaviors:[carrier],
	data: {
		isLoading: false,
    pageIndex: 1,
		pageSize: 10,
		ipList: [],
		isNotMore: false
	},
  _starttime: 0,
  onLoad (options) {
    this.initData()
  },
  onShow() {
    this._starttime = Date.now()
  },
  onHide(){
    this.setPoint();
  },
  onUnload() {
	  this.setPoint();
	},
  onPageScroll(e) {
    this.pageScrolling(e)
  },
  initData() {
		showToast({type: TOAST_TYPE.LOADING})
		this.setData({pageIndex: 1, ipList: []})
		this.ipList()
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
    this.ipList(this.data.ipList)
  },
  //查询我的奖品列表数据
  ipList(list = []) {
    this.setData({isLoading: true})
    ipList({rows: this.data.pageSize, page: this.data.pageIndex, state: 1, ipTypes: (this.options.ipTypes || '1').split(',')}).then(res => {
      this.setData({ipList: list.concat(res.result.list)})
      if (res.result.list.length < this.data.pageSize) {
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
	goDoctorDetail(e) {
		wx.navigateTo({
		  url: `/pages/recommend/ipDetail/index?id=${e.currentTarget.dataset.id}`
		})
	},
  
  // 设置埋点
  setPoint(){
    const endtime = Date.now();
    const cycle_time = Math.floor((endtime - this._starttime) / 1000)
    let trackOptions = {
      special_id: '',
			detail_id: '',
      special_name: '专家列表',
      starttime: this._starttime,
      endtime,
      cycle_time
    };
    track(TrackEventName.Boss_Special_Detail, trackOptions)
  },
});