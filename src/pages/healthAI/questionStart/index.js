import {STORAGE_JKYY_KEY, JKYY_BIZ_TYPE, JKYY_APP_ID, JKYY_API_KEY, TOAST_TYPE} from "@const/index";
import {getJkyjToken, getHealthAIPermission} from "../models/healthAIModel";
import {getHealthAIQuestionnaire} from "../models/healthAIModel";
import {getLocalUser} from "@models/userModel";
import {wxFuncToPromise} from "@utils/wxUtils";
import {hideToast, showToast} from "@components/toast/index";

Page({
  data: {
    apiKey: JKYY_API_KEY,
    appId: JKYY_APP_ID,
    bizType: JKYY_BIZ_TYPE,
    healthProblemsItem: {},
    questionCount: [],
    questionnaireData: {},
    accessToken: ''
  },
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    // 获取上一页面通过eventChannel传送到当前页面的数据
    /* healthProblemsItem:{number,name,time,text,code,
       mode, 问卷模型 1:精简，2：精准
      configId 四种疾病对应 四个configId
     }*/
    eventChannel.on('healthProblems', data => {
      console.log('页面传递参数', data);
      const {healthProblemsItem} = data || {};
      this.setData({healthProblemsItem}, () => {
        this.getHealthAIQuestionnaire()
      });
    })
  },
  //获取问卷数据
  async getHealthAIQuestionnaire() {
    showToast({type: TOAST_TYPE.LOADING})
    const {userId} = getLocalUser()
    try {
      const {result: JkyjTokenResult} = await getJkyjToken()
      wx.setStorageSync(STORAGE_JKYY_KEY, {token: JkyjTokenResult.result})
      const {appId, bizType, healthProblemsItem: {configId, type}} = this.data
      const pParams = {appId, bizType, configId, userId}
      const {result: pResult} = await getHealthAIPermission(pParams)
      const gparams = {appId, userId, configId, accessToken: pResult.accessToken, mode: type}
      const {result: gResult} = await getHealthAIQuestionnaire(gparams)
      this.setData({questionnaireData: gResult.questionnaire, accessToken: pResult.accessToken})
      hideToast()
    } catch (err) {
      console.log(err)
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }
  },
  //开始答题
  hanleStart() {
    const {healthProblemsItem, questionnaireData, accessToken} = this.data
    wxFuncToPromise(`navigateTo`, {
      url: `/pages/healthAI/questionnaire/index`,
    }).then(({eventChannel}) => {
      eventChannel.emit(`questionnaireData`, {
        questionnaireData,
        healthProblemsItem,
        accessToken
      })
    })
  }
});