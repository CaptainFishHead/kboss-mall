const app = getApp()

Page({
  data: {
    url: ''
  },
  onLoad(e) {
    wx.setNavigationBarColor({
      frontColor: e.dark ? '#ffffff' : '#000000',
      backgroundColor: e.dark ? '#000000' : '#ffffff'
    })
    if (e.title) {
      wx.setNavigationBarTitle({
        title: e.title
      })
    }
    this.setData({
      url: decodeURIComponent(e.url)
    })
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
})