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
    appId: 'wxcc3540ea25b97878',
    path: 'pages/index/index?source=HOTEL&targetId=aBgvYBURF6',
    id: '865306058837738'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  // 调用微信扫码
  gotoScan() {
    wx.scanCode({
      onlyFromCamera: false,
      success(res) {
        let result = res.result
        let id = ''
        if (result.indexOf("jd.yunshang520.com/dc/") != -1||result.indexOf("static.tojoyshop.com/website/dc/") != -1) {
          id = result.split("/dc/")[1] || ""
        }else if (result.indexOf("jd.yunshang520.com/dc2/") != -1||result.indexOf("static.tojoyshop.com/website/dc/") != -1) {
          id = result.split("/dc2/")[1] || ""
        }
        if (id && id.length > 0) {
          API_buy.checkShareDeviceExsits({
            'deviceId': id
          }).then(res => {
            //deviceType设备分类(1氧吧房设备2共享氧吧房)
            if (res && res.code == 200 && res.result && res.result.deviceType && res.result.deviceType == 2) {
              wx.navigateTo({url: `/pages/obh/buy/index?deviceId=${id}`})
            } else {
            }
          }).catch(err => {
          })
        }
      },
      fail() {
        wx.showToast({
          title: '扫码失败，请稍候再试。',
          icon: 'error'
        })
      }
    })
  },

  // 直接购买
  gotoBuy() {
    API_obh.getBuyUrl({id: this.data.id, type: 1}).then(res => {
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
    }).catch(err => {
      wx.showToast({
        title: '获取购买链接失败，请稍候再试。',
        icon: 'none'
      })
    })
  }
})