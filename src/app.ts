import saInit, { saLogin, track, TrackEventName } from "@utils/sa";
import {
  ENVIRONMENT_KEY,
  SCENE_CODE,
  SOURCE,
  DEFAULT_SHARE_PARAMS, USER_SOURCE_TYPE_KEY, USER_SOURCE_KEY, HEALTH_SHARE_PARAMS, COORDINATE_TYPE
} from "@const/index";
import env from "./config/env";
import { loginByCodeMap, loginNotice, shareConfig } from "@models/commonModels";
import { getLocalUser, holdUpAdv, queryUserInfo, setLocalUser, /*tjCloudLogin*/ } from "@models/userModel";
import { wxFuncToPromise } from "@utils/wxUtils";
import eventEmitter from "./utils/http/Events";
import './utils/promise.finally'
import { getEnterOptions, isAgainOpenProgram } from "@utils/index";
import { getObhMiddleParam } from "@utils/orhParams";
// import {loadCloudFontFace} from "@utils/loadFont.js";

import '@utils/at.polyfill'
import { deconstructChannels, queryUserMark } from "@models/commissionModel";
// app.js
App({
  onShow(options) {
    loginNotice(true)
    const extra = this.initExtraParams(options)
    if ((extra.member_userId && extra.member_userId !== this.globalData.extra.member_userId) || options.scene === 1089) {
      this.startApp()
      this.globalData.extra = extra
      this.globalData.marketExtra = null
    }
    if (this.globalData.trackFlag && !isAgainOpenProgram()) {
      this.reportPv()
    }
    // if (options.scene !== 1047) {
    // 	this.globalData.marketExtra = null
    // }
    this.globalData.isShow = true
  },
  onLaunch(options) {
    wx.loadFontFace({
      global: true,
      family: 'DINAlternate-Bold',
      source: 'url("https://static.tojoyshop.com/font/DIN-bold.ttf")'
    })
    /*   wx.loadFontFace({
         global: true,
         family: 'FZZZHONGJW',
         source: 'url("https://static.tojoyshop.com/font/FZZZHONGJW.TTF")'
       })*/
    // 优化字体加载
    // loadCloudFontFace('https://static.tojoyshop.com/font/FZYanSJW_Cu.TTF', 'FZYanSJW_Cu.TTF', 'FZYANS_CUJW')

    eventEmitter.on(`updateIsLogged`, isLogged => {
      this.globalData.isLogged = isLogged
    })
    try {
      // 应用更新
      this.updater()
    } catch (e) {
      console.log('应用更新监听失败', e)
    } finally {
      console.log(`启动应用更新监控`)
    }

    // 网络状态
    wx.onNetworkStatusChange(({ isConnected, networkType }) => {
      let networkStatusInfo = { isConnected, networkType }
      this.globalData.networkState = networkStatusInfo
      eventEmitter.emit("onNetworkStatus", networkStatusInfo)
    })
    //弱网监听
    wx.onNetworkWeakChange(function (res) {
      eventEmitter.emit("onNetworkWeak", { weakNet: res.weakNet, networkType: res.networkType })
    })

    // 老板云参数处理-------
    this.globalData.extra = this.initExtraParams(options)
    this.startApp()
    this.getLocation()
    // 老板云参数处理-------
    // 获取分享配置信息
    shareConfig()
      .then(({ result }) => {
        this.globalData.shareInfo = result
      })
      .catch((err) => {
        this.globalData.shareInfo = DEFAULT_SHARE_PARAMS
      })
  },
  async reportPv() {
    const res = await getObhMiddleParam()
    const query = wx.getEnterOptionsSync().query
    if (!res.mid && !res.source && (query.ssid || query.mid)) {
      // 兼容分享
      res.source = query.source
      res.mid = query.ssid
    }

    try {
      // @ts-ignore 20240129 fix： 双氧、老板云、老板帮渠道覆盖问题处理
      const {
        targetId,
        activity_id,
        sharer_id,
        scene_id,
        ssid,
        source,
        position,
        v2_code
      } = await getEnterOptions(res.source ? { ...res } : undefined, {}, { type: 'product' })
      // obh初始化逻辑在里面
      const deviceId = this.initObh({ targetId, activity_id, sharer_id, scene_id, ssid, position })
      // v2_code 在pages/index/index中处理，解决先后顺序引起的channel准确问题
      if (!deviceId && !v2_code) {
        this.initBhMall({ source, position, targetId, ssid })
      }
    } catch (e) {
      console.log('启动失败：', e)
    }
  },
  getDeviceId() {
    let enterOptions = wx.getEnterOptionsSync()
    if (enterOptions && enterOptions.path && enterOptions.path == 'pages/obh/buy/index') {
      try {
        const path = decodeURIComponent(enterOptions.query.q)
        if (path.includes("jd.yunshang520.com/dc/")) {
          const str = path.split("/dc/")[1] || ""
          if (str.includes('http://win.kjsjair.com/app/h5kjsj/index.html')) {
            return str.split("http://win.kjsjair.com/app/h5kjsj/index.html?id=")[1] || ""
          }
          return str
        } else if (path.includes("jd.yunshang520.com/dc2/")) {
          return path.split("/dc2/")[1] || ""
        }
      } catch (err) {
      }
    }
    return ''
  },
  initObh({ position, targetId, ssid, activity_id, sharer_id, scene_id }: Partial<{
    position: string,
    targetId: string,
    ssid: string,
    activity_id: string,
    sharer_id: string,
    scene_id: string
  }>) {
    const deviceId = this.getDeviceId()
    if (deviceId) {
      this.globalData.customer_channel = {
        source: SOURCE.HOTEL,
        position, targetId, ssid
      }
      saInit({
        lby_source: SOURCE.HOTEL,
        // @ts-ignore
        lby_skipscene: position,
        lby_liveid: targetId,
        lby_fourth: ssid
      })
      track(TrackEventName.Boss_HomePage, {
        hotel_id: targetId, activity_id, sharer_id, scene_id, code_id: ssid
      })
      return deviceId
    }
    return ''
  },
  async initBhMall({ source, position, targetId, ssid }: Partial<{
    source: string,
    position: string,
    targetId: string,
    ssid: string,
  }>) {
    const result = await queryUserMark({})
    // @ts-ignore
    const _channel = deconstructChannels(result)
    const _source = source ? source : (_channel.source || SOURCE.BH_MALL)
    const _position = source ? (position || '') : (_channel.position || '')
    const _targetId = source ? (targetId || '') : (_channel.targetId || '')
    const _ssid = source ? (ssid || '') : (_channel.ssid || '')
    if (source || _channel.source) {
      this.globalData.customer_channel = {
        source: _source,
        position: _position,
        targetId: _targetId,
        ssid: _ssid
      }
    }
    console.log(this.globalData.customer_channel, '渠道消息')
    saInit({
      lby_source: _source,
      // @ts-ignore
      lby_skipscene: _position,
      lby_liveid: _targetId,
      lby_fourth: _ssid
    })
    track(TrackEventName.Boss_HomePage)
  },
  // 合成客户信息，接入sobot客服。参考文档：https://codecenter.sobot.com/pages/6c0905/
  getContactInfo(data = {}) {
    const user = getLocalUser()
    // 客户信息概览
    let nickname = user.nickName || '' //客户昵称
    let headimg = user.avatarUrl || '' //用户头像
    let mobile = user.mobile || '' //用户手机号

    //自定义参数
    let params_info = Object.assign({
      "nickName": nickname,
      "tel": mobile,
      "title": "会话来源页面",
    }, data)

    let params = JSON.stringify(params_info)

    // 返回值要求最大长度为1000字符串
    return `sobot|${nickname}|${headimg}|${params}`
  },
  // @ts-ignore
  updater() {
    const updateManager = wx.getUpdateManager()
    if (!updateManager) return false
    updateManager.onCheckForUpdate(res => {
      // 请求完新版本信息的回调
      console.log(`请求完新版本信息的回调`, res.hasUpdate, res)
    })
    updateManager.onUpdateReady(() => {
      wxFuncToPromise(`showModal`, {
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
      })
        .then(res => {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        })
    })

    updateManager.onUpdateFailed(err => {
      // 新版本下载失败
      console.log(`新版本下载失败`, err)
    })
  },

  // on show 更新参数
  initExtraParams(options) {
    // @ts-ignore
    const scene = SCENE_CODE[options.scene]
    const { referrerInfo, query = {} } = options
    let extra = null
    switch (scene) {
      case 'app':
        extra = query
        break
      case 'h5':
        extra = query
        break
      case 'mini':
        extra = referrerInfo.extraData || {}
        break
      default:
        extra = { source: SOURCE.BH_MALL }
        break
    }
    console.log(extra, scene, `ExtraParams`)
    return extra
  },

  startApp() {
    // 切换环境清理数据
    const environment = env.__environment__
    const _env_ = wx.getStorageSync(ENVIRONMENT_KEY)
    if (_env_ !== environment) {
      try {
        wx.clearStorageSync()
        wx.setStorageSync(ENVIRONMENT_KEY, environment)
      } catch (e) {
        console.error(e, '切换环境清理数据')
      }
    }
    this.loginByCode()
  },

  async loginByCode() {
    let { source, code, targetId, position, token, ssid/*, deviceId, query*/ } = await getEnterOptions()
    // @ts-ignore
    const registerType = USER_SOURCE_TYPE_KEY[source]
    if (targetId && registerType) {
      wx.setStorageSync(USER_SOURCE_KEY, {
        thirdId: targetId, registerType
      })
    }
    // if (!code && !token) return null
    loginByCodeMap({ code, source, token, type: 'login' })
      .then((result = {}) => {
        wx.clearStorageSync()
        setLocalUser(result)
        return queryUserInfo()
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        loginNotice()
        const user = getLocalUser()
        if (user.userId) {
          saLogin(user.userId, true)
        }
        this.reportPv()
        this.globalData.trackFlag = true
        holdUpAdv()
      })
  },

  // 老板云用户认证
  // bossCloudLogin({member_userId}) {
  // 	if (!member_userId) {
  // 		return Promise.resolve()
  // 	}
  // 	return tjCloudLogin({code: member_userId})
  // 		.then(({result}) => {
  // 			wx.setStorageSync(STORAGE_USER_FOR_KEY, {...result})
  // 			return queryUserInfo()
  // 		})
  // },
  //授权获取位置
  async getLocation() {
    var that = this;
    try {
      // 检查用户是否已经授权过位置信息权限
      const { authSetting }: any = await wxFuncToPromise(`getSetting`)
      // 用户未授权，请求用户授权
      if (authSetting['scope.userLocation'] !== undefined && authSetting['scope.userLocation'] !== true) {
        wxFuncToPromise(`authorize`, { scope: 'scope.userLocation' }).then(() => {
          that.getUserLocation();
        })
      } else {
        that.getUserLocation();
      }
    } catch (e) {
      console.log(e)
    }
  },
  // 用户已授权，直接获取位置信息
  getUserLocation() {
    wxFuncToPromise(`getLocation`, {
      type: COORDINATE_TYPE,
    }).then((res: any) => {
      // console.log('UserLocation', res)
      this.globalData.userLocation = {
        latitude: res.latitude,// 纬度，浮点数
        longitude: res.longitude,// 经度，浮点数
      }
    })
  },
  onHide() {
    this.globalData.isShow = false
  },
  globalData: {
    // 同步v2_code，下单参数source、position、targetId
    customer_channel: null,
    deveiceCode: '', //扫描的氧吧设备码
    userInfo: null,
    shareInfo: DEFAULT_SHARE_PARAMS,
    // 订单附加参数（三方、来源）
    extra: {
      // roomLiveId（固定，如直播间则带此id，为空时值为“”）
      // member_userId（固定，等于加密老板云用户userid）；
      // source=laobanyunmp（固定，小程序端）；
      // skipScene（运营配置，取位置代码12……）；1.1老板云APP访问康老板：banner位（1）、金刚区（2）、push推送（3）、开屏（4）、信息流（5）、直播间（6）、直播预告页（7），外部投放（8）跳转到康老板小程序
    },
    isLogged: getLocalUser().token,
    networkState: {
      isConnected: true,
      networkType: ''
    },
    isShow: true,
    trackFlag: false,
    isMoblieLogin: false,
    userLocation: {
      latitude: 0,// 纬度，浮点数
      longitude: 0,// 经度，浮点数
    }
  },
  watch(key, func) {
    const obj = this.globalData
    // 加个前缀生成隐藏变量，防止死循环发生
    let ori = obj[key]; //obj[key]这个不能放在Object.defineProperty里
    if (ori) { //处理已经声明的变量，绑定处理
      func(ori);
    }
    const _key = `_${key}`
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set(value) {
        this[_key] = value
        func(value)
      },
      get() {
        if (typeof this[_key] === 'undefined') {
          if (ori) {
            this[_key] = ori
            return ori
          }
          return undefined
        }
        return this[_key]
      }
    })
  }
})
