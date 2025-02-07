import {PRODUCT_TYPE} from "../../../../const/index"
import order from "../../behaviors/order";
import {goodsAfterSaleList} from "../../../../models/afterSaleModel"


Component({
    behaviors: [order],
    data: {
        PRODUCT_TYPE,
        priceDescVisbale: false,
        orderItem: {},
        spuKind: 2 // 储存当前售后记录商品是组合品还是单品 售后记录标题使用
    },
    properties: {
        orderInfo: {
            type: Object,
            value: {}
        }
    },
    options: {
        styleIsolation: 'apply-shared'
    },
    methods: {
        //订单详情查看物流
        logistics(e) {
            wx.navigateTo({
                url: `/pages/order/logistics/index?orderId=${this.data.orderInfo.id}&productId=${e.target.id}`,
            })
        },
        //去商品详情
        productTo(e) {
            const {id,spuid} = e.currentTarget.dataset;
            const {orderCode} = this.data.orderInfo || {};
            wx.navigateTo({
                url: `/pages/product/index?spuId=${spuid}&skuId=${id}&page_id=${orderCode}`,
            })
        },
        // 弹出产品详情半弹窗
        showDetail({detail}){
          const {skuId} = detail || {};
          this.selectComponent("#detailComponents").showContainer({skuId,isWarpGoods:true});
        },
        //价格说明
        showPriceDesc(e) {
            const {item} = e.currentTarget.dataset || {};
            item.discountPrice = (item.sellPrice*100 - item.skuPromotionPrice*100)/100;
            this.setData({
                priceDescVisbale: true,
                orderItem: item
            })
        },
        // 售后记录
        showAfterSales({currentTarget}){
          const {ordercode, skuid, spukind} = currentTarget.dataset || {};
          goodsAfterSaleList({ orderCode: ordercode, skuId: skuid }).then(({result}) => {
            this.showAfterRecord({
              orderCode: ordercode,
              skuList: result || [],
              title: spukind === 1 ?  '礼包售后商品' : '售后商品'
            })
          })
        },
        // 关闭价格说明弹窗
        onDelSubmit(){
          this.setData({priceDescVisbale: false})
        },
        touchMove() {
          return // 解决蒙层下页面滚动问题
        }
    }
})
