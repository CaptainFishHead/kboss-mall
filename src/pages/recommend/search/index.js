// pages/recommend/search/index.js
import { queryWordLenovoList, queryResultList } from "../../../models/searchModel";
import { TOAST_TYPE } from "../../../const/index";
import { hideToast, showToast } from "../../../components/toast/index";
import { track, TrackEventName } from "../../../utils/sa";

const app = getApp()

Page({
  data: {
    lenovoList: [],
    resultList: [],
    keyword: '',
    searchType: '1', // 搜索类型 1、提示词 2、手动输入（搜索发现） 3、历史搜索 4、热词搜索
    isLoading: false,
    page: 1,
    totalCount: 0,
    showResultPage: false
  },

  onLoad(options) {
    let sysinfo = wx.getSystemInfoSync()
    let statusHeight = sysinfo.statusBarHeight
    this.setData({ statusHeight })

    //点击时获取当前轮播词
    const { curIndex, isFromBtn } = options
    this.selectComponent("#searchbar").fromInput(curIndex, isFromBtn)
  },


  // 跳转商品详情
  toProduct(e) {
    const {id, name} = e.currentTarget.dataset;
    this.setResultPoint(id, name);
    wx.navigateTo({
      url: `/pages/product/index?spuId=${id}&skuId=none`
    })
  },

  
  // 获取联想词列表
  getWordLenovoList(params) {
    const { keyword } = params
    queryWordLenovoList({
      ...params,
      position: 3
    })
      .then(({ result }) => {
        this.setData({ lenovoList: result.lenovoList })
        let lenovoList = result.lenovoList
        let list = []
        if (lenovoList.length > 0) {
          lenovoList.forEach(e => {
            e.showText = e.keyword.replace(new RegExp(`(${keyword})`, 'g'), `<span style="color:#DD1921">${keyword}</span>`)
            list.push(e)
          })
        }
        this.setData({ lenovoList: list })
      })
      .catch((err) => { })
  },
  onEdit(e) {
    const { value } = e.detail
    clearTimeout(this.timer)
    if (value !== '') {
      this.timer = setTimeout(() => {
        this.getWordLenovoList({ keyword: value }) //获取联想词列表
      }, 300)
    } else {
      this.setData({ lenovoList: [] })
    }
    this.setData({
      resultList: [],
      keyword: value,
      showResultPage: false,
      searchType: '2'
    })
  },

  // 选择搜索结果
  onSelectResult(e) {
    const { text, type } = e.currentTarget.dataset
    this.onSearch(text, type)
  },

  // 搜索请求
  onSearch(e, type) {
    let keyword = ''
    if (e.detail) {
      keyword = e.detail.value
    } else {
      keyword = e
    }
    this.setData({
      keyword,
      resultList: [],
      page: 1,
      isLoading: true,
      searchType: type || '1'
    })

    //获取结果列表
    this.getResultList({ keyword:keyword });

    // 添加搜索埋点
    this.setSearchPoint(keyword)
  },

  //加载更多
  onReachScrollBottom() {
    const page = this.data.page + 1
    this.setData({
      isHideLoadMore: true,
      page
    })
    const params = {
      keyword: this.data.keyword,
      page,
      isBottom: true
    }
    this.getResultList(params) //更新卡片列表
  },
  // 获取列表
  getResultList(params) {
    if (!params.isBottom) {
      showToast({ type: TOAST_TYPE.LOADING })
    }
    queryResultList(params)
      .then(({ result }) => {
        hideToast().then(() => {
          const { isJumped, hotWord: link, productPage } = result
          //不跳转
          const list = [...this.data.resultList, ...productPage.list]
          if (params.isBottom) {
            this.setData({ resultList: list })
          } else {
            this.setData({ resultList: productPage.list })
          }
          this.setData({
            totalCount: productPage.totalCount,
            showResultPage: true
          })
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

  // 设置搜索埋点
  setSearchPoint(){
    const {searchType, keyword} = this.data;
    let wordKey = {'1': 'key_word', '2': 'search_found'};
    let params = {channelpage_name: '种草频道页'};
    params[wordKey[searchType]] = keyword;
    track(TrackEventName.Boss_SearchColumClick, params);
  },

  // 设置搜索结果买点
  setResultPoint(id, name){
    track(TrackEventName.Boss_SearchResultClick, {
      channelpage_name:  '种草频道页',
      detail_id: id,
      content_name: name 
    })
  },

})