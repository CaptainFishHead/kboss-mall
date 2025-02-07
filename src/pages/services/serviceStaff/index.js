import { showToast } from '@components/toast/index'
import { TOAST_TYPE } from '@const/index'
const app = getApp()
Page({
  data: {
    // 店铺信息
    storeInfo: {},
    serviceAllAddr: '',
    splitPhone: '', //分割后的手机号
    customerServicePhone: '', //手机号
    businessHours: '09:00-21:30',
    //地址
    serviceAllAddr: '',
  },
  onLoad(options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('staff', data => {
      this.setData({ storeInfo: data })
      this.queryAgentInfo()
    })
  },
  onShow() {
    this.queryAgentInfo()
  },
  queryAgentInfo() {
    const { splitPhone, storeInfo } = this.data
    this.setData({
      serviceAllAddr: `${storeInfo.provinceName || ''}${storeInfo.cityName || ''}${storeInfo.countyName || ''}${storeInfo.agentStoreAddress || ''}`
    })
    if (storeInfo.wexinId) {
      this.setData({ splitPhone: this.splitPhone(storeInfo.customerServicePhone || '') })
    } else {
      this.setData({ splitPhone: this.splitPhone(storeInfo.agentMobile || '') })
    }
  },
  // 分割手机号
  splitPhone(phoneStr) {
    if (phoneStr.length !== 11) {
      return phoneStr
    } else {
      const arrPhone = phoneStr.split('')
      arrPhone.splice(3, 0, '-')
      arrPhone.splice(8, 0, '-')
      return arrPhone.join('')
    }
  },
  // 复制微信号
  copyWechart(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.wechart,
      success() {
        wx.showToast({
          title: '已成功复制',
          icon: 'none'
        })
      }
    })
  },
  // 拨打电话
  onStoreService() {
    const { customerServicePhone, agentMobile, wexinId } = this.data.storeInfo
    wx.makePhoneCall({
      phoneNumber: wexinId ? customerServicePhone : agentMobile
    })
  },
  // 复制地址
  copyAddress(e) {
    let address = e.currentTarget.dataset.addr
    wx.setClipboardData({
      data: address,
      success() {
        wx.showToast({
          title: '已成功复制',
          icon: 'none'
        })
      }
    })
  },
  // 长按识别二维码
  longPressQrcode() {
    wx.previewImage({
      current: this.data.storeInfo.weixinQr, // 当前显示图片的 http 链接
      urls: [] // 需要预览的图片 http 链接列表
    })
  }
})
