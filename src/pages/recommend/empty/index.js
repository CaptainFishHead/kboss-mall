// pages/recommend/empty/index.js
import back from "../../../behaviors/back";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '', // 标题
  },
  behaviors:[back],
  onLoad(options){
    options.title && this.setData({title: options.title })
  },
  handBack(){
    const pages = getCurrentPages();
			if (pages.length <= 1) {
        wx.reLaunch({
          url: `/pages/index/index`
        })
      } else {
        wx.navigateBack();
      }
  },

})