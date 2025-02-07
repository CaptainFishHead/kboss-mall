// pages/obh/promotion/index.ts
import * as API_Obh from '../models/obh'
import back from "../../../behaviors/back";
import {
  STORAGE_USER_FOR_KEY,
  USER_SOURCE_KEY,
  USER_SOURCE_TYPE_KEY,
  ORDER_SOURCE_PAGE,
} from "../../../const/index";
import { track } from "../../../utils/sa";
import { isLogged } from '../../../utils/index';
// winList
// mobile	中奖手机号	string	
// nickName	昵称	string	
// prizeId	奖品ID	string	
// prizeName	奖品名称	string	
// timeStr	时间	string


Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    wechatToken: '',
    id: '',
    checkinVisible: false,
    checkinTipsVisible: false,
    deviceInfo: {},
    productNames: '',
    winNum: 2000000,
    winList: [],
    winListReverse: [],
    prizeUserList: [],
    inited: false,
    checkInType: 0,
    isHide: false,
    currentTime: 0,
    pageStartTime: 0,
    showVideo: false,
    videoInfo: undefined,
    isEnteredVideo: false,
    muted: false, //是否静音，true静音
    playStatus: 1, //当前的播放状态，0:播放停止，1，正在播放，2，暂停
    isVideoLoading: true,
    loginPopup: false,
    loginMsg: '',
    imgs: ["https://static.tojoyshop.com/images/obh/loaded/20231020/1.png", "https://static.tojoyshop.com/images/obh/loaded/20231020/2.png", "https://static.tojoyshop.com/images/obh/loaded/20231020/3.png", "https://static.tojoyshop.com/images/obh/loaded/20231020/4.png", "https://static.tojoyshop.com/images/obh/loaded/20231020/5.png", "https://static.tojoyshop.com/images/obh/loaded/20231020/6.png", "https://static.tojoyshop.com/images/obh/loaded/20231020/7.png", "https://static.tojoyshop.com/images/obh/loaded/20231020/8.png"]
    // imgs: ['https://static.tojoyshop.com/images/obh/loaded/1.png', 'https://static.tojoyshop.com/images/obh/loaded/2.png', 'https://static.tojoyshop.com/images/obh/loaded/3.png', 'https://static.tojoyshop.com/images/obh/loaded/4.png', 'https://static.tojoyshop.com/images/obh/loaded/5.png', 'https://static.tojoyshop.com/images/obh/loaded/6.png']
  },

  behaviors: [back],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.queryLoadedConfig()
    this.queryLoadedVideoConfig()

    this.isLogged = isLogged()

    let source = wx.getStorageSync(USER_SOURCE_KEY)
    if (!source || !source.registerType) {
      wx.setStorageSync(USER_SOURCE_KEY, {
        registerType: USER_SOURCE_TYPE_KEY['HOTEL']
      })
    }

    this.video_duration = 0
    this.getId()
  },

  queryLoadedConfig() {

    API_Obh.queryLoadedJson().then(res => {
      if (res && res.result && res.result.imgs && res.result.imgs.length > 0) {
        this.setData({
          imgs: res.result.imgs
        })
      }
    }).catch(err => {
    })
  },

  queryLoadedVideoConfig() {

    API_Obh.queryLoadedVideoConfig().then(res => {
      if (res && res.result && res.result.videoInfo) {
        this.setData({
          videoInfo: res.result.videoInfo
        })
      }
    }).catch(err => {
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // this.getId()

    this.setData({
      pageStartTime: new Date(),
      isHide: false
    })
  },

  onHide() {
    this.onPageUnload()
    this.setData({
      isHide: true
    })
  },

  onUnload() {
    this.onPageUnload()
  },

  onPageUnload() {
    let { pageStartTime, deviceInfo, id } = this.data
    let pageEndTime = new Date()
    let { hotelId, hotelName, activityId, activityName } = deviceInfo


    if (!this.scrollTop) {
      this.scrollTop = 0
    }
    let page_scale = this.scrollTop / this.rootHeight * 100
    if (page_scale > 100) page_scale = 100
    track('Boss_Obh_Special_Detail', {
      deviceId: id,
      hotel_id: hotelId,
      hotel_name: hotelName,
      activity_id: activityId,
      activity_name: activityName,
      special_id: '',
      special_name: '氧吧扫码落地页',
      start_time: pageStartTime,
      end_time: pageEndTime,
      is_loggedIn: this.isLogged, 
      cycle_time: Math.floor((pageEndTime.getTime() - pageStartTime.getTime()) / 1000),
      page_scale,
      sharer_id: '',
      video_duration: Math.floor(this.video_duration)
    })
  },

  backHandler() {
    //点击上边返回按钮不弹，其他按正常逻辑
    getApp().globalData.backFromBuyTopBar = 1
    this.restart()
  },

  // 关闭入住弹窗
  onCheckinClose() {
    this.setData({
      checkinVisible: false
    })
  },

  // 显示入住开启设备弹窗
  showCheckinPopup(e) {
    let { deviceInfo } = this.data
    this.setData({
      checkInType: e.currentTarget.dataset.index ? 1 : 2,
      checkinVisible: true,
      checkinTipsVisible: false
    })

    let { activityId, hotelId, activityName, hotelName } = deviceInfo
    let { id } = this.data

      track('Boss_Obh_StartOxygenBar', {
        hotel_id: hotelId,
        activity_id: activityId,
        deviceId: id,
        hotel_name: hotelName,
        activity_name: activityName,
        action_code: e.currentTarget.dataset.index ? 1 : 2,
        action_name: e.currentTarget.dataset.index ? '直接开启' : '引导开启'
      })
      
  },

  // 提示开启设备
  showCheckinTipsPopup() {
    let { deviceInfo, openId, id } = this.data
    if (deviceInfo.openFlag == 2) {
      // 直接跳抽奖
      wx.navigateTo({
        url: `/pages/obh/buy/lottery/index?activityId=${deviceInfo.activityId}&openId=${openId}&hotelId=${deviceInfo.hotelId}&drawNum=${0}&checkInType=${2}&deviceId=${id}&hotelName=${deviceInfo.hotelName}`,
      })
    } else {
      this.setData({
        checkinTipsVisible: true
      })
    }
  },

  onTipsClose() {
    this.setData({
      checkinTipsVisible: false
    })
  },

  // 入住回调
  onCheckin(e) {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    let { id, openId, wechatToken } = this.data
    let params = {deviceId: id, wechatOpenId: openId, unit: 1, buyNum: e.detail.index + 1, wechatToken}
    params.customerMobile = user.mobile

    let promise = user.userId ? API_Obh.checkinForLottery(params) : API_Obh.checkinForLotteryNL(params)
    wx.showLoading({
      title: '加载中……',
    })
    promise.then(({result, code}) => {
      wx.hideLoading()
      if (code == 200) {
        this.setData({
          checkinVisible: false
        })
  
        let { drawNum } = result
        let { deviceInfo, openId } = this.data
        wx.showToast({
          title: '设备开启成功',
          icon: 'none'
        })

        if (!deviceInfo.activityId) {
          this.getId()
          return
        }
  
        wx.navigateTo({
          url: `/pages/obh/buy/lottery/index?activityId=${deviceInfo.activityId}&openId=${openId}&hotelId=${deviceInfo.hotelId}&drawNum=${drawNum}&checkInType=${checkInType}&deviceId=${id}&hotelName=${deviceInfo.hotelName}`,
        })
      }
    }).catch(({msg, code}) => {
      wx.hideLoading()
      if (code == -30000 || code == -30001) {
        this.showLoginPopup(msg)
      }
      wx.showToast({
        title: msg ? msg : '开始设备失败，请稍后再试。',
        icon: 'none'
      })
    })

    let { checkInType, deviceInfo } = this.data
    let { hotelId, activityId, hotelName, activityName } = deviceInfo

    track('Boss_Obh_StayTime', {
      deviceId: id,
      hotel_id: hotelId,
      activity_id: activityId,
      hotel_name: hotelName,
      activity_name: activityName,
      page_id: checkInType == 1 ? '1' : '2',
      page_name: checkInType == 1 ? '直接开启' : '引导开启',
      stay_id: e.detail.index + 1
    })
  },


  // 扫码链接解析出设备号
  getId() {
    let pages = getCurrentPages()
    let options = pages[pages.length - 1].options || {}
    let id = ''
    let {
      showError,
      errorMsg
    } = this.data
    if (options && options.q) {
      // 获取url参数
      // 1.现在我们用的码地址https://jd.yunshang520.com/dc/865812058340854
      let result = decodeURIComponent(options.q)
      if (result.indexOf("jd.yunshang520.com/dc/") != -1) {
        let str = result.split("/dc/")[1] || ""
        //兼容 https://jd.yunshang520.com/dc/http://win.kjsjair.com/app/h5kjsj/index.html?id=864531069785615
        if (str.indexOf('http://win.kjsjair.com/app/h5kjsj/index.html') !== -1) {
          id = str.split("http://win.kjsjair.com/app/h5kjsj/index.html?id=")[1] || ""
        } else {
          id = str
        }
      } else if (result.indexOf("jd.yunshang520.com/dc2/") != -1) {
        id = result.split("/dc2/")[1] || ""
      }

    } else {
      id = options.deviceId || ''
    }
    getApp().globalData.deveiceCode = id //设备id
    this.setData({
      id,
    }, () => {
      this.getWechatOpenId()
    })
  },

  // 获取设备信息
  requestDeviceInfo(openId, wechatToken) {
    let { id } = this.data
    API_Obh.getDeviceLoaded({ deviceId: id, wechatOpenId: openId, wechatToken }).then(({code, result}) => {
      if (code == 200) {
        let str = ''
        if (result.productNames && result.productNames.length > 0) {
          str = result.productNames.join('、')
        }
        this.setData({winNum: result.winNum})
        let winList = result.winList ? result.winList : []
        // if (this.data.winList.length <= 0) {
          if (winList.length >= 4) {
            this.setData({winList: winList.slice(0, Math.ceil(winList.length / 2))})
            this.setData({winListReverse: winList.slice(Math.ceil(winList.length / 2), winList.length)})
          } else {
            this.setData({winList: winList})
            this.setData({winListReverse: winList.reverse()})
          }
        // }
        this.setData({deviceInfo: result, productNames: str}, () => {

          try {
            if (!this.data.inited) {
              let {hotelId, activityId, activityName, hotelName} = result
              this.setData({inited: true}, () => {
                track('Boss_Obh_QR', {deviceId: id, hotel_id: hotelId, activity_id: activityId, action_name: activityName, hotel_name: hotelName})
              })
            }
          } catch(err) {}
        })
      }
    }).catch(({msg, code}) => {
      if (code == -30000 || code == -30001) {
        this.showLoginPopup(msg)
      } else {
        wx.showToast({ title: msg, icon: 'none' })
        setTimeout(() => {
          getApp().globalData.backFromBuyTopBar = 0 //点击上边返回按钮不弹，其他按正常逻辑
          this.restart()
        }, 2000)
      }
    })

  },

  showLoginPopup(msg) {
    this.setData({
      loginPopup: true,
      loginMsg: msg
    })
  },

  // 获取微信的openid
  getWechatOpenId() {
    this.setData({
      loginPopup: false
    })
    let that = this
    wx.login({
      success: (res) => {
        API_Obh.getWechatOpenId({ code: res.code }).then(({ result, code }) => {
          if (code == 200) {
            if (result && result.openid) {
              that.setData({openId: result.openid, wechatToken: result.wechatToken})
              that.requestDeviceInfo(result.openid, result.wechatToken)
            }
          }
        }).catch(err => {
        })
      },
    })
  },

  touchMove() {
    return true
  },


  // 视频缓冲
  bindprogressVideo(e) {
    let { isVideoLoading, videoInfo } = this.data
    let { buffered } = e.detail
    //buffered//视频的缓冲加载的进度百分比,0-100
    if (isVideoLoading && buffered && buffered > (3)) {
      this.setData({isVideoLoading: false})
    }
  },

  bindTimeUpdateVideo(e) {
    let { currentTime } = e.detail

    this.video_duration += currentTime - this.data.currentTime
    this.setData({currentTime})
  },

  // 显示视频组件
  showVideoContainer() {
    this.setData({showVideo: true, playStatus: 1, isEnteredVideo: true}, () => {
      if (this.data.playStatus == 2) {
        this.changePlay()
      }
    })

    let { checkInType, deviceInfo, id } = this.data
    let { hotelId, activityId, hotelName, activityName } = deviceInfo

    track('Boss_Obh_LiveIn', {deviceId: id, hotel_id: hotelId, activity_id: activityId, action_name: activityName, hotel_name: hotelName, special_id: '', special_name: '氧吧扫码落地页',})
  },

  
  //changePlay,更改播放状态
  changePlay(type = 0) {
    //type=1,播放，2，停止，0，切换
    //playStatus:0,//当前的播放状态，0:播放停止，1，正在播放，2，暂停
    let {playStatus} = this.data
    let that = this
    wx.createSelectorQuery().select('#myVideo').context(function (res) {
      let videoContext = res.context
      if ((type == 0 || type == 1) && (playStatus == 0 || playStatus == 2)) {
        videoContext.play()
        playStatus = 1
      } else if ((type == 0 || type == 2) && playStatus == 1) {
        videoContext.pause()
        playStatus = 2
      }
      // videoContext.stop()
      // playStatus=0
      that.setData({
        playStatus: playStatus
      })
    }).exec()
  },

  //点击播放按钮
  clickPlay() {
    this.changePlay()
  },

  closeVideo() {
    if (this.data.playStatus != 2) {
      this.changePlay()
    }
    this.setData({showVideo: false})
  },
  
  //切换视频声音
  changeMuted(e) {
    this.setData({
      muted: !this.data.muted
    })
  },


  onReady() {
    let that = this
    wx.createSelectorQuery().in(this).select('#root-container').boundingClientRect(res => {
      that.rootHeight = res.height
    }).exec()
  },
  

  onPageScroll(e) {
    let { scrollTop } = e
    if (!this.scrollTop) this.scrollTop = 0
    if (scrollTop > this.scrollTop) {
      this.scrollTop = scrollTop
    }
  },

  endVideo() {},

  playHandler() {},

  pauseHandler() {}
})