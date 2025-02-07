
import { wxFuncToPromise } from "@utils/wxUtils";
import { getReportList } from "./models/healthAIModel";
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, HEALTH_INFO_BUSINESS_PAGE } from "@const/index";
import {
  interceptionPrivacyProtocol,
  parsePageOnLoadOptions,
  openPage,
  urlAppendQuery,
  getLoggedUser,
  isLogged
} from "@utils/index";
const app = getApp()
Page({
  data: {
    isLogged: isLogged(),
    healthProblemsList: [],
    heaName: '健康评估',
    background:"#FFFFFF",
    istitle:false
  },
  onLoad: function (options) {
    // 获取列表
    this.getReportListFun()

  },
  onShow() {
  },
  // 评估列表
  getReportListFun() {
    showToast({ type: TOAST_TYPE.LOADING })
    getReportList({
      page: 1,
      pageFlag: true,
      rows: 10
    }).then(({ result }) => {
      hideToast()
      this.setData({
        healthProblemsList: result.list
      })
    }).catch((err) => {
      console.log(err, 'err')
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    })
  },
  // 点击进入历史记录
  onclickHistory() {
    // 判断登录状态
    if (isLogged()) {
      wx.navigateTo({
        url: '/pages/healthAI/history/index',
      })
    } else {
      this.selectComponent("#authHealthCoponents").openAuthorize(true);
    }

  },
  // 未登录状态下点击登录按钮
  onclickshare(){
    this.selectComponent("#authHealthCoponents").openAuthorize(true);
  },
  onReceive(){
    this.setData({
      isLogged: isLogged()
    })
  },
  //跳转到评估开始页
  toQuestionsStart(e) {
    // 判断登录状态
    if (isLogged()) {
      let item = e.currentTarget.dataset.item
      wxFuncToPromise(`navigateTo`, {
        url: `/pages/healthAI/questionStart/index`,
      }).then(({ eventChannel }) => {
        eventChannel.emit(`healthProblems`, {
          healthProblemsItem: item
        })
      })
    } else {
      this.selectComponent("#authHealthCoponents").openAuthorize(true);
    }

  },
  // 分享好友
  onShareAppMessage() {
    const { nickName } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    return {
      title: `${nickName} 邀请您一起关注健康`, //分享的标题
      imageUrl: "https://static.tojoyshop.com/images/wxapp-boss/assessment/shareTitle.png", //分享的封面图路径
      path: '/pages/healthAI/index'  //被分享者打开的页面地址，可携带参数如："/pages/success/success?id=5"
    }
  },
  // 
  goBack(){
    let pages = getCurrentPages()
    console.log(pages, 'pages')
    if(pages[pages.length - 2]){
      //如果有上一页，就返回上一页
      wx.navigateBack({//返回
        delta: 1
      })
    }else{
      wx.switchTab({
        url: '/pages/index/index',
      })
     } 
  },
  pageScrolling(e){
    this.setData({
      istitle: e.detail.scrollTop >= 115
    })
  }
  
});