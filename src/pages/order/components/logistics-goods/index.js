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
       show({ skuList, title}){
        const totalNumber = skuList.reduce((total, item)  => (total += item.skuNum), 0);
        this.setData({
          totalNumber,
          skus: skuList || [],
          title,
          visible: true
        });
      }
  }
})
