import { queryRecuperateList, queryRecuperateInfo } from "@models/healthArchivesModel"
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, } from "@const/index";
import { getImgBoxSize,isLogged } from '@utils/index'

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    showEmpty: false,
    bgRgb: '255, 255, 255',
    naviTransparent: 0,
    plans: [],
    currentPlan: null,
    planDetails: {},
    scrollLeft: 0,
    isBind: 0 ,//是否绑定了健康顾问 默认为0
    isLogged: true,
    programmeId:''
  },

  async getConditioningPlanList(){
    try{
      showToast({ type: TOAST_TYPE.LOADING })
      const { result: plans } = await queryRecuperateList()
      const showEmpty = !plans.length
      const currentPlan = plans.find(plan => plan.programmeId === this.data.programmeId) || plans[0]
      this.setData({ plans, showEmpty, currentPlan })
      await this.getConditioningPlanDetails()
      hideToast()
    } catch (err){
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }
  },

  async getConditioningPlanDetails(){
    const { currentPlan } = this.data
    try{
      showToast({ type: TOAST_TYPE.LOADING })
      const { result: planDetails } = await queryRecuperateInfo({ str: currentPlan.programmeId})
      this.setData({ planDetails })
    }catch(err){
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }
    hideToast()
  },

  async handleCurrentPlan(e){
    const { current: currentPlan } = e.detail
    this.setData({ currentPlan })
    await this.getConditioningPlanDetails()
  },
  async handlerScrollLeft(){
    const  planCards = await getImgBoxSize('.plan-tab-card', this)
    const { plans, currentPlan } = this.data
    const findIndex = plans.findIndex(plan => plan.programmeId === currentPlan.programmeId)
    if(findIndex === -1) return
    const { right, width }  = planCards[findIndex]
    this.setData({ scrollLeft: right - width })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { programmeId, str } = options
    this.setData({
      isLogged:isLogged(),//获取用户token
      isBind:str,
      programmeId:programmeId
    })
  },

  async onShow() {
    if (isLogged()) {
      showToast({type: TOAST_TYPE.LOADING})
      await this.getConditioningPlanList()
      this.handlerScrollLeft()
    }
  },
  bindSuccess(e) {
    if (isLogged()) {
      this.setData({isLogged: true});
      showToast({type: TOAST_TYPE.LOADING})
      this.getConditioningPlanList()
      this.handlerScrollLeft()
    }
  },
  bindFail(err) {
    this.setData({isLogged: false});
    showToast({type: TOAST_TYPE.WARNING, title: err.msg || '网络请求错误'})
  },
  
  goBack() {
    wx.switchTab({
      url: `/pages/mine/index`,
    })
  },

  navigateToWaiter(e){
    wx.navigateTo({
      url:`/pages/healthArchives/healthWaiter/index?str=${this.data.isBind}` 
    })
  },

  onPageScroll(e) {
    const { scrollTop } = e
    const naviTransparent = scrollTop > 10 ? 1 : 0
    this.setData({ naviTransparent })
  }
})