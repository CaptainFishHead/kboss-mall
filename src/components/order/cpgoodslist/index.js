Component({
  properties: {
    list: { //商品集合
      type: Array,
      value: []
    },
    showArrow: {
      type: Boolean,
      value: false
    }
  },
  data: {
    isShowMore: false
  },
  methods: {
    //显示详情弹层
    showProInfo(e) {
      if (this.data.showArrow) {
        const {skuid:skuId} = e.currentTarget.dataset
        this.triggerEvent('showinfo', {skuId})
      }
    },
    viewMore() {
      this.setData({
        isShowMore: !this.data.isShowMore
      })
    }
  }
})
