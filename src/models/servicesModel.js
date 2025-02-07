import { post, get } from '@utils/http/index'
import { TEMP_CLOUD } from '@const/index'
import env from '../config/env'

/**
 * 联想词
 * @param keyWord	string 搜索词名称
 * @param limit	integer($int32) 显示条数(最大10条)
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryWordLenovoList = params => {
  return post(`${TEMP_CLOUD}/opensearch/app/hotWord/v2/lenovo`, { limit: 10, ...params })
}
// ==========================我的服务=============================
/**
 * 我的服务
 * @param orderByUpdateDateAsc 按修改时间排序 true正序 false倒序
 * @param orderStatus 查询状态 0查询历史 1待付款 2待预约 3待服务 4已完成 5已关闭,
 * @param orderType 	服务类型 1线上 2到店,
 * @param page 默认值1 当前页数，从1开始,
 * @param rows 默认值10 每页行数
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryMyServiceList = params => {
  return post(`${TEMP_CLOUD}/order/app/service/order/myService`, { page: 1, rows: 10, ...params })
}

/**
 * 获取服务详情
 * @param latitude	当前位置维度
 * @param longitude	当前位置精度
 * @param orderStatus	服务状态 1待付款、2待预约、3待开始、4已完成、5已关闭
 * @param serviceId	服务id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getServiceDetail = params => {
  return post(`${TEMP_CLOUD}/order/app/service/order/getServiceDetail`, { orderStatus: 3, ...params })
}

/**
 * 取消预约
 * @param serviceOrderCode
 * @returns {Promise<AxiosResponse<*>>}
 */
export const cancelReservation = params => {
  return post(`${TEMP_CLOUD}/order/app/service/order/cancelReservation`, params)
}

/**
 * 生成二维码流
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const createQrCode = content => {
  console.log('content======', content)
  return get(`${TEMP_CLOUD}/order/app/service/order/createQrCode?content=${encodeURIComponent(content)}`)
}

/**
 *  获取编辑信息
 * @param params
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getDetailByService = params => {
  return post(`${TEMP_CLOUD}/order/app/service/order/getDetailByServiceOrderCode`, params)
  // return post(`${TEMP_CLOUD}/order/app/service/order/getUserByServiceOrderCode`, params);
}

/**
 *  线上服务编辑信息
 * @param params
 * @returns {Promise<AxiosResponse<*>>}
 */
export const completeInformation = params => {
  return post(`${TEMP_CLOUD}/order/app/service/order/completePreBookUserInformation`, params)
}

/**
 *  开始视频
 * @param params
 * @returns {Promise<AxiosResponse<*>>}
 */
export const jumpThird = params => {
  return post(`${TEMP_CLOUD}/order/app/service/order/jumpThird`, params)
}

/**
 *  获取商品门店信息
 * @param params
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getStoreList = params => {
  let url = params.serviceId ? '/goods/app/service/info/find/store' : '/goods/app/service/info/find/store/by/spu'
  return post(`${url}`, params)
}
