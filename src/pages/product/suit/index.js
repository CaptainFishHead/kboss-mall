import { ORDER_SOURCE_PAGE, TOAST_TYPE } from "../../../const/index";
import { showToast } from "../../../components/toast/index";
import tripartite from "./../behaviors/tripartite";
import product from "./../behaviors/product";
import { isLogged, moneyFormat } from '../../../utils/index'
import { track, TrackEventName } from "../../../utils/sa";
import pageIsScrolling from "../../../behaviors/pageIsScrolling";
import { setWechatMoments } from "../../../utils/wxUtils";

Page({
  behaviors: [tripartite, product,pageIsScrolling],
  data: {
    isSuit: true,
    deleteGoodsDialogVis: false,
    subSkuDtoList: [],
    actionButtons: [{text: '去逛逛'}],
  },
  onLoad(options) {
    console.log('随心配', options)
    if(options.v2_code) return setWechatMoments(options);  // 从朋友圈进入时调用
    this.initializeProductQueryParameters(options)
      .then(product => {
        this.setData({
          pointParamsBase: {
            ...this.data.pointParamsBase,
            commodity_detail_souce: product.targetId || '康老板',
            page_name: decodeURIComponent(product.pageName),
            spu_id: product.id,
            sku_id: product.skuId,
            product_type: '随心配'
          }
        })
        if (!product.id && !product.skuId) {
          showToast({ title: '商品不存在' })
          setTimeout(() => {
            this.goBack()
          }, 2000)
          return null
        }
        this.selectComponent("#product").getSuit(product) //获取随心配详情
      })
  },
  onShow() {
    this.setData({
      pointParamsDetail: { ...this.data.pointParamsDetail, starttime: Date.now() }
    })
    if (isLogged()) {
      // 初始化用户相关数据
      this.initData()
    }
  },
  onPageScroll(e) {
    this.pageScrolling(e)
  },

  /**
   * _______________商品详情相关操作_______________start_______________
   */
  //获取商品详情
  getProductDetail(e) {
    /**
     * 返回参数 e.detail
     * @param product: Object {}
     * @param subSkuDtoList: Array []
     * @param productImages: Array []
     * @param pointParamsBase: Object {}
     */
    this.setData(e.detail)
    this.calcHandle() //计算总价格
    this.afterReadyInit() //获取详情后 初始化信息
  },

  //替换商品成功后
  replaceProductSuccess(e) {
    const { spu, index } = e.detail
    const { subSkuDtoList } = this.data
    spu.checked = false //初始化选中状态

    const newSpu = { ...subSkuDtoList[index], ...spu }
    subSkuDtoList.splice(index, 1, newSpu)

    this.setData({ subSkuDtoList })
    this.calcHandle() //计算总价格

    showToast({
      title: '商品组合发生变更',
      desc: '价格同步变化',
      type: TOAST_TYPE.WARNING
    })
  },
  //登录成功后 选择商品
  showSku(e) {
    const { submit: submitType, frombtn: fromBtn } = e.currentTarget.dataset
    const { subSkuDtoList } = this.data
    const ids = subSkuDtoList.map(e => e.subProductId)
    const params = {
      productIdList: ids,
      submitType,
      fromBtn
    }
    this.selectComponent("#suitComponents").getChooseList(params)
  },
  //选择成功后 后续操作
  selectProductSuccess(e) {
    const { selectSkus, totalPriceSubmit, submitType } = e.detail
    this.submitConfirm({ selectSkus, totalPriceSubmit }, submitType) //提交
  },
  /**
   * 提交 相关操作
   * @param {*} params : object :{ selectSku, totalPriceSubmit }
   * @param {*} submitType : string 立即购买 1，加购 2
   */
  submitConfirm({ selectSkus, totalPriceSubmit }, submitType) {
    this.setData({
      pointParamsBase: {
        ...this.data.pointParamsBase,
        sku_price: totalPriceSubmit
      }
    })
    const paramsArr = selectSkus.map(sku => ({
      skuId: sku.skuId,
      skuNum: sku.num,
    }))
    if (submitType === '1') {
      // 埋点（立即购买）
      track(TrackEventName.Boss_BuyNow, { ...this.data.pointParamsBase, ...this.data.pointParamsSubmit })
      //立即购买
      this.buyNow({
        skuList: paramsArr,
        extra: { ...this.data.additionalParams },
        type: ORDER_SOURCE_PAGE.SUIT
      })
    } else {
      // 埋点（加购）
      track(TrackEventName.Boss_AddCart, { ...this.data.pointParamsBase, ...this.data.pointParamsSubmit, addtime: Date.now() })
      //加入购物车
      this.addToShoppingCart(paramsArr)
    }
  },

  // 计算总价格
  calcHandle() {
    let totalPrice = 0
    const { subSkuDtoList } = this.data
    subSkuDtoList.forEach(item => {
      if (item.isShelf) {
        totalPrice = Number((totalPrice * 100 + item.sellPrice * 100) / 100).toFixed(2)
      }
    })
    this.setData({
      totalPrice: moneyFormat(totalPrice)
    })
  },
 // 分享好友
  shareFriend(){
    const {product, sku} = this.data || {};
    track(TrackEventName.Boss_Share, {
      spu_id: product.id,
      sku_id: sku.id,
      product_type: '随心配',
      commodity_id: product.code,
      commodity_name: product.name
    })
  }
  /**
   * _______________商品详情相关操作_______________end_______________
   */
});