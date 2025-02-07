Component({
  properties: {
    storeInfo: {
      type:Object,
      value:{}
    },
    goodsList:{
      type:Array,
      value:[]
    }
  },
  options:{
    styleIsolation: 'apply-shared'
  },
  data: {},
  methods: {
    //选择商品
    selectGoods(e) {
      let {storeindex, itemindex} = e.currentTarget.dataset;
      this.triggerEvent('bindselect', {storeindex, itemindex})
    },
    changeNum(e){
      const {productNum} = e.detail
      let {storeindex,itemindex} = e.currentTarget.dataset;
      this.triggerEvent('bindchangenum', {num:productNum,storeindex,itemindex})
    },
  }
});
