import {FabulousType, FabulousInfo} from '../../../models/types/fabulous'
import {SCENE_TYPE, track, TrackEventName} from "@utils/sa";
import {fnv32a, getRandom} from "@utils/index";
import {queuePush} from "@utils/queue";

const EXPRESSIONS: FabulousInfo[] = [
	{
		type: FabulousType.SMILE,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/SMILE.png'
	},
	{
		type: FabulousType.KISS,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/KISS.png'
	},
	{
		type: FabulousType.WHISTLE,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/WHISTLE.png'
	},
	{
		type: FabulousType.WONDER,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/WONDER.png'
	},
	{
		type: FabulousType.HEARTS,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/HEARTS.png'
	},
	{
		type: FabulousType.COOL,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/COOL.png'
	},
	{
		type: FabulousType.FABULOUS,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/FABULOUS.png'
	},
	{
		type: FabulousType.BUY,
		url: 'https://static.tojoyshop.com/images/wxapp-boss/bosshealth/phiz/BUY.png'
	}
]

const EXPRESSIONS_LEN = EXPRESSIONS.length
Component({
	properties: {
		roomInfo: {type: Object, value: {}},
		likeCount: {
			type: Number, value: 0,
			observer(_newVal, old) {
				if (old && !this.data._likeNumber) {
					this.translate()
				}
			}
		},
		style: {type: String, value: ''},
	},
	options: {
		virtualHost: true,
		pureDataPattern: /^_/
	},
	data: {
		list: <FabulousInfo[]>[],
		isClick: <boolean>false,
		_trackTimerId: <number | null>null,
		_clickTimerId: <number | null>null,
		_likeNumber: <number>0
	},
	observers: {},
	methods: {
		vibrateLongTap() {
			wx.vibrateLong()
		},
		vibrateShortTap() {
			// wx.vibrateLong()
			const {_trackTimerId, _clickTimerId, _likeNumber} = this.data
			_trackTimerId && clearTimeout(_trackTimerId)
			_clickTimerId && clearTimeout(_clickTimerId)
			const {roomInfo, isClick} = this.data
			if (!isClick) {
				this.setData({isClick: true})
			}
			const clickTimerId = setTimeout(() => {
				wx.nextTick(() => {
					this.setData({isClick: false})
				})
			}, 100)
			const type = this.translate()
			wx.$tls.like({type})
			const trackTimerId = setTimeout(() => {
				track(TrackEventName.Sdk_Live_Like, {
					detail_id: roomInfo.roomId,
					live_name: roomInfo.title,
					like_number: _likeNumber + 1,
					sceneType: SCENE_TYPE.LIVE
				})
				this.setData({_likeNumber: 0})
			}, 1000)
			this.setData({
				_trackTimerId: trackTimerId,
				_likeNumber: _likeNumber + 1, _clickTimerId: clickTimerId
			})
		},
		expressionsPush() {
			const index = getRandom(0, EXPRESSIONS_LEN)
			const expression = {...EXPRESSIONS[index], id: `animate_${fnv32a('' + getRandom(index, 100000))}`}
			const {list} = this.data
			list.push(expression)
			this.setData({
				list
			})
			return expression
		},
		expressionsPop() {
			const {list} = this.data
			list.shift()
			this.setData({list})
		},
		translate() {
			const expression = this.expressionsPush()
			const x = Math.min(getRandom(0, 60, true), 16)
			queuePush(() => {
				this.animate(`#${expression.id}`, [
					{
						opacity: 0,
						translate3d: [0, 20, 0],
						scale3d: [.1, .1, .1],
						ease: 'ease-in-out'
					},
					{
						opacity: 1,
						translate3d: [x, -120, 0],
						scale3d: [1, 1, 1],
						ease: 'ease-in-out'
					},
					{
						opacity: 0,
						translate3d: [0, -180, 0],
						scale3d: [0, 0, 0],
						ease: 'ease-in-out'
					}
				], 2000, () => {
					this.expressionsPop()
				})
			}, {isStart: true, delay: 100})
			return expression.type
		},
		getRandomInt(min: number, max: number) {
			return Math.floor(Math.random() * (max - min + 1)) + min
		}
	}
})