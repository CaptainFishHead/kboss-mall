import { post } from "@utils/http/index";

/**
 * 获取健康拍签名
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getJkpParameter = params => {
  return post(`/innersupport/app/jkp/sign/get`, params);
};
/**
 * 获取健康拍报告
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const checkRecord = params => {
  return post(`/member/app/detect/jkp/result/latest/get`, params);
};

/**
 * 获取健康拍状态
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getJkpStatus = params => {
  return post(`/member/app/detect/jkp/result/exist`, params);
}