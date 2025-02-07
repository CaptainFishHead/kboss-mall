import { post } from "../utils/http/index";
import { CLOUD_SDK, SOURCE, TEMP_CLOUD } from "../const/index";
import env from "../config/env";

export const isPlugin = source => [SOURCE.PLUGIN, 'sdk'].includes(source)
const baseApi = source => {
  return {
    baseURL: isPlugin(source) ? env.SDK_API : env.BASE_API,
    startWith: isPlugin(source) ? `${TEMP_CLOUD}${CLOUD_SDK}/cms-new` : `${TEMP_CLOUD}/cms/v2`,
  }
}
/**
 * 获取主题
 * @param pageId
 * @param pageType 2：商城  3：专栏
 * @param extra {{source}} - 来源(为重载小程序首页准备，重载统一为bds)
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryThemeByPageId = async ({pageId = undefined, activeId, pageType = undefined }, extra = {}) => {
  if (pageId === 'undefined' || !pageId) pageId = undefined
  const { baseURL, startWith } = await baseApi(extra.source)
  const resp = await post(`${startWith}/column/app/theme`, {
    pageId,
    activeId,
    pageType
  }, { baseURL })
  if (resp.result.theme) {
    resp.result.theme = JSON.parse(resp.result.theme)
  }
  return resp
}
/**
 * 获取页面配置信息
 * @param pageId
 * @param pageType 2：商城  3：专栏
 * @param activeId
 * @param extra {{preview,source}} - 预览（用户id）,来源(为重载小程序首页准备，重载统一为bds)
 * @returns {Promise<{result: *}>}
 */
export const queryPageConfigByPageId = async ({ pageId, activeId, pageType = undefined }, extra = {}) => {
  if (pageId === 'undefined' || !pageId) pageId = undefined
  const { baseURL, startWith } = await baseApi(extra.source)

  const {
    result,
    ...more
  } = await post(`${startWith}/column/app/${extra.preview ? 'noPublishList' : 'list'}`, {
    pageId,
    activeId,
    pageType
  }, { baseURL })
  return {
    result: result.map(({ functional, cells, ...column }) => ({
      ...column,
      cells: cells.map(({ functional, ...cell }) => ({ ...cell, functional: JSON.parse(functional || '[]') })),
      functional: JSON.parse(functional || '[]')
    })), ...more
  }
}
/**
 * 小程序端-新首页-（0运营位+1个人数据窗口+7服务顾问 聚合口）
 */
export const welcome = (params) => {
  return post(`/cms/app/v3/homepage/welcome`, params)
}
/**
 * 小程序-新首页-为您推荐
 */
export const listRecommend = (params) => {
  return post(`/cms/app/recommend/mine/list`, params)
}
/**
 * 小程序端--新人引导内容
 */
export const newcomerList = (params) => {
  return post(`/member/app/guide/newcomer/content/list`, params)
}
/**
 * 小程序端--新人引导内容提交
 */
export const newcomerRecord = (params) => {
  return post(`/member/app/guide/newcomer/record`, params)
}