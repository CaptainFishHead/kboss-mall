Component({
  data: {
    swiperIndex: 1,
    isStop: true, //是否终止
    playStates: false,
    volumeStates: false,
    fullStates: false,
    sliderValue: 0, //当前播放时间
    updateState: false, //防止视频播放过程中导致的拖拽失效
    duration: 0, //视频播放进度,
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    product: {
      type: Object,
      value: {}
    },
    productImages: {
      type: Array,
      value: []
    },
    picHeight: {
      type: String,
      value: ''
    }
  },
  methods: {
    //视频初始化
    createVideo() {
      wx.createSelectorQuery().in(this)
      .select('#swiperVideo')
      .context(res => {
        this.videoContext = res.context
      }).exec()
      this.setData({
        updateState: true
      })
    },
    //播放 原控件
    videoPlay() {
      this.setData({
        playStates: true //需要修改播放状态
      })
    },
    //暂停 原控件
    videoPause() {
      this.setData({
        playStates: false //需要修改播放状态
      })
    },
    //全屏退出 原控件
    videoFullScreenChange(e) {
      if (!e.detail.fullScreen) {
        this.setData({
          fullStates: false //需要修改全屏状态
        })
      }
    },
    //播放结束 原控件
    videoEnd() {
      this.videoContext.exitFullScreen()
      this.setData({
        isStop: true,
        playStates: false,
        fullStates: false,
        sliderValue: 0,
        duration: 0
      })
    },
    //全屏开关 自定义控件
    videoFullScreen() {
      this.data.fullStates ? this.videoContext.exitFullScreen() : this.videoContext.requestFullScreen()
      this.setData({
        fullStates: !this.data.fullStates
      })
    },
    //音量开关 自定义控件
    videoVolume() {
      this.setData({
        volumeStates: !this.data.volumeStates
      })
    },
    //播放开关 自定义控件
    videoOpreation(type) {
      if (type === 'pause') {
        this.videoContext.pause()
      } else {
        this.data.playStates ? this.videoContext.pause() : this.videoContext.play()
        this.setData({
          playStates: !this.data.playStates,
          isStop: false
        })
      }
    },
    //播放进度 自定义控件
    videoUpdate(e) {
      const {currentTime, duration} = e.detail
      if (this.data.updateState) { //判断拖拽完成后才触发更新，避免拖拽失效
        const sliderValue = currentTime / duration * 100;
        this.setData({
          sliderValue,
          duration
        })
      }
    },
    //模拟进度条 拖拽
    sliderChanging() {
      this.setData({
        updateState: false //拖拽过程中，不允许更新进度条
      })
    },
    //模拟进度条 更新位置
    sliderChange(e) {
      const {value} = e.detail
      if (this.data.duration) {
        this.videoContext.seek(value / 100 * this.data.duration) //完成拖动后，计算对应时间并跳转到指定位置
        this.setData({
          sliderValue: value,
          updateState: true //完成拖动后允许更新滚动条
        })
      }
    },
    
    // 轮播图切换 控制音视频
    swiperChange(e) {
      const cur = e.detail.current
      this.setData({swiperIndex: cur + 1})
      if (cur !== 0) {
        this.videoContext && this.videoContext.pause()
        this.setData({
          playStates: false,
          isStop: true
        })
      }
    },
  }
});
