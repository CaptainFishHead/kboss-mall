import {
  queryWordLenovoList,
  queryWordHotList,
  queryResultList,
  queryContentList
} from "../../models/searchModel";
import {
  TOAST_TYPE
} from "../../const/index";
import {
  hideToast,
  showToast
} from "../../components/toast/index";
import {
  openPage
} from "../../utils/index";
import {
  track,
  TrackEventName
} from "../../utils/sa";

const app = getApp()

Page({
  data: {
    historyList: [], //搜索历史 未折叠
    historyListShow: [], // 搜索历史 折叠
    hotList: [], //热门搜索
    lenovoList: [], // 搜索词列表
    resultList: [], // 搜索结果列表商品
    resultList1: [], // 搜索结果列表内容
    keyword: '', // 输入框内容
    searchType: '1', // 搜索类型 1、提示词 2、手动输入（搜索发现） 3、历史搜索 4、热词搜索
    loadingHistory: true,
    showMoreBtn: false,
    toggleDown: false,
    dialogShow: false,
    buttonsConfim: [{
      text: '取消'
    }, {
      text: '确定'
    }],
    isLoading: false,
    isLoading1: false,
    page: 1,
    page1: 1,
    totalCount: 0,
    totalCount1: 0,
    isHideLoadMore: false,
    isHideLoadMore1: false,
    showResultPage: false,
    active: '1', // 1商品 2内容
    hotPosition: '1', // 顶部搜索热词 1：搜索框热词-商品 | 2：热门搜索词-商品 | 3：搜索框热词-内容 | 4：热门搜索词-内容
    showLenovo:false,
    isObser: false, // 判断需不需要强制更新输入框里的内容
    options:{}, // 进入搜索页面携带的参数
  },

  onLoad(options) {
    if (options.tolink) {
      this.setData({
        active: options.tolink,
        hotPosition: options.tolink == '2' ? '3' : '1'
      })
    }
    let sysinfo = wx.getSystemInfoSync()
    let statusHeight = sysinfo.statusBarHeight
    this.setData({
      statusHeight
    })
    
    //获取热门列表
    let params = {
      hotPosition: this.data.active == '1' ? '2' : '4'
    }
    this.getWordHotList(params)
    //获取搜索历史
    this.getHistoryList()
    //点击时获取当前轮播词
    const {
      curIndex,
      isFromBtn
    } = options
    this.setData({
      options: options
    })
    this.selectComponent("#searchbar").fromInput(curIndex, isFromBtn, 0)

  },
  // 切换tab商品和内容
  clickTab(e) {
    if(this.data.active == e.currentTarget.dataset.active){
      return
    }
    this.setData({
      hotPosition: e.currentTarget.dataset.active == '1' ? '1' : '3',
      active: e.currentTarget.dataset.active
    })
    // 切换搜索历史
    this.getHistoryList()
    //获取热门列表
    let params = {
      hotPosition: e.currentTarget.dataset.active == '1' ? '2' : '4'
    }
    this.getWordHotList(params)
    // 有搜索结果时切换tab后重新搜索
    if(this.data.showResultPage){
      this.onSearch(this.data.keyword, this.data.searchType)
    }
  },
  // 获取搜索历史
  getHistoryList() {
    let historyList = wx.getStorageSync('historyList') || []
    this.setData({
      historyListShow: historyList,
      historyList
    })
    this.toggleHistoryData() // 超出2行默认折叠
  },

  // 跳转商品详情
  toProduct(e) {
    let currentRow = e.currentTarget.dataset.item
    this.setResultPoint(currentRow.productId, currentRow.productName);
    if (this.data.active == '1') {
      wx.navigateTo({
        url: `/pages/product/index?spuId=${currentRow.productId}&skuId=none`
      })
    } else {
      let href = ""
      if (currentRow.type == 1) {
        // 图文种草
        href = `/pages/recommend/graphicDetail/index?id=${currentRow.id}`
      } else if (currentRow.type == 2) {
        // 视频种草
        href = `/pages/recommend/videoDetail/index?id=${currentRow.id}`
      } else if (currentRow.type == 3) {
        // 直播种草
        href = `/pages/live/player/index?roomId=${currentRow.roomId}`
      }
      wx.navigateTo({
        url: href
      })
    }
  },

  // 获取热门列表
  getWordHotList(params) {
    queryWordHotList(params)
      .then(({
        result
      }) => {
        this.setData({
          hotList: result.hotWordList
        })
      })
      .catch((err) => {
        console.error(err)
      })
  },
  // 获取联想词列表
  getWordLenovoList(params) {
    queryWordLenovoList(params).then(({
      result
    }) => {
      this.setData({
        showLenovo: result.lenovoList.length != 0,
        lenovoList: result.lenovoList
      })
    }).catch((err) => { })
  },

  // 折叠历史
  toggleShow() {
    const {
      toggleDown,
      historyList
    } = this.data
    if (toggleDown) {
      this.toggleHistoryData()
    } else {
      this.setData({
        historyListShow: historyList
      })
    }
    this.setData({
      toggleDown: !toggleDown
    })
  },
  toggleHistoryData() {
    const historyList = this.data.historyList
    let _this = this
    let idx = 0
    let count = 0
    wx.createSelectorQuery().selectAll('.history .item').boundingClientRect(function (rects) {
      rects.forEach((item, index) => {
        if (item.left === rects[0].left) {
          count++
          if (count === 3) {
            idx = index - 1
          }
        }
        if (idx > 0) {
          const historyListShow = historyList.slice(0, idx) //超过2行截断数据
          _this.setData({
            historyListShow,
            toggleDown: false,
            showMoreBtn: true
          })
        } else {
          _this.setData({
            toggleDown: true,
            showMoreBtn: false
          })
        }
        setTimeout(() => { //防止闪动
          _this.setData({
            loadingHistory: false
          })
        }, 100);
      })
    }).exec()
  },
  // 删除搜索历史弹窗
  deleteBtn() {
    this.setData({
      dialogShow: true
    })
  },
  // 删除搜索历史弹窗确认
  tapDialogButton(e) {
    if (e.detail.index) {
      // 删除历史
      this.setData({
        historyList: [],
        showMoreBtn: false
      })
      wx.setStorageSync('historyList', [])

    }
    this.setData({
      dialogShow: false
    })
  },
  obserFun(e){
    const {
      obser
    } = e.detail
    this.setData({
      isObser: obser
    })
  },
  onEdit(e) {
    const {
      value
    } = e.detail
    clearTimeout(this.timer)
    if (value !== '') {
      this.timer = setTimeout(() => {
        this.getWordLenovoList({
          hotPosition: this.data.active == '1' ? '1' : '3',
          keyword: value
        }) //获取联想词列表
      }, 300)
    } else {
      this.setData({
        keyword: "",
        lenovoList: [],
        showLenovo: false
      })
    }
    this.setData({
      resultList: [],
      resultList1: [],
      keyword: value,
      showResultPage: false,
      searchType: '2'
    })
  },

  // 选择搜索结果/搜索历史/热门搜索
  onSelectResult(e) {
    const {
      text,
      type
    } = e.currentTarget.dataset
    this.onSearch(text, type, 'btn');
  },

  // 搜索请求
  onSearch(e, type, route) {
    let keyword = ''
    if (e.detail) {
      keyword = e.detail.value
    } else {
      keyword = e
    }

    if (this.data.active == '1') {
      wx.nextTick(()=>{
        this.setData({
          keyword,
          isObser: route == 'btn',
          resultList: [],
          page: 1,
          isLoading: true,
          showLenovo:false,
          searchType: type || '1'
        })
      })
      
    } else {
      wx.nextTick(()=>{
        this.setData({
          keyword,
          isObser: route == 'btn',
          resultList1: [],
          page1: 1,
          isLoading1: true,
          showLenovo:false,
          searchType: type || '1'
        })
      })
    }


    //保存搜索历史
    const {
      historyList
    } = this.data
    if (keyword) {
      historyList.unshift(keyword)
    }
    let arr = Array.from(new Set(historyList))
    if (arr.length > 15) {
      arr.pop()
    }
    wx.setStorageSync('historyList', arr || [])
    //更新搜索历史
    this.getHistoryList()


    let hotPosition = ''
    // 判断是否是搜索框热词 是否是热门搜索热词
    let ishot = this.data.hotList.some(obj => obj.wordName == keyword)
    if (ishot) {
      hotPosition = this.data.active == '1' ? '2' : '4'
    } else {
      hotPosition = this.data.active == '1' ? '1' : '3'
    }
    this.setData({
      hotPosition
    })
    //获取结果列表
    this.getResultList({
      hotPosition: hotPosition,
      keyword: keyword
    })

    // 添加搜索埋点
    this.setSearchPoint()
  },

  //加载更多
  onReachScrollBottom() {
    let page = ''
    if (this.data.active == '1') {
      page = this.data.page + 1
      this.setData({
        isHideLoadMore: true,
        page
      })
    } else {
      page = this.data.page1 + 1
      this.setData({
        isHideLoadMore1: true,
        page1: page
      })
    }

    const params = {
      keyword: this.data.keyword,
      hotPosition: this.data.hotPosition,
      page,
      isBottom: true
    }
    this.getResultList(params) //更新卡片列表
  },
  // 获取列表
  getResultList(params) {
    if (!params.isBottom) {
      showToast({
        type: TOAST_TYPE.LOADING
      })
    }
    // 商品搜索
    if (this.data.active == '1') {
      queryResultList(params)
        .then(({
          result
        }) => {
          hideToast().then(() => {
            const {
              isJumped,
              hotWord: link,
              productPage
            } = result

            if (isJumped === 1) {
              openPage.call(this, {
                link
              })

            } else {
              //不跳转
              let list = [...this.data.resultList, ...productPage.list]
              if (params.isBottom) {
                this.setData({
                  resultList: list
                })
              } else {
                this.setData({
                  resultList: productPage.list
                })
              }
              this.setData({
                totalCount: productPage.totalCount,
                showResultPage: true
              })
              // 有搜索结果时 搜索框不自动聚焦
              // let {
              //   curIndex,
              //   isFromBtn
              // } = this.data.options
              // this.selectComponent("#searchbar").fromInput(curIndex, isFromBtn, 1)
            }
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
    } else {
      // 内容搜索
      queryContentList(params)
        .then(({
          result
        }) => {
          hideToast().then(() => {
            const {
              isJumped,
              hotWord: link,
              productPage
            } = result

            if (isJumped === 1) {
              openPage.call(this, {
                link
              })

            } else {
              //不跳转
              let list = [...this.data.resultList1, ...productPage.list]
              if (params.isBottom) {
                this.setData({
                  resultList1: list
                })
              } else {
                this.setData({
                  resultList1: productPage.list
                })
              }
              this.setData({
                totalCount1: productPage.totalCount,
                showResultPage: true
              })
            }
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
            isLoading1: false,
            isHideLoadMore1: false
          })

        })
    }

  },
  // 设置搜索埋点
  setSearchPoint() {
    const {
      searchType,
      keyword
    } = this.data;
    let wordKey = {
      '1': 'key_word',
      '2': 'search_found',
      '3': 'hist_word',
      '4': 'hot_word'
    };
    let params = {}
    params[wordKey[searchType]] = keyword;
    track(TrackEventName.Boss_SearchColumClick, params);
  },
  // 设置搜索结果埋点
  setResultPoint(id, name) {
    track(TrackEventName.Boss_SearchResultClick, {
      // channelpage_name: pageSource || '',
      detail_id: id,
      content_name: name
    })
  },

  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
  // contains(arr, val) {
  //   for (var i = 0; i < arr.length; i++) {
  //     if (arr[i] === val) {
  //       return true
  //     }
  //   }
  //   return false
  // }

})