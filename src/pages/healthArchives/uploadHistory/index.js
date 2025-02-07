import { fetchHistoryRecords, queryHistoryDetails } from '@models/healthInfo'
import { STORAGE_USER_FOR_KEY, TOAST_TYPE } from '@const/index'
import { showToast, hideToast } from '@components/toast/index'

Page({
  data: {
    content: '',
    isLoading: false,
    historyData: {
      list: [],
      currPage: 0,
      pageSize: 0,
      totalCount: 0,
      totalPage: 0
    }
  },
  onLoad() {
    showToast({
      type: TOAST_TYPE.LOADING
    })
    this.queryHistoryList({ page: 1 })
  },

  // 加载更多
  onReachBottom() {
    const { currPage, totalPage } = this.data.historyData
    if (currPage + 1 <= totalPage) {
      this.queryHistoryList({ page: currPage + 1 })
    }
  },

  // 处理数据
  historyHandle(arr) {
    const formatTimestampToDate = timestamp => {
      var date = new Date(timestamp * 1000)
      var year = date.getFullYear()
      var month = ('0' + (date.getMonth() + 1)).slice(-2)
      var day = ('0' + date.getDate()).slice(-2)
      let hours = ('0' + date.getHours()).slice(-2)
      let minutes = ('0' + date.getMinutes()).slice(-2)
      let seconds = ('0' + date.getSeconds()).slice(-2)
      return {
        formattedDate: `${year}年${month}月`,
        formattedMonth: `${month}月${day}日`,
        formattedTime: `${hours}:${minutes}:${seconds}`
      }
    }
    const createFlatTree = items => {
      const grouped = {}
      items.forEach(item => {
        const dateKey = item.formattedDate
        if (!grouped[dateKey]) {
          grouped[dateKey] = { list: [] }
        }
        grouped[dateKey].list.push(item)
      })
      const result = Object.keys(grouped).map(dateKey => ({
        createdTime: dateKey,
        list: grouped[dateKey].list
      }))
      return result
    }
    let mapList = arr.sort((a, b) => b.createTimestamp - a.createTimestamp)
    mapList.forEach(item => {
      let { formattedDate, formattedMonth, formattedTime } = formatTimestampToDate(item.createTimestamp)
      item.formattedDate = formattedDate
      item.formattedMonth = formattedMonth
      item.formattedTime = formattedTime
    })
    const flatTree = createFlatTree(mapList)
    return flatTree
  },

  // 查询历史记录列表
  queryHistoryList(params) {
    this.setData({ isLoading: true })
    fetchHistoryRecords(params)
      .then(({ result }) => {
        const { list } = this.data.historyData
        const flatTree = this.historyHandle(result.list)
        const newList = result.currPage === 1 ? flatTree : [...list, ...flatTree]
        this.setData({ historyData: { ...result, list: newList } })
      })
      .catch(err => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
      .finally(() => {
        this.setData({
          isLoading: false
        })
        hideToast()
      })
  },

  // 刷新
  onRefresh() {
    this.queryHistoryList({ page: 1 })
  },

  // 查看详情
  onViewDetails(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/healthArchives/historyDetail/index?id=${id}`
    })
  }
})
