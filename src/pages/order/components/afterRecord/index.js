// pages/order/components/afterRecord/index.ts

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    orderCode: '',
    title: '全部商品',
    visible: false,
    skus: [],
    totalNumber: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
       // 售后记录
       show({orderCode, skuList, title}){
        let total = 0;
        skuList.forEach(item => {
          item.total = item.skuList.reduce((total, val) => total += val.skuNum, 0);
          total += item.total; 
        });
        this.setData({
          orderCode,
          totalNumber: total || 0,
          skus: skuList || [],
          title,
          visible: true
        });
      },
      // 跳转售后详情
      goAfterDetail({currentTarget}){
        const {refundcode} = currentTarget.dataset || {};
        wx.navigateTo({
          url: `/pages/afterSale/detail/index?refundCode=${refundcode}&from=detail`,
        }).then(() => {
          this.setData({
            totalNumber: 0,
            skus: [],
            visible: false
          });
        })
      }
  }
})
