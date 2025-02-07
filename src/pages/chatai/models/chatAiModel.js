import { get, post } from "@utils/http/index";

/**
 * 获取答案
 * @param {*} params 
 */
export const getChatAIAnswer = (params) => post('/ai/app/dify/queryChatAnswer', params)

/**
 * 获取会话id
 * @param {*} params 
 */
export const getChatId = (params) => post('/ai/app/dify/createChatQuery', params)

/**
 * 获取推荐内容
 */
export const getQuestionList = (params) => post('/ai/app/dify/openingRemarks', params)

/**
 * 获取推荐文章列表
 */
export const getReArticleList = (params) => post('/cms/app/recommend/main/other/list', params)

/**
 * 获取医生列表
 */
export const getReDoctorList = (params) => post('/scene/app/service/scene/v1/doctor/list', params) 