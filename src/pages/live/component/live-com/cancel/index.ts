import { liveRecommendList } from "../../../models/live"
import { IRoomInfo } from "../../../models/types/live"

// 直播取消页面
Component({
  options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
  properties: {
	},
  data: {
    liveList: <IRoomInfo[]>[]
  },
  lifetimes: {
    ready() {
      // this.getList()
    }
  },
  methods: {
    getList() {
      liveRecommendList({liveState: 3}).then(res => {
        this.setData({liveList: res.result})
      })
    }
  }
})
  