Component({
  properties: {
    goodsList:{
      type:Array,
      value:[]
    },
    isReal:{
      type:Boolean,
      value:true
    },
    showMsg: {
      type:Boolean,
      value:true
    }
  },
  data: {},
  options: {
    styleIsolation: 'apply-shared'
  },
  methods: {
    onEditMessage({currentTarget, detail}) {
      const {storeid} = currentTarget.dataset;
      const {value} = detail;
      this.triggerEvent('oneditmessage', {storeId: storeid, userMessage: value})
    },
    // 弹出产品详情半弹窗
    showDetail({detail}){
      const {skuId} = detail || {};
      this.selectComponent("#detailComponents").showContainer({skuId,isWarpGoods:true});
    },
  }
})
