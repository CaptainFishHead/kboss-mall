
import { SOURCE } from "@const/index";
import { IRoomInfo } from "../../models/types/live";

// 直播列表卡片
Component({
	// externalClasses: ['class'],
	properties: {
		liveInfo: {
			type: Object,
			value: <IRoomInfo>{}
		}
	},

	data: {},

	lifetimes: {
		created() {
		},
		ready() {
		},
		detached() {
		}
	},

	methods: {
		joinRoom() {
			// app.reset()
			// const detailId = this.data.liveInfo.roomId
			// app.setData({sceneId: '0', sceneType: SCENE_TYPE.LIVE, detailId, shareId: '0'})
			const platformRoomId = this.data.liveInfo.platformRoomId
			wx.navigateTo({
				url: `/pages/live/player/index?roomId=${platformRoomId}&source=${SOURCE.BH_MALL}&targetId=${platformRoomId}&position=live`
			})
		}
	}
})

