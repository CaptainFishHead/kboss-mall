import { stringify } from "qs";
import { querySpuInfoRecommendList } from "../../../models/productModel";

Component({
  options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
  data: {
    page: 1,
    list: [],
    totalCount: 0,
    isBottom: false
  },
  properties: {
    product: {
      type: Object,
      value: {},
      observer(product) {
        if (product.id) {
          this.getList()
        }
			}
    },
    sku: {
			type: Object,
			value: {}
		},
  },
  methods: {
    getList () {
      if (this.data.isBottom) return
      querySpuInfoRecommendList({
        page: this.data.page,
        rows: 3,
        spuId: this.data.product.id
      }).then(res => {
        if (res.result.list.length < 3) {
          this.setData({isBottom: true})
        }
        this.setData({page: this.data.page + 1})
        this.setData({list: this.data.list.concat(res.result.list)})
        this.setData({totalCount: res.result.totalCount})
      })
    },
    toList() {
      wx.redirectTo({
        url: `/pages/recommend/index?page_name=${this.data.product.name}&page_id=${this.data.product.id}&spuId=${this.data.product.id}`
      })
    },
    toItem(e) {
      const { item } = e.currentTarget.dataset;
      const {name, id} = this.data.product || {};
      const params = {
        id: item.recommendId,
        curr_page_info: JSON.stringify({
          "page_name": name,
          "page_id": id,
          "page_source": '商品详情'
        })
      }
      if(item.type === 1) {
        wx.redirectTo({
          url: `/pages/recommend/graphicDetail/index?${stringify(params)}`
        })
      } else if (item.type === 2) {
        params.noRecommend = 1;
        wx.redirectTo({
          url: `/pages/recommend/videoDetail/index?${stringify(params)}`
        })
      }
    }
  }
});
