import {ipInfo} from "../models/ipModel";
import carrier from "@behaviors/carrier";
import { track, TrackEventName } from "@utils/sa";
import { htmlToWxml } from "@utils/index"

Page({
	behaviors:[carrier],
	data: {
		info: {},
		loading: true
	},
	_starttime: 0,
	onShow() {
    this._starttime = Date.now()
  },
  onHide(){
    this.setPoint();
  },
	onLoad(options) {
		this.getInfo()
	},
	onUnload() {
	  this.setPoint();
	},
	onPageScroll(e) {
    this.pageScrolling(e)
  },
	getInfo() {
		ipInfo({ ipId: this.options.id }).then(res => {
			res.result.remark = htmlToWxml(res.result.remark)
			this.setData({ info: res.result })
		}).finally(() => {
			this.setData({ loading: false })
		})
	},
	// 设置埋点
	setPoint(){
		const { info } = this.data;
		const endtime = Date.now();
		const cycle_time = Math.floor((endtime - this._starttime) / 1000)
		let trackOptions = {
			special_id: info.ipId || '',
			detail_id: info.ipId || '',
			special_name: info.ipName || '专家详情',
			starttime: this._starttime,
			endtime,
			cycle_time
		};
		track(TrackEventName.Boss_Special_Detail, trackOptions)
	},
});