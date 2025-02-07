import {post} from "../utils/http/index";
import {AUTHENTICATION_MODE} from "../const/index";

/**
 * 订单列表
 * @param endDate 结束时间【格式:yyyy-MM-dd】
 * @param isDel 删除状态（-1：全部、0：正常、1：已删除）【默认:启用】
 * @param key 关键字
 * @param order 排序字段（数据库）排序规则【字段名-asc/desc】
 * @param orderBy 排序规则【字段名-asc/desc】
 * @param page 分页对象 {index,size}
 * @param startDate 开始时间【格式:yyyy-MM-dd】
 * @param type 订单状态（0：全部、1：待付款、2：待发货、3：待收货、4：已完成、5：售后申请）
 * @param 分页对象【QueryPage】 {index (integer, optional): 当前分页页码【默认1】 ,paging (boolean, optional): 是否分页（true：分页、false：不分页）【默认true】 ,size (integer, optional): 每页展示条数【默认10】
 * @returns {Promise<AxiosResponse<*>>}
 */
export const findOrderList = params => {
  return post(`/order/app/v2/page`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 查询订单
 * @param filterProductIds 订单所属商品ID集合【只查询指定的商品信息】
 * @param id 订单ID【必填】
 * @returns {Promise<AxiosResponse<*>>}
 */

export const findOrder = params => {
  return post(`/order/app/v2/orderInfo`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 提醒发货 -- 京华
 * @param orderCode (string, optional): 订单id
 * @returns {Promise<AxiosResponse<*>>}
 */

export const orderRemind = params => {
  return post(`/order/app/v2/remind`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 确认收货 -- 京华
 * @param orderCode 订单编码【必填】
 * @returns {Promise<AxiosResponse<*>>}
 */
export const confirmReceipt = (params) => {
  return post(`/order/app/v2/confirmReceipt`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 订单取消 -- 京华
 * @param cancelRemark 取消原因
 * @param orderCode 交易订单号
 * @returns {Promise<AxiosResponse<*>>}
 */
export const cancelOrder = (params) => {
  return post(`/order/app/v2/cancel`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 删除订单 --- 京华
 * @param orderCode 订单编号
 * @returns {Promise<AxiosResponse<*>>}
 */
export const deleteOrder = (params) => {
  return post(`/order/app/v2/delOrder`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 获取商品物流信息
 * @param orderId 商家订单ID【必填】
 * @param productIdList 商家订单下商品ID集合
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryOrderLogistics = ({orderId, productIdList}) => {
  return post(`/api/v1/os/app/omsorder/getLogisticsTrackInfo`, {orderId, productIdList}, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}


/**
 * 获取订单不同状态数量
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryOrderCount = params => {
  return post(`/order/app/v2/tojoyshop/statistics`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 更新订单支付状态
 * @param orderId 商家订单ID【必填】
 * @returns {Promise<AxiosResponse<*>>}
 */
export const updateOrderPayStatus = params => {
  return post(`/order/app/v2/tojoyshop/pay/updateStatus`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 获取售后物流信息--后端-京华
 * @param storeOrderCode	商家订单编号
 *
 */
export const findLogistics = (params) => {
	return post(`/order/app/v2/tojoyshop/logistics`, params)
}

/**
 * 获取售后物流信息--后端-京华
 * @param expressCompanyCode	快递公司编码
 * @param expressNumber	快递单号
 *
 */
export const findExpress = (params) => {
	return post(`/order/app/v2/tojoyshop/express`, params)
}

/**
 * 查询订单支付金额/康豆奖励数
 * @param orderCode 商家订单编号【必填】
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryOrderAmount = params => {
  return post(`/order/app/v2/orderBean`, params)
}

/**
 * 查询温暖医生服务单详情
 * @param serviceOrderCode 服务单号
 */
export const queryServiceDetail = params => {
  return post(`/order/app/service/order/serviceDetail`, params)
}

/**
 * 查询适用门店  订单详情
 * @param orderCode 订单号
 */
export const serviceOrderDetail = params => {
  return post(`/order/app/service/order/getOrderDetail`, params)
}
/**
 * 订单详情 联系顾问
 * @param tradeId 服务单交易单主键
 */
export const serviceRelationShip = params => {
  return post(`/order/app/service/order/getRelationShip`, params)
}
