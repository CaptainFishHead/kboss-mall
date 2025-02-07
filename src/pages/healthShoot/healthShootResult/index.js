import {
  checkRecord
} from "../models/healthShootModel";
import {
  hideToast,
  showToast,
  showLoadingToast
} from "@components/toast/index";
import { track, TrackEventName } from "@utils/sa"

Page({
  data: {
    healthColors: "#149598",
    endColor: "#F87624",
    detectTime: "", // 检测日期
    detectScore: 0, // 当次得分
    exceedsPercent: 0, // 超越用户百分百
    indicatorList: [], // 指标概况列表
    detailList: [], // 详细数据列表
  },

  onLoad(options) {
    if(!options.type){
      track(TrackEventName.Boss_HealthBat, { is_success: 1 })
    }
    this.getHealth()
  },
  //获取报告详情信息
  getHealth(params) {
    showLoadingToast()
    checkRecord(params)
      .then(({ result }) => {
        let { metricsOverview, metricsDetail } = result
        function extractSonIndexList(data) {
          let newArray = [];
          data.forEach(items => {
            if (items.sonIndexList && items.sonIndexList.length > 0) {
              items.sonIndexList.forEach(item => {
                item.parentIndexId = items.indexId
                item.indexRange = JSON.parse(item.indexRange);
              });
              newArray.push(...items.sonIndexList);
            }
          });
          return newArray;
        }
        this.setData({
          detectTime: result.detectTime || '',
          detectScore: result.detectScore || 0,
          exceedsPercent: result.exceedsPercent || 0,
          indicatorList: extractSonIndexList(metricsOverview) || [],
          detailList: extractSonIndexList(metricsDetail) || [],
        });
        if (result.detectScore > 70) {
          this.setData({
            endColor: this.data.healthColors,
          });
        }
        setTimeout(() => {
          hideToast();
        }, 1000);
      })
      .catch(err => {
        showToast({
          title: err.msg,
          type: TOAST_TYPE.WARNING,
        });
      });
  },

  goBack() {
    wx.redirectTo({
      url: '/pages/healthShoot/index'
    })
  },

});