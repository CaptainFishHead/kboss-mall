
Component({
  data: {
    show: false,
    buttons: [{
      text: '我知道了',
      extClass: 'only-one-btn'
    }],
  },
  methods: {

    showDialog(memberInfo) {
      this.setData({
        memberInfo,
        show: true //显示
      })
    },
    tapDialogButton() {
      this.setData({ show: false }) //关闭
      this.triggerEvent('closed')
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
