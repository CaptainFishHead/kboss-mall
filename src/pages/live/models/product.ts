import {IProduct, IProductParam} from "./types/product";
import { CLOUD_SDK, TEMP_CLOUD } from "@const/index";
import {post} from "@utils/http/index";
import ENV from "@config/env";
const { SDK_API } = ENV

export const queryProductById = async (param: IProductParam) => {
	return post<IProduct, IProductParam>(`${TEMP_CLOUD}${CLOUD_SDK}/goods/app/v1/goodsInfo`, param,{
		baseURL:SDK_API
	})
}