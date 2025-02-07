import {post} from "../utils/http/index";
import {TEMP_CLOUD} from "../const/index";

/**
 * 获取退款订单价格信息--后端 -- 喜冬
 */
 export const findRefundOrderPrice = params => {
	return post(`/order/app/refund/promotionBack`, params)
}
/**
 * 售后提交申请--后端-喜冬
 */
export const confirmRefund = params => {
	return post(`/order/app/refund/apply`, params)
}

/**
 * 售后详情--后端-喜冬
 * @param refundCode 退款订单编号
 */
export const findOmsRefundDetails = params => {
	return post(`/order/app/refund/info`, params)
}

/**
 * 退款订单品牌地址接口--后端-喜冬
 * @param refundCode 退款订单编号
 */
export const findOmsRefundBrandAddress = params => {
	return post(`/order/app/refund/queryBrandAddress`, params)
}

/**
 * 售后提交物流单号--后端-喜冬
 * @param refundCode 退款订单编号
 * @param refundId 退款订单ID
 * @param brandParam: [{ 品牌物流集合
		"brandId": "120",
		"logisticsCode": "133yugfc"
	}]
 */
export const saveRefundLogisticsCode = params => {
	return post(`/order/app/refund/confirm`, params)
}

/**
 * 获取售后退款--后端-喜冬
 * @param
 */
export const findOmsRefundList = params => {
	return post(`/order/app/refund/list`, params)
}

/**
 * 提醒退款--后端-喜冬
 * @param refundCode: 退款订单编号
 * @param orderType: 商家订单类型(1：组合商品商家订单2：单品商家订单)
 * @param orderSkuIdList: 订单商品skuId集合
 */
export const sendOmsOrderRefundSms = params => {
	return post(`/order/app/refund/warn`, params)
}

/**
 * 取消申请--后端-喜冬
 * @param refundCode: 退款订单编号
 * @param subSkuRefundCodeList: 组合商品子商品退款订单Code集合
 */
export const cancelRefund = params => {
	return post(`/order/app/refund/cancel`, params)
}

/**
 * 退款订单查询上传物流地址接口--后端-喜冬
 * @param refundCode: 退款订单编号
 */
export const findOmsRefundLogistics = params => {
	return post(`/order/app/refund/queryLogisticCode`, params)
}

/**
 * 退款订单查询物流信息--后端-喜冬
 * @param logisticsCode: 物流单号
 */
export const findRefundLogisInfo = params => {
	return post(`/order/app/refund/queryLogistic`, params)
}

/**
 * 用户申请售后预处理--后端-徐孝敬
 * @param refundCause: "生产日期、批号与卖家承诺不符\n其他原因",售后原因
 * @param orderId: "704dc3fa0bc04ddf9ea1669a3512fdb1",
 * @param customerRemark: "看见了",售后描述
 * @param refundType: "1",售后类型
 * @param products: [{"productNum": 4,"productId": "66d3e124a759447cb1d1b842e7f4df43"}, {"productNum": 1,"productId": "0b4d31a9d1724e6fb5cd0b5d0f7d369f"}]
 */
export const confirmRefundPre = params => {
	return post(`/api/v1/os/app/omsorder/confirmRefundPre`, params)
}

/**
 * 商品售后记录列表 -- 喜冬
 */
export const goodsAfterSaleList = params => {
	return post(`/order/app/refund/listByOrderCode`, params)
}

/**
 * 查看是否可售后 -- 喜冬
 */
export const checkIsAfterSale = params => {
	return post(`/order/app/refund/canRefund`, params)
}