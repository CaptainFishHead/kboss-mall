import { getImgBoxSize, formatDate, formatDateTime } from '@utils/index'
import { queryMetricsDetails, queryMetricsAssistant } from "@models/healthArchivesModel"
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, } from "@const/index";
import healthArchivesAnswer from "@behaviors/healthArchivesAnswer";

Page({
  behaviors: [healthArchivesAnswer],
  data: {
    maxHeight: 0,
    minHeight: 0,
    currentDetail: null,
    metrics: [],
    currentMetric: null,
    indexId: null,
    assistantData: {}, //顾问信息
    //BMI 默认身高体重
    sonIndexListBMI: [{
      indexId: "cm",
      indexName: "身高",
      indexData: "",
      indexRange: "[0,300]",
      indexDataType: 1,
      indexUnit: "cm",
    }, {
      indexId: "kg",
      indexName: "体重",
      indexData: "",
      indexRange: "[0,200]",
      indexDataType: 1,
      indexUnit: "kg",
    }],
  },
  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    const { indexId } = this.data
    await this.getHealthCurrentMetric(indexId)
    await this.queryMetricsAssistant()
    await this.handlerHeight()
    await this.getInterpretation(indexId); //指标大模型解读
  },
  onLoad(options) {
    const { indexId } = options
    this.setData({ indexId })
  },
  onUnload() {
    this.clearTimer(); //除定时器
  },
  onHide() {
    this.clearTimer(); //除定时器
  },

  async handlerHeight() {
    const listCards = await getImgBoxSize('.list-card', this)
    if (!listCards.length) return
    const { height } = listCards[0]
    this.setData({
      maxHeight: height * 15,
      minHeight: height * 5
    })
  },

  // 获取管家信息
  async queryMetricsAssistant() {
    try {
      const { result } = await queryMetricsAssistant({ str: 0 })
      if (!result) return;
      result.consultantAvatar = result.consultantAvatar || 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/consult_defult.png'
      this.setData({ assistantData: result || {} })
    } catch (err) {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }
  },

  // 获取健康指标子数据
  async getHealthCurrentMetric(indexId) {
    const { sonIndexListBMI } = this.data
    try {
      showToast({ type: TOAST_TYPE.LOADING })
      const { result: currentMetric } = await queryMetricsDetails({ str: indexId })
      const cur = currentMetric.sonIndexList[0]
      const time = formatDateTime(cur.createdTime).getTime()
      currentMetric.createdTime = formatDate(time, '.').dateTimeMM

      // BMI指标 身高体重不取子集展示，前端强制写死
      if (currentMetric.indexId === '1') {
        const { textReferenceValue } = cur
        const valArr = textReferenceValue && textReferenceValue.split(",") || [] //从左到右顺序为：体重 身高
        sonIndexListBMI[0].indexData = valArr[0]
        sonIndexListBMI[1].indexData = valArr[1]

        //赋值后，再替换写死数据
        currentMetric.sonIndexList = sonIndexListBMI
      }
      this.setData({ currentMetric })
      hideToast()
    } catch (err) {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }

    this.setData({ isLoading: false })
  },

  setCurrentDetail(e) {
    const currentDetail = e.type === 'close' ? null : e.detail.currentDetail
    this.setData({ currentDetail })
  },

  navigateToHistory() {
    const { indexId, sonIndexList } = this.data.currentMetric
    if (!sonIndexList || !sonIndexList.length) {
      showToast({
        title: '暂无信息',
        type: TOAST_TYPE.WARNING
      })
      return
    }
    wx.navigateTo({
      url: `/pages/healthArchives/healthHistory/index?indexId=${indexId}`
    })
  },

  navigateToUpdateMetric() {
    const { indexId, sonIndexList } = this.data.currentMetric
    if (!sonIndexList || !sonIndexList.length) {
      showToast({
        title: '暂无指标',
        type: TOAST_TYPE.WARNING
      })
      return
    }
    wx.navigateTo({
      url: `/pages/healthArchives/bloodLipidRecord/index?indexId=${indexId}`
    })
  },
  advatar() {
    let str = this.data.assistantData.isBind ? 0 : 1
    wx.navigateTo({
      url: "/pages/healthArchives/healthWaiter/index?str=" + str,
    })
  }
})