import {post} from "../utils/http/index";
import env from "../config/env";
import {TEMP_CLOUD} from "../const/index";
/**
 * 分页查询足迹列表
 */
export const createFootPrint = (params) => {
	return post(`${TEMP_CLOUD}/member/app/footprint/v2/add`, params);
}
/**
 * 分页查询足迹列表
 */
export const queryFootPrintByPage = (params) => {
	return post(`${TEMP_CLOUD}/member/app/footprint/v2/page`, params);
}