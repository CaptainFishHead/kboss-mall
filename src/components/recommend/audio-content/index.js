Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: String,
      value: 'https://downsc.chinaz.net/Files/DownLoad/sound1/202309/y2112.mp3'
    },
    title: {
      type: String,
      value: ''
    },
    cover: {
      type: String,
      value: ''
    },
    audioName: {
      type: String,
      value: ''
    },
  },
  options: {
    virtualHost: true,
    styleIsolation: 'apply-shared'
  },
  /**
   * 组件的初始数据
   */
  data: {
    audioContext: null,
    audioState: false,
    audioLength: 0, //音频总时长
    audioCurrentTime: 0, //播放时长
    intervalLoadDuration: '',
  },
  pageLifetimes: {

  },
  ready() {
    // this.setData({audioName: this.data.src.split('/').pop()})
    this.createAudio(this.data.src)
  },
  detached() {
    // 组件销毁时 释放音频资源
    this.data.audioContext && this.data.audioContext.destroy && this.data.audioContext.destroy()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    createAudio(audioSrc) {
      let that = this
      // 创建音频上下文对象
      const innerAudioContext = wx.createInnerAudioContext({
        useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
      })
      // 设置音频资源地址
      innerAudioContext.src = audioSrc
      // 设置音频上下文对象
      this.setData({ audioContext: innerAudioContext })
      //运行一次
      innerAudioContext.play();
      innerAudioContext.pause();
      // 监听音频播放进度更新事件
      innerAudioContext.onTimeUpdate(() => {
        this.triggerEvent('timeUpdate', innerAudioContext)
        // 设置音频播放进度
        this.setData({ audioCurrentTime: innerAudioContext.currentTime })
      })
      // 音频播放完成
      innerAudioContext.onEnded(() => {
        // 关闭播放状态
        this.setData({ audioState: false })
        // 设置音频播放进度为总长度
        this.triggerEvent('playEnd', innerAudioContext)
        this.setData({ audioCurrentTime: innerAudioContext.duration })
      })
      innerAudioContext.onCanplay(() => {
        // 设置音频总长度
        innerAudioContext.duration
        // 延时获取音频真正的duration 一般第一次获取不到。。。
        that.data.intervalLoadDuration = setInterval(() => {
          if (innerAudioContext.duration) {
            console.log(innerAudioContext.duration)
            clearInterval(that.data.intervalLoadDuration);
            //延时获取音频真正的duration
            let duration = innerAudioContext.duration
            this.triggerEvent('init', innerAudioContext)
            that.setData({
              audioLength: duration
            });
          }
        }, 100);
        // setTimeout(() => {
        //   this.triggerEvent('init', innerAudioContext)
        //   this.setData({audioLength: innerAudioContext.duration})
        // }, 1000)
      })
      
    },
    switchState() {
      // 音频播放或暂停
      this.setData({ audioState: !this.data.audioState })
      if (this.data.audioState) {
        this.data.audioContext.play()
      } else {
        this.data.audioContext.pause()
      }
    },
    sliderChange(e) {
      // 通过拖拽进度条设置进度
      this.setData({ audioCurrentTime: e.detail.value })
      this.data.audioContext.seek(e.detail.value)
      if (e.detail.value >= this.data.audioLength) {
        // 进度条拖拽到最后 则停止播放 下次从头开始播放
        this.data.audioContext.stop()
        // 重置播放状态
        this.setData({ audioState: false })
      }
    },
  }
})
