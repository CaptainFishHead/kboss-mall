import {
  post,
  get
} from "../../../utils/http/index";
import {
PLAT_FORM, DELAY
} from "../../../const/index";

import httpTask from "../../../utils/http/HttpTask";
import env from "@config/env";

let configRequest={
  headers:{ platformId: PLAT_FORM.OBH},
  baseURL:env.YUNSHANG_API
}
/**中间跳转页面，获取跳转地址 - 后端陈林
 * @params id ("场景ID或者活动id")
 * @params type("类型：1.场景ID,2.活动id")
 * @params sharerSaffId("推广人id")
 * @params sharerHotelId("推广人酒店id")
 * @return path(小程序跳转路径),param(传递的参数)
*/
export const hotelGetSchemeUrl = (params) => {
  return post(`/api/v1/obh/wechat/obhhotel/getSchemeUrl`, params,configRequest)
}
//校验售后弹窗 - 后端徐孝敬
export const checkRefund = (params) => {
  return post(`/api/v1/obh/wechat/obhorder/checkOrder`, params,configRequest)
}
//确认售后 - 后端顾夕阳
export const confirmRefund = (params) => {
  return post(`/api/v1/obh/pay/refund`, params,configRequest)
}

//判断是不是共享设备 - 后端李肖鹏
export const checkShareDeviceExsits = (params) => {
  return post(`/api/v1/obh/obhdevicenl/checkShareDeviceExsits`, params,configRequest)
}

//获取商品 - 后端朱小亮
export const findList = (params) => {
  return post(`/api/v1/obh/nl/obhproduct/findList`, params,configRequest)
}

//获取设备时间 - 后端朱小亮
export const queryDeviceTime = (params) => {
  return post(`/api/v1/obh/nl/obhproduct/queryDeviceTime`, params,configRequest)
}


/**
 * 下单 - 后端孝敬
* @param {createId} 用户userId
*/
export const buyOrder = (params) => {
  return post(`/api/v1/obh/wechat/obhorder/saveWechatObhOrder`, params,configRequest)
}
//支付 - 后端杨攀峰
export const pay = (params) => {
  return post(`/api/v1/obh/pay/obhOrderPay`, params,configRequest)
}

// 落地页直接购买 - 后端李肖鹏
export const getBuyUrl = (params) => {
  return post(`/api/v1/obh/wechat/getSchemeUrl`, params,configRequest)
}

// 获取共享设备状态，用于落地页底部栏的显示 -- 后端李肖鹏
export const getDeviceStatus = (params) => {
  return post(`/api/v1/obh/obhdevicenl/checkDeviceExsits`, params,configRequest)
}


/**
 * 服务购买记录 createId: - 后端孝雷
 * @param {createId} 用户userId
 */
export const getList = (params) => {
  return post(`/api/v1/obh/wechat/obhorder/findWechatObhOrderList`, params,configRequest)
}

/**
 * 落地页直接购买 - 后端李肖鹏
 * @param {id} 设备id
 *  type:1-首页，2-跳转立即购买详情
 */
 export const getSchemeUrl = (params) => {
  return post(`/api/v1/obh/wechat/getSchemeUrl`, params,configRequest)
}

/**
 * 扫码引流落地页，获取设备信息等 -- 后端李肖鹏
 * @param {*} params
 */
export const getDeviceLoaded = (params) => {
  return post('/api/v1/obh/nl/obhraffledevicelog/checkHasLog', params, configRequest)
}

/**
 * 获取微信OpenId -- 后端朱晓亮
 * @param {*} params
 */
export const getWechatOpenId = (params) => {
  return  post('/api/v1/obh/program/nl/getWxInfoByCode', params, configRequest)
}

/**
 * 开启氧吧设备 -- 后端李肖鹏
 * @param {*} params
 */
export const checkinForLottery = (params) =>  {
  return post('/api/v1/obh/wechat/obhraffledevicelog/saveDeviceLogDto', params, configRequest)
}


/**
 * 开启氧吧设备 -- 后端李肖鹏
 * @param {*} params
 */
export const checkinForLotteryNL = (params) =>  {
  return post('/api/v1/obh/nl/obhraffledevicelog/saveDeviceLogDto', params, configRequest)
}
/**
 * 获取抽奖活动信息 -- 后端左永宾
 * @param {*} params
 */
export const getLotteryActivity = (params) => {
  return post('/api/v1/obh/obhraffleactivity/findObhRaffleActivity', params, configRequest)
}

/**
 * 获取获奖名单列表 -- 后端魏广甫
 * @param {*} params
 */
export const queryWinningList = (params) => {
  return post('/api/v1/obh/obhraffleactivity/findActivityWinList', params, configRequest)
}


/**
 * 获取抽奖活动信息 -- 后端左永宾
 * @param {*} params
 */
export const getLotteryActivityNL = (params) => {
  return post('/api/v1/obh/obhraffleactivity/nl/findObhRaffleActivity', params, configRequest)
}

/**
 * 获取获奖名单列表 -- 后端魏广甫
 * @param {*} params
 */
export const queryWinningListNL = (params) => {
  return post('/api/v1/obh/obhraffleactivity/nl/findActivityWinList', params, configRequest)
}
/**
 * 奖活动用户登录后--增加用户扫描开房所得的抽奖次数 -- 史孝雷
 * @param {*} params
 */
export const addLotteryTimes = (params) => {
  return post('/api/v1/obh/wechat/obhraffleuser/addUserRaffleNumFromOpenId', params, configRequest)
}

/**
 * 获取用户的抽奖次数 -- 史孝雷
 * @param {} params
 */
export const queryLotteryTimes = (params) => {
  return post('/api/v1/obh/wechat/obhraffleuser/nl/querySurplusRaffleNum', params, configRequest)
}

/**
 * 抽奖 -- 左永宾
 * @param {*} params
 */
export const lottery = (params) => {
  return post('/api/v1/obh/obhraffleactivity/drawRaffle', params, configRequest)
}

/**
 * 分享增加抽奖次数 -- 史孝雷
 * @param {*} params
 */
export const shareForLottery = (params) => {
  return post('/api/v1/obh/wechat/obhraffleuser/addUserRaffleNumByShare', params, configRequest)
}

/**
 * 查询分享参数 -- 朱晓亮
 * @param {*} id
 */
export const queryShareParams = (id) => {
  return get(`/api/v1/obh/wechat/obhParameter/queryById/${id}`, configRequest)
}

/**
 * 活动预览 -- 左永宾
 * @param {*} params
 */
export const previewActivity = (params) => {
  return post('/api/v1/obh/obhraffleactivity/nl/previewObhRaffleActivity', params, configRequest)
}

/**
 * 获取分享活动相关参数，主要是小程序码 -- 朱晓亮
 * @param {*} params
 */
export const requestSunQr = (params) => {
  return post('/api/v1/obh/wechat/obhraffleactivityshare/queryRaffleActivityShareInfo', params, configRequest)
}

/**
 * 分享链接登录后，保存分享信息 -- 朱晓亮
 * @param {*} params
 */
export const saveShareLogin = (params) => {
  return post('/api/v1/obh/wechat/obhraffleactivityshare/saveObhRaffleActivityShare', params, configRequest)
}

/**
 * 被分享人添加抽奖次数 -- 史孝雷
 * @param {*} params
 */
export const addShareCount = (params) => {
  return post('/api/v1/obh/wechat/obhraffleuser/nl/addRaffleNumToShared', params, configRequest)
}


/**
 * 查询分享信息 -- 朱晓亮
 * @param {*} params
 */
export const requestShareInfo = (params) => {
  return post('/api/v1/obh/obhraffleactivityshare/findObhRaffleActivityShare', params, configRequest)
}

/**
 * 查询分享次数  --  史孝雷
 * @param {*} params
 */
export const queryShareNum = (params) => {
  return post('/api/v1/obh/wechat/obhraffleuser/queryUserShareNum', params, configRequest)
}

/**
 * 落地页配置
 */
export const queryLoadedJson = () => {
  const url = `https://static.tojoyshop.com/data/obh/loadedv1.1.json`
  return httpTask.createTask(() => get(url, { v: Date.now() }, { baseURL: '' }), { url }, DELAY)
}

/**
 * 落地页视频配置信息
 */
export const queryLoadedVideoConfig = () => {
  const url = `https://static.tojoyshop.com/data/obh/loadedVideo.json`
  return httpTask.createTask(() => get(url, { v: Date.now() }, { baseURL: '' }), { url }, DELAY)

}