import env from "../config/env";
import { get, post } from "../utils/http/index";
import { SOURCE, STORAGE_USER_FOR_KEY, TEMP_CLOUD, PLAT_FORM } from "../const/index";
import { getBaseEnterOptions, getEnterOptions, parameterMergeMapping, parsePageOnLoadOptions } from "../utils/index";
import httpTask, { fnv32a } from "../utils/http/HttpTask";
import { DELAY } from "../const/index";
import { getMemberLevel } from "./userModel";
import { wxFuncToPromise } from "../utils/wxUtils";
import { queryPidByDirectSupplyShareId } from "@models/commissionModel";

/**
 * 获取城市数据
 */
export const queryProvinceData = () => {
  const url = `https://static.tojoyshop.com/data/wxapp-boss/city.json`
  return httpTask.createTask(() => get(url, { v: Date.now() }, { baseURL: '' }), { url }, DELAY)
}
/**
 * 获取康豆场景
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryScene = () => {
  const url = `https://static.tojoyshop.com/data/wxapp-boss/sceneActivity.${ env.__environment__ }.json`
  return httpTask.createTask(() => get(url, { v: Date.now() }, { baseURL: '' }), { url }, DELAY)
}
// 获取康豆规则
export const queryHealthBeanRules = () => {
  const url = `https://static.tojoyshop.com/data/wxapp-boss/healthBeanRules.json`
  return httpTask.createTask(() => get(url, { v: Date.now() }, { baseURL: '' }), { url }, DELAY)
}

/**
 * 查询 - 康豆可见配置
 * @param
 */
export const queryBeansConfig = params => {
  return post(`${TEMP_CLOUD}/innersupport/app/common/config/get`, params)
}

/**
 * 分享配置
 * @returns {Promise<AxiosResponse<*>>}
 */
export const shareConfig = () => {
  const url = `https://static.tojoyshop.com/data/wxapp-boss/shareConfig.json`
  return httpTask.createTask(() => get(url, { v: Date.now() }, { baseURL: '' }), { url }, DELAY)
}

export const queryYasumeByScene = ({ sceneId, token }, config) => {
  return post(`/member/app/benefits/kangdou/balance/get`, {
    sceneId,
    token
  }, { headers: config })
}
export const getAllMall = () => {
  return post(`/api/v1/is/mall/getAllMall`)
}

/**
 * 获取康豆记录列表
 * @param sceneId 场景id
 * @param jfUserId 用户id
 * @param createBeginDate 交易开始时间
 * @param createEndDate 用户交易结束时间id
 * @param querySource 来源 1 康老板
 */
export const queryBillList = (params, config) => {
  // /api/v1/is/wechat/jfpointlog/findJfPointLogBillList
  return post(`/member/app/benefits/kangdou/bill/page`, { querySource: 1, ...params }, { headers: config })
}

/**
 * 获取映射关系
 * @param source
 * @returns {Promise<AxiosResponse<*>>}
 */
const queryApiMap = async ({ action }) => {
  return get(action, { v: Date.now() }, { baseURL: 'https://static.tojoyshop.com/data/wxapp-boss/maps' })
}

const querySourceMaps = () => {
  return queryApiMap({ action: `/source.json` })
}

const mapBase = async (func) => {
  const { config, params, mapInfo, mid } = await func()
  const tokenKey = mapInfo.bdsTokenKey || 'token'
  const { token } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || { token: '' }
  // token 处理
  if (mapInfo.bdsToken && token) {
    // 携带token
    if (mapInfo.bdsToken === 'params') {
      params[tokenKey] = token
    } else {
      config.headers[tokenKey] = token
    }
  }
  // baseURL 处理
  if (mapInfo.baseURL) {
    config.baseURL = mapInfo.baseURL
  }
  const { result: { payLoad = "{}", ...result } } = await post(mapInfo.action, params, config)
  const resultMap = parameterMergeMapping({ ...result, ...JSON.parse(payLoad) }, mapInfo.resultKeys, {}, true)
  if (mapInfo.midToSsid && mid) resultMap.ssid = mid
  return resultMap
}

export const queryBdsNeedsParamsByMid = async ({ mid, source, type }) => {
  return await mapBase(async () => {
    const sourceMaps = await querySourceMaps()
    const apiMap = await queryApiMap({
      action: `/${ type }/${ env.__environment__ }/${ sourceMaps[source] || source }.json`
    })
    const config = {
      headers: { ...(apiMap.headers || {}) }
    }
    const params = {
      [apiMap.paramKeys?.mid || 'mid']: mid,
      [apiMap.paramKeys?.source || 'source']: SOURCE.BH_MALL,
      // 静态参数，会原样发送到接口
      ...(apiMap.staticParams || {})
    }
    return { config, params, mapInfo: apiMap, mid }
  })
}

export const loginByCodeMap = async ({ source, code, token, type }) => {
  if (!code && !token) return Promise.reject({})
  if (token) {
    return { token: decodeURIComponent(token) }
  }
  return await mapBase(async () => {
    const sourceMaps = await querySourceMaps()
    const apiMap = await queryApiMap({
      action: `/${ type }/${ env.__environment__ }/${ sourceMaps[source] || source }.json`
    })
    const config = {
      headers: { ...(apiMap.headers || {}) }
    }
    const params = {
      [apiMap.paramKeys?.code || 'code']: code,
      [apiMap.paramKeys?.source || 'source']: source,
      // 静态参数，会原样发送到接口
      ...(apiMap.staticParams || {})
    }
    return { config, params, mapInfo: apiMap }
  })
}

export const getSource = async () => {
  const routeQuery: Record<string, any> = getBaseEnterOptions().query
  const _params: Record<string, any> = {}
  const { v2_code } = parsePageOnLoadOptions(routeQuery)
  if (v2_code) {
    const { result: { extra } } = await queryPidByDirectSupplyShareId({ shareId: v2_code })
    if (extra) {
      const { position, source, targetId, ssid }: Record<string, any> = extra.params || {}
      const channel = position && source ? `${ source }_${ position }` : source
      Object.assign(_params, {
        extInfo: ssid || v2_code, channel,
        channelId: targetId, position, source, targetId, ssid
      })
    }
  } else if (routeQuery && (routeQuery.mid || routeQuery.source)) {
    const {
      source, position,
      targetId,
      ssid
    }: Record<string, any> = await getEnterOptions({}, routeQuery)
    const channel = position && source ? `${ source }_${ position }` : source
    Object.assign(_params, { channel, channelId: targetId, extInfo: ssid, position, source, targetId, ssid })
  }
  return _params
}

/**
 * 登录通知
 * @returns {Promise<AxiosResponse<*>>}
 */
export const loginNotice = async (appShow?:boolean):Promise<any> => {
  const launchOption = JSON.stringify(wx.getLaunchOptionsSync())
  const entryOption = JSON.stringify(wx.getEnterOptionsSync())
  const user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
  if (!appShow && user.token) {
    try {
      console.log(user.token, 'getMemberLevel')
      getMemberLevel({})
    } catch (e) {
      console.error('康豆同步失败', e)
    }
  }
  // console.log('launchOption === entryOption', launchOption === entryOption)
  if ((appShow && launchOption === entryOption) || !user.token) {
    console.log('loginNotice', !user.token ? '用户没用登录，不能调用' : '', appShow && launchOption === entryOption ? '当前不具备调用条件，启动参数和激活参数一致' : '用户为登录')
    return null
  }

  try {
    const params = await getSource()
    if (!params.channel) return null
    console.log(`通知服务：loginNotice->/partner/app/data/push/bossHelpSync`, { ...params })
    post(`/partner/app/data/push/bossHelpSync`, { ...params })
  } catch (e) {
    console.error('loginNotice', e)
  }
}

/**
 * Cos临时上传秘钥
 * @returns {Promise<AxiosResponse<any>>}
 */
export const cosUploadTempSecret = ({ dir }:{dir:string}) => {
  return post(`${ TEMP_CLOUD }/file/cret/tmp/get`, { dir })
}

/**
 * 生成海报
 */
export const getPoster = (params) => {
  return post(`/getPosterImages`, params, { baseURL: env.KBOSS_WEB_API })
}

// export const getWxSharePath = async () => {
//   const res = await post(`/bh/share/path`, {
//     path: `/pages/carrier/index`,
//     params: {
//       pageId: 251,
//       source: 'source',
//       position: 'position',
//     }
//   }, { baseURL: "http://localhost:3000" })
//   console.clear()
//   console.log(res)
//
// }

// // 落地页
// const a = {
//   path: `/pages/carrier/index`,
//   params: {
//     pageId: ,
//     source: 'zhongjian',
//     position: 'yh',
//   }
// }
// // 商品详情页
// const b = {
//   path: `/pages/product/index`,
//   params: {
//     spuId: '',
//     skuId: '',
//     source: 'zhongjian',
//     position: 'yh',
//   }
// }
