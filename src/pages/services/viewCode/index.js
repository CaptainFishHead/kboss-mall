import { createQrCode, getServiceDetail } from '@models/servicesModel'
Page({
  data: {
    serviceId: '',
    codeInfo: {},
    base64ImgUrl: '',
    spaced: ''
  },

  onLoad(options) {
    this.handleCode(options.serviceId)
  },

  // 处理数据 （每4个字符加一个字符）
  insertSpaces(str, interval) {
    if (!str || str.length === 0) {
      return str
    }
    let result = ''
    for (let i = 0; i < str.length; i += interval) {
      result += str.substring(i, i + interval) + (i < str.length - interval ? ' ' : '')
    }
    return result
  },

  handleCode(serviceId) {
    getServiceDetail({ serviceId }).then(({ result }) => {
      let spacedString = this.insertSpaces(result.chargeOffCode, 4) || ''
      this.setData({ codeInfo: result, spaced: spacedString })
      this.handleQrCode(result.jumpUrl)
    })
  },

  handleQrCode(url) {
    createQrCode(url).then(res => {
      let base64Data = res.result
      this.setData({ base64ImgUrl: base64Data })
    })
  },

  // 复制
  copyCode(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.wechart,
      success() {
        wx.showToast({
          title: '已成功复制',
          icon: 'none'
        })
      }
    })
  }
})
