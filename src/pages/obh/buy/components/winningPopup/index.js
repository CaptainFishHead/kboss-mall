// pages/obh/promotion/components/winningPopup/index.ts
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

    // promptMsg: {
    //   type: String,
    //   value: '人品大爆发'
    // },
    
    noWinningMsg: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

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
