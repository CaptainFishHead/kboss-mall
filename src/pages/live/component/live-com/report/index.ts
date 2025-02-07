import {ITypes} from '../../../models/types/fabulous'
import {saveLiveRoomReport} from '../../../models/live'
import { CONSUMER_HOTLINE, TOAST_TYPE } from "@const/index";
import { showToast } from "@components/toast/index";

enum STEP_ENUM {
	OPTION,
	REPORT
}

Component({
	options: {virtualHost: true},
	properties: {
	},
	data: {
		selectIds: <Array<number>>[],
		types: <Array<ITypes>>[
			{
				id: 1,
				name: '非法政治内容',
				isSelect: false
			},
			{
				id: 2,
				name: '不良行为',
				isSelect: false
			},
			{
				id: 3,
				name: '封建迷信',
				isSelect: false
			},
			{
				id: 4,
				name: '低俗色情内容',
				isSelect: false
			},
			{
				id: 5,
				name: '假冒商品',
				isSelect: false
			},
			{
				id: 6,
				name: '内容引起不适',
				isSelect: false
			},
			{
				id: 7,
				name: '违法违禁',
				isSelect: false
			},
			{
				id: 8,
				name: '引导线下转账',
				isSelect: false
			},
			{
				id: 9,
				name: '主播侮辱谩骂',
				isSelect: false
			}
		],
		step: STEP_ENUM.OPTION
	},
	lifetimes: {
		ready() {
			this.reset()
		}
	},
	methods: {
		bindType(e: any) {
			const {id: id} = e.currentTarget.dataset
			let ids: number[] = this.data.selectIds
			let operate_types: Array<{ id: number, name: string, isSelect: boolean }> = this.data.types
			if (ids.includes(id)) {
				let index: number = ids.findIndex(e => e === id)
				ids.splice(index, 1)
				this.setData({
					selectIds: ids
				})
				let ot: ITypes | undefined = operate_types.find(e => e.id === id)
				ot && (ot.isSelect = false)
				this.setData({
					selectIds: ids,
					types: operate_types
				})
			} else {
				ids.push(id)
				let ot: ITypes | undefined = operate_types.find(e => e.id === id)
				ot && (ot.isSelect = true)
				this.setData({
					selectIds: ids,
					types: operate_types
				})
			}
		},
		close() {
			this.reset()
			this.triggerEvent('close')
		},
		onCallTel() {
			this.triggerEvent('contact')
			// wx.makePhoneCall({
			// 	phoneNumber: CONSUMER_HOTLINE
			// })
		},
		showReport() {
			let types: Array<ITypes> = this.data.types.map(item => {
				item.isSelect = false
				return item
			})
			this.setData({
				step: STEP_ENUM.REPORT,
				selectIds: [],
				types: types
			})

		},
		submitReport() {
			const textList = this.data.types
				.filter(item => this.data.selectIds.includes(item.id))
				.map(item => item.name)
			saveLiveRoomReport({roomId: wx.$tls.liveId, reportContent: textList.join(',')})
				.then(() => {
					showToast({
						title: '举报成功',
						type: TOAST_TYPE.SUCCESS,
						desc: '感谢您的监督，我们会尽快处理'
					})
				})
				.finally(() => {
					this.close()
				})
		},
		reset() {
			this.setData({step: STEP_ENUM.OPTION})
		},
	},
});