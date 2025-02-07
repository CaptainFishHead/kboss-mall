import {post} from "../utils/http/index";
import {AUTHENTICATION_MODE, TEMP_CLOUD} from "../const/index";
import env from "../config/env";

/**
 * 获取小程序码
 * @param scene : object : 页面参数
 * @param page ： string : 页面地址
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryWxQRCodeModel = (params) => {
	return post(`/bh/share/info`, params,{baseURL:env.KBOSS_WEB_API})
}

/**
 * 获取酒店专属码对应的页面id
 * @param id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryExclusiveCodeByQrId = ({qrId: id}) => {
	return post(`${TEMP_CLOUD}/cms/app/hotel/code/scanQRCode`, {id})
}