import {IRoomProduct, IRoomProductParam, IRoomInfo, IAccountInfoParam, IAccountInfo, ILiveDataInfo, IProductBuyInfo, ILiveDataTableInfoItem, ILiveDataAllInfo} from "./types/live";
import { post } from "@utils/http/index";
import ENV from "@config/env";
import { CLOUD_SDK, TEMP_CLOUD } from "@const/index";
const { SDK_API } = ENV
// 观众端购物袋商品列表
export const getRoomProductList = (param: IRoomProductParam) => {
	return post<IRoomProduct[], IRoomProductParam>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveRoomProduct/listOfView`, param,{
		baseURL:SDK_API
	})
}

/* 观众端直播详情 */
export const getRoomInfo = (param: IRoomProductParam) => {
  return post<IRoomInfo, IRoomProductParam>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveImRoom/infoOfView`, param,{
		baseURL:SDK_API
	})
}

export const getAdminAccountInfo = (param: IAccountInfoParam) => {
	return post<IAccountInfo, IAccountInfoParam>(`${TEMP_CLOUD}${CLOUD_SDK}/live/im/getUserAccountInfo`, param,{
		baseURL:SDK_API
	})
}

// 直播间推荐列表
export const liveRecommendList = (param: {liveState: number}) => {
	return post<IRoomInfo[], {liveState: number}>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveImRoom/recommend`, param,{
		baseURL:SDK_API
	})
}

// 举报
export const saveLiveRoomReport = (param: {roomId: string, reportContent: string}) => {
	return post<object, {roomId: string, reportContent: string}>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveRoomReportRecord/save`, param,{
		baseURL:SDK_API
	})
}

// 获取直播间统计数据 点赞、人气、观看数量、人数、时间
export const liveRoomData = (param: {roomId: string}) => {
	return post<ILiveDataInfo, {roomId: string }>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveRoomData/simpleInfo`, param,{
		baseURL:SDK_API
	})
}

// 直播间获取热卖提示中商品的购买人数、购买数量 【田阔阔】【https://docs.apipost.cn/preview/d42364041fc66b57/8ba8ccb523c06a71?target_id=983f6929-8ab7-4962-a094-a1112c0420ee】
export const productBuyInfo = (param: {roomId: string, spuId: string}) => {
	return post<IProductBuyInfo, {roomId: string, spuId: string}>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveRoomData/productBuyInfo`, param,{
		baseURL:SDK_API
	})
}

// 直播间数据表详情查询 【申德轩】
// https://uat-platform-api.kang-boss.com/doc.html#/%E4%BA%91%E5%B9%B3%E5%8F%B0%E7%9B%B4%E6%92%AD%E6%8E%A5%E5%8F%A3/APP-%E7%9B%B4%E6%92%AD%E9%97%B4%E6%95%B0%E6%8D%AE%E8%A1%A8%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/infoUsingPOST_1
export const liveRoomDataInfo = (param: {roomId: string}) => {
	return post<ILiveDataAllInfo, {roomId: string }>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveRoomData/info`, param,{
		baseURL:SDK_API
	})
}

// 获取曲线图数据 【申德轩】
// https://uat-platform-api.kang-boss.com/doc.html#/%E4%BA%91%E5%B9%B3%E5%8F%B0%E7%9B%B4%E6%92%AD%E6%8E%A5%E5%8F%A3/APP-%E7%9B%B4%E6%92%AD%E9%97%B4%E6%95%B0%E6%8D%AE%E8%A1%A8%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/tableDataUsingPOST
export const liveRoomTableData = (param: {roomId: string}) => {
	return post<ILiveDataTableInfoItem[], {roomId: string }>(`${TEMP_CLOUD}${CLOUD_SDK}/live/app/liveRoomData/tableData`, param,{
		baseURL:SDK_API
	})
}
