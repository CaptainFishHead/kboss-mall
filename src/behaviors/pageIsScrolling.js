let scroll_timer = null
export default Behavior({
  data: {
    isScrolling: false
  },
  methods: {
    pageScrolling(e) {
      if (scroll_timer) {
        clearTimeout(scroll_timer)
        scroll_timer = null
      }
      if (!this.data.isScrolling) {
        this.setData({
          isScrolling: true
        })
      }
      const scrollTop = e.scrollTop || e.detail?.scrollTop
      const opacity = Math.min(scrollTop / 200, 1)
      wx.nextTick(() => {
        if (opacity !== this.data.opacity) {
          this.setData({
            opacity: Math.min(scrollTop / 200, 1)
          })
        }
      })

      scroll_timer = setTimeout(() => {
        this.setData({
          isScrolling: false,
          opacity: Math.min(scrollTop / 200, 1)
        })
      }, 300)


      //商品详情页所需参数______________________start
      if (e) {
        if (scrollTop > 88) { //导航
          this.setData({ show: true })
        } else {
          this.setData({ show: false })
        }
        if (scrollTop > 700) { //返回顶部按钮
          this.setData({ showTop: true })
        } else {
          this.setData({ showTop: false })
        }
      }
      //商品详情页所需参数______________________end

    },
  }
})