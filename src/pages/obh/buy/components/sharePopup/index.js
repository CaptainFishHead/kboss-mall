// pages/obh/promotion/components/sharePopup/index.ts
Component({
  properties: {
  },
  
  data: {
    visible: false,
    showPoster: false,
    enable: true
  },

  methods: {
    
    // 显示半弹窗
    shareBtn() {
      this.setData({ visible: true, showPoster: false, enable: true });
    },
    
    // 跳往生成海报
    onCreatePoster() {
      if (this.data.enable) {
        this.setData({enable: false})
        this.triggerEvent('createPoster')
      }
    },
    
    showPoster() {
      this.setData({ showPoster: true });
    },

    // 分享好友
    onShareFriend() {
      this.triggerEvent('shareFriend')
      this.setData({ visible: false });
    },

    closeShare() {
      this.triggerEvent('closeShare')
      this.setData({ visible: false })
    },

    onSavePoster() {
      this.triggerEvent('savePoster')
      this.setData({ visible: false })
    }
  },
})
