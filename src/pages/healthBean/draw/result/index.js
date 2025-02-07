import back from "../../../../behaviors/back";
// import { reqGainBeansInfo } from "../../../../models/gainBeansModel"
import { openPage } from "../../../../utils/index";
Page({
  data: {
    activityId: "",
    receiveState: "",
    gainBeansData: {},
  },
  behaviors: [back],

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad(options) {
    let gainBeansData = JSON.parse(decodeURIComponent(options.data))
    this.setData({
      activityId: gainBeansData.activityId,
      receiveState: gainBeansData.receiveState,
      gainBeansData
    })
  },
  // 跳转到指定页面 flag: 1调到指定页面 2: 查看康豆余额
  goHrefPage(e) {
    const { flag } = e.currentTarget.dataset
    if (flag === "1") {
      const { link } = this.data.gainBeansData || {}
      if (link?.href === "/pages/index/index") {//首页
        wx.reLaunch({ url: link.href })
      } else {//非首页  
        openPage.call(this, { link })
      }
    } else {
      wx.navigateTo({ url: `/pages/healthBean/index` })
    }
  }

})

