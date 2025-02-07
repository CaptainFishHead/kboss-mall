Component({
  properties: {
    detailList: {
      type: Array,
      value: [],
    },
  },
  data: {
    detailListImg: {
      '心率': "https://static.tojoyshop.com/images/wxapp-boss/healthai/heartrate.png",
      '呼吸': "https://static.tojoyshop.com/images/wxapp-boss/healthai/breathe.png",
      '血氧饱和度': "https://static.tojoyshop.com/images/wxapp-boss/healthai/saturability.png",
      '收缩压': "https://static.tojoyshop.com/images/wxapp-boss/healthai/shrink.png",
      '舒张压': "https://static.tojoyshop.com/images/wxapp-boss/healthai/shrink.png",
    }
  },
  methods: {
    handleToDetails(e) {
      let indexId = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/healthArchives/bmi/index?indexId=${indexId}`
      });
    }
  },
});