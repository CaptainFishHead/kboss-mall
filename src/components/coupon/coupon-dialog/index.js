import {wxFuncToPromise} from "../../../utils/wxUtils";

Component({
  data: {
    show: false,
    couponItem:{}
  },
  methods: {
    showReceiveCouponDialog(couponItem) {
      this.setData({
        couponItem,
        show: true //显示
      })
    },
    close() {
      this.setData({ show: false }) //关闭
      this.triggerEvent('closed')
    },
    /**立即使用-去商品详情*/
    toProductInfo(){
      wxFuncToPromise(`navigateTo`, {
        url: `/pages/product/index?spuId=${this.data.couponItem.spuId||''}`,
      }).then((res) => {
        this.setData({ show: false })
        this.triggerEvent('closed')
      })
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
