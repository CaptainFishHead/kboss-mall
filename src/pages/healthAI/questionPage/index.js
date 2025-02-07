import {questionData} from "./data.js"
import {isArrayContained} from "@utils/index";
import {
  generateHealthAIReport,
  getHealthAIReport,
  healthAIQuestionsAnalysis, questionnaireSave,
  reportSave
} from "../models/healthAIModel";
import {hideToast, showToast} from "@components/toast/index";
import {STORAGE_JKYY_KEY, JKYY_BIZ_TYPE, JKYY_APP_ID, JKYY_API_KEY, TOAST_TYPE} from "@const/index";
import {getLocalUser} from "@models/userModel";

Page({
  data: {
    apiKey: JKYY_API_KEY,
    appId: JKYY_APP_ID,
    bizType: JKYY_BIZ_TYPE,
    accessToken: '',
    healthProblemsItem: {},
    allQuestions: questionData.questionnaire,//全部题目集合
    mustQuestions: [],//需要答题集合
    skipQuestionsList: [//跳过题目集合
      {
        qsCode: '',
        skipQsCodes: [],
        skipSubQsCodes: [],
      }
    ],
    currentQsItem: {},//当前在答题目
    userOptions: [],//选择题目答案集合 {questionCode,userOptionValues}
    // questionCount: 0, //题目数量
    // questionnaireItems: [], //题目数组
  },
  onLoad: function (options) {
    /* const eventChannel = this.getOpenerEventChannel()
     //获取上一页面通过eventChannel传送到当前页面的数据
     eventChannel.on('questionnaireData', data => {
       console.log('页面传递参数', data);
       const {questionnaireData: {questionCount, questionnaireItems}} = data || {};
       this.setData({questionCount, questionnaireItems});
     })*/
  },
  onShow() {
    this.setData({
      currentQsItem: this.data.allQuestions[0],
      mustQuestions: this.data.allQuestions,
    })
  },
  handleEmit(qsItem){
    /*todo
    * userOptionValues ['1']
    * questionId
    * */
    // this.data.qsItem
    this.setData({
      qsItem
    })

  },
  confim(){
    this.handleNext()
  },
  //下一步
  handleNext(e) {
    //先整理好跳题集合，题目会影响总题目数量，子题不会影响总题目数量
    //获取选择的答案，跟 下一题选择器条件值 匹配 获取的 跳过题目集合 code ，以及子题目集合code
    //假如 跳题集合数组里与下一题选择器条件 处理去重问题code
    // 然后 根据跳题集合 和全题集合 重新洗牌 再整理出来 需答题集合
    // 最后在 需答题集合 和当前问题id 映射 找到 下一题对象
    //todo 每次重新洗牌
    //获取到实际答题的 选择器条件值集合
    let qsItem = this.data.qsItem

    const allQuestions = this.data.allQuestions //全部答题集合
    const mustQuestions = this.data.mustQuestions //实际答题集合
    //获取到当前题目选择的答案 {questionCode,userOptionValues,conditionValue}
    const currOptionObj = this.getCurrOptionValue(qsItem)
    const curQsIndex = mustQuestions.findIndex((quest) => qsItem.questionId === quest.questionId)
    //跳题逻辑只会隐藏后面的题目，所以不影响当前题目，故可以使用当前下标
    mustQuestions[curQsIndex].userOptionValues = currOptionObj.userOptionValues //赋值答案
    mustQuestions[curQsIndex].conditions = currOptionObj.conditions //赋值选择器条件值
    
    //todo 根据前面选题答案-选择器条件值 - 更新后面 多选题/单选题 的 子选项显示/隐藏， 还需要更新 mustQuestions
    //todo 再根据子选项 的全显示：没有匹配任何选项时候，隐藏：只剩下一个子选项时候， 则隐藏该题目
    //todo 可以把 conditions 提前处理到 mustQuestions 里面
    //todo 如果下一题选择器 和 单选/多选题-隐藏选项 - 产生的隐藏题目
    const mConditionList = mustQuestions.map(mQs => {
      return {questionCode: mQs.questionCode, conditions: mQs.conditions}
    })

    const mConditionValueList = mConditionList.reduce((qsConditions, conItem)  => {
      return qsConditions.concat(conItem.conditions)
    }, []);

    const userOptionsMaps = {}
    mustQuestions.forEach(qsItem => {
      let skipQsCodeBySelectors = []
      let options = []
      if (qsItem.questionType === '1' || qsItem.questionType === '2') {
        options = qsItem.question.options.filter((opt) => {
          if (opt.hideSelectors) {
            const isHideSelector = opt.hideSelectors.find((hSelect) => {
              return isArrayContained(mConditionValueList, hSelect.conditions)
            })
            return !isHideSelector
          } else if (opt.showSelectors) {
            const isShowSelector = opt.showSelectors.find((showSelect) => {
              return isArrayContained(mConditionValueList, showSelect.conditions)
            })
            return isShowSelector
          } else {
            return true
          }
        })
        qsItem.question.options = options
        if (options.length <= 1) {
          skipQsCodeBySelectors = [qsItem.questionCode]
        }
        qsItem.skipQsCodeBySelectors = skipQsCodeBySelectors
      }
      /*
      * {questionCode:{
          userOptionValues: qsItem.userOptionValues || [],
          conditionValue: qsItem.conditionValue || [],
          skipQsCodeBySelectors,
          options
        } }
      * */
      if (!userOptionsMaps[qsItem.questionCode] && qsItem.userOptionValues) {
        userOptionsMaps[qsItem.questionCode] = {
          userOptionValues: qsItem.userOptionValues || [],
          conditionValue: qsItem.conditionValue || [],
          skipQsCodeBySelectors,
          options
        }
      }
    })
    
    const {skipQsCodes, skipSubQsCodes} = this.getSkipQuestions(qsItem, mustQuestions)
    //根据 全部题 和 跳题集合 获取 需要答题集合
    const __mustQuestions = allQuestions.filter(quest => {
      return !skipQsCodes.includes(quest.questionCode) && !skipSubQsCodes.includes(quest.subQuestionCode)
    })
    __mustQuestions.forEach(__mQs => {
      __mQs.userOptionValues = userOptionsMaps[__mQs.questionCode].userOptionValues
      __mQs.conditionValue = userOptionsMaps[__mQs.questionCode].conditionValue
      __mQs.skipQsCodeBySelectors = userOptionsMaps[__mQs.questionCode].skipQsCodeBySelectors
      __mQs.options = userOptionsMaps[__mQs.questionCode].options
      
    })

    this.setData({
      currentQsItem: __mustQuestions[curQsIndex + 1],
      mustQuestions: __mustQuestions
    })
  },
  //上一题
  handlePrve() {
    const {mustQuestions, currentQsItem} = this.data
    const curQsIndex = mustQuestions.findIndex((quest) => {
      currentQsItem.questionId === quest.questionId
    })
    const prveQsItem = mustQuestions[curQsIndex - 1]
    this.setData({
      currentQsItem: prveQsItem
    })
    //判断极限显示
  },
  //整理-隐藏题目集合
  getSkipQuestions(item, mustQuestions) {
    let skipQsCodes = this.data.skipQsCodes
    let skipSubQsCodes = this.data.skipSubQsCodes //跳过的子题目集合 ，不被计算到题目总数
    let skipQsCodeBySelectors = []
    
    const mConditionValueList = mustQuestions.map(mQs => {
      if (mQs.skipQsCodeBySelectors && mQs.skipQsCodeBySelectors.length) {
        skipQsCodeBySelectors = [...skipQsCodeBySelectors, ...mQs.skipQsCodeBySelectors]
      }
      return {questionCode: mQs.questionCode, conditionValue: mQs.conditionValue}
    })
    //单选/多选-依据子选项条件判断的隐藏题目集合
    skipQsCodes = [...skipQsCodes, ...skipQsCodeBySelectors]
    
    //conditions 可能是多个问题组合起来的选择题条件值 ，前面的问题 也要被计算到逻辑里面
    const conditionItem = item.nextSelectors.find((condItem) => (
        isArrayContained(mConditionValueList, condItem.conditions)
    ))
    if (conditionItem) {
      skipQsCodes = [...skipQsCodes, ...conditionItem.skipQuestionCodes]
      //子题目隐藏
      skipSubQsCodes = [...skipSubQsCodes, ...conditionItem.skipSubQuestionCodes]
    }
    skipQsCodes = [...new Set(skipQsCodes)]
    skipSubQsCodes = [...new Set(skipSubQsCodes)]
    
    this.setData({
      skipQsCodes,
      skipSubQsCodes,
    })
    return {
      skipQsCodes,
      skipSubQsCodes,
    }
  },
  //整理当前题目答案
  getCurrOptionValue(qsItem) {
    // 每道题类型不同，获取答案value 逻辑不同 ，多项数字题会比较复杂些，都是以数组格式 包含value
    //编写方法，抽象获取 答案value
    //todo 抽象组件value  父传子 userOptionValues- 整合正确的赋值给不同答题组件， 子传父-不同value 整合成userOptionValues
    let userOptionValues = []
    let conditions = []
    switch (qsItem.questionType) {
      case  1: //单选题
      case  3: //性别题
      case  4: //出生日期题
      case  5: //单项数字题
      case  7: //BMI题
      case  8: //日期题
        userOptionValues = qsItem.userOptionValues[0]
        const optionItem = qsItem.question.options.find(ops => ops.optionValue === qsItem.userOptionValues[0])
        const conditionValue = optionItem ? optionItem.conditionValue : ''
        conditions = [{questionCode: qsItem.questionCode, conditionValue}]
        break;
      case  2: //多选题
      case  6: //多项数字题
        userOptionValues = qsItem.userOptionValues // [1,3,4]
        const optionList = qsItem.question.options.filter(ops => qsItem.userOptionValues.includes(ops.optionValue))
        conditions = optionList.map(opt => ({
          questionCode: qsItem.questionCode,
          conditionValue: opt.conditionValue
        }))
        break;

      default:
        break;
    }
    return {
      questionId: qsItem.questionId,
      questionCode: qsItem.questionCode,
      userOptionValues,
      conditions
    }
  },
  async handleSubmit() {
    showToast({type: TOAST_TYPE.LOADING})
    const {accessToken, healthProblemsItem: {type, configId, title}} = this.data
    const {userId} = getLocalUser()
    
    const userOptions = []
    const mustQuestions = []
    const aParams = {accessToken, userId, mode: type, configId, userOptions}
    try {
      const {result: aResult} = await healthAIQuestionsAnalysis(aParams)//解析问卷
      const qParams = {data: mustQuestions, detectCode: configId, detectModelType: type, detectTitle: title}
      const cParams = {
        accessToken, userId, mode: type, configId,
        channel: "1", //生成报告渠道 1:测评问卷参数生成，2：未测评，对接方参数生成
        assessmentParams: aResult.assessmentParams
      }
      const {result: qResult} = await questionnaireSave(qParams) //问卷答题上报后台
      const {result: cResult} = await generateHealthAIReport(cParams) //生成报告
      const gParams = {userId, reportId: cResult.reportId}
      const {result: gResult} = await getHealthAIReport(gParams) //获取报告结果
      const reportSaveParams = {
        data: gResult.assessmentReport,
        detectCode: configId,
        detectModelType: type,
        detectTitle: title,
        itemId: qResult.itemId,
      }
      await reportSave(reportSaveParams) //上传报告给后台
      hideToast()
    } catch (e) {
      console.log(e)
      hideToast()
    }
  }
  
});