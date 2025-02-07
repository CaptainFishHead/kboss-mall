import {
  ORDER_SOURCE_PAGE,
  TOAST_TYPE,
  SOURCE,
  STORAGE_USER_FOR_KEY,
  RECEIVER_ADDRESS
} from "../../const/index";
import { showToast } from "../../components/toast/index";
import tripartite from "./behaviors/tripartite";
import product from "./behaviors/product";
import { track, TrackEventName } from "@utils/sa";
import pageIsScrolling from "../../behaviors/pageIsScrolling";
import { setWechatMoments } from "@utils/wxUtils";
import { isLogged } from "@utils/index";
import { getStoreList } from "@models/servicesModel";

const app = getApp()
Page({
  behaviors: [tripartite, product,pageIsScrolling],
  data:{
    isScrolling:false,
    isLogged:false,
    storeList:[]
  },
  onLoad(options) {
    console.log('产品详情',options);
    const latelyAddress = wx.getStorageSync(RECEIVER_ADDRESS)
    if (latelyAddress) {
     wx.removeStorageSync(RECEIVER_ADDRESS)
    }
    if (!isLogged()) {
      this.setData({ isLogged: false })
    } else {
      this.setData({ isLogged: true })
    }
    if(options.v2_code) return setWechatMoments(options);  // 从朋友圈进入时调用
    this.initializeProductQueryParameters(options)
      .then(product => {
        this.setData({
          pointParamsBase: {
            ...this.data.pointParamsBase,
            commodity_detail_souce: product.targetId || '康老板',
            page_id: options.page_id || options.pageId || product.targetId,
            page_name: decodeURIComponent(options.page_name || options.pageName || product.pageName),
            spu_id: product.id,
            sku_id: product.skuId
          },
          fromHelpBoss: product.source === SOURCE.CODE_XIAO_BAO //是否来自老板帮
        })
        if (!product.id && !product.spuId && !product.skuId) {
          showToast({ title: '商品不存在' })
          setTimeout(() => {
            this.goBack()
          }, 2000)
          return null
        }
        this.selectComponent("#product").getProduct(product) //获取商品详情
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
     * @param skuList: Array []
     * @param sku: Object {}
     * @param isReal: Boolean true/false
     * @param pointParamsBase: Object {}
     * @param pointParamsSubmit: Object {}
     * @param isRefresh: Boolean true/false, 是否重新加载详情
     * @param action: String, 进入详情页后触发的动作
     */
    let { product, sku,subSkuDtoList, isRefresh, action } = e.detail
    //判断库存 -如果是组合品额外要判断子品库存/下架
    const isChildGoodsDisabled = subSkuDtoList.find(item=>{
      return item.stockNums <= 0||item.stockNums<item.skuCount||item.isShelf===0
    })
    //判断单品所有sku的库存是否不足
    const _skuList = product.skuList||[]
    const isAllSkuDisabled = _skuList.every(item=>{
      return item.stockNums <= 0||item.stockNums<item.sinceMin
    })
    if (isAllSkuDisabled||isChildGoodsDisabled) {
      product = { ...product, disabled: true }
    }
    if (this.data.product.id !== product.id ) {
      // console.log('正在浏览商品')
      // 正在浏览商品 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
      const { position } = this.options;
      if (position === 'live') {
        wx.$tls && wx.$tls.viewGoods({ name: product.name, spuId: product.id, skuId: sku.id })
      }
    }
    this.setData({ ...e.detail, product, sku })
    if (isRefresh) {
      this.afterReadyInit() //获取详情后 初始化信息
    }
    if (action === 'sku') {
      const e = { currentTarget: { dataset: { submitType: 0, fromBtn: false } } }
      this.showSku(e)
    }
     //根据状态来 获取门店信息 chargeOffType === 5 线下 4 线上
     if(product.virtualData.chargeOffType && product.virtualData.chargeOffType === 5 ){
       let params = {
        latitude : app.globalData.userLocation.latitude,// 纬度，浮点数
        longitude : app.globalData.userLocation.longitude,// 经度，浮点数
        spuId: product.id
       }
      getStoreList(params).then(({result}) =>{
        this.setData({storeList: result}) 
      }).catch((err) => {
        console.log(err)
      })
     }
  },

  //登录成功后 选择规格
  showSku(e) {
    //todo 库存不足 toast 提示
    const { submit: submitType, frombtn: fromBtn,stocknums } = e.currentTarget.dataset
    if (stocknums){
      showToast({
        title: '抱歉，商品库存不足咯~',
        type: TOAST_TYPE.WARNING,
        duration: 2000
      })
      return
    }
    const { isReal } = this.data
    this.selectComponent("#skuComponents").setSku({ submitType, fromBtn, isReal })
  },

  //选择规格 切换规格
  selectType(e) {
    const { sku } = e.detail
    const { product } = this.data

    this.setData({ sku })
  },
  //选择成功后 后续操作
  selectTypeSubmit(e) {
    const { sku, num: productNum, submitType } = e.detail
    this.setData({ sku })
    this.submitConfirm({ sku, productNum }, submitType) //提交
  },
  //关闭规格半弹层后
  closeToShowCoupon(e) {
    const { product, sku } = this.data
    this.selectComponent("#dialogCouponComp").getDialogCouponList({spuId: product.id, skuId: sku.id, isInit: true}) //显示领取优惠券弹窗
  },

  /**
   * 提交 相关操作
   * @param {*} params : object :{ sku,productNum, selectSku }
   * @param {*} submitType : string 立即购买 1，加购 2
   * @param {*} isHasCoupon : string 优惠券购买 1，无优惠券购买 0
   */
  submitConfirm({ sku, productNum }, submitType) {
    const { product } = this.data
    this.setData({
      pointParamsBase: {
        ...this.data.pointParamsBase,
        sku_id: sku.id,
        // commodity_id: sku.code,
        sku_price: sku.sellPrice
      },
      pointParamsSubmit: {
        ...this.data.pointParamsSubmit,
        commodity_specification: sku.ruleVal && sku.natureVal && (sku.ruleVal + ' ' + sku.natureVal),
        commodity_quantity: productNum
      }
    })
    if (sku.stockNums < productNum) {
      showToast({
        title: '抱歉，商品库存不足咯~',
        type: TOAST_TYPE.ERROR
      })
      return
    }
    if (submitType === '1') {
      // 埋点（立即购买）
      track(TrackEventName.Boss_BuyNow, { ...this.data.pointParamsBase, ...this.data.pointParamsSubmit })
      //立即购买
      this.buyNow({
        skuList: [{skuId: sku.id, skuNum: productNum}],
        extra: { ...this.data.additionalParams },
        type: ORDER_SOURCE_PAGE.PRODUCT
      })
      // 正在购买商品 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
      // pluginBuying({name:product.name,spuId:product.id,skuId:sku.id})
      const { position } = this.options;
      if (position === 'live' && wx.$tls) {
        wx.$tls.buying({name:product.name,spuId:product.id,skuId:sku.id})
      }
    } else {
      // 埋点（加购）
      track(TrackEventName.Boss_AddCart, { ...this.data.pointParamsBase, ...this.data.pointParamsSubmit, addtime: Date.now() })
      //加入购物车
      this.addToShoppingCart([{ skuId: sku.id, skuNum: productNum}],this.data.additionalParams)
      // 正在添加购物车 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
      // pluginAddCartGoods({name:product.name,spuId:product.id,skuId:sku.id})
      const { position } = this.options;
      if (position === 'live' && wx.$tls) {
        wx.$tls.addCartGoods({name:product.name,spuId:product.id,skuId:sku.id})
      }
    }
  },
  // 分享好友
  shareFriend(){
    const {product, sku} = this.data || {};
    track(TrackEventName.Boss_Share, {
      spu_id: product.id,
      sku_id: sku.id,
      product_type: product.spuKind === 1 ? '组合品' : '单品',
      commodity_id: product.code,
      commodity_name: product.name
    })
  },
  /**
   * _______________商品详情相关操作_______________end_______________
   */
});