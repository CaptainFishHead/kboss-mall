Component({
  externalClasses: ["class"],
  properties: {
    src: {
      type: String,
      value: ''
    }
  },
  data: {
    pictureInPictureMode: ['push'/*,'pop'*/]
  },
  methods: {
    onJoinSmallRoom(e) {
      console.log('进入小屏直播间', e,wx.$tls)
      // wx.createSelectorQuery().in(this)
      //   .select('#live-player')
      //   .context(res => {
      //     // this.videoContext = res.context
      //     console.log(res.context)
      //   })
      //   .exec()
      this.triggerEvent('joinSmallRoom', e);
    },
    onExitSmallRoom(e) {
      console.log('退出小屏直播间', e)
      this.triggerEvent('exitSmallRoom', e);
    },
    statechange(e) {
      console.log('~~~~~~拉流状态变化', e.detail.code)
      this.triggerEvent('statechange', e.detail);
    },
    error(e) {
      console.log('~~~~~~拉流状态变化error', e)
      this.triggerEvent('error', e.detail);
    }
  }
});
