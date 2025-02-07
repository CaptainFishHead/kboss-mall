import { post, get } from "../../../utils/http/index";
import { PLAT_FORM } from "../../../const/index";
import env from "@config/env";

let configRequest={
  headers:{ platformId: PLAT_FORM.OBH },
  baseURL:env.YUNSHANG_API
}

// /**
//  * 我的奖品数量 - 后端魏广甫
//  * http://10.101.94.181:8050/doc.html#/default/1.256/findObhRaffleUserLogTotalNumUsingPOST
//  * @param
//  */
// export const myPrizeNum = (params) => {
//   return post(`/api/v1/obh/obhraffleuserlog/total/num`, params, configRequest)
// }

/**
 * 我的奖品列表 - 后端魏广甫
 * http://10.101.94.181:8050/doc.html#/default/obh-raffle-user-log-controller/findObhRaffleUserLogListUsingPOST
 * @param {page} 分页对象 {index, size}
 */
export const myPrizeList = (params) => {
  return post(`/api/v1/obh/obhraffleuserlog/page`, params, configRequest)
}

/**
 * 兑奖详情 - 后端魏广甫
 * http://10.101.94.181:8050/doc.html#/default/1.256/findObhRaffleUserLogInfoUsingPOST
 * @param {id} 奖品列表主键id
 */
export const findPrizeInfo = (params) => {
  return post(`/api/v1/obh/obhraffleuserlog/info`, params, configRequest)
}

/**
 * 获取奖品的物流信息 - 后端魏广甫
 * http://10.101.94.181:8050/doc.html#/default/1.256/findLogisticsUsingPOST
 * @param {id} 奖品列表主键id
 */
export const findLogistics = (params) => {
  return post(`/api/v1/obh/obhraffleuserlog/logistics`, params, configRequest)
}

/**
 * 通过奖品ID查询产品伴侣 - 后端朱晓亮
 * http://10.101.94.181:8050/doc.html#/default/3.210/findPrizePartnerListByPrizeIdUsingGET
 * @param {prizeId} 奖品id
 */
export const findPrizePartner = (params) => {
  return get(`/api/v1/obh/wechat/obhraffleprize/findPrizePartnerListByPrizeId?prizeId=${params.prizeId}`, {}, configRequest)
}

/**
 * 通过用户中奖记录ID查询分享用户列表 - 后端朱晓亮
 * http://10.101.94.181:8050/doc.html#/default/3.208/findObhRaffleActivityShareListUsingPOST
 * @param {raffleUserLogId} 用户中奖记录ID
 */
export const findShareUserList = (params) => {
  return post(`/api/v1/obh/wechat/obhraffleactivityshare/findObhRaffleActivityShareList`, params, configRequest)
}

/**
 * 兑奖页面分享校验 判断是否达成分享条件 - 后端朱晓亮
 * http://10.101.94.181:8050/doc.html#/default/3.208/checkShareUsingPOST
 * @param {raffleUserLogId} 用户中奖记录ID
 */
export const checkShare = (params) => {
  return post(`/api/v1/obh/wechat/obhraffleactivityshare/checkShare`, params, configRequest)
}

/**
 * 兑奖说明 - 后端朱晓亮
 *
 * @param {id} 用户奖品ID
 */
export const findPrizeDes = (params) => {
  return get(`/api/v1/obh/wechat/obhraffleprize/findPrizeById`, params, configRequest)
}



/**
 * 兑奖页面获取商品详情跳转链接（带参数） - 后端李肖鹏
 * http://10.101.94.181:8050/doc.html#/default/wechat/getProductDetailUsingPOST
 * @param {raffleUserLogId} 用户中奖记录ID
 * @param {spuId} 商品spuId
 */
export const getPrizeProductPath = (params) => {
  return post(`/api/v1/obh/wechat/getProductDetail`, params, configRequest)
}