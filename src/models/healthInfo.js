import { post, get } from "../utils/http/index";
import { TEMP_CLOUD } from "../const/index";
import env from "../config/env";

/**
 *查询用户是否已填写健康档案
 * @returns {Promise<AxiosResponse<*>>} shi xiao lei
 */
export const queryUserIsHealth = params => {
  return post(`${TEMP_CLOUD}/member/app/healthUserInfo/queryUserIsHealth`, params);
};
/**
 *查询用户健康档案信息
 * @returns {Promise<AxiosResponse<*>>}shi xiao lei
 */
export const queryUserHealth = params => {
  return post(`${TEMP_CLOUD}/member/app/healthUserInfo/queryUserHealth`, params);
};
/**
 *保存-编辑用户基本信息接口 shi xiao lei
 * birthday {String} 出生日期
 * channelId {String} 渠道id
 * customerId {String	} 用户ID
 * gender {Number} 性别(1：男2：女)
 * id {Number} id
 * mobile {String} 手机号
 * name {String} 姓名
 */
export const saveUserBasicInfo = params => {
  return post(`${TEMP_CLOUD}/member/app/healthUserInfo/saveUserBasicInfo`, params);
};
/**
 *保存/编辑用户健康信息接口shi xiao lei
 * id {Number} id
 * userCategoryParamList {array}   健康分类信息
        categoryId {Number}  健康信息分类Id
        isHave      {Number} 	0无 1有
        userCategoryOptionParamList {array} 健康选项
              categoryOptionId {Number} 健康选项Id
              isOther           {Number} 是否是其他 0 否 1
              otherOptionName    {String} 其他选项名称
 */
export const saveUserCategory = params => {
  return post(`${TEMP_CLOUD}/member/app/healthUserInfo/saveUserCategory`, params);
};
/**
 *获取健康档案填写表单(分类标签) shendexuan
 * @returns {Promise<AxiosResponse<*>>}
 */
export const reqHealthCategoryInfo = params => {
  return post(`/member/app/healthCategory/info`, params);
};

/**
 *获取历史记录列表
 * @returns {Promise<AxiosResponse<*>>}
 */
export const fetchHistoryRecords = params => {
  return post(`${TEMP_CLOUD}/member/app/report`, params);
};
/**
 *查看历史记录详情
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryHistoryDetails = params => {
  return post(`${TEMP_CLOUD}/member/app/report/get`, params);
};
