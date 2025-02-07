import { queryHealthArchivesInfo, queryInterpretation, queryChatAnswerInfo } from "@models/healthArchivesModel"
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, HEALTH_INFO_BUSINESS_PAGE, HEALTHARCHIVES_SOURCE_PAGE } from "@const/index";
import { calculateAge, formatDateInt } from '@utils/index'
import { track, TrackEventName } from "@utils/sa"
import healthArchivesAnswer from "@behaviors/healthArchivesAnswer";
import { reqCounselor } from '@models/healthWaiter';
/**
 * redirectTo 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面
 * reLaunch 关闭所有页面，打开到应用内的某个页面
 * navigateBack 关闭当前页面，返回上一页面或多级页面。
 * navigateTo 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。
 * switchTab 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
 * */

Page({
  behaviors: [healthArchivesAnswer],
  data: {
    naviTransparent: 0,
    abnormal: 0,
    abnormalStatus: 0,
    healthInfo: {},
    waiterData: {}, //医生信息
    baseUrl: 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/',
    defaultHead: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/icon-default-head.png",
  },
  onShow() {
    this.getHealthInfo()
    this.getInterpretation(); //指标大模型解读
    this.getDetail(); // 健康管家
  },
  onUnload() {
    this.clearTimer(); //除定时器
  },
  onHide() {
    this.clearTimer(); //除定时器
  },

  async getHealthInfo() {
    let that = this
    try {
      showToast({ type: TOAST_TYPE.LOADING })
      const { result: healthInfo } = await queryHealthArchivesInfo()
      healthInfo.recuperateSchemes.forEach((item, index) => {
        item.totalDays = that.timeDifferenceFun(item.updatedTime)
      })
      healthInfo.basicInfo.headImg = healthInfo.basicInfo.headImg || that.data.defaultHead
      // 判断指标是否需要单独一行展示
      healthInfo.healthMetrics.forEach((item, index) => {
        item.str = item.indexName == "血压" ? `${item.sonIndexList[1].indexData}/${item.sonIndexList[0].indexData}` : (item.sonIndexList.sort((a, b) => formatDateInt(b.createdTime) - formatDateInt(a.createdTime)))[0].indexData
        // if(item.indexName && item.indexName.length >= 7){
        //   item.solt = '1'
        // }
        // if((item.str + item.sonIndexList[0].indexUnit).length >= 12){
        //   item.solt = '1'
        // }
      })
      // console.log(healthInfo.healthMetrics, 'healthInfo')
      that.setData({
        healthInfo: {
          ...healthInfo,
          healthMetricsArr10: healthInfo.healthMetrics.slice(0, 10)
        }
      })
      hideToast()
    } catch (err) {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }

    this.setData({ isLoading: false })
  },

  uploadReport() {
    this.selectComponent("#upload-report-comp").showUpload();
  },
  //档案头像
  handerBasicInfo() {
    wx.navigateTo({
      url: `/pages/healthInfo/personInfo/index?businessPage=${HEALTH_INFO_BUSINESS_PAGE.HEALTH_ARCHIVES}`
    })
  },

  handlAbnormalMetrics(e) {
    const { abnormal, abnormalStatus } = e.detail
    this.setData({ abnormal, abnormalStatus })
  },

  navigateToPlan(e) {
    const { programmeId } = e.currentTarget.dataset.programme
   let str = this.data.waiterData && this.data.waiterData.isBind ? 0 : 1;
    wx.navigateTo({
      url: `/pages/conditioningPlan/index?programmeId=${programmeId}&str=${str}`
    })
  },
  // 获取健康医生信息
  getDetail() {
    reqCounselor({ str: 0 })
      .then(({ result }) => {
        this.setData({
          waiterData: result
        });
      })
      .catch(err => {
        showToast({
          title: err.msg || '获取信息失败',
          type: TOAST_TYPE.WARNING,
          duration: 2000
        });
      });
  },
  // 获取健康医生信息
  getDetail() {
    reqCounselor({ str: 0 })
      .then(({ result }) => {
        this.setData({
          waiterData: result
        });
      })
      .catch(err => {
        showToast({
          title: err.msg || '获取信息失败',
          type: TOAST_TYPE.WARNING,
          duration: 2000
        });
      });
  },
  navigateToWaiter(e) {
    const { consultantid: consultantId } = e.currentTarget.dataset
    let str = this.data.waiterData && this.data.waiterData.isBind ? 0 : 1;
    wx.navigateTo({
      url: `/pages/healthArchives/healthWaiter/index?consultantId=${consultantId}&str=${str}`
    })
  },
  toQueryString(params) {
    return Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
  },

  navigateToBmi(e) {
    const { indexId } = e.detail
    const { basicInfo: { bmiIndexId } } = this.data.healthInfo
    wx.navigateTo({
      url: `/pages/healthArchives/bmi/index?indexId=${indexId || bmiIndexId}`
    })
  },

  navigateToFitnessInfo() {
    wx.navigateTo({
      url: `/pages/healthInfo/fitnessInfo/index?businessPage=${HEALTH_INFO_BUSINESS_PAGE.HEALTH_ARCHIVES}`
    })
  },

  onPageScroll(e) {
    const { scrollTop } = e
    const naviTransparent = scrollTop > 10 ? 1 : 0
    this.setData({ naviTransparent })
  },
  goBack() {
    // wx.switchTab({ url: '/pages/mine/index' })
    // wx.navigateBack();
    const healthArchivesSourcePage = wx.getStorageSync(HEALTHARCHIVES_SOURCE_PAGE) || ''
    let url = '/pages/index/index'
    if (healthArchivesSourcePage === 'mine') {
      url = '/pages/mine/index'
    }
    wx.switchTab({
      url, success: function () {
        wx.removeStorageSync(HEALTHARCHIVES_SOURCE_PAGE)
      }
    })

    //1回到首页，2回到我的页面
    //如果从首页或者我的 点击健康档案按钮 进入 初始创建 然后一路 往后跳 虽然能正常回来，但是如果半路 左上又操作回退
    //那么 WHICH_PAGE_TO_HEALTH_ARCHIVES 存储的变量 就无法保证 健康档案 页来源入口的准确性了，还得在多个地方清理

    //  const whichPageToArchives = wx.getStorageSync(WHICH_PAGE_TO_HEALTH_ARCHIVES)||''
    //  let backUrl = '/pages/index/index'
    //  if (whichPageToArchives==='mine'){
    //    backUrl = '/pages/mine/index'
    //  }
    // wx.switchTab({url: backUrl,success(){
    //   wx.removeStorageSync(WHICH_PAGE_TO_HEALTH_ARCHIVES)
    //   }})
  },
  // 判断时间差
  // time 传入的时间
  timeDifferenceFun(time) {
    if (time === null || time === undefined) {
      return ''
    }
    time = time.replace(/-/g, '/')
    // 获取两个日期之间相差的毫秒数
    let timeDifference = Math.abs(Date.now() - new Date(time).getTime())
    let days = timeDifference / 1000 / 60 / 60 / 24
    let hours = timeDifference / 1000 / 60 / 60 - (24 * Math.floor(days))

    // 一天内 不满24小时
    if (timeDifference < 3600000) {
      timeDifference = 3600000
    }
    if (timeDifference >= 3600000 && timeDifference < 86400000) {
      return Math.floor(hours) < 1 ? 1 + '小时前' : Math.floor(hours) + '小时前'
    }

    // 大于24小时
    // const twentyDays = 86400000 * 20
    if (timeDifference >= 86400000) {
      return Math.floor(days) < 1 ? 1 + '天前' : Math.floor(days) + '天前'
    }

    return ''
  }
  // handBack(){
  //   const pages = getCurrentPages();
  //   if (pages.length <= 1) {
  //     wx.reLaunch({
  //       url: `/pages/index/index`
  //     })
  //   } else {
  //     wx.navigateBack();
  //   }
  // },
});