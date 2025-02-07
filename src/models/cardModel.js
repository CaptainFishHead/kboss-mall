import {post, get} from "../utils/http/index";
import {TEMP_CLOUD} from "../const/index";
import env from "./../config/env";

/**
 * 卡片数量统计（可用数量、不可用数量、赠送中数量、已赠送数量）
 */
export const getCardStatistics = () => {
	return post(`/marketing/app/card/statistics`, {v: Date.now()})
}
/**
 * 卡片列表
 * @param isEnable  integer($int32) 查询列表类型：1-可用，2-不可用
 * @param page  integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag  boolean 默认值true 分页标识
 * @param rows  integer($int32) 默认值10 每页行数
 */
export const queryCardList = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/myCardPage`, params)
}
/**
 * 卡消费记录列表
 * @param cardId 卡片id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryCardConsumeList = params => {
  return post(`${TEMP_CLOUD}/marketing/app/cardConsume/list`, params)
}
/**
 * 绑定卡片 卡密绑定
 * @param cardPwd 密码
 * @param ticket 验证码
 * @returns {Promise<AxiosResponse<*>>}
 */
export const bindCardByPassword = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/cdkey`, params)
}
/**
 * 激活卡片
 * @param cardNo 卡号
 * @returns {Promise<AxiosResponse<*>>}
 */
export const activateCardByNo = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/activate`, params)
}

/**
 * 赠送卡片列表
 * @param isPresent	integer($int32) 查询列表类型：1-赠送中，2-已赠送
 * @param page	integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag	boolean 默认值true 分页标识
 * @param rows	integer($int32) 默认值10 每页行数
 */
export const querySendCardList = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/myPresentCardPage`, params)
}
/**
 * 撤回赠送卡
 * @param id integer($int32) 卡ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const cancelSendCard = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/presentCancel`, params)
}


/**
 * 查询卡详情接口
 * @param id integer($int32) 卡ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryCardDetailById = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/info`, params)
}

/**
 * 赠送礼品卡
 * @param cardNo string 卡号
 * @param mobile string 手机号
 * @param presentWay integer($int32) 赠送途径：1-微信，2-短信（手机号必填）
 * @returns {Promise<AxiosResponse<*>>}
 */
export const presentGiftCard = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/present`, params)
}

/**
 * 查询卡赠送记录详情
 * @param id string 赠送记录ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryGiftCardRecord = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/presentInfo`, params)
}

/**
 * 领取礼品卡
 * @param id string 赠送记录ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const receiveGiftCard = params => {
  return post(`${TEMP_CLOUD}/marketing/app/card/receive`, params)
}
