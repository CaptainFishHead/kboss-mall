import { htmlToWxml } from "@utils/index"
import { findPrizeDes } from "../../models/myPrize"
const app = getApp()

Page({
  data: {
    activeType: '1',
    content: '',
    details: '',
    illustrate: ''
  },
  onShow () {
    this.setData({activeType: this.options.tab})
    this.findPrizeDesFn()
  },
  tabChange(e) {
    this.setData({activeType: e.currentTarget.dataset.type})
    this.setContent()
  },
  findPrizeDesFn() {
    findPrizeDes({id: this.options.prizeId}).then(({result}) => {
      this.setData({details: htmlToWxml(result.details)})
      this.setData({illustrate: htmlToWxml(result.illustrate)})
      this.setContent()
    })
  },
  setContent() {
    if (this.data.activeType == 1) {
      this.setData({content: this.data.details})
    } else {
      this.setData({content: this.data.illustrate})
    }
  },
  //分享
  onShareAppMessage(res) {
		return app.globalData.shareInfo
  },
});
