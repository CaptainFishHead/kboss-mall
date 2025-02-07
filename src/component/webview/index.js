import {wxFuncToPromise} from "../../utils/wxUtils";

Component({
	properties: {
		src: String
	},
	data: {},
	methods: {
		onMessage(e) {
			console.log(e.detail)
			// 小程序webview事件通讯,type为事件类型，payload为事件参数，用type作为case为webview提供原生功能
			const {type, payload} = e.detail.data
			if (type) {
				wxFuncToPromise(type, payload)
					.catch(e => {
						console.log(e)
					})
			}
        },
        statechange(e){
            console.log("============", e)
        },
        error(e){
            console.log("============", e)
        }
	}
});
