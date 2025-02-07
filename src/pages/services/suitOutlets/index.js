import mapNav from '@behaviors/mapNav'
import { showToast, hideToast } from '@components/toast/index'
import { TOAST_TYPE } from '@const/index'

Page({
  data: {
    serviceId: '',
    spuId: ''
  },
  behaviors: [mapNav],
  onLoad(options) {
    showToast({ type: TOAST_TYPE.LOADING })
    this.setData({ serviceId: options.serviceId || '', spuId: options.spuId || '' }, () => {
      this.getLocation({})
    })
    hideToast()
  },
  onShow() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {}
})
