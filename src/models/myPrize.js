import { post } from "../utils/http/index";
import { PLAT_FORM } from "../const/index";
import env from "../config/env";
// import { TEMP_CLOUD } from "../const/index";
let configRequest={
  headers:{ platformId: PLAT_FORM.OBH },
  baseURL:env.YUNSHANG_API
}
/**
 * 我的奖品数量 - 后端魏广甫
 * @param {userId} 用户id
 */
export const myPrizeNum = (params) => {
  return post(`/api/v1/obh/obhraffleuserlog/total/num`, params, configRequest)
}