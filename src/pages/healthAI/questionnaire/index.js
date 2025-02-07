import { wxFuncToPromise } from '@utils/wxUtils';
import {
  generateHealthAIReport,
  healthAIQuestionsAnalysis,
  questionnaireSave,
  jkyy_channel
} from '../models/healthAIModel';
import { hideToast, showToast } from '@components/toast/index';
import { JKYY_BIZ_TYPE, JKYY_APP_ID, JKYY_API_KEY, TOAST_TYPE } from '@const/index';
import { getLocalUser } from '@models/userModel';
import { track, TrackEventName } from '@utils/sa';
import { isArrayContained, deepClone, isArray } from '@utils/index';
// import dataJSON from './data.js';

Page({
  data: {
    apiKey: JKYY_API_KEY,
    appId: JKYY_APP_ID,
    bizType: JKYY_BIZ_TYPE,
    accessToken: '',
    currentTestNum: 0,
    questionCount: 0,
    currentTestNewNum: 0,
    skipQsCodes: [],
    skipSubQsCodes: [],
    currentQsItem: {},
    mustQuestions: [],
    questionnaireItemsAll: [],
    finishedStatus: false
  },
  // 获取进度条总宽度
  onReady: function () {
    const query = wx.createSelectorQuery();
    query.select('#quesProgress')
      .boundingClientRect(res => {
        let progreeWidth = res.width;
        this.setData({ progreeWidth: progreeWidth });
      })
      .exec();
  },
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('questionnaireData', data => {
      console.log('页面传递参数', data);
      const {
        questionnaireData: { questionCount, questionnaireItems = [] },
        healthProblemsItem = {},
        accessToken
      } = data || {};
      questionnaireItems.forEach(item => {
        item.required = item.question.required;
        item.answerStatus = false;
        item.question.questionContentName = isArray(
          item.question.questionContent || item.question.questionContents
        );
      });
      this.setData({
        questionnaireItemsAll: deepClone(questionnaireItems),
        questionCount,
        healthProblemsItem,
        accessToken,
        currentQsItem: questionnaireItems[0],
        mustQuestions: questionnaireItems
      });
    });
  },
  // 触发选项作答
  handleEmit(data) {
    this.setData(
      {
        currentQsItem: {
          ...this.data.currentQsItem,
          userOptionValues: data.detail.userOptionValues,
          userOptionKeys: data.detail.userOptionKeys,
          answerStatus: data.detail.answerStatus
        }
      }, () => {
        //有确定按钮的题目
        switch (data.detail.questionType) {
          case '4': // 生日题
          case '5': // 单项数字题
          case '6': // 多项数字题
          case '7': // BMI题
            this.handleTestNext();
            break;
          default:
            break;
        }
      }
    );
  },
  //不是必答题可以直接条跳过题目
  handleSkipCurrQs() {
    this.setData(
      {
        currentQsItem: {
          ...this.data.currentQsItem,
          userOptionValues: [],
          userOptionKeys: [],
          answerStatus: false
        }
      }, () => {
        this.handleTestNext({ isSkpiQs: true });
      }
    );
  },
  // 上一题
  handleTestPrev() {
    if (this.data.currentTestNum !== 0) {
      const curQsIndex = this.data.mustQuestions.findIndex(quest => {
        return quest.questionId === this.data.currentQsItem.questionId;
      });
      const currentQsItemByAll =
        this.data.questionnaireItemsAll.find(
          aItem => aItem.questionId === this.data.currentQsItem.questionId
        ) || {};
      this.data.mustQuestions.forEach(mQsItem => {
        if (currentQsItemByAll.questionId === mQsItem.questionId) {
          mQsItem.question.options = currentQsItemByAll.question.options;
        }
      });
      const isLastQs = curQsIndex === this.data.mustQuestions.length - 1;
      const isFinished  =isLastQs && this.data.finishedStatus
      this.setData({
        currentTestNum: isFinished ? curQsIndex : curQsIndex - 1,
        currentQsItem: isFinished ? this.data.mustQuestions[curQsIndex] : this.data.mustQuestions[curQsIndex - 1],
        finishedStatus: false
      });
    }
  },
  // 下一题
  handleTestNext({ isSkpiQs } = { isSkpiQs: false }) {
    const { answerStatus, userOptionValues, required } = this.data.currentQsItem;
    if (
      !isSkpiQs &&
      !answerStatus &&
      (!userOptionValues || (userOptionValues && userOptionValues.length <= 0))
    ) {
      showToast({
        title: '当前题目未作答 无法前往下一道',
        type: TOAST_TYPE.WARNING
      });
      return;
    }
    let allQuestionsList = this.data.questionnaireItemsAll;
    let mustQuestionsList = JSON.parse(JSON.stringify(this.data.mustQuestions));
    /**1.汇总当前题所回答的结果和答题状态*/
    let curQsIndex = mustQuestionsList.findIndex(
      quest => this.data.currentQsItem.questionId === quest.questionId
    );
    let currOptionObj = this.getCurrOptionValue(this.data.currentQsItem);
    mustQuestionsList[curQsIndex].userOptionValues = currOptionObj.userOptionValues || null;
    mustQuestionsList[curQsIndex].userOptionKeys = currOptionObj.userOptionKeys || null;
    mustQuestionsList[curQsIndex].answerStatus = currOptionObj.answerStatus;
    mustQuestionsList[curQsIndex].conditions = currOptionObj.conditions || null;
    /** 2.根据条件过滤选项(单选多选)*/
    const mConditionValueList = [];
    mustQuestionsList.forEach(mQs => {
      if (mQs.conditions) {
        mConditionValueList.push(...mQs.conditions);
      }
    });
    let userOptionMaps = {};
    mustQuestionsList.forEach(mQsItem => {
      let skipQsCodeBySelectors = [];
      let options = mQsItem.question.options || [];
      if (mQsItem.questionType === '1' || mQsItem.questionType === '2') {
        options = options.filter(opt => {
          if (opt.hideSelectors) {
            const isHideSelector = opt.hideSelectors.find(hSelect => {
              return isArrayContained(mConditionValueList, hSelect.conditions);
            });
            return !isHideSelector;
          } else if (opt.showSelectors) {
            const isShowSelector = opt.showSelectors.find(sSelect => {
              return isArrayContained(mConditionValueList, sSelect.conditions);
            });
            return isShowSelector;
          } else {
            return true;
          }
        });
        if (options.length <= 1) {
          skipQsCodeBySelectors = [
            { questionId: mQsItem.questionId, questionCode: mQsItem.questionCode }
          ];
        }
        mQsItem.skipQsCodeBySelectors = skipQsCodeBySelectors;
      }
      if (!userOptionMaps[mQsItem.questionId]) {
        userOptionMaps[mQsItem.questionId] = {
          userOptionValues: mQsItem.userOptionValues || [],
          userOptionKeys: mQsItem.userOptionKeys || [],
          answerStatus: mQsItem.answerStatus,
          skipQsCodeBySelectors,
          options
        };
      }
    });
    /**
     * 3.根据条件过滤大题
     */
    const { skipQsCodes, skipSubQsCodes } = this.getSkipQuestions(
      this.data.currentQsItem,
      mustQuestionsList
    );
    //更新实际题目
    const __mustQuestions = allQuestionsList.filter(quest => {
      return (
        !skipQsCodes.includes(quest.questionCode) && !skipSubQsCodes.includes(quest.subQuestionCode)
      );
    });
    const mQsCodes = [];
    // 重新渲染数据
    __mustQuestions.forEach(__mQs => {
      mQsCodes.push(__mQs.questionCode);
      if (userOptionMaps[__mQs.questionId]) {
        __mQs.userOptionValues = userOptionMaps[__mQs.questionId].userOptionValues || [];
        __mQs.userOptionKeys = userOptionMaps[__mQs.questionId].userOptionKeys || [];
        __mQs.answerStatus = userOptionMaps[__mQs.questionId].answerStatus || false;
        __mQs.skipQsCodeBySelectors = userOptionMaps[__mQs.questionId].skipQsCodeBySelectors;
        __mQs.question.options = userOptionMaps[__mQs.questionId].options;
      }
    });
    if (__mustQuestions[curQsIndex + 1]) {
      this.setData({
        mustQuestions: __mustQuestions,
        currentQsItem: __mustQuestions[curQsIndex + 1],
        questionCount: [...new Set(mQsCodes)].length,
        currentTestNum: curQsIndex + 1
      });
    } else {
      this.setData({
        mustQuestions: __mustQuestions,
        currentQsItem: __mustQuestions[curQsIndex],
        questionCount: [...new Set(mQsCodes)].length,
        currentTestNum: curQsIndex,
        // 因为是最后一道题并且已经回答完成了，所以设置展示封底状态
        finishedStatus: true
      });
    }
  },
  // 整理当前题答案
  getCurrOptionValue(qsItem) {
    let userOptionValues = [];
    let userOptionKeys = [];
    let answerStatus = false;
    let optionItem = null;
    let conditions = [];
    let conditionValue = '';
    if (!qsItem.userOptionValues) return {};
    switch (qsItem.questionType) {
      case '1': // 单选题
      case '3': // 性别题
      case '7': // BMI题
      case '5': // 单项数字题
        userOptionValues = qsItem.userOptionValues;
        userOptionKeys = qsItem.userOptionKeys;
        answerStatus = qsItem.answerStatus;
        optionItem = qsItem.question.options.find(
          opt => opt.optionValue == qsItem.userOptionValues.join()
        );
        conditionValue = optionItem ? optionItem.conditionValue : '';
        conditions = [
          {
            questionCode: qsItem.questionCode,
            conditionValue
          }
        ];
        break;
      case '4': // 出生日期题
        userOptionValues = qsItem.userOptionValues;
        userOptionKeys = qsItem.userOptionKeys;
        answerStatus = qsItem.answerStatus;
        optionItem = this.filterDateRange(qsItem.userOptionValues, qsItem.question.optionNodes);
        conditionValue =
          optionItem && optionItem.length > 0
            ? optionItem[0].conditionValue || ''
            : optionItem.conditionValue || '';
        conditions = [
          {
            questionCode: qsItem.questionCode,
            conditionValue
          }
        ];
        break;
      case '2': // 多选题
        userOptionValues = qsItem.userOptionValues; // [1,3,4]
        answerStatus = qsItem.answerStatus;
        const optionListData = qsItem.question.options.filter((ops, index) =>
          qsItem.userOptionValues.includes(ops.optionValue)
        );
        conditions = optionListData.map(opt => ({
          questionCode: qsItem.questionCode,
          conditionValue: opt.conditionValue
        }));
        break;
      case '6': // 多项数字题
        userOptionValues = qsItem.userOptionValues; // [1,3,4]
        userOptionKeys = qsItem.userOptionKeys;
        answerStatus = qsItem.answerStatus;
        const optionList = qsItem.question.optionNodes.filter(ops =>
          qsItem.userOptionValues.includes(ops.startValue)
        );
        conditions = optionList.map(opt => ({
          questionCode: qsItem.questionCode,
          conditionValue: opt.conditionValue
        }));
        break;
      default:
        break;
    }
    return {
      questionId: qsItem.questionId,
      questionCode: qsItem.questionCode,
      userOptionValues,
      userOptionKeys,
      answerStatus,
      conditions
    };
  },

  // 逆向推算出生日期题/单项数字题范围数据
  filterDateRange(dateValue, optionNodes) {
    const myDate = new Date();
    const toYears = myDate.getFullYear();
    const dateFormat = dateValue.map(item => item.split('-'))[0];
    const when = toYears - dateFormat[0];
    return optionNodes.filter(item => item.startValue <= when && when <= item.endValue);
  },
  /**隐藏题目*/
  getSkipQuestions(curQsItem, mustQuestions) {
    let skipQsCodeBySelectors = [];
    let skipQsCodesNew = [];
    let skipSubQsCodesNew = [];
    let mConditionList = mustQuestions.map(mQs => {
      if (mQs.skipQsCodeBySelectors && mQs.skipQsCodeBySelectors.length) {
        skipQsCodeBySelectors = [...skipQsCodeBySelectors, ...mQs.skipQsCodeBySelectors];
      }
      return {
        questionCode: mQs.questionCode,
        conditions: mQs.conditions
      };
    });
    const mConditionValueList = mConditionList.reduce((total, item) => {
      total = total.concat(item.conditions);
      return total;
    }, []);
    //单选/多选-依据子选项条件判断的隐藏题目集合
    skipQsCodesNew = [...skipQsCodeBySelectors];
    //如果没有下一题选择器，仍然保留前面题目答案的隐藏题目集合
    if (curQsItem.nextSelectors) {
      let _skipQuestionCodes = [];
      let _skipSubQuestionCodes = [];
      const conditionItem = curQsItem.nextSelectors.find(condItem => {
        return isArrayContained(mConditionValueList, condItem.conditions);
      });
      if (conditionItem) {
        //存在隐藏题目条件
        const { skipQuestionCodes, skipSubQuestionCodes } = conditionItem || {};
        _skipQuestionCodes = skipQuestionCodes || [];
        _skipSubQuestionCodes = skipSubQuestionCodes || [];

        const __skipQuestionCodes = _skipQuestionCodes.map(sQsCode => ({
          questionId: curQsItem.questionId,
          questionCode: sQsCode
        }));
        const __skipSubQuestionCodes = _skipSubQuestionCodes.map(sSubQsCode => ({
          questionId: curQsItem.questionId,
          questionCode: sSubQsCode
        }));
        skipQsCodesNew = [...skipQsCodesNew, ...(__skipQuestionCodes || [])];
        skipSubQsCodesNew = [...skipSubQsCodesNew, ...(__skipSubQuestionCodes || [])];
      } else {
        //不存在隐藏题目
        _skipQuestionCodes = [{ questionId: curQsItem.questionId, questionCode: 'noQsCode' }];
        _skipSubQuestionCodes = [{ questionId: curQsItem.questionId, questionCode: 'noSubQsCode' }];
        skipQsCodesNew = [...skipQsCodesNew, ...(_skipQuestionCodes || [])];
        skipSubQsCodesNew = [...skipSubQsCodesNew, ...(_skipSubQuestionCodes || [])];
      }
    }
    const { qsCodeObjList, qsCodes } = this.fomatQsCodes(skipQsCodesNew, this.data.skipQsCodes);
    const { qsCodeObjList: subQsCodeObjList, qsCodes: subQsCodes } = this.fomatQsCodes(
      skipSubQsCodesNew,
      this.data.skipSubQsCodes
    );
    this.setData({
      skipQsCodes: qsCodeObjList,
      skipSubQsCodes: subQsCodeObjList
    });
    return {
      skipQsCodes: qsCodes,
      skipSubQsCodes: subQsCodes
    };
  },
  fomatQsCodes(newSkipQsCodeList, oldSkipQsCodeList) {
    const getSkipQsCodesMap = (qsCodeList, type) => {
      const _skipQsCodesMap = {};
      qsCodeList.forEach(item => {
        if (!_skipQsCodesMap[item.questionId]) {
          _skipQsCodesMap[item.questionId] =
            type === 'new' ? [item.questionCode] : item.questionCodes;
        } else {
          if (type === 'new') {
            _skipQsCodesMap[item.questionId].push(item.questionCode);
          } else {
            _skipQsCodesMap[item.questionId].push(...item.questionCodes);
          }
        }
      });
      return _skipQsCodesMap;
    };
    const skipQsCodesMapNew = getSkipQsCodesMap(newSkipQsCodeList, 'new');
    const skipQsCodesMapOld = getSkipQsCodesMap(oldSkipQsCodeList, 'old');
    for (let key in skipQsCodesMapNew) {
      skipQsCodesMapOld[key] = skipQsCodesMapNew[key];
    }
    const arrayOfObjects = Object.entries(skipQsCodesMapOld).map(([questionId, questionCodes]) => ({
      questionId,
      questionCodes
    }));
    const skipQsCodesNew1 = arrayOfObjects.reduce((totalCodes, codeItem) => {
      totalCodes = totalCodes.concat(codeItem.questionCodes);
      return totalCodes;
    }, []);
    const skipQsCodesNew2 = [...new Set(skipQsCodesNew1)];
    const noQsCodeIndex = skipQsCodesNew2.findIndex(code => code === 'noQsCode');
    if (noQsCodeIndex > -1) {
      skipQsCodesNew2.splice(noQsCodeIndex, 1);
    }
    return {
      qsCodeObjList: arrayOfObjects,
      qsCodes: skipQsCodesNew2
    };
  },
  // 完成提交
  async handleFinished() {
    const userOptions = this.data.mustQuestions.map(item=>{
      const {userOptionValues,questionCode,subQuestionCode=undefined} = item
      return {
        userOptionValues,
        questionCode,
        subQuestionCode,
      }
    })
    showToast({ type: TOAST_TYPE.LOADING });
    const {
      accessToken,
      healthProblemsItem: { type: mode, configId, name }
    } = this.data;
    const { userId } = getLocalUser();
    const aParams = {accessToken, userId, mode, configId, userOptions};
    try {
      const { result: aResult } = await healthAIQuestionsAnalysis(aParams); //解析问卷
      const cParams = {
        accessToken,
        userId,
        mode,
        configId,
        channel: jkyy_channel,
        assessmentParams: aResult.assessmentParams
      };
      const { result: cResult } = await generateHealthAIReport(cParams); //生成报告
      //问卷答题上报后台
      const qParams = {
        data: this.data.mustQuestions,
        detectCode: configId,
        detectModelType: mode,
        detectTitle: name
      };
      const { result: qResult } = await questionnaireSave(qParams);
      let { type, code } = this.data.healthProblemsItem;
      wxFuncToPromise(`redirectTo`, {
        url: `/pages/healthAI/reportResults/index?itemId=${qResult.result}&reportId=${cResult.reportId}&routes=1&type=${type}&configId=${configId}&name=${name}&code=${code}`
      });
      hideToast();
    } catch (e) {
      hideToast();
    }
  },
  goBack() {
    const currItem = this.data.currentQsItem|| {};
    let questionContentName = '';
    if (currItem && currItem.question && currItem.question.questionContentName) {
      questionContentName = currItem.question.questionContentName;
    }
    track(TrackEventName.Boss_HealthTesting, {
      is_success: 0,
      fail_reason: questionContentName
    });
    // wx.navigateBack()
  }
});
