import {post} from "../utils/http/index";
import {AUTHENTICATION_MODE, SOURCE, TEMP_CLOUD} from "../const/index";
// import {getEnterOptions} from "../utils/index";
import env from "../config/env";
import { queryUserMark } from "@models/commissionModel";
// import { getSource } from "@models/commonModels";

/**
 * 购物车列表
 * @param params
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryCartList = () => {
  return post(`${TEMP_CLOUD}/goods/app/cart/v2/list`, {})
}

/**
 * 购物车数量
 * @returns {Promise<AxiosResponse<*>>}
 */
export const findCarCount = () => {
  return post(`${TEMP_CLOUD}/goods/app/cart/v2/count`, {}, {
    authenticationMode: AUTHENTICATION_MODE.break
  })
}

/**
 * 购物车 添加
 * @param {Object} params
 * @param {Array} params.cartList 商品列表
 * @param {Object} params.extra 渠道信息
 * @returns {Promise<AxiosResponse<*>>}
 */
export const cartAdd = async (params) => {
  const {cartList,extra = {}} = params
  const resp = await post(`${TEMP_CLOUD}/goods/app/cart/v2/add`, { cartList,...extra })
  try {
    post(`${TEMP_CLOUD}/cb/mini/wechat/notify`,
        {
          channelId: extra.channelId,
          channelName: extra.channelName,
          sharedGuys: extra.distributionId,
          skuIds: params.cartList.map(item => item.skuId)
        })
    // 请求鹏志接口，告诉他购物车添加成功,传来源和appid，这里不需要用await等待接口处理结果
    if (env.envVersion !== 'release') {
      console.log(`${TEMP_CLOUD}/cb/mini/wechat/notify`,
          {
            channelId: extra.channelId,
            channelName: extra.channelName,
            sharedGuys: extra.distributionId,
            skuIds: params.cartList.map(item => item.skuId)
          })
    }
  } catch (e) {
    console.error('购物车通知失败', e)
  }
  return resp
}

/**
 * 购物车 编辑
 * @param cartId	购物车id	【必填】string
 * @param skuId	商品skuId	【必填】string
 * @param skuNum	商品数量(总)【非必填】integer
 * @returns {Promise<AxiosResponse<*>>}
 */
export const editCar = (params) => {
  return post(`${TEMP_CLOUD}/goods/app/cart/v2/edit`, params)
}

/**
 * 购物车 删除
 * @param cartId string  购物车id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const deleteCar = (params) => {
  return post(`${TEMP_CLOUD}/goods/app/cart/v2/del`, params)
}

/**
 * 购物车中商品状态校验
 * @param skuIdList array 商品skuId列表【必填】
 * @returns {Promise<AxiosResponse<*>>}
 */
export const validCart = (params) => {
  return post(`${TEMP_CLOUD}/goods/app/cart/v2/valid`, params)
}

/**
 * 确认订单页面 购物车下单数据
 * @param params
 * @param provinceId (integer, optional): 省ID ,
 * @param cityId (integer, optional): 市ID ,
 * @param areaId (integer, optional): 区ID ,
 * @param carIds (Array[string], optional): 购物车ID集合【当type=2时必填】 ,
 * @param cardId (Array[string], optional): 商品卡ID【当type=3时必填，用于查询商品卡商品信息】 ,
 * @param productAttributes (string, optional): 商品属性【当type=1时必填】 ,
 * @param productId (string, optional): 商品SKU的ID【当type=1时必填】 ,
 * @param productNum (integer, optional): 商品数量【当type=1时必填】 ,
 * @param productKind integer(int32)  商品种类 1-套餐 2-单品 【当type=1时必填】 ,
 * @param productSellerPrice  (number, optional): 商品销售价（单价）【当type=1时必填】 ,
 * @param skuIdList  array 组合商品子商品skuId集合 【当type=1时必填】 ,
 * @param couponFree  integer 优惠 【当type=1时必填】 ,
 * @param type (integer, optional): 查询类型（1：直接下单、2：购物车下单、3：商品卡兑换下单）【必填】
 * @param beanFlag integer(int32): 是否用康豆 0 否 1 是
 * @param sceneId string: 康豆场景ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const findPreBuyOrder = (params) => {
  return post(`/order/app/v2/preBuyOrder`, params, {
    authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
  })
}

/**
 * 查询运费
 * @param province 省【必填】false string
 * @param city  市【必填】false string
 * @param county 县 false string
 * @param products  商品集合【必填】  false array
 * @returns {Promise<AxiosResponse<*>>}
 */
export const findOrderPostagePrice = params => {
  return post(`${TEMP_CLOUD}/api/v1/os/omsorder/getOrderPostage`, params, {
    authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
  })
}

/**
 *  单品/组合品-下单 温暖医生服务立即购买
 * @param province 省【必填】false string
 * @param city  市【必填】false string
 * @param county 县 false string
 * @param products  商品集合【必填】  false array
 * @param orderPoint  订单康豆金额
 * @param sceneId  场景id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const buyOrder = async (params) => {
  const result = await queryUserMark(params)
  return post(params.doctorId ? '/order/app/service/order/buyServiceOrder' : '/order/app/v2/buyOrder', result, {
    authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
  })
}

/**
 * 购物车下单 立即购买
 * @param province 省【必填】false string
 * @param city  市【必填】false string
 * @param county 县 false string
 * @param products  商品集合【必填】  false array
 * @param orderPoint  订单康豆金额
 * @param sceneId  场景id
 * @returns {Promise<AxiosResponse<*>>}
 */
/*export const buyCarOrder = (params) => {
  if (!params.channelName) {
    params.channelName = SOURCE.BH_MALL
  }
  return post(`${TEMP_CLOUD}/api/v1/os/app/omsorder/buyCarOrder`, params, {
    authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
  })
}*/


/**
 * 商品卡兑换下单 立即兑换
 * @param province 省【必填】false string
 * @param city  市【必填】false string
 * @param county 县 false string
 * @param cardId  商品卡ID【必填】 true string
 * @returns {Promise<AxiosResponse<*>>}
 */
/*export const buyCardOrder = (params) => {
  if (!params.channelName) {
    params.channelName = SOURCE.BH_MALL
  }
  return post(`${TEMP_CLOUD}/api/v1/os/app/omsorder/buyCardOrder`, params, {
    authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
  })
}*/

/**
 * 根据skuId集合查询是否参与活动
 * @param skuIdList skuId集合 array
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryActiveGoodsList = (params) => {
  return post(`${TEMP_CLOUD}/marketing/app/promotion/queryPromotionBySkuIds`, params)
}
