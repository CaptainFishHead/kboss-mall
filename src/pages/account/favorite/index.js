import { favoriteProductList } from "../../../models/productModel";
import { findCarCount } from "../../../models/newCartModel";
import { PRODUCT_TYPE, TOAST_TYPE, SUBJECT_TYPE } from "../../../const/index";
import { hideToast, showToast } from "../../../components/toast/index";
import { track, TrackEventName } from "../../../utils/sa";
import back from "../../../behaviors/back";

const app = getApp()

Page({
  data: {
    isLoading: false,
    pageIndex: 1,
    favoriteNum: 0,
    favoriteList: [],
    show: true,
    product: {},
    sku: {},
    //埋点参数（浏览心愿单）
    pointParamsDetail: {
      starttime: undefined,	//访问时间
      endtime: undefined,	//退出时间
    }
  },
  behaviors:[back],
  onLoad() {
    this.getFavoriteList() //获取收藏列表
  },
  onShow() {
    this.start = false;
    this.setData({ pointParamsDetail: { ...this.data.pointParamsDetail, starttime: Date.now() } })

    this.getCartNum() //获取购物车数量
  },

  //获取心愿单列表
  getFavoriteList() {
    this.setData({ isLoading: true })
    showToast({ type: TOAST_TYPE.LOADING })
    favoriteProductList({
      favoriteType: 1,
      // subjectType: 1
    })
      .then(res => {
        const list = res.rows || []
        this.compileToFavoriteList(list)
        this.setData({
          favoriteList: list,
          favoriteNum: res.total
        })
      })
      .finally(() => {
        this.setData({ isLoading: false })
        hideToast()
      })
  },

  //加载更多
  onReachBottom() {
    this.setData({
      isHideLoadMore: true,
      pageIndex: this.data.pageIndex + 1
    })
    const params = {
      page: this.data.pageIndex,
      favoriteType: 1,
      // subjectType: 1
    }
    this.setData({ isLoading: true })
    favoriteProductList(params)
      .then(res => {
        const list = res.rows || []
        this.compileToFavoriteList(list)
        this.setData({ favoriteList: [...this.data.favoriteList, ...list] })
      })
      .catch((err) => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
      .finally(() => {
        this.setData({
          isHideLoadMore: false,
        })
      })
  },
  //重定义favoriteList
  compileToFavoriteList(list) {
    list.forEach(item => {
      if (item.productInfoVo) {
        item.productInfoVo.isReal = (item.productInfoVo.attribute === PRODUCT_TYPE.REAL)
        item.productInfoVo.isFavorite = 1
      }
    })
    return list
  },

  //加购弹窗 选择规格
  addCart(e) {
    const { id } = e.currentTarget.dataset
    this.selectComponent("#addCartBtn").addCartBtn({ id })
  },
  //加购弹窗 获取商品详情
  getDetail(e) {
    const { product, sku } = e.detail
    this.setData({ product, sku })
  },
  //加购弹窗 获取小球位置
  getBallPosition(e) {
    const { top, left, ballDisplay } = e.detail
    this.setData({ top, left, ballDisplay })
  },
  //加购成功
  addCartSuccess() {
    setTimeout(() => {
      this.getCartNum() //配合动画到车里时，获取购物车商品数量
    }, 800);
  },

  //获取购物车商品数量
  getCartNum() {
    findCarCount({}).then(({ result }) => this.setData({ cartNum: result.count }))
  },
  // 跳转商品详情
  toProduct(e) {
    const { id, type } = e.currentTarget.dataset
    if (type === SUBJECT_TYPE.PRODUCT) {
      wx.navigateTo({
        url: `/pages/product/index?spuId=${id}&skuId=none`
      })
    } else {
      wx.navigateTo({
        url: `/pages/product/suit/index?spuId=${id}`
      })
    }
  },
  //去购物车
  toCartList() {
    wx.navigateTo({ url: '/pages/cart/index' })
  },

  //收藏
  onFavorite(e) {
    const { item, index } = e.currentTarget.dataset
    const { productInfoVo } = item || {}
    this.setData({ curProductId: productInfoVo.productId })
    this.selectComponent("#favoriteBtn").favoriteBtn({
      product: productInfoVo,
      productId: productInfoVo.productId,
      isFavorite: productInfoVo.isFavorite,
      index: index,
      subjectType: item.subjectType
    })
  },
  //收藏成功
  favoriteSuccess(e) {
    const { isFavorite, index } = e.detail
    const favoriteList = this.data.favoriteList
    favoriteList[index].productInfoVo.isFavorite = isFavorite
    this.setData({ favoriteList })
  },

  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },

  //监听页面隐藏
  onHide() {
    if (this.data.favoriteList.length > 0) {
      this.pageHide()
    }
  },
  //监听页面卸载
  onUnload() {
    this.pageHide()
  },
  pageHide() {
    //埋点
    track(TrackEventName.Boss_FavouriteList, {
      ...this.data.pointParamsDetail,
      endtime: Date.now(),
      cycle_time: Math.floor((Date.now() - this.data.pointParamsDetail.starttime) / 1000)
    })
  }
});