import { wxFuncToPromise } from "../utils/wxUtils";
import { queryCategoryGoodsList, queryCategoryGoodsPage } from "../models/searchModel";
import { showToast } from "../components/toast/index";
import { TOAST_TYPE } from "../const/index";
import loginPage from "../behaviors/loginPage";

export default Behavior({
  behaviors: [loginPage],
  data: {
    scrollHeight: 0,
    currentClassifyId: "",
    list: {
      cId: "",
      tops: [],
      products: [],
      cover: '',
      // 当前页码
      current: 1,
      // 总页数
      total: 10
    },
    totalCount: 0,
    currPage: 1,
    totalPage: 0,
    page: 1,
    cIds: {
      currId: "",
      nextId: "",
      preId: ''
    },
    isHideLoadMore: false,
    isLoading: true,
  },
  methods: {
    initPageHeight() {
      wxFuncToPromise('getSystemInfo')
        .then(result => {
          //状态栏高度
          const statusBarHeight = Number(result.statusBarHeight);
          const menu = wx.getMenuButtonBoundingClientRect()
          //状态栏加导航栏高度
          const navStatusBarHeight = statusBarHeight + menu.height + (menu.top - statusBarHeight) * 2
          this.setData({
            scrollHeight: result.safeArea.bottom - navStatusBarHeight
          })
        })
    },
    /* 监听分类切换 */
    async onChangeClassify({ detail }) {
      // 请求下一个分类的时候需要将 currentClassifyId 更新为nextId
      this.setData({ cIds: detail, page: 1 });
      await this.getGoodsList(detail.currId) //轮播商品
      await this.getGoodsPage(detail.currId, 1) //分页商品
      this.setData({ isScrollTop: true })
    },
    //滚到底部-上拉加载更多
    onReachScrollBottom() {
      this.setData({ isHideLoadMore: true })
      const { page, list, cIds } = this.data
      //如果 某类商品加载 切换加载下一类商品
      if (list.products.length === list.total) {
        this.setData({ isHideLoadMore: false })
        // this.setData({currentClassifyId: cIds.nextId||""})
      } else { //自动加载更多
        this.setData({ page: page + 1 })
        this.getGoodsPage(cIds.currId, page + 1) //更新
      }
    },
    /** 获取分类下分页商品*/
    getGoodsPage(goodsCategoryId, page) {
      const params = {
        goodsCategoryId,
        page
      }
      queryCategoryGoodsPage(params)
        .then(({result}) => {
          const list = this.data.list;
          const _list = result.list.map(e => ({ ...e, sellPrice: Number(e.sellPrice) }))||[]
          if (params.page > 1) {
            list.products = [...list.products, ..._list]
          } else {
            list.cId = params.goodsCategoryId
            list.products = _list || []
          }
          list.total = result.totalCount || list.total;
          this.setData({
            list,
            totalCount: result.totalCount,
            currPage: result.currPage,
            totalPage: result.totalPage,
          })
        })
        .catch((err) => {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
        .finally(() => {
          this.setData({
            isLoading: false,
            isHideLoadMore: false
          })
        })
    },
    /** 获取分类下置顶 轮播图商品*/
    getGoodsList(goodsCategoryId) {
      const params = {goodsCategoryId}
      queryCategoryGoodsList(params).then(({result}) => {
        const list = this.data.list
        list.tops = result?result.jumpList:[];
        this.setData({ list })
        console.log(list,'list')
      }).catch((err) => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
    }
  }
})