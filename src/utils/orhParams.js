import {post} from "./http/index";
import {PLAT_FORM} from "../const/index";

export const getObhMiddleParam = async () => {
	return new Promise(function (resolve, reject) {
		let obj = {
			mid: '',
			source: '',
		}
		if (getParams().code != 200) {
			return resolve(obj)
		}
		let {type, hd, cjId} = getParams().data
		if (type == 'hd') {
			let params = {
				id: hd.activeId,
				type: '2', //1.场景ID,2.活动id
				sharerSaffId: hd.shareId,
				sharerHotelId: hd.hotelId,
			}
			post(`/api/v1/obh/wechat/obhhotel/getSchemeUrl`, params, {
				headers: {platformId: PLAT_FORM.OBH}
			})
				.then((res) => {
					console.log('API_obh.hotelGetSchemeUrl', res)
					if (res && res.code == 200 && res.result) {
						let path = res.result.path
						let param = res.result.param || ''
						let isTab =
							path.indexOf('pages/index/index') !== -1 ||
							path.indexOf('pages/mall/index') !== -1 ||
							path.indexOf('pages/mine/index') !== -1 ||
							path.indexOf('pages/column/index') !== -1
						if (path.indexOf('/') != 0) path = `/${path}`
						if (path.indexOf('?') != -1 && param) {
							path = `${path}&${param}`
						} else if (path.indexOf('?') == -1 && param) {
							path = `${path}?${param}`
						}
						console.log('path', path)
						obj = {
							mid: getQueryVariable(path, 'mid') || '',
							source: getQueryVariable(path, 's') || '',
						}
						resolve(obj)
					} else {
						resolve(obj)
					}
				})
				.catch((err) => {
					resolve(obj)
				})
		} else if (type == 'cj') {
			let params = {
				id: cjId,
				type: '1', //1.场景ID,2.活动id
				sharerSaffId: '',
				sharerHotelId: '',
			}
			post(`/api/v1/obh/wechat/obhhotel/getSchemeUrl`,params,{
				headers: {platformId: PLAT_FORM.OBH}
			})
				.then((res) => {
					console.log('API_obh.hotelGetSchemeUrl', res)
					if (res && res.code == 200 && res.result) {
						let path = res.result.path
						let param = res.result.param || ''
						let isTab =
							path.indexOf('pages/index/index') !== -1 ||
							path.indexOf('pages/cart/index') !== -1 ||
							path.indexOf('pages/mine/index') !== -1 ||
							path.indexOf('pages/classify/index') !== -1
						if (path.indexOf('/') != 0) path = `/${path}`
						if (path.indexOf('?') != -1 && param) {
							path = `${path}&${param}`
						} else if (path.indexOf('?') == -1 && param) {
							path = `${path}?${param}`
						}
						obj = {
							mid: getQueryVariable(path, 'mid') || '',
							source: getQueryVariable(path, 's') || '',
						}
						resolve(obj)
					} else {
						resolve(obj)
					}
				})
				.catch((err) => {
					resolve(obj)
				})
		}
	})
}

function getParams() {
	let options = wx.getLaunchOptionsSync().query
	let type = ''
	let cjId = '' //场景id
	let hd = {
		activeId: '',
		hotelId: '',
		shareId: '',
	}
	if (options && options.q) {
		// 获取url参数
		// 1.现在我们用的码地址https://jd.yunshang520.com/dc/865812058340854
		let result = decodeURIComponent(options.q)
		if (result.indexOf('https://jd.yunshang520.com/cj/') != -1) {
			cjId = result.split('/cj/')[1] || ''
			type = 'cj'
		} else if (result.indexOf('https://jd.yunshang520.com/cj2/') != -1) {
			cjId = result.split('/cj2/')[1] || ''
			type = 'cj'
		} else if (result.indexOf('https://jd.yunshang520.com/hd/') != -1) {
			let hdStr = result.split('/hd/')[1] || ''
			type = 'hd'
			let arr = hdStr.split('/')
			hd = {
				activeId: arr[0] || '',
				hotelId: arr[1] || '',
				shareId: arr[2] || '',
			}
		} else if (result.indexOf('https://jd.yunshang520.com/hd2/') != -1) {
			let hdStr = result.split('/hd2/')[1] || ''
			type = 'hd'
			let arr = hdStr.split('/')
			hd = {
				activeId: arr[0] || '',
				hotelId: arr[1] || '',
				shareId: arr[2] || '',
			}
		} else {
			return {
				code: 400,
				message: '',
				data: {
					type,
					cjId,
					hd,
				},
			}
		}
		if (type) {
			return {
				code: 200,
				message: '',
				data: {
					type,
					cjId,
					hd,
				},
			}
		} else {
			return {
				code: 400,
				message: '',
				data: {
					type,
					cjId,
					hd,
				},
			}
		}
	} else {
		return {
			code: 400,
			message: '',
			data: {
				type,
				cjId,
				hd,
			},
		}
	}
}

export function getQueryVariable(link, variable) {
	var query = link.split('?')[1]
	var vars = query.split('&')
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=')
		if (pair[0] == variable) {
			return pair[1]
		}
	}
	return false
}
