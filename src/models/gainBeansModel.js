import { post, get } from "../utils/http/index";
import { TEMP_CLOUD } from "../const/index";
import env from "../config/env";

/**
 * 赠送康豆活动--用户领取接口
 * @param activityId integer 赠送康豆活动主键Id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const reqGainBeansReceive = params => {
  return post(`${TEMP_CLOUD}/marketing/app/givingActivity/receive`, params)
}

/**
 * 赠送康豆活动--详情
 * @param activityId integer 赠送康豆活动主键Id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const reqGainBeansInfo = params => {
  return post(`${TEMP_CLOUD}/marketing/app/givingActivity/info`, params)
}
/** 
 * guxiyang
 * 获取openId
 * @param code   wx.login code
 * @returns {Promise<AxiosResponse<*>>}
 */
export const reqGetOpendId = (openId) => {
  return get(`${TEMP_CLOUD}/innersupport/admin/riskUserLog/openId?code=${openId}`)
}

