// plugin/components/live/notice/index.ts
let timers: number | null = null
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    desc: {
      type: String,
      value: '',
      observer(val) {
        this.setData({ noticeDesc: val });
        this.toggleNotice();
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showNotice: false,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 8s隐藏公告
    toggleNotice() {
      this.onShowNotice();
      if (timers) {
        clearTimeout(timers)
        timers = null
      }
      timers = setTimeout(() => {
        this.onHideNotice();
      }, 8000);
    },
    // 展示公告
    onShowNotice() {
      this.setData({ showNotice: true })
    },
    // 隐藏公告
    onHideNotice() {
      this.setData({ showNotice: false })
    }
  }
})
