import { getHealthAIReport, reportSave } from "../models/healthAIModel";
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE } from "@const/index";
import { reqCounselor } from "@models/healthWaiter";
import { getLocalUser } from "@models/userModel";
import { track, TrackEventName } from "@utils/sa";

Page({
  data: {
    colors: '#09BDAC', // 评分颜色
    reportObj: {},
    healthProblemsItem: {},
    itemId: '',
    reportId: '',
    waiterData: {}, //健康管家
    routes: '', // 1答题进入 2历史记录进入
  },
  onLoad: function (options) {
    let { itemId, reportId, routes, type, configId, name, code } = options
    let that = this
    if (options.routes == '1') {
      that.setData({
        itemId,
        reportId,
        routes,
        healthProblemsItem: { type, configId, name, code }
      });
      // 获取测评报告
      that.getHealthAIReportFun()
    } else {
      const eventChannel = that.getOpenerEventChannel()
      eventChannel.on('reportResult', data => {
        console.log('页面传递参数', data);
        const { healthProblemsItem, itemId, reportId, routes } = data || {};
        that.setData({ healthProblemsItem, itemId, reportId, routes });
        that.onloadFun(data.healthProblemsItem)
      })
    }
    //todo 正式调流程 放开
  },
  onShow:function () {
    // 获取健康管家
    this.getDetail()
  },
  // 获取健康医生信息
  getDetail() {
    reqCounselor({ str: 0 }).then(({ result }) => {
      this.setData({ waiterData: result })
    }).catch(err => {
      showToast({
        title: err.msg || "获取信息失败",
        type: TOAST_TYPE.WARNING,
        duration: 2000,
      });
    });
  },
  // 点击咨询专属顾问
  advatar() {
    let str = this.data.waiterData && this.data.waiterData.isBind ? 0 : 1
    wx.navigateTo({
      url: '/pages/healthArchives/healthWaiter/index?str=' + str,
    })
  },
  riskLevelFun(level, num) {
    // num 1 为疾病分析  2为风险因素分析
    //疾病分析等级 -1 已确诊 1 低风险 2 中风险 3 高风险 4 极高风险
    // 风险因素等级 0,1 低风险  2，3 中风险   4,5 高风险
    let obj = {
      "-1": {
        "name": "已确诊",
        "classname": "diagnosis"
      },
      "1": {
        "name": "低风险",
        "classname": "lowrisk"
      },
      "2": {
        "name": "中风险",
        "classname": "highrisk"
      },
      "3": {
        "name": "高风险",
        "classname": "highrisk"
      },
      "4": {
        "name": "极高风险",
        "classname": "extremelyrisk"
      },
    }
    let obj1 = {}
    if (level <= 1) {
      obj1 = {
        "name": "低风险",
        "classname": "lowrisk"
      }
    } else if (level <= 3) {
      obj1 = {
        "name": "中风险",
        "classname": "highrisk"
      }
    } else if (level <= 5) {
      obj1 = {
        "name": "高风险",
        "classname": "extremelyrisk"
      }
    }
    if (num == 1) {
      return obj[level]
    } else {
      return obj1
    }

  },
  //报告结果，上报后台结果
  async getHealthAIReportFun() {
    let that = this
    showToast({ type: TOAST_TYPE.LOADING })
    try {
      const { userId } = getLocalUser()
      const { itemId, reportId, healthProblemsItem: { type, configId, name } } = this.data
      const gParams = { userId, reportId }
      const { result: gResult } = await getHealthAIReport(gParams) //获取报告结果
      this.onloadFun(gResult)
      const reportSaveParams = {
        data: gResult.assessmentReport,
        detectCode: configId,
        detectModelType: type,
        detectTitle: name,
        itemId,//上报后台记录ID
      }
      //gResult 报告结果数据用这里的
      await reportSave(reportSaveParams) //上传报告给后台
      track(TrackEventName.Boss_HealthTesting, { is_success: 1 });
      hideToast()
    } catch (err) {
      console.log(err)
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }
  },
  // 判断逻辑封装
  onloadFun(data) {
    let that = this
    let obj = data.assessmentReport ? data.assessmentReport : JSON.parse(data.detectReportResult)
    // 09BDAC  100-70分     FF8F30   69-50     FF5930   49-0
    // [0,60):较差
    //   [60,80):良好
    //   [80,100]:优秀
    if (obj) {
      if (obj.report.healthIndex < 60) {
        this.setData({ colors: "#FF5930" })
      } else if (obj.report.healthIndex < 80) {
        this.setData({ colors: "#FF8F30" })
      }

      // 疾病因素 级别判断
      obj.report.diseasesAnalysis.forEach(item => {
        item.riskLevelName = that.riskLevelFun(item.riskLevel, 1).name
        item.classname = that.riskLevelFun(item.riskLevel, 1).classname
      })
      // 风险因素 级别判断
      obj.report.riskFactorAnalysis.forEach(item => {
        item.riskLevelName = that.riskLevelFun(item.riskFactorLevel, 2).name
        item.classname = that.riskLevelFun(item.riskFactorLevel, 2).classname
      })
    }

    this.setData({
      reportObj: obj
    })
  },
  goBack() {
    if (this.data.routes == '1') {
      wx.navigateBack(2)
    }
  }
});