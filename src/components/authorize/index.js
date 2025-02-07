import { interceptionPrivacyProtocol, isLogged } from "@utils/index";
import { track, TrackEventName} from "../../utils/sa";
Component({
	properties: {
		extClass: {
			type: String,
			value: ''
		},
		plain: {
			type: Boolean,
			value: false
		},
		type: {
			type: String,
			value: 'default'
		},
		isShowAuth: {
			type: Boolean,
			value: false
		},
		timer: {
			type: [String, Number],
			observer: 'openAuthorize'
		},
		// 开启优化
		optimization: {
			type: Boolean,
			value: false
		},
		hoverClass: String,
		disabled: {
			type: Boolean,
			value: false
    },
    
    pageSource: {
      type: String,
      value: ''
    }
	},
	options: {
		// 在组件定义时的选项中启用多slot支持
		multipleSlots: true,
		styleIsolation: 'apply-shared',
		virtualHost: true
	},
	methods: {
		// visibleUpdate(isVisible) {
		// 	this.setData({
		// 		visible: true
		// 	})
		// },
		openAuthorize(v) {
			if (v && this.data.isShowAuth) {
				this.setData({
					visible: true
        })
        
        this.triggerEvent('popStatus', {showPop:true})
			}
		},
		hideDialog() {
      this.triggerEvent('popStatus', {showPop:false})
			this.setData({visible: false})
		},
		async beforeAction(e) {
			if (isLogged()) {
				this.triggerEvent(this.data.optimization ? 'logged' : 'success', {result: e.detail.userInfo})
        // this.hideLogin()
        this.triggerEvent('popStatus', {showPop:false})
				return false
			} else {
        await interceptionPrivacyProtocol()
				this.setData({
					visible: true
        }, () => {
          track(TrackEventName.Boss_WechatLogin)
        })
        this.triggerEvent('popStatus', {showPop:true})
			}
		},
		bindSuccess(e) {
      this.hideDialog()
      this.triggerEvent('success', e.detail)
		},
		bindFail(e) {
			this.triggerEvent('fail', e)
		},
		bindClose() {
			this.setData({
				visible: false
      })
      this.triggerEvent('popStatus', {showPop:false})
		}
	}
});
