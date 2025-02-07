// import {getEnterOptions} from "../utils/index";
// import {CARRIER_PAGES, SOURCE} from "../const/index";
// import {wxFuncToPromise} from "../utils/wxUtils";
export default Behavior({
	methods: {
		/*async */goBack(e, url) {
      const pages = getCurrentPages()
			if (pages.length <= 1) {
				if (url) wx.reLaunch({url})
				else this.restart()
				return false
			}
		},
		/**
		 * 重启启动，加载康老板数据，防止来源为sdk，sdk没有首页
		 */
		restart() {
			wx.reLaunch({
				url: `/pages/index/index`
			})
		},
		exit() {
			wx.exitMiniProgram()
		}
	}
})