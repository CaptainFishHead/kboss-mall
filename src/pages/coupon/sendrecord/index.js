import { querySendCardList, getCardStatistics } from "../../../models/cardModel";
import { TOAST_TYPE } from "../../../const/index";
import { hideToast, showToast } from "../../../components/toast/index";

Page({
  data: {
    isLoading: false,
    page: 1,
    totalCount: 0,
    cardList: [],
    current: 0,
    tabList: [{
      text: '赠送中',
    }, {
      text: '已赠送',
    },],
  },
  onLoad() {
    this.tabChange(0) //获取卡片列表
  },

  //tab切换
  tabChange(e) {
    const { detail } = e
    let cur = 0
    if (e) {
      cur = detail.index
    }
    this.setData({
      current: cur, // 更新tab下标
      cardList: [],
      page: 1,
      isLoading: true
    })
    const params = { isPresent: cur + 1 }
    this.getCardList(params) //更新卡片列表
    this.getCardNumber() //更新卡片数量
  },

  //加载更多
  onReachBottom(e) {
    this.setData({ isHideLoadMore: true })
    const { page, current, cardList } = this.data
    const params = {
      isPresent: current + 1,
      page: page + 1,
      isBottom: true
    }
    if (e === 1) {
      // 手动添加一条数据
      params.rows = e
      params.page = cardList.length + 1
    } else {
      //自动加载更多
      this.setData({ page: page + 1 })
    }
    this.getCardList(params) //更新卡片列表
  },

  // 获取卡片列表
  getCardList(params) {
    if (!params.isBottom) {
      showToast({ type: TOAST_TYPE.LOADING })
    }
    querySendCardList(params)
      .then(({ result }) => {
        const _list = result && result.list || []
        const list = _list.map(e => {
          return e = {
            ...e,
            presentStatus: params.isPresent,
          }
        })
        if (params.isBottom) {
          this.setData({ cardList: [...this.data.cardList, ...list] })
        } else {
          this.setData({ cardList: list })
        }
        this.setData({ totalCount: result.totalCount })
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
            text: `赠送中(${result.presentingSum > 99 ? '99+' : result.presentingSum || 0})`,
          }, {
            text: `已赠送(${result.presentedSum > 99 ? '99+' : result.presentedSum || 0})`,
          }]
        })
      })
      .catch((err) => { })
  },

  // 撤销赠送 成功
  onCancelCard(e) {
    const { index } = e.detail
    const { cardList, totalCount } = this.data
    cardList.splice(index, 1)
    this.setData({ cardList })
    this.getCardNumber() //更新卡片数量
    if (cardList.length < totalCount - 1) {
      this.onReachBottom(1) //在当前分页尾部 手动添加一条数据
    }
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
  },

});
