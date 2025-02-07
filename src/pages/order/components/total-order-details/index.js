import {PRODUCT_TYPE, SDK_APPLET} from "../../../../const/index";
import {moneyFormat, pxToRpx} from "../../../../utils/index";

Component({
  data: {
    PRODUCT_TYPE,
    SDK_APPLET,
    maxHeight: 0,
    isShowMore: false,
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
  observers: {
    "orderInfo"() {
      const {buyCards} = this.data.orderInfo|| {}
      if (buyCards) {
        this.setData({
          maxHeight: buyCards.length >= 3 ? 174 : buyCards.length * pxToRpx(29)
        })
      }
      
    }
  },
  methods: {
    viewMore() {
      const isShowMore = this.data.isShowMore
      const _buyCards = this.data.orderInfo.buyCards || []
      if (!isShowMore) {
        // 获取元素的高度
        const query = this.createSelectorQuery();
        query.select('.gift-card-list-num').boundingClientRect(rect => {
          // 获取每一个数据
          this.setData({
            maxHeight: pxToRpx(29) * _buyCards.length,
            isShowMore: true
          })
        }).exec();
      } else {
        this.setData({
          maxHeight: _buyCards.length >= 3 ? 180 : _buyCards.length * pxToRpx(30),
          isShowMore: false
        })
      }
    }
  }
})
