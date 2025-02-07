import {post} from "../utils/http/index";
import {TEMP_CLOUD} from "../const/index";
import env from "./../config/env";

/* 获取栏目详情 */
export const queryColumnInfo = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/cmsContent/nl/info`, params)
}

/* 获取种草ID */
export const queryRecommendId = () => {
  return post(`${TEMP_CLOUD}/cms/app/cmsContent/nl/getRecommend`)
}

/* 查询种草广告图列表 */
export const queryAdList = (params) => {
	return post(`${TEMP_CLOUD}/cms/app/recommend/ad/list`, params)
}
/* 查询种草详情广告图列表 */
export const queryDetailAdList = (params) => {
	return post(`${TEMP_CLOUD}/cms/app/recommend/ad/info`, params)
}
/* 查询种草分类列表 */
export const queryClassifyList = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/category/list`, params)
}
/* 分页查询种草列表 */
export const queryRecommendList = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/main/page`, params)
}
/* 种草详情 */
export const queryRecommendDetail = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/main/info`, params)
}
export const queryRecommendSwiperDetail = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/main/swipe`, params)
}

export const queryRecommendDataById = (params)=>{
	return post(`${TEMP_CLOUD}/cms/app/recommend/main/queryData`, params)
}
/* 添加点赞、收藏 */
export const addLikeCollection = (params) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/add`, params)
}
/* 取消点赞、收藏 */
export const delLikeCollection = (params) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/del`, params)
}
/* 统计点赞、收藏、分享 */
export const statisticsOperate = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/main/saveData`, params)
}
/* 获取专题详情 */
export const queryTopicDetail = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/topic/info`, params)
}
/* 获取种草状态 */
export const queryStatus = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/recommend/main/state`, params)
}
/* 更新点赞数量 */
export const updateLikeNum = (params) => {
  return post(`${TEMP_CLOUD}/member/app/favorite/v2/queryData`, params)
}

/* 服秘校验 */
export const getServant = (params) => {
  return post(`${TEMP_CLOUD}/partner/app/servant/get`, params)
}