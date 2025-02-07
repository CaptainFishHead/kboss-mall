// components/audio/audio.ts
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext();
// import carrier from "../../behaviors/carrier";
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    audiosrc: {
      type: String,
      value: ""
    },
    isstopAudio: {
      type: Boolean,
      value: false
    }
  },
  observers: {
    'audiosrc'(str) {
      if (str) {
        this.Initialization();
        this.loadaudio();
      }
    },
    'isstopAudio'(isor) {
      // 停止播放
      if (isor) {
        this.playAudio('1')
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0, //总时间
    showTime1: 0, // 已播放时长
    // audioTime: 0, // 进度条百分比
    intervalLoadDuration: '',
  },
  // 初始化

  /**
   * 组件的方法列表
   */
  methods: {
    //初始化播放器，获取duration
    Initialization() {
      let that = this;
      if (this.data.audiosrc) {
        //设置src
        innerAudioContext.src = this.data.audiosrc;
        //运行一次
        innerAudioContext.play();
        innerAudioContext.pause();
        // 监听音频播放进度更新事件
        innerAudioContext.onTimeUpdate(() => {
          that.triggerEvent('timeUpdate', innerAudioContext)
        })
        // 音频播放完成
        innerAudioContext.onEnded(() => {
          // 设置音频播放进度为总长度
          that.triggerEvent('playEnd', innerAudioContext)
        })
        innerAudioContext.onCanplay(() => {
          if (that.data.intervalLoadDuration) {
            return;
          }
          //初始化duration
          innerAudioContext.duration
          // 延时获取音频真正的duration 一般第一次获取不到。。。
          that.data.intervalLoadDuration = setInterval(() => {
            if (innerAudioContext.duration) {
              clearInterval(that.data.intervalLoadDuration);
              //延时获取音频真正的duration
              let duration = innerAudioContext.duration;
              that.setData({
                audioDuration: duration
              });
            }
          }, 100);
        })
      }
    },
    //拖动进度条事件
    sliderChange(e) {
      console.log(e.detail.value, 'e.detail.value')
      var that = this;
      innerAudioContext.src = this.data.audiosrc;
      //获取进度条百分比
      var value = e.detail.value;
      // this.setData({
      //   audioTime: value
      // });
      var duration = this.data.audioDuration;
      //根据进度条百分比及歌曲总时间，计算拖动位置的时间
      // value = parseInt(value * duration / 100);
      //更改状态
      this.setData({
        showTime1:value,
        audioSeek: value,
        isPlayAudio: true
      });
      //调用seek方法跳转歌曲时间
      innerAudioContext.seek(value);
      //播放歌曲
      innerAudioContext.play();
    },
    //播放、暂停按钮
    playAudio(num) {
      // num 1页面隐藏时调用 其它为点击时调用
      //获取播放状态和当前播放时间
      var isPlayAudio = this.data.isPlayAudio;
      var seek = this.data.audioSeek;
      innerAudioContext.pause();
      //更改播放状态
      this.setData({
        isPlayAudio: num == '1' ? false : !isPlayAudio
      })
      if (isPlayAudio) {
        //如果在播放则记录播放的时间seek，暂停
        this.setData({
          audioSeek: innerAudioContext.currentTime
        });
      } else if (num != '1') {
        //如果在暂停，获取播放时间并继续播放
        innerAudioContext.src = this.data.audiosrc;
        if (innerAudioContext.duration != 0) {
          this.setData({
            audioDuration: innerAudioContext.duration
          });
        }
        //跳转到指定时间播放
        innerAudioContext.seek(seek);
        innerAudioContext.play();
      }
    },
    loadaudio() {
      var that = this;
      //设置一个计步器
      this.data.durationIntval = setInterval(function () {
        //当歌曲在播放时执行
        if (that.data.isPlayAudio == true) {
          //获取歌曲的播放时间，进度百分比
          var seek = that.data.audioSeek;
          var duration = innerAudioContext.duration;
          console.log(duration, 'duration')
          // var time = that.data.audioTime;
          var time = that.data.showTime1;
          // time = parseInt(100 * seek / duration);
          //当进度条完成，停止播放，并重设播放时间和进度条
          if (time >= that.data.audioDuration) {
            innerAudioContext.stop();
            that.setData({
              audioSeek: 0,
              // audioTime: 0,
              audioDuration: duration,
              isPlayAudio: false,
              showTime1: 0
            });
            return false;
          }
          //正常播放，更改进度信息，更改播放时间信息
          that.setData({
            audioSeek: seek + 1,
            // audioTime: time,
            audioDuration: duration,
            showTime1: seek
          });
        }
      }, 1000);
    }
  },
  lifetimes: {
    detached: function () {
      //卸载页面，清除计步器
      clearInterval(this.data.durationIntval)
    }
  },
  detached: function () {
    //卸载页面，清除计步器
    clearInterval(this.data.durationIntval)
  },
  pageLifetimes: {
    show: function () {
      this.Initialization();
      this.loadaudio();
    },
    hide: function () {
      // 隐藏页面时,停止播放
      this.playAudio('1')
      // 清除计步器
      clearInterval(this.data.durationIntval)
    }
  }
})