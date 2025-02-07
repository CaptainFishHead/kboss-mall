import '../../../utils/dateFormat';
import back from "@behaviors/back";
import { reqGainBeansReceive, reqGainBeansInfo, reqGetOpendId } from "@models/gainBeansModel"
import { GET_BEANS_ACTIVE_TIPS, TOAST_TYPE, STORAGE_USER_FOR_KEY,HEALTH_INFO_BUSINESS_PAGE } from "@const/index";
import { hideToast, showToast } from "@components/toast/index";
import { track, TrackEventName } from "@utils/sa"
import { decrypt } from "@utils/crypto"
import { queryUserIsHealth } from "@models/healthInfo"

const turingSDK = require('../rick-sdk/turingSDK_1025_28_FJKRF3IO8NM8KYBG_20240328220812.js')
let callback; //SDK传递出来的对象
Page({
  data: {
    bgRgb: "0, 0, 0",
    opacity: 1,
    visible: false,
    activityId: "",
    gainBeansData: {
      // receiveState: 3, //活动状态(1：正常 2：活动未开始 3：活动已结束 4：用户无权参与 5：康豆余额不足 6：超出领取次数7.活动不存在 41:仅限新客户参与哟！)
    },
    showEmpty: false,
    getBeansActiveTips: GET_BEANS_ACTIVE_TIPS,
    // 埋点
    trackPointData: {
      start_time: null,//开始时间
      end_time: null,//结束时间
    },
    retainedVisible: false,//留资信息弹框
    isRetainedInfo: false,//已开启&同一个用户未填写过留资信息 显示留资弹框
    retainedMobile: '',//留资默认手机号
    isRce: false,
  },
  behaviors: [back],
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad(options) {
    console.log(options, "领康豆跳过来的参数")
    this.setData({ activityId: options.actId || options.targetId })
    this.getGainBeansInfo()
    console.log(options, "onload options 信息")
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow() {
    this.setData({
      'trackPointData.start_time': new Date()
    })
  },
  //页面卸载
  onUnload() {
    this.setPoint()
  },
  //监听页面隐藏
  onHide() {
    this.setPoint()
  },
  async onReady() {
    const openId = await this.getWechatOpenId()
    const decryptOpenId = await decrypt(openId)
    const pageObj = this
    turingSDK.init({
      channel: '109030',
      page: pageObj, //为Page时可不传，Component必传
      openid: decryptOpenId || '',
      implement: {
        getTouch(cb) {
          //获取到SDK传递的cb对象，⽤以传递接⼊侧获取到的touch evnet数据
          callback = cb;
        }
      }
    }, function (res) {
      //检测res是否初始化成功，成功为res.ret == 0
      if (res.ret == 0) {
        //初始化成功，请参考
      }
    })

  },
  closeRce() {
    this.setData({
      isRce: false
    })
  },
  openRce() {
    this.setData({
      isRce: true
    })
  },
  // 设置埋点
  setPoint() {
    const { activityId, trackPointData } = this.data
    console.log(activityId, "circle_time", Math.floor((Date.now() - trackPointData.start_time.getTime()) / 1000), "@@@@@@@@@@@@@@@@@@@@@@")
    track(TrackEventName.Boss_Special_Detail, {
      ...trackPointData,
      detail_id: activityId,
      special_id: activityId,
      special_name: '扫码领康豆',
      end_time: new Date(),
      cycle_time: Math.floor((Date.now() - trackPointData.start_time.getTime()) / 1000)
    })
  },
  goGains() {
    const isShowDialog = ![1, 6, 8].includes(this.data.gainBeansData.receiveState)
    // this.data.gainBeansData.receiveState !== 1 && this.data.gainBeansData.receiveState !== 6
    if (isShowDialog) {
      this.setData({ visible: true })
    } else if (this.data.gainBeansData.receiveState === 8) {
      this.openRce()
    } else {
      let { receiveState } = this.data.gainBeansData
      let gainBeansData = JSON.stringify(this.data.gainBeansData)
      wx.redirectTo({ url: `/pages/healthBean/draw/result/index?data=` + encodeURIComponent(gainBeansData) })
    }
  },
  // 获取微信的openid
  getWechatOpenId() {
    let that = this
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          reqGetOpendId(res.code).then(({ result, code, msg }) => {
            // encryptContext 加密后的openId    ,context 明文openId
            if (code == 200) {
              hideToast()
              if (result && result.encryptContext) {
                resolve(result.encryptContext)
              }
            }
          }).catch(err => {
            showToast({
              title: err.msg || '获取信息失败',
              type: TOAST_TYPE.WARNING,
              duration: 2000
            })
          })
        },
      })

    })

  },
  //获取图灵盾sdk的token
  getTuringSDKToken() {
    //确保init完成后再进⾏deviceToken获取(缓存接⼝)
    return new Promise((resolve, reject) => {
      turingSDK.getDeviceTokenV2(
        function (res) {
          //返回结果
          if (res.ret == 0) {
            // res.deviceToken;//返回结果token标识
            resolve(res.deviceToken)
          }
        })
    })
  },
  // 去领取康豆 decrypt
  async getGainBeansReceive(paramExtraObj) {//正常领豆
    showToast({
      type: TOAST_TYPE.LOADING
    })
    const deviceToken = await this.getTuringSDKToken()//获取deviceToken
    // platform: '1':Android,'2':iOS,'3':H5,'4':小程序
    let params = {
      activityId: this.data.activityId,
      deviceToken,
      platform: '4',
    }
    if (paramExtraObj !== null) {
      params.retention = paramExtraObj
    }
    reqGainBeansReceive(params).then(({ result, code }) => {
      console.log(this.data.gainBeansData, ":领取康豆Recieve接口数据", "result:", result)
      this.setData({
        gainBeansData: result,
        retainedVisible: false,
      })
      this.goGains()//领豆
      hideToast()
    }).catch(async (err) => {
      console.log(err, "err----")
      if (err.code === 104201) {// code 是104201需填写留资信息
        hideToast()
        this.setData({ retainedVisible: true })
      } else if (err.code === 104203) {//code 10423 运营开启了健康档案&未填写健康档案
        hideToast()
        wx.navigateTo({
          url: `/pages/healthInfo/personInfo/index?businessPage=${HEALTH_INFO_BUSINESS_PAGE.BEANS}&activityId=${this.data.activityId}`,
        })
      } else showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING,
        duration: 2000
      })
    }).finally(() => {

    })
  },
  /*授权成功后跳转对应的页面去领取康豆
  receiveState:活动状态(1：正常 2：活动未开始 3：活动已结束 4：用户无权参与 5：康豆余额不足 6：超出领取次数7.活动不存在)
  */
  async getBeans() {
    const { mobile } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || { mobile: '' }
    this.setData({ retainedMobile: mobile })
    this.getGainBeansReceive(null)
  },

  // 去商城逛逛
  goMall() {
    wx.switchTab({ url: `/pages/index/index` })
  },
  // 关闭弹框
  close() {
    this.setData({ visible: false })
  },
  // 领取康豆详情数据
  getGainBeansInfo(e) {
    reqGainBeansInfo({ activityId: this.data.activityId }).then(({ result }) => {
      this.setData({ gainBeansData: result })
    }).catch((err) => {
    })
  },
  //
  getReceive(e) {
    const { detail } = e
    this.getGainBeansReceive(detail)
  }
})
