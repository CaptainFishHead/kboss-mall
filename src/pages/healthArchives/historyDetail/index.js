import { queryHistoryDetails } from "@models/healthInfo";
Page({
  data: {
    dataList: [],
  },

  onLoad(options) {
    this.queryDetails(options.id);
  },
  queryDetails(id) {
    queryHistoryDetails({ str: id }).then(({ result }) => {
      const { list = [] } = result
      list.forEach((item, index) => {
        const length = item.url.length
        item.pdf = item.url.slice(length - 3, length).toLowerCase() === 'pdf'
      })
      this.setData({
        dataList: result.list || [],
      });
    });
  },
  // 查看详情
  showPdf(e) {
    const { item } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/webview/index?title=${item.name}&url=${item.url}`
    })
  }
});
