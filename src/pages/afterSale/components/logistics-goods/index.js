
Component({
  properties: {
    systemInfo: {
      type: Object,
      value: {}
    },
  },
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared',
  },
  data: {
    visbale: false,
    skuList: [],
  },
  methods: {
    //获取售后商品列表
    showGoodsList({skuList}) {
      this.setData({
        skuList: [...skuList],
        visbale: true
      })
    },
    close() {
      this.setData({visbale: false})
    },
  },
  touchMove() {
    return // 解决蒙层下页面滚动问题
  }
});
