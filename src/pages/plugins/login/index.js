Page({
	bindSuccess(e) {
		if (this.options.back === 'self') {
			wx.navigateBack()
		} else {
			wx.navigateBackMiniProgram({
				extraData: {
					mobile: e.detail.user.mobile
				},
				success(res) {
					// 返回成功
				}
			})
		}
	},
	bindFail(e) {
	},
	bindClose() {
  },
  handleBack(){
    if(this.options.back === 'self') {
      wx.navigateBack({delta:2})
      return false
    }
  }
})