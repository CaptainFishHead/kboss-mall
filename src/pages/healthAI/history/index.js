import { wxFuncToPromise } from "@utils/wxUtils";
import { getReporthistoryList } from "../models/healthAIModel";
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, HEALTH_INFO_BUSINESS_PAGE } from "@const/index";
Page({
  data: {
    isshow:false, //是否展示暂无历史记录
    collectionData: {},
  },
  onLoad: function (options) {
    this.getReporthistoryListFun({page: 1})
  },
  // 历史评估列表
  getReporthistoryListFun(page) {
    showToast({ type: TOAST_TYPE.LOADING })
    getReporthistoryList({
      ...page,
      rows:10,
      pageFlag:true
    }).then(({result}) => {
      hideToast()
      // 分页合并数据
      if(result.currPage !== 1) {
        result.list = this.data.collectionData.list.concat(result.list);
      }
      result.list.forEach( item =>{
        console.log(item,"item")
        if(item.detectReportResult){
          item.healthReview = JSON.parse(item.detectReportResult).report.healthReview
        }else{
          item.healthReview = ''
        }
      })
      this.setData({
        isshow: !result.list.length,
        collectionData: result || {}
      });
    }).catch((err) => {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    })
  },
  // 详细报告
  onCLickDetail(e){
    let item = e.currentTarget.dataset.item
      wxFuncToPromise(`navigateTo`, {
        url: `/pages/healthAI/reportResults/index?routes=2`,
      }).then(({ eventChannel }) => {
        eventChannel.emit(`reportResult`, {
          healthProblemsItem: item,
          routes:'2'
        })
      })
  },
  // 测评列表
  onClicknavto(){
    wx.navigateBack()
  },
  // 滚动到底部 加载更多
  onReachBottom () {
    const {totalPage, currPage} = this.data.collectionData;
    if(currPage < totalPage){
      this.getReporthistoryListFun({
        page: currPage+1
      })
    }
  },
});