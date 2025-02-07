Component({
  externalClasses: ["class"],
	properties: {
    src: {
      type: String,
      value: ''
    }
	},
	data: {
		pictureInPictureMode:['push'/*,'pop'*/]
	},
	methods: {
    onJoinSmallRoom(e) {
      console.log('进入小屏直播间', e)
      this.triggerEvent('joinSmallRoom', e);
    },
    onExitSmallRoom(e){
      console.log('退出小屏直播间', e)
      this.triggerEvent('exitSmallRoom', e);
    },
      statechange(e){
        this.triggerEvent('statechange', e.detail);
      },
      error(e){
        this.triggerEvent('error', e.detail);
      }
	}
});
