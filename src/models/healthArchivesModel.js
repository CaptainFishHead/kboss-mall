import {post} from "@utils/http/index";
import {TEMP_CLOUD} from "@const/index";

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
 * 健康档案- 上传报告
 * @param str 报告图 url
 * @returns {Promise<AxiosResponse<*>>}
 */
export const uploadHealthReport = params => {
  return post(`/member/app/report/upload`, params)
}

/**
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryHealthArchivesInfo = params => {
  return post('/member/app/archive/homepage', params)
}

/**
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryRecuperateList = params => {
  return post('/member/app/recuperate/list', params)
}

/**
 * @param str id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryRecuperateInfo = params => {
  return post('/member/app/recuperate/get', params)
}


/**
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryMetricsCategory = params => {
  return post('/member/app/metrics/category/list', params)
}

/**
 * @param str id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryDataInMetrics = params => {
  return post('/member/app/archive/metrics/data', params)
}

/**
 * @param str id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryMetricsDetails = params => {
  return post('/member/app/archive/metrics/latest', params)
}

/**
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryAllDataInMetrics = params => {
  return post('/member/app/archive/metrics/data/all', params)
}

/**
 * @param str id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryMetricsHistory = params => {
  return post('/member/app/archive/metrics/history', params)
}

/**
 * @param str id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const updateArchiveMetricsToDb = params => {
  return post('/member/app/archive/metrics/add', params)
}

/** 
 * 获取 我的顾问info
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryMetricsAssistant = params => {
  return post('/member/app/assistant/counselor', params)
}

/**
 * 指标大模型解读
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryInterpretation = params => {
  return post('/member/app/archive/IndicatorsInterpretation', params)
}

/**
 * 查询单个聊天问题回复信息
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryChatAnswerInfo = params => {
  return post('/member/app/archive/queryChatAnswerInfo', params)
}