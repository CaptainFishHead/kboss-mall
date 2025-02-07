import {post} from "@utils/http";

export enum ENUM_LIVE_STATE {
	PENDING,
	LIVING,
	FINISH,
	CANCEL,
	PAUSE,
	// 前端自定义
	// 直播间拥挤
	BLOCK,
	// 直播间加载失败
	LOADING_FAIL,
	// 直播间不存在
	NOT_EXIST
}

export interface IAnchorItem{
  mobile?: string;
  authorId?: number| string,
  authorMobile?: string,
  authorName?: string
}

export interface IAnchorList {
  authorList: IAnchorItem[];
}

export interface ICheckState {
  checkState: number;
}
export interface IRecommendParams {
  recommendLocation: number,
  agentInfoId?: string
}
export interface ILiveItem {
  agentInfoId: number,
  countDown: number,
  coverUrl: string,
  endTimeFact: string,
	liveDuration: number,
	liveState: number,
	platformRoomId: string,
	remark: string,
	roomName: string,
	startTimeFact: string,
	startTimePlan: string
}
export interface ILiveItem {
  agentInfoId: number,
  countDown: number,
  coverUrl: string,
  endTimeFact: string,
	liveDuration: number,
	liveState: number,
	platformRoomId: string,
	remark: string,
	roomName: string,
	startTimeFact: string,
	startTimePlan: string
}
export interface IliveListParams {
  labelType: number,
  page?: number,
  pageFlag?: boolean,
  rows?: number,
  agentInfoId?: string
}
export interface IliveList {
  currPage: number,
  totalPage: number,
  list: ILiveItem[]
}
export interface IGoodsInfo {
  position: string,
  skuId: string,
  source: string,
  spuId: string,
  ssid: string,
  targetId: string
}
export interface IImRoomConfig{
  liveRoomConfigImgList: never[] | undefined;
  imgList: string[],
  isComment: number,
  isLike: number,
  isPlayBack: number,
  isSelf: number,
  isShare: number,
  videoUrl: string
}
export interface IRoomInfo{
  anchorUserId: string,
  anchorUserPhone: string,
  coverUrl: string,
  endTimeFact: string,
  endTimePlan: string,
  headImg: string,
  imRoomConfigQueryVo: IImRoomConfig,
  isPublic: number,
  liveState: ENUM_LIVE_STATE,
  name: string,
  packageId: string,
  pullStreamUrl: string,
  pushStreamUrl: string,
  remark: string,
  roomId: string,
  startTimeFact: string,
  startTimePlan: string,
  streamLiveState: number,
  livePausedTime: string,
  tencentGroupId: string,
  title: string,
  type: number
}

export type IAgentInfoId = {
  agentInfoId: string
}
/**
 * 查询主播列表
 * @param params
 * agentInfoId (integer): 代理商Id
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryAnchorList = (params: IAgentInfoId) => {
  return post<IAnchorList, any>(`/live/app/agentAuthor/list`, params)
}

/**
 * 添加主播列表
 * @param params
 * agentInfoId (integer): 代理商ID
 * authorMobile (sting): 主播手机号
 * authorName (string): 主播姓名
 * @returns {Promise<AxiosResponse<*>>}
 */
export const createAnchor = (params:IAnchorItem) => {
  return post<any, IAnchorItem>(`/live/app/agentAuthor/save`, params)
}
/**
 * 删除主播前校验是否在直播
 * @param params
 * authorId (integer): 主播ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const delBeforeCheck = (params:IAnchorItem & IAgentInfoId) => {
  return post<ICheckState, IAnchorItem & IAgentInfoId>(`/live/app/agentAuthor/check`, params)
}
/**
 * 删除主播
 * @param params
 * authorId (integer): 主播ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const deleteAnchor = (params:IAnchorItem  & IAgentInfoId) => {
  return post<any, IAnchorItem>(`/live/app/agentAuthor/delete`, params)
}
/**
 * 推荐直播接口
 * @param params
 * agentInfoId (integer): 代理商ID
 * recommendLocation (integer): 推荐位置（1:首页 2:直播管理）
 * @returns {Promise<AxiosResponse<*>>}
 */
export const liveRecommend = (params:IRecommendParams) => {
  return post<ILiveItem[], IRecommendParams>(`/live/app/applet/agentLiveRoom/agentRecommend`, params)
}

/**
 * 查询直播列表
 * @param params
 * agentInfoId (integer): 代理商ID
 * labelType (integer): 标签页（1:直播列表 2:直播回顾）
 * page (integer): 当前页
 * pageFlag (integer): 是否分页
 * rows (integer): 每页条数 默认10条
 * @returns {Promise<AxiosResponse<*>>}
 */
export const queryLiveList = (params:IliveListParams) => {
  return post<IliveList, IliveListParams>(`/live/app/applet/agentLiveRoom/page`, params)
}

// 直播间推荐列表
export const liveRecommendList = (param: {livingStatus: number, platformRoomId: string}) => {
	return post<IRoomInfo[], {livingStatus: number, platformRoomId: string}>(`/live/app/applet/agentLiveRoom/liveRecommend`, param)
}