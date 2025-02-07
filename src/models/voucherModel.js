import {post} from "../utils/http/index";
import {AUTHENTICATION_MODE, TEMP_CLOUD} from "../const/index";
import env from "../config/env";


/**
 * 获取优惠券列表
 * @param couponId  integer($int32) 查询列表类型：1-可用，2-不可用
 * @param page  integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag  boolean 默认值true 分页标识
 * @param rows  integer($int32) 默认值10 每页行数
 */
export const queryVoucherList = params => {
  return post(`${TEMP_CLOUD}/coupon/app/couponReceive/couponInfo`, params)
}

/**
 * 获取优惠券详情
 * @param couponId integer 优惠券ID
 */
export const queryCouponInfo = params => {
  return post(`${TEMP_CLOUD}/coupon/app/couponReceive/couponInfo`, params)
}

/**
 * 立即领取(手动领取)
 * @param couponId integer 优惠券ID
 */
export const manualReceiveCoupon = params => {
  return post(`${TEMP_CLOUD}/coupon/app/couponReceive/manualReceive`, params)
}

/**
 * APP优惠券领取:领券购买(自动领取)
 * @param spuId integer 商品spuId
 */
export const autoReceiveCoupon = params => {
  return post(`${TEMP_CLOUD}/coupon/app/couponReceive/autoReceive`, params)
}

/**
 * 可用优惠券数量
 * */
export const queryCouponNum = () => {
  return post(`${TEMP_CLOUD}/coupon/app/userCoupon/queryCouponNum`,{})
}

/**
 * 订单确认页优惠券列表
 * @param spuIdAndPriceList array（orderPrice 实付金额(分),不含邮费，spuId）
 */
export const queryCouponOrderList = params => {
  return post(`${TEMP_CLOUD}/coupon/app/userCoupon/queryCouponOrderList`, params)
}

/**
 * 我的优惠券列表
 * @param isAvailable 用户优惠券状态 1可用/不可用 2历史
 */
export const queryCouponUserList = params => {
  return post(`${TEMP_CLOUD}/coupon/app/userCoupon/queryCouponUserList`, params)
}


/**
 * 详情页可领取优惠券弹窗列表
 * @param filterUserGroup 是否过滤客群 1：是 0：否 false integer
 * @param spuId 商品spuId string
 * @param skuId 商品skuId string
 */
export const queryCouponPopList = params => {
  return post(`${TEMP_CLOUD}/coupon/app/sku/coupon/pop`, params)
}


/**
 * 删除订单
 * @param ids 编号集合【必填】
 * @returns {Promise<AxiosResponse<*>>}
 */
export const deleteOrder = (params) => {
  return post(`/api/v1/os/app/omsorder/deleteOrder`, params, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}
