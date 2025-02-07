// pages/envConfig/index.js
import {
  STORAGE_HONG_CU_BAO_KEY,
  STORAGE_USER_FOR_KEY
} from "../../const/index";
import { isLogged } from "@utils/index";
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMoblieLogin: false,
    isLogged: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      isMoblieLogin: app.globalData.isMoblieLogin,
      isLogged: isLogged()
    })
  },
  clearData() {
    wx.setStorageSync(STORAGE_USER_FOR_KEY, null)
    wx.setStorageSync(STORAGE_HONG_CU_BAO_KEY, null)
    wx.showToast({title: '清除成功', icon: 'none'})
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/mine/index',
      })
    }, 2000)
  },
  copyToken() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    wx.setClipboardData({data: user.token})
  },
  onChangeSwitch(detail) {
    app.globalData.isMoblieLogin = detail.detail.value
  },
  goUserCenter() {
    wx.switchTab({url: '/pages/mine/index'})
  },
})