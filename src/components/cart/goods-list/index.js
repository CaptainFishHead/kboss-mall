import {deleteCar} from "@models/newCartModel";
import {showToast} from "../../toast/index";
import {TOAST_TYPE} from "../../../const/index";

Component({
  properties: {
    goodsList: {
      type: Array,
      value: []
    },
    invalidList: {
      type: Array,
      value: []
    },
  },
  data: {
    delGoodsVisible: false, // 删除确认弹窗是否展示
    cartId: [],
    delSkuId: '',//要删除的skuId
    triggered: false, // 下拉刷新
    refreshText: '下拉刷新'
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  methods: {
    /**删除产品*/
    delGoodsHandle: function ({currentTarget}) {
      const {skuid, cartid} = currentTarget.dataset
      this.setData({delGoodsVisible: true, delSkuId: skuid, cartId: cartid});
    },
    /** 关闭确认删除弹窗*/
    onCloseDelDialog() {
      this.setData({delGoodsVisible: false, delSkuId: '', cartId: ''});
    },
    /** 删除商品*/
    onDelSubmit() {
      const {cartId} = this.data;
      deleteCar({cartId}).then(() => {
        this.setData({delGoodsVisible: false});
        showToast({
          title: '删除成功!',
          type: TOAST_TYPE.SUCCESS
        })
        this.triggerEvent('delgoods', {delSkuId: this.data.delSkuId})
      })
    },
    //加减产品数量
    changeNum: function ({detail}) {
      const {productNum, skuId} = detail
      this.triggerEvent('changenum', {skuNum: productNum, skuId: skuId})
    },
    //选择/取消商品
    checkeChange: function ({currentTarget}) {
      const {checked, skuid} = currentTarget.dataset;
      this.triggerEvent('selectgoods', {checked, skuid})
    },
    //去商品详情
    toProdInfo: function ({currentTarget}) {
      const {skuid,spuid} = currentTarget.dataset
      wx.navigateTo({
        url: `/pages/product/index?spuId=${spuid||''}&skuId=${skuid}`
      })
    },
    //show 规格
    showSku({currentTarget}) {
      let {skuid, spuid, skunum, cartid, spukind} = currentTarget.dataset
      if (spukind !== '1') {
        this.triggerEvent('showskuinfo', {skuid, spuid, skunum, cartid})
      }
    },
    //show 组合子品信息
    showSubComInfo({detail}) {
      let {skuId} = detail
      this.triggerEvent('showcomsubinfo', {skuId})
    },
    // 下拉 但是没松手！！！
    onPulling() {
      // console.log('自定义下拉刷新被触发');
    },
    // 回弹复位
    onRestore(event, ownerInstance) {
      // console.log('onRestore 自定义下拉刷新被复位');
      this.setData({
        triggered: false,
        refreshText: '下拉刷新'
      })
    },
    // 被中止
    onAbort() {
      // console.log('onAbort 自定义下拉刷新被中止');
    },
    // 下拉 松手了！！！
    onRefresh() {
      // console.log('onRefresh 下拉松手 请求数据')
      this.setData({
        triggered: true,
        refreshText: '正在加载'
      }, () => {
        setTimeout(() => {
          this.triggerEvent('updatecartlist')
        }, 500)
      })
    },
  }
})
