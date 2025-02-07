import env from "@config/env";
import { utf8ArrayToStr } from "@utils/wxUtils"

const postStream = async (url, params = {}, onSuccess, onFail, onCallback) => {
	try {
		const requestTask = wx.request({
			url: env.BASE_API + url,
			method: 'POST',
			responseType: "arraybuffer",
			enableChunked: true,
			data: {
				...params
			},
			success: (res) => {
			  console.log('onSuccess', res)
				onSuccess(res)
			},
			fail: (err) => {
			 console.log('onFail', err)
				onFail(err)
			},
		});
		// 监听请求头接受事件
		requestTask.onHeadersReceived(r => {
			console.log('onHeadersReceived', r)
		});
		// 监听数据分块接收事件
		requestTask.onChunkReceived((response) => {
		console.log('response', response)
		});
	} catch (err) {
		onFail(res)
	}
}

export {
	postStream
}