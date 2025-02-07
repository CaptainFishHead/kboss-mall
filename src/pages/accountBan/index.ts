// pages/accountBan/index.ts

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let sessionFrom = app.getContactInfo({title: '售后/退款'})
    this.setData({sessionFrom})
  }
})