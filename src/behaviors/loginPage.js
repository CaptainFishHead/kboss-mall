import {openPage} from "../utils/index";
import {executeCallbacks} from "../components/LoginPage/callbacks";

export default Behavior({
	data: {
		loginPageVisible: false,
	},
	methods: {
		searchbarOpenPage(e) {
			const {link} = e.detail || {}
			openPage.call(this, {link})
		},
		closeLoginPage() {
			this.setData({loginPageVisible: false})
		},
		// 登录回掉
		afterLogin() {
			this.closeLoginPage()
			executeCallbacks()
		},
	}
})