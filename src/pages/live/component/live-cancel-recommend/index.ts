import { liveRecommendList } from "../../models/live"
import { IRoomInfo } from "../../models/types/live";
// 直播取消页面
Component({
  options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
  properties: {
    roomId: {
      type: String,
      value: ''
    }
	},
  data: {
    liveList: <IRoomInfo[]>[]
  },
  lifetimes: {
    ready() {
      this.getList()
    }
  },
  methods: {
    getList() {
      liveRecommendList({livingStatus: 3, platformRoomId: this.data.roomId}).then(res => {
        this.setData({liveList: res.result})
      })
    }
  }
})
  