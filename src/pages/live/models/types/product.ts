import {IS} from "./common";

export interface IProductParam {
	spuId: string,
	skuId?: string
}
export enum CARD_TYPE {
	SPU,
	SKU
}
export enum SPU_ATTR {
	REAL = 1,
	VIRTUAL
}

export enum SPU_KIND {
	//商品种类1-套餐2-单品
	COMBO = 1,
	SINGLE
}
export enum REWARD_TYPE {
	// 1商品奖励
	PRODUCT = 1,
	// 2会员奖励
	MEMBER
}
export interface IKBossActivityInfo {
	// 奖励康豆数量
	awardNum: number,
	// 可用康豆数量
	usableNum: number,
	// 是否参加活动(0：未参加1：参加)
	isJoinPromotion: IS,
	// 活动ID
	promotionId: number,
	// 活动商品详情图
	promotionInfoUrl: string,
	// 活动规格图标
	promotionSkuUrl: string,
	// 促销价格类型-1:促销价;2:打折
	promotionPriceType: number,
	// 活动商品单品限购数量
	promotionSkuLimit: number,
	// 活动商品折扣
	promotionSkuDiscount: number
	// 活动商品促销价
	promotionSkuPrice: number,
	// 奖励康豆类型（1商品奖励，2会员奖励）
	rewardType: REWARD_TYPE
}
export interface ISku {
	//商品规格ID
	skuId: string,
	//商品规格属性
	skuDesc: string,
	//商品规格编码
	skuCode: string,
	//商品规格图片地址
	skuImgUrl: string,
	//是否是默认规格（0：不是、1：是）
	isDefault: IS,
	//商品规格限购量
	sinceMax: number,
	//商品规格起购量
	sinceMin: number,
	//商品规格库存
	stockNums: number,
	//商品规格价格信息
	skuPriceVo: {
		//商品规格销售价格(单价)
		yourPrice: number,
		//商品规格市场价格(单价)
		listPrice: number
	},
	// ======活动康豆相关
	kangBossActivityInfo:IKBossActivityInfo,
}

export interface ISubSku {
	subSpuId: string,  //子商品ID
	subSkuId: string,  //子商品规格ID
	subSpuName: string,  //子商品名称
	subSkuNum: number,  //子商品规格在套餐中数量
	subSkuImgUrl: string  //子商品规格图片地址
}

export interface ISpuImages {
	spuImgUrl: string
}

export interface IProduct {
	//商品属性（1：真实商品、2：虚拟商品）
	spuAttribute: SPU_ATTR,
	//商品Id
	spuId: string,
	spuContent: string,
	// 商品副标题
	spuSubhead: string,
	//商品名称
	spuName: string,
	//商品图片地址
	spuImgUrl: string,
	// 商品视频地址
	spuVideoUrl: string,
	//商品销量
	spusellNum: number,
	//商品种类1-套餐2-单品
	spuKind: SPU_KIND,
	//商品图片列表
	spuImageVoList: ISpuImages[],
	//商品规格信息列表
	skuVoList: ISku[],
	//套餐商品内子商品规格信息
	subSkuList: ISubSku[],
	[props:string]:any
}

export interface ICombineProductListparam {
	pageFlag?: boolean,
	page?: number,
	combineId: string,
	rows?: number
}