import {post} from "../utils/http/index";
import {TEMP_CLOUD} from "../const/index";
import env from "./../config/env";

/**
 * 联想词
 * @param keyWord	string 搜索词名称
 * @param limit	integer($int32) 显示条数(最大10条)
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryWordLenovoList = params => {
  return post(`${TEMP_CLOUD}/opensearch/app/hotWord/v2/lenovo`, {limit: 10, ...params})
}
/**
 * 热词 列表
 * @param position	integer($int32) 热词位置 (0全部 1搜索框热词 2热门搜索词)
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryWordHotList = params => {
  return post(`${TEMP_CLOUD}/opensearch/app/hotWord/v2/list`, params)
}
/**
 * 商品搜索
 * @param keyWord	string 搜索词名称
 * @param page	integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag	boolean 默认值true 分页标识
 * @param rows	integer($int32) 默认值10 每页行数
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryResultList = params => {
  return post(`${TEMP_CLOUD}/opensearch/app/hotWord/v2/search`, params)
}
/**
 * 内容 搜索 
 * @param keyWord	string 搜索词名称
 * @param page	integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag	boolean 默认值true 分页标识
 * @param rows	integer($int32) 默认值10 每页行数
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryContentList = params => {
  return post(`/opensearch/app/hotWord/v2/content/search`, params)
}

/**
 * 分页获取分类下的商品
 * @param goodsCategoryId	integer($int64) 分类ID
 * @param isTop	integer($int32) 是否是置顶 0 否 1是
 * @param page	integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag	boolean 默认值true 分页标识
 * @param rows	integer($int32) 默认值10 每页行数
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryCategoryGoodsPage = params => {
  return post(`${TEMP_CLOUD}/goods/app/category/product/v2/page`, params)
}

/**
 * 分类广告图详情查询
 * @param goodsCategoryId	integer($int64) 分类ID
 * @param isTop	integer($int32) 是否是置顶 0 否 1是
 * @param page	integer($int32) 默认值1 当前页数，从1开始
 * @param pageFlag	boolean 默认值true 分页标识
 * @param rows	integer($int32) 默认值10 每页行数
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryCategoryGoodsList = params => {
  // goods/app/goods/category/product/v1/list
  //  /goods/app/category/product/v2/list
  return post(`${TEMP_CLOUD}/goods/app/goodsCategoryAdvertise/info`, params)
}
