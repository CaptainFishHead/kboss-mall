export enum FabulousType {
	SMILE = 'SMILE',
	KISS = 'KISS',
	WHISTLE = 'WHISTLE',
	WONDER = 'WONDER',
	HEARTS = 'HEARTS',
	COOL = 'COOL',
	FABULOUS = 'FABULOUS',
	BUY = 'BUY'
}

export interface FabulousInfo {
  type: string,
  url: string
}
export interface ITypes {
	id: number,
	name: string,
  isSelect: boolean
}

export interface SdkLiveLike {
	detail_id: string,
	live_name: string,
	like_number: number
}