Component({
  properties: {
    // 显示描述
    showDesc: {
      type: Boolean,
      value: false
    },
    // 显示销量
    showSales: {
      type: Boolean,
      value: false
    },
    // 显示价格
    showPrice: {
      type: Boolean,
      value: true
    },
    // 产品展示方向，值直接使用flex-direction对应对的可选值
    direction: {
      type: String,
      value: 'column'
    },
    // 商品信息和价格间排版
    bodyDirection: {
      type: String,
      value: 'column'
    },
    bodyHeight: {
      type: String,
      value: '100%'
    },
    bodyTextAlign: {
      type: String,
      value: 'center'
    },
    // 价格和销量排版
    extDirection: {
      type: String,
      value: 'column'
    },
    extJustifyContent: {
      type: String,
      value: 'start'
    },
    priceTextAlign: {
      type: String,
      value: 'center'
    },
    priceFontSize: {
      type: String,
      value: '30rpx'
    },
    productPadding: {
      type: String,
      value: '0'
    },
    productMargin: {
      type: String,
      value: '0'
    },
    productHeight: {
      type: String,
      value: '0'
    },
    productBoxShadow: {
      type: String,
      value: 'none'
    },
    productBgColor: {
      type: String,
      value: '#FFFFFF'
    },
    productBorder: {
      type: String,
      value: 'none'
    },
    productCoverWidth: {
      type: String,
      value: '182rpx'
    },
    productCoverHeight: {
      type: String,
      value: '182rpx'
    },
    productBaseSize: {
      type: String,
      value: '24rpx'
    },
    productNameColor: {
      type: String,
      value: '#0D0E15'
    },
    productBorderRadius: {
      type: String,
      value: '0'
    },
    productNameMargin: {
      type: String,
      value: '0'
    },
    productNameHeight: {
      type: String,
      value: '0'
    },
    productNameSize: {
      type: String,
      value: '28rpx'
    },
    productDescColor: {
      type: String,
      value: '#C5975F'
    },
    productDescSize: {
      type: String,
      value: '26rpx'
    },
    productCoverFlex: {
      type: String,
      // 对应flex item
      value: '1 0 auto'
    },
    /** 商品信息*/
    sellPrice: {
      type: String,
      value: ''
    },
    prodItem: {
      type: Object,
      value: {}
    },
    prentChecked: {
      type: Object,
      value: {}
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {},
  methods: {
    clickEventHandler(e) {
      const { item } = e.currentTarget.dataset;
      const {currId, currName} = this.data.prentChecked || {};
      wx.navigateTo({
         url:`/pages/product/index?spuId=${item.spuId}&skuId=${item.skuId}&pageId=${currId}&pageName=${currName}`,
      })
    }
  }
});
