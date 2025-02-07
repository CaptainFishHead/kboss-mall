import { post } from "../utils/http/index";
import { wxFuncToPromise } from "../utils/wxUtils";
import env from "../config/env";
import { PLAT_FORM, STORAGE_USER_FOR_KEY, TEMP_CLOUD, USER_SOURCE_KEY, RECEIVER_ADDRESS } from "../const/index";
import { getSource, loginNotice } from "@models/commonModels";
import { track } from "@utils/sa";



/**
 * 用户登录一系列操作，包含业务存储用户信息，最终promise返回的结果不变（接口返回拦截器包装的结果：{code,result,msg}）,直接集成登录逻辑是为了防止需要在请求接口时有可能需要登录后继续发送请求完成上一次操作逻辑，在请求拦截器中有使用
 * 先检查或者获取授权信息
 * 1、微信登录，获取code
 * 2、获取微信用户信息
 * 3、和服务端交互通过wx.login返回的code完成token信息交换
 * 4、本地缓存携带token的用户信息
 * @returns {Promise<AxiosResponse<*>>}
 */
export const wxAuthorizeLogin = async () => {
  try {
    const [{code}, {
      encryptedData,
      iv
    }] = await Promise.all([wxFuncToPromise(`login`), wxFuncToPromise(`getUserProfile`, {
      desc: '识别您的身份并创建帐号提供服务',
      lang: 'zh_CN'
    })])
    // await wxReqAuthorize({scope: 'scope.userInfo'})
    // system 操作系统版本  version 微信版本 SDKVersion 客户端基础库版本
    // model 设备型号
    const {system: sysVersion, model: unitType} = wx.getSystemInfoSync()
    // const {thirdId} = wx.getStorageSync(USER_SOURCE_KEY) || {}
    const response = await post(`/api/v1/cs/program/crmuser/login`, Object.assign({}, {
      code, encryptedData, iv, sysVersion, unitType,
      appVersion: env.version, platform: '3',
      deviceId: '', ip: ''// ,thirdId,nickname: userInfo.nickName,userHeadIcourl
    }))
    await wx.setStorageSync(STORAGE_USER_FOR_KEY, response.result)
    saveKangUser()
    loginNotice()
    return response
  } catch (e) {
    return Promise.reject(e)
  }
}


export const registerType = {
  "bh-mall_perf": 100
}
/**
 * 注册并登录
 * @param params
 * @returns {Promise<AxiosResponse<*>>}
 */
export const registerAndLogin = async (params) => {
  const enterOptions = await getSource()
  const extra = wx.getStorageSync(USER_SOURCE_KEY) || {}
  const app = getApp()
  const {source, targetId: channelId, position, ssid: extInfo} = app.globalData.customer_channel || {
    ...enterOptions
  }
  let channel = position && source ? `${source}_${position}` : source
  if (channel === `bh-mall_perf`) {
    params.registerType = registerType["bh-mall_perf"]
  }
  if (extra && extra.registerType) {
    if (extra.registerType === 40) {
      channel = 'HOTEL_M'
    } else if (extra.registerType === 70) {
      channel = 'ORH_M'
    }
  }
  const group = Date.now()
  try {
    track(`kboss_applet_login_logs`,{group,message:`LOCAL:【${JSON.stringify(app.globalData.customer_channel||{})}】;ENTER_OPTIONS：【${JSON.stringify(enterOptions)}】`,steps:1,actionUrl :`/member/app/wxcode/login/`})
  } catch (e) {
    console.log(`kboss_applet_login_logs error`)
  }
  const response = await post(`/member/app/wxcode/login/`, Object.assign({}, params, {
    channelName:channel,
    channelId,
    extInfo,
    ...extra
  }),{
    headers: {
      "x-tojoy-source": channel,
      "x-tojoy-channel": channel,
      "x-tojoy-channelId": channelId || ''
    }
  })
  wx.setStorageSync(USER_SOURCE_KEY, null)

  wx.removeStorageSync(RECEIVER_ADDRESS)
  // wx.setStorageSync(STORAGE_USER_FOR_KEY, Object.assign({},response.result.baseMember,{token:response.result.token,userId:response.result.baseMember.memberId}))
  setLocalUser(response.result)
 try {
   saveKangUser()
 } catch (e) {
   console.error('saveKangUser',e)
 }

  loginNotice()
  return {...response,group}
}

export const setLocalUser = (user)=>{
  wx.setStorageSync(STORAGE_USER_FOR_KEY, Object.assign(
    {},user.baseMember,{token:user.token,userId:(user.baseMember||{}).memberId}
  ))
}

export const getLocalUser = ()=>{
  return wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
}

const saveKangUser = async  () => {

  try {
    const res1 = await wxFuncToPromise('login')
    const openIdRes = await post('/api/v1/obh/program/nl/getWxInfoByCode', {code: res1.code}, {headers:{ platformId: PLAT_FORM.OBH}, baseURL:env.YUNSHANG_API})
    if (openIdRes && openIdRes.code  === 200) {
      await post('/api/v1/obh/program/saveKangBossUser', {wxOpenId: openIdRes.result.openid}, {headers:{ platformId: PLAT_FORM.OBH}, baseURL:env.YUNSHANG_API})
    }
  } catch(err) {}

}

/**
 * 获取用户信息，并存储到storage中，promise执行成功后可以直接读取用户信息
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryUserInfo = async () => {
  // const url = `/api/v1/cs/app/crmuser/getUserInfo`
  const user = getLocalUser()
  const { result } = await post(`/member/app/customer/info`, {})
  const _user = {
    ...user,
    ...result
  }
  _user.userId = _user.userId||_user.memberId
  wx.setStorageSync(STORAGE_USER_FOR_KEY, _user)
  return wx.getStorageSync(STORAGE_USER_FOR_KEY)
}

// /**
//  * 获取用户等级（已废弃）
//  */
// export const getUserLevel = () => {
// 	return post(`${TEMP_CLOUD}/member/level/get`, {})
// }

/**
 * 会员等级关系表 详情
 * @param memberPhone  会员手机号 string
 * @param targetId  目标id string
 * @param tenantUserId  用户ID string
 * @param type  2确认收货，3售后退款 integer
 */
export const getMemberLevel = (params) => {
	// return post(`${TEMP_CLOUD}/member/app/memberLevelRelation/findMemberLeveinfo`, params)
	return post(`${TEMP_CLOUD}/member/app/memberLevelRelation/queryMemberLevelInfo`, params)
}

/**
 * 查询会员等级规则信息
 * @param token  token string
 */
export const queryMemberLevelRule = params => {
	return post(`${TEMP_CLOUD}/member/app/memberLevelRelation/queryMemberLevelRule`, params)
}

/**
 * 查询会员是否升级
 * @param token  token string
 */
export const queryMemberLevelChange = params => {
	return post(`${TEMP_CLOUD}/member/app/memberLevelRelation/queryMemberLevelChange`, params)
}

/**
 * 天九老板云用户登录
 * @param code : string : 老板云传递过来的加密用户id
 * @returns {Promise<AxiosResponse<*>>}
 */
// export const tjCloudLogin = ({code}) => {
// 	return post(`/api/v1/cs/third/loginBossDirectSupplyFromThird`, {
// 		tojoyCloudUserId: code
// 	})
// }
/**
 * 上传用户行为数据
 * @param params
 * {
 *   "actionTime": 0,
 *     "actionType": "",
 *     "channel": "",
 *     "trace": {
 *       "clickId": ""
 *     }
 * }
 * @returns {Promise<AxiosResponse<*>>}
 */
export const holdUpAdv = (params) => {
  const {query, ...more} = wx.getLaunchOptionsSync()
  // console.log('holdUpAdv query', query, more)
  const user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}

  if (query.gdt_vid && user.userId) {
    // TODO：这里上报
    post(`${TEMP_CLOUD}/cb/app/ads/userActions/userActionsAdd`, {
      actionTime: Math.floor(Date.now() / 1000),
      actionType: 'RESERVATION',
      channel: 'TENCENT',
      trace: {clickId: query.gdt_vid}, ...params
    })
  }

}

/**
 * 更新用户信息
 "requestInfo": {
 "avatarUrl": "",
 "nickName": ""
 }
 */
export const updateUserInfo = (params) => {
  return post(`/member/app/customer/update`, params)
}

/**
 * 获取红促宝token
 * @param token  token string
 */
export const getHCBToken = params => {
  return post(`${TEMP_CLOUD}/member/app/customer/badboy/get`, params)
}
/**
 * 获取健康早知道
 */
export const getHealthKnow = params => {
  return post(`/cms/app/recommend/main/getHealthKnow`, params)
}
