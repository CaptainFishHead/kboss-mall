// 直播结束页面
// import { liveRoomData } from '../../../models/live'
Component({
  options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
  properties: {
    // 直播间信息
    dataInfo: {
      type: Object,
      value: {
        viewTime: '',
        viewCount: '',
        viewPerson: '',
        hotNum: ''
      }
    }
  },
  data: {
    // dataInfo: {
    //   viewTime: '',
    //   viewCount: '',
    //   viewPerson: '',
    //   hotNum: ''
    // }
  },
  lifetimes: {
    ready() {
      // this.getData()
    }
  },
  methods: {
    // getData() {
    //   liveRoomData({roomId: this.data.roomId}).then(({result}) => {
    //     this.setData({dataInfo: result})
    //   })
    // },
    // getList() {
    //   liveRecommendList({liveState: 2}).then(res => {
    //     if (res.result.length) {
    //       this.setData({trailerLiveInfo: res.result[0]})
    //     }
    //   })
    // }
  }
})
