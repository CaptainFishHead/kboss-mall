import { post } from "../utils/http/index";
import env from "../config/env";
import { TEMP_CLOUD, USER_SOURCE_KEY } from "../const/index";
import { getEnterOptions } from "../utils/index";
import { registerType } from "./userModel";

/**
 * 获取登录验证码
 * @param mobile 手机号
 */
export const getCaptcha = params => {
  return post(`${TEMP_CLOUD}/member/app/captcha/get`, params)
}

/**
 * 手机号验证码登录
 * @param mobile 手机号
 * @param code 验证码
 */
export const login = async (params) => {
  const enterOptions = await getEnterOptions()
  const extra = wx.getStorageSync(USER_SOURCE_KEY) || {}
  const app = getApp()
  const {source, targetId: channelId, position, ssid: extInfo} = app.globalData.customer_channel || {
    ...enterOptions
  }
  let channel = position && source ? `${source}_${position}` : source
  if (registerType["bh-mall_perf"]) {
    params.registerType = 100
  }
  if (extra && extra.registerType) {
    if (extra.registerType === 40) {
      channel = 'HOTEL_M'
    } else if (extra.registerType === 70) {
      channel = 'ORH_M'
    }
  }
  Object.assign(extra, {channel, channelId, registerType: params.registerType, extInfo})
  return post(`${TEMP_CLOUD}/member/app/captcha/login/`, Object.assign({}, params, {
    channel,
    channelId,
    extInfo,
    extra
  }))
}
