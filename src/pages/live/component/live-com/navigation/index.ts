import {wxFuncToPromise} from "@utils/wxUtils";
import {hexToRgba} from "@utils/index";

Component({
	properties: {
		// 返回icon的颜色会根据文字颜色变化
		frontColor: {type: String, value: "#000000", observer: 'updateNavigation'},
		backgroundColor: {type: String, value: "#ffffff", observer: 'updateNavigation'},
		// 状态栏颜色（0，1）只有黑和白
		statusBar: Number,
		// 是否自定义返回事件，自定义后需要绑定bind:back,组件只会触发bind:back事件，不做任何处理
		isCustomBack: {type: Boolean, value: false},
		// 是否是假页面，假页，一定会显示返回按钮（icon）
		isFakePage: {type: Boolean, value: false, observer: 'updateNavigation'},
		// 过渡透明度起始（如果透明度开始状态不等于1则会开启页面滚动，）
		transparencyStart: {type: Number, value: 1, observer: 'updateNavigation'},
		transparencyEnd: {type: Number, value: 1, observer: 'updateNavigation'},
		// 滚动高度为多少px时导航栏背景色透明度从transparencyStart-->transparencyEnd
		transparencyHeight: {type: Number, value: 0},
		// 当前滚动条高度
		currentScrollTop: {type: Number, value: 0, observer: 'scrolling'},
		fixed: {type: Boolean, value: false},
		style: String
	},
	options: {
		virtualHost: true,
		multipleSlots: true
	},
	data: {
		isShowBack: <boolean>true,
		navigatorTransparency: <number>0,
		bgRgb: <string>''
	},
	lifetimes: {
		ready() {
			// const pages = getCurrentPages()


			// const {frontColor, backgroundColor, /*isFakePage,*/ transparencyStart, transparencyHeight} = this.data
			// const bgRgb = hexToRgba(backgroundColor)
			// this.setData({navigatorTransparency: transparencyStart, bgRgb})

			// if (pages.length > 1 || isFakePage) {
			// 	this.setData({isShowBack: true})
			// }


			// this.init(transparencyHeight)
			// wx.setNavigationBarColor({frontColor, backgroundColor})


			// wx.createSelectorQuery().in(this)
			// 	.select('#scoller')
			// 	.fields({node: true, scrollOffset: true})
			// 	.exec(([{node: scrollView, scrollTop}]) => {
			// 		console.log(scrollView, scrollTop)
			// 	})
		}
	},
	methods: {
		init(BASE_HEIGHT?: number, BASE_WIDTH?: number) {
			wxFuncToPromise<{ windowWidth: number, statusBarHeight: number }>('getSystemInfo')
				.then((arg) => {
					const {windowWidth, statusBarHeight} = arg
					this.setData({
						statusBarHeight: statusBarHeight
					})
					const equipmentFactor = windowWidth / (BASE_WIDTH || 375)
					this.setData({
						limitHeight: equipmentFactor * (BASE_HEIGHT || 375)
					})
				})
		},
		scrolling(scrollTop: number): any {
			const {transparencyHeight} = this.data
			if (!transparencyHeight) {
				return null
			}
			const navigatorTransparency = scrollTop / transparencyHeight
			if (navigatorTransparency >= 1 && this.data.navigatorTransparency >= 1) {
				return null
			}
			wx.nextTick(() => {
				this.setData({navigatorTransparency})
			})
		},
		tapBack() {
			if (this.data.isCustomBack) {
				this.triggerEvent('back')
			} else {
				const pages = getCurrentPages()
				wxFuncToPromise(pages.length > 1 ? 'navigateBack' : 'reLaunch', {url: '/pages/index/index'})
					.catch(err => {
						console.error('navigateBack', err)
					})
			}
		},
		updateNavigation() {
			// const pages = getCurrentPages()
			const {frontColor, backgroundColor, /*isFakePage,*/ transparencyStart, transparencyHeight} = this.data
			const bgRgb = hexToRgba(backgroundColor)
			this.setData({navigatorTransparency: transparencyStart, bgRgb})
			// if (pages.length > 1 || isFakePage) {
			// 	this.setData({isShowBack: true})
			// }
			this.init(transparencyHeight)
			wx.setNavigationBarColor({frontColor, backgroundColor})
			// wx.createSelectorQuery()
			// 	.select('#carrier')
			// 	.fields({node: true, scrollOffset: true})
			// 	.exec(([{node: scrollView, scrollTop}]) => {
			// 		console.log(scrollView, scrollTop)
			// 	})
		}
	}
});
