
Component({
	properties: {
		visible: {
			type: Boolean,
			value: false
		}
	},
	options: {
		virtualHost: true
	},
	methods: {
		bindSuccess(e) {
			this.triggerEvent('success', e.detail)
		},
		bindFail(e) {
			this.triggerEvent('fail', e)
		},
		bindClose() {
			this.triggerEvent('close')
		},
		// openLogin() {
		// 	return new Promise((resolve, reject)=>{
		// 		this.triggerEvent('open')
		// 	})
		// }
	}
});
