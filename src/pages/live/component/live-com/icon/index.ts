Component({
	options: {
		virtualHost: true
	},
	externalClasses: ['class'], // 可以将 class 设为 externalClasses
	properties: {
		style: String,
		color: {type: String, value: 'currentColor'},
		width: {type: String, value: '100%'},
		height: {type: String, value: 'auto'},
		src: String,
		mode: {type: String, value: 'aspectFit'},
		baseURL: {type: String, value: 'https://static.tojoyshop.com'},
		dir: {type: String, value: '/images/wxapp-boss/icons'},
		lazyLoad: {type: Boolean, value: true},
		// 取反色
		colorReversed: {type: Boolean, value: false},
		// 亮度
		brightness: {type: Number, value: 1}
	},
	methods: {}
});
