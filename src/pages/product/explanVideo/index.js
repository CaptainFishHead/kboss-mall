import { queryVideoBySpu } from "../../../models/productModel";
import {track, TrackEventName} from "../../../utils/sa";

// 直播前页面 预告
Page({
    data: {
      statusBarHeight: 0,
      productVideo: {
        introUrl: 'https://test-1258763073.cos.ap-beijing.myqcloud.com/video/mp4/1689299034414.mp4'
      },
    },
    _starttime: null,
    _videoTime: 0, // 预览视频的多次累加时间
    _videoLoop: 0, // 视频循环播放次数
    onShow() {
      this._starttime = Date.now();
    },
    onLoad(option) {
      this.getVideo(option.spuId)
      wx.getSystemInfo().then((res) => {
        this.setData({
          statusBarHeight: res.statusBarHeight
        })
      })
    },
    videoErrorCallback() {
      wx.showToast({title: '视频播放错误', icon: 'none'})
    },
    videoTimeUpdate({detail}){
      const {currentTime, duration} = detail;
      if(duration && currentTime >= duration) {
        this._videoLoop += 1;
      }
      this._videoTime = this._videoLoop * duration + detail.currentTime;
    },
    getVideo(spuId) {
      // 获取该商品讲解视频
      queryVideoBySpu({ spuId }).then(data => {
        this.setData({ productVideo: data.result })
      })
    },
    onUnload() {
      this.setPoint()
    },
    onHide() {
      this.setPoint()
    },
    setPoint() {
      const endtime = Date.now();
      const cycle_time = Math.floor((endtime - this._starttime) / 1000)
      const { productVideo } = this.data;
      track(TrackEventName.Boss_LiveExplanation_Detail, {
        starttime: this._starttime,
        endtime,
        cycle_time,
        video_link: productVideo.introUrl,
        video_duration: this._videoTime
      })
    }
  })
