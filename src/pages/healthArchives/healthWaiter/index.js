

import { TOAST_TYPE, } from "@const/index";
import { hideToast, showToast } from "@components/toast/index";
import { reqCounselor } from "@models/healthWaiter";
import { track, TrackEventName } from "@utils/sa"
import '@utils/dateFormat';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    waiterData: {},
    scheme: 0,
    _starttime: 0,
    str:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // scheme 0:默认的健康顾问内容 1：点定制方案顾问内容
    this.setData({
      str: Number(options?.str ? options.str : 0),
      scheme: Number(options?.scheme ? options.scheme : 0)
    })
    this.getDetail()
    // 记录开始时间
    this._starttime = Date.now();
    this.data.startTime = new Date();
  }, 
  onUnload() {
    this.data.endTime = new Date();
    this.setPoint();
  },
  onHide() {
    this.data.endTime = new Date();
    this.setPoint();
  },

  // 设置埋点
 setPoint(){
  const page_source = this.data.scheme === 1 ? '定制方案' : '联系管家';
  const { waiterData } = this.data;
  const end_time = Date.now();
  const cycle_time = Math.floor((end_time - this._starttime) / 1000)
  let healthOptions = {
    counselor_id: waiterData ? waiterData.consultantId : '',//顾问ID
    counselor_name: waiterData ? waiterData.consultantName : '', //顾问名称
    start_time: this.data.startTime.dateFormat("YYYY-MM-DD HH:mm:ss"), //开始时间
    end_time:  this.data.endTime.dateFormat("YYYY-MM-DD HH:mm:ss"), //结束时间
    page_source, //页面来源
    page_id: waiterData ? waiterData.consultantId : '', //页面id
    page_name:'健康管家',//页面名称
    cycle_time //时间周期
  };
  track(TrackEventName.Boss_Counselor_Detail, healthOptions)
},

  /* 拨打电话*/
  onCallTel() {
    wx.makePhoneCall({
      phoneNumber: this.data.waiterData.consultantMobile || ''
    })
  },
  /*获取详情*/
  getDetail() {
    reqCounselor({str:this.data.str})
      .then(({ result }) => {
        if(result){
          this.setData({ waiterData: result })
        }
      })
      .catch(err => {
        showToast({
          title: err.msg || "获取信息失败",
          type: TOAST_TYPE.WARNING,
          duration: 2000,
        });
      });
  },
})