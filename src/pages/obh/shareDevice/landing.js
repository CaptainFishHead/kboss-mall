import * as API_obh from '../models/obh.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-1.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-2.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-3.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-4.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-5.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-6.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-7.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-8.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-9.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-10.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-11.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-12.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-13.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-14.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-15.png',
      'http://pre-static.tojoyshop.com/images/obh/device_code/device-code-16.png'
    ],
    id: '',
    hasDeviceFlag: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({id: options.deviceId})
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    API_obh.getDeviceStatus({deviceId: this.data.id}).then(res => {
      if (res.code == 200) {
        this.setData({hasDeviceFlag: res.result.hasDeviceFlag})
      }
    }).catch(err => {
    })
  },
  
  // 我想体验
  gotoBuyService() {
    wx.navigateTo({
      url: `/pages/obh/buy/index?deviceId=${this.data.id}`
    })
  },

  // 跳转康老板首页
  gotoHome() {
    API_obh.getBuyUrl({id: this.data.id, type: 1}).then(res => {
      if (res.code == 200) {
        if(res.result&&res.result.appletPath){
          let isTab=res.result.appletPath.indexOf('pages/index/index')!==-1||res.result.appletPath.indexOf('pages/column/index')!==-1||res.result.appletPath.indexOf('pages/mine/index')!==-1||res.result.appletPath.indexOf('pages/mall/index')!==-1
          if(isTab){
            wx.switchTab({
              url: `/${res.result.appletPath}`,
            })
          }else{
            wx.navigateTo({
              url: `/${res.result.appletPath}`,
            })
          }
        }
      } else {
        wx.showToast({
          title: res.msg ? res.msg : '获取购买链接失败，请稍候再试。',
          icon: 'none'
        })
      }
    }).catch(res => {
      wx.showToast({
        title: res.msg ||'获取购买链接失败，请稍候再试。',
        icon: 'none'
      })
    })
  },

  // 直接购买
  gotoBuy() {
    API_obh.getBuyUrl({id: this.data.id, type: 1}).then(res => {
      if (res.code == 200) {
        if(res.result&&res.result.appletPath){
          let isTab=res.result.appletPath.indexOf('pages/index/index')!==-1||res.result.appletPath.indexOf('pages/column/index')!==-1||res.result.appletPath.indexOf('pages/mine/index')!==-1||res.result.appletPath.indexOf('pages/mall/index')!==-1
          if(isTab){
            wx.switchTab({
              url: `/${res.result.appletPath}`,
            })
          }else{
            wx.navigateTo({
              url: `/${res.result.appletPath}`,
            })
          }
        }
      } else {
        wx.showToast({
          title: res.msg ? res.msg : '获取购买链接失败，请稍候再试。',
          icon: 'none'
        })
      }
    }).catch(res=> {
      wx.showToast({
        title: res.msg ||'获取购买链接失败，请稍候再试。',
        icon: 'none'
      })
    })
  }
})