import {post} from "../utils/http/index";
import env from "./../config/env";
/**
 * 不分页获取所有分类
 */
export const queryClassify = (params) => {
	return post(`/goods/app/category/v2/list`, params)
}
