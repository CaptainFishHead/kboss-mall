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
export interface IRoomProductParam {
	roomId: string
	isHidden?: boolean
	productName?: string
}

export interface IRoomProduct {
	isExplain: number,
	isHidden: number,
	isTop: number,
	natureVal: string,
	recordId: string,
	roomId: string,
	ruleVal: string,
	skuId: string,
	skuName: string,
	skuPrice: string,
	sort: number,
	serialNo: number
	spuId: string,
	spuImgUrl: string,
	spuName: string,
	stockNum: number
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
		anchorImAccount: string,
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

export interface IAccountInfoParam {
	userId?: string
	nickName?: string
	mobile?: string
	source?: ISource
}

export enum ISource {
  BHAGENT = 'bh_agent', // 康店代理商（康老板小程序内暂时用不到此来源，康店用的）
  BHMAIL = 'bh_mail' // 康老板
}

export interface IAccountInfo {
	userAccount: string
	userPrefix: string
	userSign: string
}

// 获取直播间统计数据 点赞、人气、观看数量、人数、时间
export interface ILiveDataInfo {
	hotNum: number
	likeCount: number
	viewCount: number
	viewTime: number
}

// 直播间商品购买人数、购买数量
export interface IProductBuyInfo {
	productUvPerson: number
	productNum: number
}


export interface ILiveDataTableInfoItem {
	allPerson: number // 总人数	
	clickCount: number // 点击次数	
	enterPerson: number // 进入人数	
	linePerson: number // 在线人数	
	statisticsDate: string // 统计日期	
}

export interface ILiveDataAllInfo {
	viewPerson: number // 观看人数		
	maxOnline: number // 最高在线人数		
	viewCount: number // 观看次数		
	totalCommodityEposureCount: number // 商品总曝光数		
	totalClickCount: number // 商品总点击量			
	orderProductNum: number // 总成交商品成交件数			
	totalOrderPrice: number // 总成总交金额 单位:元			
	productDataList: ILiveProductData[] // 商品销售数据
}

export interface ILiveProductData {
	spuImgUrl: number // 商品图片			
	spuName: number // 商品名称			
	orderProductNum: number // 成交总件数		
	orderTotalPrice: number // 成交总金额	
}

export interface IGoodsInfo {
  position: string,
  skuId: string,
  source: string,
  spuId: string,
  ssid: string,
  targetId: string
}