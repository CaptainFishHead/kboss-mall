import {post} from "../utils/http/index";
import env from "./../config/env";
import {TEMP_CLOUD, CLOUD_SDK} from "../const/index";

const {SDK_API} = env

/**
 * 商品详情
 * @param id (string, optional): 商品SPU的ID
 * @param spuId (string, optional): 商品SPU的ID
 * @param skuId (string, optional): 商品SKU的ID
 */
export const queryProductById = ({id, skuId, spuId}) => {
  return post(`${TEMP_CLOUD}/goods/app/v2/goodsInfo`, {spuId: id || spuId, skuId})
}

/**
 * 随心配详情
 * @param goodsPackageId (string, optional): 随心配ID
 */
export const querySuitById = async params => {
  const resp = await post(`${TEMP_CLOUD}/goods/app/packageConf/v2/info`, {goodsPackageId: params.id})
  const data = resp.result
  resp.result = {
    ...data,
    id: `${data.goodsPackageId || ''}`,
    name: data.goodsPackageTitle,
    subhead: data.goodsPackageSubtitle,
    content: data.goodsPackageRemark,
    subSkuDtoList: (data.goodsPackageConfProductList || []).map(e => ({
      ...e,
      disabled: !e.isShelf|| e.stockNums<=0,
      subProductId: e.spuId,
      productName: e.spuName,
      salePrice: e.sellPrice,
      imageUrl: e.imageUrl
    }))
  }
  return resp
}

/**
 * 随心配 替换商品列表
 * @param goodsPackageConfId  integer($int64) 随心配组合内商品配置Id
 * @param goodsPackageId  integer($int64) 随心配商品主键Id
 * @param productId  string 当前被替换的商品spuId
 */
export const queryReplaceSuitList = async params => {
  const resp = await post(`${TEMP_CLOUD}/goods/app/packageConf/v2/replace`, params)
  const {productList} = resp.result
  resp.result = {
    productList: productList.map(item => ({
      ...item,
      productName: item.spuName,
      disabled: !item.isShelf||item.stockNums<=0,
      subProductId: item.spuId,
      imageUrl: item.imageUrl
    }))
  }
  return resp
}

/**
 * 随心配 下单商品列表
 * @param productIdList  arr 商品spuId集合
 */
export const queryChooseSuitList = async params => {
  const resp = await post(`${TEMP_CLOUD}/goods/app/packageConf/v2/choose`, params)
  const {productList} = resp.result
  resp.result = {
    productList: productList.map(item => ({
      ...item,
      id: item.spuId,
      name: item.spuName,
      imgurl: item.imageUrl,
      skuList: item.skuList ? item.skuList.map(e => ({
        ...e,
        id: e.skuId,
        code: e.skuCode,
        imgurl: e.skuImg,
      })) : []
    }))
  }
  return resp
}

/**
 * 收藏 列表
 * @param description  用户收藏、点赞等
 * @param page  integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag  boolean 默认值true 分页标识
 * @param rows  integer($int32) 默认值10 每页行数
 * @param subjectType *  integer($int32) 标的物类型 商品：1 | 文章：2 | 商铺:3 | 随心配:4 种草:5
 * @returns {Promise<AxiosResponse<*>>}
 */
export const favoriteProductList = (params) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/pageOfProduct`, params)
}

/**
 * 收藏 添加pro
 * @param {number} action - 传当前状态值
 * @param {number} favoriteType - 用户行为类型 收藏：1｜点赞：2｜关注：3
 * @param {number} subjectId - 标的物ID
 * @param {number} subjectType - 标的物类型 商品：1 | 文章：2 | 商铺:3 | 随心配:4
 * @returns {Promise<AxiosResponse<*>>}
 */
export const favoriteAction = ({
                                 action,
                                 favoriteType,
                                 subjectId,
                                 subjectType
                               }) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/${action ? 'del' : 'add'}`, {
    favoriteType,
    subjectId,
    subjectType
  })
}
/**
 * 收藏 添加
 * @param favoriteType  integer($int32) 用户行为类型 收藏：1｜点赞：2｜关注：3
 * @param subjectId  integer($int64) 标的物ID
 * @param subjectType  integer($int32) 标的物类型 商品：1 | 文章：2 | 商铺:3 | 随心配:4
 */
export const favoriteProductAdd = (params) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/add`, params)
}
/**
 * 收藏 取消
 * @param favoriteType  integer($int32) 用户行为类型 收藏：1｜点赞：2｜关注：3
 * @param subjectId  integer($int64) 标的物ID
 * @param subjectType  integer($int32) 标的物类型 商品：1 | 文章：2 | 商铺:3 | 随心配:4
 */
export const favoriteProductDel = (params) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/del`, params)
}
/**
 * 收藏 状态（详情页）
 * @param favoriteType  integer($int32) 用户行为类型 收藏：1｜点赞：2｜关注：3
 * @param subjectId  integer($int64) 标的物ID
 * @param subjectType  integer($int32) 标的物类型 商品：1 | 文章：2 | 商铺:3 | 随心配:4
 */
export const favoriteProductStatus = (params) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/query`, params)
}

/**
 * 商品SKU验证状态和库存
 * @param fetchErrorInfo  是否抓取错误的商品详细信息，否则只返回错误的商品数量，是则返回商品的详细信息（名称图片等） 1：是 0：否 ，默认否  false integer(int32)
 * @param skuList  sku集合 false array [{count:数量,skuId:skuId}]
 * @returns {Promise<AxiosResponse<*>>}
 */
export const checkSkuStatus = params => {
  return post(`/api/v1/ps/wechat/omsproductsku/checkSkuStatus`, params)
}

/* 分页查询种草列表 */
export const querySpuInfoRecommendList = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/main/spuInfoRecommendPage`, params)
}

/**
 * 通过spuId获取正在直播的Live
 */
export const queryLiveListBySpu = ({spuId}) => {
  return post(`${TEMP_CLOUD}/cms/app/cp/live/list`, {str: spuId})
}

/**
 * 通过spuId获取商品正在讲解的Video
 */
export const queryVideoBySpu = (params) => {
  return post(`${TEMP_CLOUD}/goods/app/spu/ext/video/get`, params)
}

/**
 * 获取商品活动信息
 */
export const goodsActivityInfo = params => {
  return post(`/goods/app/v2/goodsActivityInfo`, params)
}
