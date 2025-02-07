import {post} from "../utils/http/index";
import {TEMP_CLOUD} from "../const/index";
import env from "./../config/env";

/* 查询收藏栏目列表 */
export const queryCollectionColumnList = (params) => {
	return post(`${TEMP_CLOUD}/member/app/favorite/v2/column/list`, params)
}

/* 查询收藏列表 */
export const queryCollectionList = (params) => {
	return post(`${TEMP_CLOUD}/member/app/favorite/v2/page`, params)
}
