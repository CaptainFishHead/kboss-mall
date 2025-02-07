// 分佣相关接口调用
import { post } from "../utils/http/index";
import env from "../config/env";
import { SOURCE, TEMP_CLOUD } from "../const/index";
import { saLogin, track } from "@utils/sa";
// import { decrypt } from "@utils/crypto";
import { queryUserInfo, setLocalUser } from "@models/userModel";
import { getSource } from "@models/commonModels";

/**
 * 通过码小宝的shareId获取商品信息
 * @param shareId : string : 分享码
 */
export const queryPidByShareId = ({shareUniId}) => {
  return post(`/tbh-api/share/params`, {shareUniId}, {
    baseURL: env.COMMISSION_BASE_URL,
    headers: {
      // channel渠道:1-浏览器;2-Android;3-IOS;4-小程序;5:H5
      c: '4',
      // platform访问平台:1-API;2-运营后台
      p: '1'
    }
  })
}

/**
 * 判断用户是否为员工
 * @param skuId (string, optional): 商品规格id
 */
export const queryUserIdentity = (params) => {
  return post(`/member/app/v1/promote`, params/*,{
    baseURL:env.YUNSHANG_API
  }*/)
}

/**
 * 获取当前登录人的“营销人员信息”
 * @param {*} params
 */
export const getActorInfo = () => {
  return post(`${TEMP_CLOUD}/innersupport/app/actor/info/get`, {})
}

/**
 * 查询个人预估总收益
 * @param commissionOaid (string): 分佣人
 */
export const queryTotalStatistics = (params) => {
  return post(`/api/v1/subcommission/app/commission/totalStatisticsByToken`, params,{
    baseURL:env.PROXY_MALL_API
  })
}

/**
 * 查询个人月度预估总收益
 * @param commissionOaid (string): 分佣人
 * @param queryDate (string): 查询年月，例如：2022-01
 */
export const queryMonthStatistics = (params) => {
  return post(`/api/v1/subcommission/app/commission/monthlyStatisticsByToken`, params,{
    baseURL:env.PROXY_MALL_API
  })
}
/**
 * 分页查询分佣记录
 * @param commissionOaid (string): 分佣人
 * @param endDate (string, optional): 结束时间【格式:yyyy-MM-dd】
 * @param order (string, optional): 排序字段（数据库）排序规则【字段名-asc/desc】
 * @param key (string, optional): 关键字
 * @param page (分页对象【QueryPage】, optional): 分页对象
 * @param queryDate (string): 查询年月，例如：2022-01
 * @param startDate (string, optional): 开始时间【格式:yyyy-MM-dd】
 */
export const queryCommissionByPage = (params) => {
  return post(`/api/v1/subcommission/app/commission/queryPageByToken`, params,{
    baseURL:env.PROXY_MALL_API
  })
}
const CUMULATIVE = 10
const INTERVAL = 3000
const LOCAL_USER_MASK = `LOCAL_USER_MASK`
/**
 * http://engine-test-api.rsdx.com/doc.html#/steamengine-inner-support/FE%20-%20%E5%BD%93%E5%89%8D%E7%99%BB%E5%BD%95%E4%BA%BA%E6%89%80%E6%90%BA%E5%B8%A6%E8%90%A5%E9%94%80%E7%A0%81%E7%AE%A1%E7%90%86/doMarkUsingPOST
 * @param code
 * 重试次数
 * @param retry
 * 分组
 * @param group
 * @returns {Promise<AxiosResponse<*>>}
 */
export const addUserMark = (code, retry = CUMULATIVE, group = Date.now()) => {
  code = code || wx.getStorageSync(LOCAL_USER_MASK)
  if (retry <= 0 || !code) return false
  post(`${TEMP_CLOUD}/innersupport/app/actor/mark/do`, {str: code})
    .then(() => {
      wx.setStorageSync(LOCAL_USER_MASK, null)
      track(`kboss_applet_set_mask_success`, {
        actionUrl: `/innersupport/app/actor/mark/do`,
        message: `记录成功【shareId: ${code}】, 第${CUMULATIVE - retry + 1}请求成功`, group
      })
    })
    .catch(e => {
      track(`kboss_applet_set_mask_fail`, {
        actionUrl: `/innersupport/app/actor/mark/do`,
        message: `第${CUMULATIVE - retry + 1}请求失败【shareId: ${code}】,返回错误信息: ${e?.msg}`, group
      })
      if (e?.code === 401) {
        wx.setStorageSync(LOCAL_USER_MASK, code)
      } else {
        setTimeout(() => addUserMark(code, --retry), INTERVAL, group)
      }
    })

}
/**
 * http://engine-test-api.rsdx.com/doc.html#/steamengine-inner-support/FE%20-%20%E5%BD%93%E5%89%8D%E7%99%BB%E5%BD%95%E4%BA%BA%E6%89%80%E6%90%BA%E5%B8%A6%E8%90%A5%E9%94%80%E7%A0%81%E7%AE%A1%E7%90%86/getMarkUsingPOST
 * 获取当前登录人的所携带的营销码(如果有)
 * @returns {Promise<{}|{distributionId: *, channelName: *, channelId}>}
 */
export const queryUserMark = async (orderParams = {}) => {
  // 分组信息
  const group = Date.now()
  let steps = 0
  if (orderParams.channelName) {
    const {distributionId} = orderParams
    track(`kboss_applet_order_record`, {
      actionUrl: `--`,
      message: `不需要获取业绩核算记录，直接读取入参【channelName: ${orderParams.channelName} | shareId: ${distributionId}】`,
      group, steps: ++steps
    })
    if (!distributionId) return orderParams
    const {result: {extra}} = await queryPidByDirectSupplyShareId({shareId: distributionId})
    if (!extra) return {...orderParams}
    const {params} = extra
    return {...orderParams, distributionId: `${params.prefix || ''}${distributionId}`}
  }
  try {
    const {result} = await post(`${TEMP_CLOUD}/innersupport/app/actor/mark/get`, {})
    if (result.str) {
      track(`kboss_applet_query_mask_success`, {
        actionUrl: `/innersupport/app/actor/mark/get`,
        message: `获取分享id成功 【shareId: ${result.str} 】`,
        group, steps: ++steps
      })
      const {result: {extra}} = await queryPidByDirectSupplyShareId({shareId: result.str})
      if (!extra) {
        track(`kboss_applet_parse_share_fail`, {
          actionUrl: `/api/v1/subcommission/app/share/parsingShareCode`,
          message: `分享id读取解析数据失败【shareId: ${result.str} 】，${result.str}下的数据为空`,
          group, steps: ++steps
        })
        return {...orderParams}
      }
      const {params} = extra
      let channelName = params.source
      if (params.position) channelName += `_${params.position}`
      track(`kboss_applet_parse_share_success`, {
        actionUrl: `/api/v1/subcommission/app/share/parsingShareCode`,
        message: `分享id读取解析数据成功【shareId: ${result.str} 】`,
        group, steps: ++steps
      })
      return {
        ...orderParams,
        channelName,
        channelId: params.targetId,
        distributionId: `${params.prefix || ''}${result.str}`
      }
    }
    track(`kboss_applet_query_mask_fail`, {
      actionUrl: `/innersupport/app/actor/mark/get`,
      message: `接口请求成功，但是没有获取到业绩核算相关数据，shareId为空，服务端返回信息：${typeof result === 'object' ? JSON.stringify(result || {}) : result}`,
      group, steps: ++steps
    })

  } catch (e) {
    console.error(e)
    track(`kboss_applet_query_mask_fail`, {
      actionUrl: `/innersupport/app/actor/mark/get`, message: e.msg,
      group, steps: ++steps
    })
  }
  const {source,position,targetId} = await getSource()
  let channelName = source
  if (position) channelName += `_${params.position}`

  return {...orderParams, channelName: orderParams.channelName || channelName || SOURCE.BH_MALL,channelId:targetId}
}
export const deconstructChannels = ({channelName,channelId,distributionId})=>{
    if (channelName) {
      const [source,position] = channelName.split('_')
      return {
        source,position,targetId:channelId,ssid:distributionId
      }
    } else {
      return {}
    }
}
/*
 * 直供分享
 * @param shareId
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryPidByDirectSupplyShareId = async ({shareId}) => {
  try {
    const {result, code, msg} = await post(`/api/v1/subcommission/app/share/parsingShareCode`, {shareId},{
      baseURL:env.PROXY_MALL_API
    })
    const {extra, ...res} = result
    return {
      result: {
        ...res, extra: extra ? JSON.parse(extra) : null
      }, code, msg
    }
  }  catch (e) {
    return {result: {}}
  }
}

export const silentLoginByBhTkCode = async (bhTkCode)=>{
  // const token = await decrypt(bhTkCode)
  setLocalUser({token:bhTkCode})
  await queryUserInfo()
}