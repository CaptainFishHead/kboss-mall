// import { IRoomProduct } from "../../../../../models/types/live"

// 直播购物袋中的商品
Component({
    properties: {
      goods: {
        type: Object,
        value: {
          spuName: '善维美SOD天然善维美SOD天然活力粉善维美SOD天然活力粉善维美SOD天然活力粉善维美SOD天然活力粉善维美SOD天然活力粉善维美SOD天然活力粉活力粉',
          skuPrice: '2,100',
          isExplain: 0, // 是否讲解 0 否1是
          isTop: 0, // 是否置顶 0否1是
          stockNum: 0, // 库存
          serialNo: 0, // 排序
          spuId: '',
          skuId: '',
          spuImgUrl: 'https://file.yunshang520.com/goods/202206/2e6018b3e70844dd9832c8e8f0b793ff.jpeg'
        }
      },
      goodsMap: {
        type: Object,
        value: {},
        observer: function (newVal: any) {
          this.setData({dataMap: Object.assign({}, this.data.dataMap, newVal)});
        }
      },
      btnText: {
        type: String,
        value: '去购买'
      }
    },

    data: {
      dataMap: {
        name: "spuName",
        isExplain: "isExplain",
        isTop: "isTop",
        serialNo: "serialNo",
        price: "skuPrice",
        stockNum: "stockNum",
        spuId: "spuId",
        skuId: "skuId",
        img: "spuImgUrl"
      },
      viewed: <string[]>[]
    },
    lifetimes: {
      ready() {
        this.triggerEvent('createGoodsObserver', this.data.goods)
      }
    },
    methods: {
      btnHandler(/*e: { detail: IRoomProduct}*/) {
        this.triggerEvent('go-buy', {
          payload: { ...this.data.goods }, key:'sku', next:true
        })
      }
    }
  })
