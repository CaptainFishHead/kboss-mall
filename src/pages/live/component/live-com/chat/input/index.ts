// import {wxFuncToPromise} from "../../../../utils/wxUtils";

Component({
	externalClasses: ['class'],
	properties: {},
	options: {virtualHost: true},
	data: {
		messageText: '',
		inputFocus: false,
		keyboardHeight: '0rpx'
	},
	methods: {
		// 发送文本消息
		sendTextMessage(text: string) {
			wx.$tls.sendMessage(text).then(() => {
				// 发送成功 清空输入框
				this.setData({messageText: ''})
			})
		},
		sendMessage(e: any) {
			// wx.showToast({
			// 	title: '您已被禁言',
			// 	icon: 'none',
			// 	duration: 2000
			// })
			this.sendTextMessage(e.detail.value)
		},
		onfocus() {
			this.setData({inputFocus: true})
		},
		onblur() {
			this.setData({inputFocus: false})
		},
		bindKeyboardHeightChange(e: { detail: { height: number } }) {
			// wxFuncToPromise<{ devicePixelRatio: number }>(`getSystemInfo`)
			// 	.then(({devicePixelRatio}) => {
			//
			// 	})
			const keyboardHeight = `-${e.detail.height}px`
			if (this.data.keyboardHeight !== keyboardHeight) {
				this.setData({keyboardHeight})
			}

		}
	}
})
