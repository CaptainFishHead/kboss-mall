// 直播取消页面
Component({
    properties: {
      // 错误类型 5 直播间挤爆了 6 直播间加载失败 7 直播间不存在
      errorType: {
        type: Number,
        value: 1
      }
    },
    lifetimes: {
      ready() {}
    },
    methods: {
      retry() {
        // 重新加载页面
        this.triggerEvent('reload-room')
      },
      back() {
        // 返回首页
        wx.switchTab({url: '/pages/index/index'})
      }
    }
  })
