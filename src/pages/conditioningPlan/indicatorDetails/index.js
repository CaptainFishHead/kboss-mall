Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [
      {
        title: '健康指导建议',
        dec: ''
      },
      {
        title: '复诊建议',
        dec: ''
      }
    ],
    quotaInfo: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const { list } = this.data
    let that = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('reportResult', data => {
      const {healthProblemsItem} = data || {};
      list[0].dec = healthProblemsItem.indexHealthAdvice
      list[1].dec = healthProblemsItem.indexSubsequentVisitAdvice
      this.setData({ quotaInfo: healthProblemsItem, list })
    })
    
    
  }
})