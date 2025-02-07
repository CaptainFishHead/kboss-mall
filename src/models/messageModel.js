import {post} from "../utils/http/index";

/**
 * 模版推送通知 http://192.168.19.143:21011/doc.html#/default/1.125/saveUsingPOST
 * @param businessCode : string : 业务唯一编号
 * @param pushType : number : 推送类型(1.订单待支付,2.订单发货)
 * @returns {Promise<AxiosResponse<*>>}
 */
export const authorizePushTemp = ({businessCode, pushType}) => {
	return post(`/api/v1/cps/pushwechat/save`, {
		businessCode, pushType
	})
}