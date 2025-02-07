// pages/obh/buy/components/winningPopupv1/index.ts
import { getLotteryGif, LOTTERY_RESULT_CONGRATULATE, LOTTERY_RESULT_RAY, LOTTERY_RESULT_SINGULARITY } from '../../../../../utils/loadGif'


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lotteryResult: {
      type: Object,
      value: {}
    },
    
    lotteryCount: {
      type: Number,
      value: 0
    },

    shareTimes: {
      type: Number,
      value: 0
    },

    promptMsg: {
      type: String,
      value: '人品大爆发'
    },

  },


  lifetimes: {
    attached() {
      // getLotteryGif(LOTTERY_RESULT_RAY, (result) => {
      //   this.setData({ray: result})
      // })

      getLotteryGif(LOTTERY_RESULT_CONGRATULATE, (result) => {
        this.setData({congratulate: result})
      })

      getLotteryGif(LOTTERY_RESULT_SINGULARITY, (result) => {
        this.setData({singularity: result})
      })

      this.setData({
        showCongratulate: true,
        // showRay: true
      })
      setTimeout(()  => {
        this.setData({showRay: false})
      }, 4340)
      setTimeout(() => {
        this.setData({showCongratulate: false})
      }, 3500)
    },

    detached() {
      this.setData({
        showCongratulate: false,
        // showRay: false,
        congratulate: '', 
        // ray: '', 
        singularity: ''
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // ray: '',
    singularity: '',
    congratulate: '',
    showRay: false,
    showCongratulate: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
    closePopup() {
      this.triggerEvent('closePopup')
    },

    onPopupShare() {
      this.triggerEvent('onPopupShare')
    },

    gotoGift() {
      this.triggerEvent('gotoGift')
    }
  }
})