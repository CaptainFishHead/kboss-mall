import { queryCardList, getCardStatistics } from "../../models/cardModel";
import { TOAST_TYPE } from "../../const/index";
import { hideToast, showToast } from "../../components/toast/index";
import { isLogged } from "@utils/index";
Page({
  data: {
    isLoading: false,
    page: 1,
    totalPage: 1,
    totalCount: 0,
    cardList: [],
    current: 0,
    tabList: [{
      text: '可用卡',
    }, {
      text: '不可用卡',
    }],
    isLogged: true
  },

  onLoad() {
    this.setData({isLogged: isLogged()}); //获取用户token
  },

  onShow() {
    this.setData({isLoading: true, orderData: {}})
    if (isLogged()) {
      showToast({type: TOAST_TYPE.LOADING})
      this.tabChange() //获取卡片列表
    }
  },
  //tab切换
  tabChange(e) {
    this.setData({
      current: e ? e.detail.index : 0, // 更新tab下标
      cardList: [],
      page: 1,
      isLoading: true
    })
    showToast({ type: TOAST_TYPE.LOADING })
    this.getCardList() //更新卡片列表
    this.getCardNumber() //更新卡片数量
  },

  //加载更多
  onReachBottom() {
    const { page, current, cardList, totalPage } = this.data
    if( page < totalPage) {
      this.setData({ isHideLoadMore: true, page: page + 1  })
      this.getCardList({page: page + 1}) //更新卡片列表
    }
  },

  // 获取卡片列表
  getCardList(params) {
    const {current} = this.data;
    queryCardList({
      isEnable: current+1,
      ...params
    })
      .then(({ result }) => {
        const list = [...this.data.cardList, ...result.list]
        this.setData({
          cardList: list,
          totalCount: result.totalCount,
          totalPage: result.totalPage
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
        hideToast()
      })
  },

  // 获取卡片数量
  getCardNumber() {
    getCardStatistics()
      .then(({ result }) => {
        this.setData({
          tabList: [{
            text: `可用卡(${result.enableSum > 99 ? '99+' : result.enableSum || 0})`,
          }, {
            text: `不可用卡(${result.disabledSum > 99 ? '99+' : result.disabledSum || 0})`,
          }]
        })
      })
      .catch((err) => { })
  },

  // 获取当前卡片id (用来局部更新)
  onGetCurId(e) {
    const { curId, curIndex } = e.detail
    this.setData({ curId, curIndex })
  },

  // 激活成功
  onActivateCard(e) {
    const { index, card } = e.detail
    const { cardList } = this.data
    cardList[index] = card
    this.setData({ cardList })
  },
  // 激活成功，来自卡片详情
  onActivateCardFromDetail(card) {
    const { cardList, curId, curIndex } = this.data
    if (cardList[curIndex].id === curId) {
      cardList[curIndex] = { ...cardList[curIndex], ...card }
      this.setData({ cardList })
    }
  },

  // 赠送成功
  onGiveCard() {
    const { cardList, totalCount, curId, curIndex } = this.data
    if (cardList[curIndex].id === curId) {
      cardList.splice(curIndex, 1)
      this.setData({ cardList })
      this.getCardNumber() //更新卡片数量
      if (cardList.length < totalCount - 1) {
        this.onReachBottom(1) //在当前分页尾部 手动添加一条数据
      }
    }
  },

  bindSuccess(e) {
    if (isLogged()) {
      this.setData({isLogged: true});
      const params = {
        type: this.data.current
      }
      this.setData({isLoading: true})
      showToast({type: TOAST_TYPE.LOADING})
      this.getCardList(params) //更新卡片列表
      this.getCardNumber() //更新卡片数量
    }
  },
  bindFail(err) {
    this.setData({isLogged: false});
    showToast({type: TOAST_TYPE.WARNING, title: err.msg || '网络请求错误'})
  },
  
  toSendrecordPage() {
    wx.navigateTo({
      url: './sendrecord/index',
    })
  },
  toBindPage() {
    wx.navigateTo({
      url: './bind/index',
    })
  }

});
