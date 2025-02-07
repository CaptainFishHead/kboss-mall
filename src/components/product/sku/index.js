import { TOAST_TYPE } from "../../../const/index";
import { showToast } from "../../../components/toast/index";

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    skuList: {
      type: Array,
      value: []
    },
    skuId: { //购物车的 选中的规格id
      type: String,
      value: ''
    },
    spuId: { //购物车的 spuid
      type: String,
      value: ''
    },
    prodNum: { //购物车的 商品数量
      type: Number,
      value: ''
    },
    cartId: { //购物车的 主键ID
      type: String,
      value: ''
    },
    commission: { //分佣信息
      type: Object,
      value: {}
    }
  },
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },
  data: {
    visible: false,
    num: 1, //商品数量
    sku: {},
    submitType: '2', //点击按钮来源 1:立即购买 2:加购
    fromBtn: false, //底部按钮 规格点击（用来区分加购、立即购买，对应的不同按钮显示）
    fromCart: false, //购物车页面 规格点击
    isReal: false, //是否真实商品
  },
  methods: {
    setSku({ submitType, fromBtn, fromCart, isReal }) {
      const { skuList, skuId } = this.data
      if (skuId) {
        let obj = skuList.find(item => {
          return item.id === skuId
        })
        this.setData({
          sku: obj,
          num: obj.sinceMin
        })
      } else {
        this.setData({
          sku: skuList[0],
          num: skuList[0].sinceMin
        })
      }
      this.setData({
        fromBtn,
        fromCart,
        isReal,
        submitType,
        visible: true
      })
    },

    // 加减数量
    changeNum(e) {
      this.setData({ num: e.detail.productNum })
    },

    // 切换规格
    selectSku(e) {
      const sku = e.currentTarget.dataset.sku
      this.setData({ sku, num: sku.sinceMin })
      this.triggerEvent('select', { sku })
    },

    // 切换规格后 提交
    submit(e) {
      let submitType = e.currentTarget.dataset.submit
      const { sku, num, spuId, prodNum,cartId } = this.data
      if (!sku.id) return showToast({ title: '请选择规格', type: TOAST_TYPE.WARNING })
      this.setData({ visible: false })

      this.triggerEvent('submit', { sku, num, spuId, prodNum,cartId, submitType })
    },

    // 关闭半弹层 触发（领取优惠券弹窗）
    close() {
      this.triggerEvent('close')
    },

    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
