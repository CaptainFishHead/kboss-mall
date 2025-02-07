import {wxFuncToPromise} from "@utils/wxUtils";
import {track, TrackEventName} from "@utils/sa";
import {SCENE_CODE, STORAGE_SCAN_DEVICE} from "../../const/index";
import {getEnterOptions} from "../../utils/index";

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		isScrolling: {
			type: Boolean, value: false
		},
		isShowScan: {
			type: Boolean, value: false
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		skipScene: '',
		source: '',
		isShowIcon: true,
		// 氧吧设备id
		deviceId: null
	},
	pageLifetimes: {
		show() {
			this.updateSkipScene()
		},
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		async updateSkipScene() {
			const {scene} = wx.getEnterOptionsSync()
			// const params = parameterMergeMapping(Object.assign({}, {...(referrerInfo.extraData || {})}, query))
			const params = await getEnterOptions()
			const deviceId = this.getScanDevice()
			this.setData({
				// skipScene: SOURCE.BOSS_CLOUD.includes(params.source) ? SCENE_CODE[scene] : null,
				skipScene: SCENE_CODE[scene],
				source: params.source,
				deviceId
			})
		},
		// 氧吧设备氧吧
		getScanDevice() {
			// key: `SCAN_DEVICE`
			// value:{
			// 	id:'deviceId',
			// 		expired:过期时间（时间戳）
			// }
			const device = wx.getStorageSync(STORAGE_SCAN_DEVICE) || {}
			return Number(device.expired) > Date.now() ? device.id : (() => {
				wx.removeStorageSync(STORAGE_SCAN_DEVICE)
				return null
			})();
		},
		/** 返回小程序*/
		backMiniProHandle() {
			//点击返回时间
			track(TrackEventName.Boss_LbyReturn, {return_time: Date.now()});
			wxFuncToPromise(`navigateBackMiniProgram`)
				.then((res) => {
					// 返回成功
				}).catch(err => {
				console.log(err)
			})
		},
		backAppHandle() {
			track(TrackEventName.Boss_LbyReturn, {return_time: Date.now()});
		},
		/** 返回app 异常监听*/
		launchAppError(e) {
			console.error(e.detail.errMsg, 'errMsg')
		},
		imgLoadFail(e) {
			console.error(e, 'imgLoadFail')
			this.setData({isShowIcon: false})
		}
	}
})
