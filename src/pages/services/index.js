import { queryMyServiceList } from '@models/servicesModel'
import { STORAGE_USER_FOR_KEY, TOAST_TYPE } from '@const/index'
import { hideToast, showToast } from '@components/toast/index'
import { isLogged } from '@utils/index'
Page({
  data: {
    orderType: '1', // 线上服务1，到店服务2
    orderStatus: '3', //  0查询历史 1待付款 2待预约 3待服务 4已完成 5已关闭
    current: 0, // tab切换
    pageIndex: 1, // 当前页码
    isLoading: false,
    isLogged: true,
    tabBar: {
      1: [{ text: '待服务' }, { text: '待预约' }, { text: '服务历史' }],
      2: [{ text: '待服务' }, { text: '服务历史' }]
    },
    serviceData: {
      list: [],
      currPage: 0,
      pageSize: 0,
      totalCount: 0,
      totalPage: 0
    },
    barHeight: '',
    tabHeight: ''
  },

  onLoad() {
    this.updateContentHeight()
    this.setData({ isLogged: isLogged() })
    if (isLogged()) {
      this.queryMyService()
    }
  },

  onShow() {
    this.updateContentHeight()
    this.setData({ isLoading: true, pageIndex: 1, serviceData: {} })
    if (isLogged()) {
      this.queryMyService()
    }
  },


  serviceOnline() {
    this.setData({ orderType: '1' })
    this.resetService()
    if (isLogged()) {
      this.queryMyService()
    }
  },

  serviceStore() {
    this.setData({ orderType: '2' })
    this.resetService()
    if (isLogged()) {
      this.queryMyService()
    }
  },

  // tab切换
  tabChange(data) {
    const { detail } = data
    this.setData({ current: detail.index, serviceData: {}, pageIndex: 1 })
    // this.queryMyService()
    if (isLogged()) {
      this.queryMyService()
    }
  },

  // 清空数据
  resetService() {
    this.setData({ pageIndex: 1, current: 0, serviceData: {} })
  },

  // 计算查询状态
  calculateSum() {
    let { current, orderType } = this.data
    let type = '3'
    if (orderType == 1) {
      switch (current) {
        case 0:
          type = '3'
          break
        case 1:
          type = '2'
          break
        case 2:
          type = '0'
          break
      }
    } else {
      switch (current) {
        case 0:
          type = '3'
          break
        case 1:
          type = '0'
          break
      }
    }
    this.setData({ orderStatus: type })
  },

  // 查询我的服务
  queryMyService() {

    this.calculateSum()
    const isNotEmpty = value => {
      if (value === null || value === undefined) {
        return false
      }
      if (Array.isArray(value) || typeof value === 'object') {
        if (Array.isArray(value) && value.length > 0) {
          return true
        } else if (Object.keys(value).length > 0) {
          return true
        }
      }
      return false
    }
    showToast({ type: TOAST_TYPE.LOADING })
    let { orderStatus, orderType, pageIndex } = this.data
    queryMyServiceList({ page: pageIndex, orderStatus, orderType })
      .then(({ result, code }) => {
        if (code != 200) {
          showToast({
            type: TOAST_TYPE.ERROR,
            title: '暂无服务'
          })
          this.setData({ serviceData: { list: [] } })
          return
        }
        const { list } = this.data.serviceData
        let { myServiceList, myServicePage } = result
        if (isNotEmpty(myServiceList) || isNotEmpty(myServicePage)) {
          if (isNaN(myServiceList)) {
            this.setData({ serviceData: { list: myServiceList } })
          } else {
            let newList = pageIndex == 1 ? myServicePage.list : [...list, ...myServicePage.list]
            this.setData({ serviceData: { ...myServicePage, list: newList } })
          }
        } else {
          this.setData({ serviceData: { list: [] } })
        }
      })
      .catch(err => {
        showToast({
          title: err.msg || '暂无服务',
          type: TOAST_TYPE.WARNING
        })
      })
      .finally(() => {
        this.setData({ isLoading: false })
        hideToast()
      })
  },

  // 刷新数据
  onRefresh() {
    this.setData({ pageIndex: 1 })
    this.queryMyService()
  },

  //加载更多
  onReachBottom() {
    const { currPage, totalPage } = this.data.serviceData
    if (currPage < totalPage) {
      this.setData({
        pageIndex: currPage + 1
      })
      this.setData({ isLoading: true })
      this.queryMyService()
    }
  },

  // 返回
  goBackCustomize(e) {
    wx.switchTab({ url: '/pages/mine/index' })
  },

  bindSuccess(e) {
    if (isLogged()) {
      this.setData({ isLogged: true, isLoading: true })
      showToast({ type: TOAST_TYPE.LOADING })
      this.queryMyService()
    }
  },

  bindFail(err) {
    this.setData({ isLogged: false })
    showToast({ type: TOAST_TYPE.WARNING, title: err.msg || '网络请求错误' })
  },

  bindClose() { },

  updateContentHeight() {
    const query = wx.createSelectorQuery()
    query
      .select('#navbar')
      .boundingClientRect(res => {
        if (res.height) {
          this.setData({ barHeight: res.height })
        }
      })
      .exec()
    query
      .select('#tabBar')
      .boundingClientRect(res => {
        if (res.height) {
          this.setData({ tabHeight: res.height })
        }
      })
      .exec()
  }
})
