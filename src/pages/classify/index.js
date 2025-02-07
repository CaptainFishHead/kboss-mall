import classify from "../../behaviors/classify";

Page({
	behaviors: [classify],
  data: {
    tabbarHeight:0
  },
  /**
   * 滚动切换分类 cIds 怎么更新
   * */
  onLoad: function (options) {
    this.initPageHeight()
    this.setData({currentClassifyId: options.cid})
  }
})