
Component({
  data: {
    visible: false,
    showEmpty: false,
    isWarpGoods: false,
  },
  properties: {},
  methods: {
    showContainer(params) {//{skuId,isWarpGoods}
      this.setData({
        visible: true,
        isWarpGoods:params.isWarpGoods
      })
      this.selectComponent("#product").getProduct({...params})
    },
    close() {
      this.setData({ visible: false })
      //清除定时器
      clearTimeout(this.data.backHome)
    },

    //暂无商品信息
    empty() {
      const backHome = setTimeout(() => this.setData({ visible: false }), 2000)
      this.setData({ backHome })
    },
    //网络错误
    error(e) {
      this.setData(e.detail)
    },
    //重新加载
    backHandler() {
      this.setData({ showEmpty: false })
      this.selectComponent("#product").getProduct(this.data.params)
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
