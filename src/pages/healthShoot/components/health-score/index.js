Component({
  properties: {
    scoreValue: {
      type: Number,
      value: 0,
      observer(value) {
        this.setData({ percentage: Math.round(value * 0.65) })
        const { healthColors, notHealthColors } = this.data
        if (value > 70) {
          this.setData({
            startColor: healthColors[0],
            endColor: healthColors[1],
            statusStrColor: '#F87624'
          })
        } else {
          this.setData({
            startColor: notHealthColors[0],
            endColor: notHealthColors[1],
            statusStrColor: notHealthColors[1]
          })
        }
      }
    },
    detectTime: {
      type: String,
      value: ''
    },
    exceedsPercent: {
      type: String,
      value: ''
    }
  },
  data: {
    healthColors: ['#FFE194', '#F87624'],
    notHealthColors: ['#FFE194', '#F87624'],
    startColor: ' #F87624',
    endColor: ' #F87624',
    statusStrColor: '',
    percentage: 0,
    dialogShow: false,
    buttons: [{
      text: '我知道了',
      extClass: 'only-two-btn'
    }],
  },
  externalClasses: ['warp-class'],
  options: {
    styleIsolation: 'apply-shared',
    // virtualHost:true,
    multipleSlots: true
  },
  methods: {
    handlePrompt() {
      this.setData({
        dialogShow: true
      })
    },
    handleConfirm() {
      this.setData({
        dialogShow: false
      })
    },
    touchMove() { }
  }
})
