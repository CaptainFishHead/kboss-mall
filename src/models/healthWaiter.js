import { post } from "../utils/http/index";
/**
 * 获取我的-顾问  zhangpengzhi
 */
export const reqCounselor = (params) => {
  return post(`/member/app/assistant/counselor`, params)
}
