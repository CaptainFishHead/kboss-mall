import { TOAST_TYPE } from "../../../const/index";
import { hideToast, showToast } from "../../../components/toast/index";
import { operateTypeMap } from "../../../const/index"

Page({
  data: {
    dataDetail: {},
    operateTypeMap
  },
  onLoad() {
    // 页面传递参数
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('pageData', ({ dataDetail }) => {
      this.setData({ dataDetail })
    })
  },

  //复制
  copy(e) {
    const { text } = e.target.dataset
    wx.setClipboardData({
      data: text,
      success() {
        wx.hideToast()
        showToast({
          title: '复制成功',
          type: TOAST_TYPE.SUCCESS
        })
      }
    })
  },

})