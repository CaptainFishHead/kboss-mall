// pages/chatai/index.js
import { showToast, hideToast } from "../../components/toast/index";
import { TOAST_TYPE, CHAT_TYPE, STORAGE_USER_FOR_KEY, CHAT_FROM_TYPE, CHA_CARD_TYPE } from "../../const/index";
import {
  getChatAIAnswer,
  getChatId,
  getQuestionList,
  getReArticleList,
  getReDoctorList
} from './models/chatAiModel'
import { queryProductById } from '@models/productModel'
import { isLogged } from "@utils/index";
import eventEmitter from "@utils/http/Events";
const plugin = requirePlugin("QCloudAIVoice");
const speechRecognizerManager = plugin.speechRecognizerManager();
const app = getApp()

Page({
  timer: null,
  timeout: null,
  scrollTopBottomTimer: null,
  answerCount: 0,
  isStopSrcoll: false,
  isGetCardApi: false,
  isTouching: false,
  startY: 0,
  isStopChat: false,
  isShowNetworkWeak: false,
  data: {
    CHAT_TYPE,
    questionText: "",
    dialogTips: "点击或长按下方，开始说话",
    voicessError: "请说话...",
    chatContentHeight: 0,
    chatMinHeight: 0,
    chatMaxHeight: 0,
    bottomViewId: 0,
    content: [],
    from: "",
    visible: false,
    isStart: false,
    closabled: true,
    isEdit: false,
    isLongPress: false,
    isReception: false,
    isLogged: false,
    scrollTop: 0,
    touristId: undefined,
    userId: undefined,
    conversationId: "",
    chatType: "dify_chat",
    disabled: false,
    inputHeight: 0,
    cardList: [],
    cardBtnInfo: null,
    bottomInputHeight: 145,
    rpxRatio: 1,
    labourIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_labour_icon.png",
    vicesIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_vices_icon.png",
    voicesIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_voices1_icon.png",
    closeIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_close_icon.png",
    newcomerIcon: "https://static.tojoyshop.com/images/wxapp-boss/home/newcomer.gif",
  },

  async onLoginEvent() {
    //检测是否登录（未登录就出登录半弹层）
    const { openLoginModal } = this.selectComponent(`#authorize`)
    const res = await openLoginModal()
    this.setData({
      isLogged: true,
      conversationId: "",
      userId: res?.detail?.result?.baseMember?.memberId || ""
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(ops) {
    console.log('ops：', JSON.stringify(ops));
    this.isShowNetworkWeak = false
    this.onNetWorkEvent()
    this.onNetworkWeakEvent()
    const { userId } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    let from = ops.from
    let question = ""
    if (from == CHAT_FROM_TYPE.HOME || from == CHAT_FROM_TYPE.HEALTH) {
      question = '获取我的指标解析'
    }
    let list = this.data.content
    showToast({ type: TOAST_TYPE.LOADING });
    await getQuestionList({ flowType: this.data.chatType }).then(res => {
      if (res && res.result && res.result.suggestedQuestions) {
        list.push({
          id: this.getTimestamp(),
          type: CHAT_TYPE.REQUESTIONS,
          questions: res.result.suggestedQuestions,
          timestamp: this.getTimestamp()
        })
      }
    }).finally(() => {
      hideToast();
    })
    this.setData({
      "from": from,
      "userId": userId,
      "touristId": this.getTimestamp(),
      "content": list,
      "isLogged": isLogged()
    })
    this.initChatHeight()
    this.initVoices()
    // 如果从首页（有指标情况）或者健康档案过来，主动聊天
    if (question) {
      this.onControlChat(question)
    }
  },

  goBack() {
    if (this.data.from === "tab") {
      wx.switchTab({
        url: '/pages/index/index',
      })
      return
    }
    wx.navigateBack()
  },

  /**
   * 弹出实时语音弹窗
   */
  showVoicesDialog() {
    if (!this.onNetWorkCheck()) {
      return
    }
    if (this.data.disabled) {
      this.showTips()
      return
    }
    //判断用户是否授权使用麦克风
    const show = () => {
      this.setData(
        {
          visible: true,
          questionText: "",
          dialogTips: "点击或长按下方，开始说话",
          voicessError: "请说话...",
          isReception: false,
          closabled: true
        }
      )
    }
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              show()
            },
            fail() {
              showToast({
                title: '温馨提示',
                desc: '没有麦克风权限',
                type: TOAST_TYPE.WARNING,
                duration: 1000
              })
            }
          })
        } else {
          show()
        }
      }
    })
  },

  /**
   * 收起实时语音弹窗
   */
  hideDialog() {
    let isStart = this.data.isStart
    if (isStart) {
      speechRecognizerManager.stop();
    }
    this.setData({
      visible: false,
      closabled: true,
      isStart: false,
      questionText: ""
    })
  },

  /**
   * 开始或者结束录音
   */
  onRecord(isLongPress) {
    let isStart = this.data.isStart
    this.setData({
      "isStart": !isStart,
      "isLongPress": isLongPress,
      "voicessError": "请说话..."
    })
    if (this.data.isStart) {
      speechRecognizerManager.start({
        signCallback: null,
        secretkey: 'QpOqDpT8hBZ9TYfTTRHwOxRJ1VmpkT5U',
        secretid: 'AKID18D7ucFk4RaXN1RfrreFdnlnk0wfHh9a',
        appid: '1314672876',
        duration: 10000,
        frameSize: 0.32,
        engine_model_type: '16k_zh',
      });
    } else {
      speechRecognizerManager.stop();
    }
  },

  /**
   * 编辑录音内容
   */
  editText() {
    let closabled = this.data.closabled
    let isStart = this.data.isStart
    if (isStart) {
      speechRecognizerManager.stop();
    }
    this.setData({
      "isEdit": !this.data.isEdit,
      "closabled": !closabled,
      "isStart": false
    })
  },

  /**
   * 关闭录音弹窗
   */
  closeDialog() {
    if (!this.data.isEdit) {
      return
    }
    setTimeout(() => {
      this.editText()
    }, 500)
  },

  /**
   * 录音编辑框获得焦点
   * @param {*} e 
   */
  getEditfocus(e) {
    if (this.data.isEdit) {
      return
    }
    this.editText()
  },

  getTimestamp() {
    return new Date().getTime();
  },

  /**
   * 发送消息
   */
  sendMess() {
    this.onControlChat(this.data.questionText)
  },

  onControlChat(q) {
    if (!this.onNetWorkCheck()) {
      return
    }
    if (this.data.disabled) {
      this.showTips()
      return
    }
    this.answerCount = 0
    this.isStopSrcoll = false
    this.isGetCardApi = false
    this.isStopChat = false
    this.isShowNetworkWeak = false
    if (!q) {
      showToast({
        title: '温馨提示',
        desc: '请输入您的问题哦',
        type: TOAST_TYPE.ERROR,
        duration: 1000
      })
      return
    }
    let list = this.data.content
    list.push({
      id: this.getTimestamp(),
      type: CHAT_TYPE.QUESTION,
      texstr: q,
      timestamp: this.getTimestamp()
    })
    list.push({
      id: this.getTimestamp(),
      type: CHAT_TYPE.LOADING,
      timestamp: this.getTimestamp()
    })
    this.setData({
      content: list,
      questionText: "",
      visible: false,
      disabled: true,
      cardBtnInfo: null,
      cardList: [],
      closabled: true
    })
    this.autoScroll()
    getChatId({
      "chatQuery": q,
      "touristId": this.data.touristId,
      "chatUserId": this.data.userId,
      "conversationId": this.data.conversationId,
      "flowType": this.data.chatType
    }).then(res => {
      if (res && res.result && res.result.chatHistoryId) {
        this.getAnswerData(res.result.chatHistoryId)
      } else {
        errorAnswer("非常抱歉！小康暂时无法回答您的问题")
      }
    }).catch(err => {
      errorAnswer("对不起！小康暂时无法回答您的问题")
    })

    const errorAnswer = (errorStr) => {
      let list = this.data.content
      list.push({
        id: this.getTimestamp(),
        type: CHAT_TYPE.ANSWER,
        texstr: errorStr,
        timestamp: this.getTimestamp(),
        btnInfo: null
      })
      this.setData({
        content: list,
        disabled: false
      })
    }
  },

  /**
   * 获取答案
   * @param {*} chatHistoryId 
   */
  getAnswerData(chatHistoryId) {
    if (this.isStopChat) {
      return
    }
    let that = this
    getChatAIAnswer({ chatHistoryId: chatHistoryId }).then(res => {
      if (res && res.result) {
        console.log(JSON.stringify(res.result))
        let { pullStatus, targeType, targetIdList, btn, text } = res.result
        this.onControlCard(targeType, targetIdList, btn, text)
        if (res.result.answerPart) {
          let list = this.data.content
          let lastInfo = list[list.length - 1]
          let answer = res.result.answerPart
          if (lastInfo.type != CHAT_TYPE.ANSWER) {
            list.push({
              id: this.getTimestamp(),
              type: CHAT_TYPE.ANSWER,
              texstr: answer,
              timestamp: this.getTimestamp(),
              btnInfo: null
            })
            this.setData({
              content: list,
              conversationId: res.result.conversationId
            })
            this.autoScroll()
            this.getAnswerData(chatHistoryId)
          } else {
            this.typewriterEffect(chatHistoryId, answer)
          }
        } else if (res.result.pullStatus != 1) {
          if (this.answerCount < 30) {
            this.answerCount++
            this.timeout = setTimeout(function () {
              that.getAnswerData(chatHistoryId)
            }, 2000)
          } else {
            this.answerCount = 0
            errorAnswer("非常抱歉！小康和大脑失去了联系，请稍后咨询")
          }
        } else {
          //当拉取结束后 通过返回的推荐ids拉取相应的推荐信息
          this.isGetCardApi = false
          let cardList = this.data.cardList
          let cardBtnInfo = this.data.cardBtnInfo
          let list = this.data.content
          if (cardList.length > 0) {
            let mergedArray = list.concat(cardList);
            this.setData({
              content: mergedArray,
              cardList: [],
            })
            this.onDelayScroll()
          } else if (cardBtnInfo) {
            let lastInfo = list[list.length - 1]
            lastInfo.btnInfo = cardBtnInfo
            this.setData({
              ['content[' + (list.length - 1) + ']']: lastInfo,
              cardBtnInfo: null,
            })
            this.onDelayScroll()
          } else {
            this.setData({
              disabled: false
            })
            this.autoScroll()
          }
        }
      } else {
        errorAnswer("对不起！小康和大脑失去了联系，请稍后咨询")
      }
    }).catch(err => {
      console.log("getAnswerData err:" + JSON.stringify(err))
      errorAnswer("非常对不起！小康和大脑失去了联系，请稍后咨询")
    })

    const errorAnswer = (errorStr) => {
      let list = this.data.content
      let lastInfo = list[list.length - 1]
      if (lastInfo.type != CHAT_TYPE.ANSWER) {
        list.push({
          id: this.getTimestamp(),
          type: CHAT_TYPE.ANSWER,
          texstr: errorStr,
          timestamp: this.getTimestamp(),
          btnInfo: null
        })
        this.setData({
          content: list,
          disabled: false
        })
      } else {
        this.setData({
          ['content[' + (list.length - 1) + '].texstr']: errorStr,
          disabled: false
        })
      }
      this.autoScroll()
    }
  },

  /**
   * 打字机动效
   * @param {*} chatHistoryId 
   * @param {*} text 
   */
  typewriterEffect(chatHistoryId, text) {
    let index = 0;
    let list = this.data.content
    let lastInfo = list[list.length - 1]
    this.timer = setInterval(() => {
      if (!this.isStopSrcoll && index < text.length) {
        this.setData({
          ['content[' + (list.length - 1) + '].texstr']: lastInfo.texstr + text[index],
        })
        index++;
        this.autoScroll()
      } else {
        clearInterval(this.timer);
        if (this.isStopSrcoll) {
          this.setData({
            ['content[' + (list.length - 1) + '].texstr']: lastInfo.texstr + text.slice(index),
          })
        }
        this.getAnswerData(chatHistoryId)
      }
    }, 100);
  },


  /**
   * 处理展示卡片信息
   * @param {*} targeType 
   * @param {*} targetIdList 
   */
  onControlCard(targeType, targetIdList, btnText, btnDesc) {
    if (this.isGetCardApi) {
      return
    }
    if (targeType == CHA_CARD_TYPE.GOODS) {
      this.getGoodsInfo(targetIdList)
    } else if (targeType == CHA_CARD_TYPE.DOCTOR) {
      this.getDoctor(targetIdList)
    } else if (targeType == CHA_CARD_TYPE.ARTICLE) {
      this.getReArticle(targetIdList)
    } else if (targeType == CHA_CARD_TYPE.CONSULTANT || targeType == CHA_CARD_TYPE.PHEALTH) {
      if (this.data.cardBtnInfo == null && btnText && btnDesc) {
        this.isGetCardApi = true
        let btnInfo = {
          type: targeType,
          btn: btnText,
          text: btnDesc
        }
        this.setData({
          cardBtnInfo: btnInfo
        })
      }
    }
  },

  /**
   * 商品卡片
   * @param {*} ids 
   */
  getGoodsInfo(ids) {
    if (this.data.cardList.length == 0 && ids && ids.length > 0) {
      this.isGetCardApi = true
      ids.forEach(id => {
        queryProductById({ spuId: id }).then(res => {
          console.log("商品：" + JSON.stringify(res))
          if (res && res.result) {
            let list = this.data.cardList
            let { name, subhead, productId, sellPrice, imageUrl } = res.result
            list.push({
              id: this.getTimestamp(),
              type: CHAT_TYPE.GOODS,
              img: imageUrl,
              title: name,
              desc: subhead,
              relId: productId,
              price: sellPrice,
              btnText: "立即购买",
              timestamp: this.getTimestamp()
            })
            this.setData({
              cardList: list
            })
          }
        })
      });
    }
  },

  /**
   * 文章卡片
   * @param {*} ids 
   */
  getReArticle(ids) {
    if (this.data.cardList.length == 0 && ids && ids.length > 0) {
      this.isGetCardApi = true
      getReArticleList({ ids: ids }).then(res => {
        console.log("文章：" + JSON.stringify(res))
        if (res && res.result && res.result.length > 0) {
          let list = this.data.cardList
          res.result.forEach(item => {
            list.push({
              id: this.getTimestamp(),
              type: CHAT_TYPE.ARTICLE,
              img: item.coverImgUrl,
              title: item.title,
              desc: item.remark,
              relId: item.recommendId,
              tag: item.likeCount,
              btnText: "查看全文",
              contentType: item.type,
              timestamp: this.getTimestamp()
            })
          })
          this.setData({
            cardList: list
          })
        }
      })
    }
  },

  /**
   * 医生卡片
   * @param {*} ids 
   */
  getDoctor(ids) {
    if (this.data.cardList.length == 0 && ids && ids.length > 0) {
      this.isGetCardApi = true
      getReDoctorList({ doctorIdList: ids }).then(res => {
        console.log("医生：" + JSON.stringify(res))
        if (res && res.result && res.result.length > 0) {
          let list = this.data.cardList
          res.result.forEach(item => {
            list.push({
              id: this.getTimestamp(),
              type: CHAT_TYPE.DOCTOR,
              img: item.imageUrl,
              title: item.doctorName + " · " + item.doctorTitleName,
              desc: item.hospitalName,
              relId: item.doctorId,
              tag: item.deptName,
              btnText: "立即预约",
              timestamp: this.getTimestamp()
            })
          })
          this.setData({
            cardList: list,
          })
        }
      })
    }
  },

  onDelayScroll() {
    this.autoScroll()
    setTimeout(() => {
      this.setData({
        disabled: false
      })
    }, 300)
  },

  /**
   * 自动滚动到底部
   */
  autoScroll() {
    let that = this
    this.scrollTopBottomTimer = setTimeout(() => {
      console.log("autoScroll：" + this.isStopSrcoll)
      if (this.isStopSrcoll) {
        return
      }
      that.setData({
        bottomViewId: `item${that.data.content.length}`
      })
    }, 200)
  },

  /**
   * 推荐内容点击
   * @param {*} e 
   */
  getReQuestion(e) {
    //console.log("推荐问题：" + e.detail.question)
    this.onControlChat(e.detail.question)
  },

  /**
   * 计算聊天内容区高度
   */
  getChatHeight(inputHeight) {
    const windowInfo = wx.getWindowInfo()
    let deviceWidth = windowInfo.windowWidth;
    let chatContentH = windowInfo.windowHeight - windowInfo.statusBarHeight - this.data.bottomInputHeight - inputHeight;
    let rpx = (750 / deviceWidth) * Number(chatContentH)
    return Math.floor(rpx);
  },


  initChatHeight() {
    // 使用选择器获取输入框的高度
    const systemInfo = wx.getWindowInfo();
    const screenHeightPx = systemInfo.windowHeight;
    const screenWidthPx = systemInfo.windowWidth;
    const rpxRatio = 750 / screenWidthPx;
    const screenHeightRpx = screenHeightPx * rpxRatio;
    const statusBar = systemInfo.statusBarHeight * rpxRatio;
    const query = wx.createSelectorQuery();
    query.select('.chat-input').boundingClientRect((rect) => {
      if (rect) {
        const inputHeightRpx = rect.height * rpxRatio;
        const viewHeightRpx = screenHeightRpx - inputHeightRpx - statusBar;
        this.setData({
          "chatContentHeight": viewHeightRpx,
          "chatMaxHeight": viewHeightRpx,
          "bottomInputHeight": inputHeightRpx,
          "rpxRatio": screenHeightRpx
        });
      }
    }).exec();
  },

  /**
   * 单击录音
   */
  onVoiceClick() {
    this.onRecord(false)
  },

  /**
   * 长按录音
   */
  onLongpress() {
    //如果已经单击开始收音,不得再做长按操作
    if (!this.data.isStart) {
      this.onRecord(true)
    }
  },

  /**
   * 取消长按录音
   */
  onTouchend() {
    if (this.data.isLongPress) {
      this.onRecord(false)
    }
  },

  /**
   * 单击或长按不同提示文案
   */
  getClickOrTouchStr() {
    return this.data.isLongPress ? "松手编辑，上滑取消" : "再次点击下方，完成说话"
  },

  /**
   * 初始化实时语音监听
   */
  initVoices() {
    // 开始识别
    speechRecognizerManager.OnRecognitionStart = (res) => {
      console.log('开始识别', res);
      this.setData({
        dialogTips: this.getClickOrTouchStr(),
        isReception: false
      })
    }
    // 识别变化时
    speechRecognizerManager.OnRecognitionResultChange = (res) => {
      console.log('识别变化时', res)
      let noTextStr = "我在听，请说话"
      if (res != null && res.result && res.result.voice_text_str) {
        this.setData({
          questionText: res.result.voice_text_str,
          dialogTips: this.getClickOrTouchStr()
        })
      } else if (this.data.dialogTips != noTextStr) {
        this.setData({
          dialogTips: noTextStr
        })
      }
    }
    // 识别结束
    speechRecognizerManager.OnRecognitionComplete = (res) => {
      console.log('识别结束', res)
      let tips = "点击或长按下方，开始说话"
      let errorTips = this.data.voicessError
      if (this.data.questionText) {
        tips = "可点击上方文字区域编辑"
      } else {
        //如果不是主动取消
        if (this.data.isStart) {
          errorTips = "抱歉，没有识别到文字，请重新开始"
          showToast({
            title: '语音识别失败',
            desc: '试试文字输入吧',
            type: TOAST_TYPE.ERROR,
            duration: 1000
          })
        }
      }
      this.setData({
        dialogTips: tips,
        isStart: false,
        isReception: this.data.questionText.length > 0,
        voicessError: errorTips
      })
    }
    // 识别错误
    speechRecognizerManager.OnError = (res) => {
      console.log('识别失败', res);
    }
    // 录音结束（最长10分钟）时回调
    speechRecognizerManager.OnRecorderStop = (res) => {
      console.log('录音结束', res);
    }
  },

  /**
   * 输入回调
   * @param {*} e 
   */
  onQuestionInputEvent(e) {
    this.setData({
      questionText: e.detail.value ? e.detail.value : "",
    })
  },

  showTips() {
    showToast({
      title: '温馨提示',
      desc: '小康正在努力回答，请稍后再发送',
      type: TOAST_TYPE.WARNING,
      duration: 1000
    })
  },

  /**
   * 人工咨询
   */
  onConsult() {
    if (!this.onNetWorkCheck()) {
      return
    }
    this.isStopSrcoll = false
    let list = this.data.content
    if (this.data.disabled) {
      this.showTips()
      return
    }
    list.push({
      id: this.getTimestamp(),
      type: CHAT_TYPE.QUESTION,
      texstr: "人工咨询",
      timestamp: this.getTimestamp()
    })
    list.push({
      id: this.getTimestamp(),
      type: CHAT_TYPE.CONSULT,
      timestamp: this.getTimestamp()
    })
    this.setData({
      content: list
    })
    this.autoScroll()
  },

  onTouchStart(e) {
    //console.log("onTouchStart" + JSON.stringify(e))
    this.startY = e.detail.scrollTop
    this.isTouching = true
  },

  onTouchMove(e) {
    //console.log("onTouchMove" + JSON.stringify(e))
    if (!this.isTouching) return;
    const deltaY = e.detail.scrollTop - this.startY;
    // 判断滑动方向
    if (deltaY > 0) {
      console.log('向下滑动');
    } else if (deltaY < 0) {
      console.log('向上滑动');
      this.isStopSrcoll = true
      clearTimeout(this.scrollTopBottomTimer)
    }
    this.startY = e.detail.scrollTop // 更新 startY 以便连续计算 deltaY
  },

  onTouchEnd() {
    console.log("onTouchEnd")
    this.isTouching = false
  },

  onScrolltolower() {
    console.log("onScrolltolower")
    this.isStopSrcoll = false
  },

  /**
 * 资源释放
 */
  onRelease() {
    this.isStopChat = true
    this.isGetCardApi = true
    speechRecognizerManager.stop();
    clearInterval(this.timer);
    clearTimeout(this.timeout)
    clearTimeout(this.scrollTopBottomTimer)
    this.timeout = null
    this.timer = null
    this.scrollTopBottomTimer = null
  },

  onHide() {
    console.log("onHide")
  },

  onUnload() {
    console.log("onUnload")
    this.onRelease()
  },

  inputFocus(e) {
    var inputHeight = 0
    if (e.detail.height) {
      inputHeight = e.detail.height
      let chatH = this.data.chatMinHeight
      if (chatH === 0) {
        chatH = this.getChatHeight(inputHeight)
      }
      this.setData({
        inputHeight: inputHeight,
        chatContentHeight: chatH,
        chatMinHeight: chatH
      })
      this.isStopSrcoll = false
      this.autoScroll()
    }
  },
  inputBlur() {
    this.setData({
      inputHeight: 0,
      chatContentHeight: this.data.chatMaxHeight,
    })
    this.isStopSrcoll = false
    this.autoScroll()
  },

  /**
   * 断网提示
   */
  onNetWorkCheck() {
    let isConnected = app.globalData.networkState.isConnected
    if (!isConnected) {
      showToast({
        title: '温馨提示',
        desc: '网络连接已断开，请检查网络',
        type: TOAST_TYPE.WARNING,
        duration: 1000
      })
    }
    return isConnected
  },

  /**
   * 弱网监听
   */

  onNetworkWeakEvent() {
    eventEmitter.on(`onNetworkWeak`, networkWeakInfo => {
      if (!this.isShowNetworkWeak && networkWeakInfo.weakNet) {
        this.isShowNetworkWeak = true
        showToast({
          title: '温馨提示',
          desc: '您的设备处于弱网状态,请耐心等待',
          type: TOAST_TYPE.WARNING,
          duration: 3000
        })
      }
    })
  },

  /**
   * 断网监听
   */
  onNetWorkEvent() {
    let that = this
    eventEmitter.on(`onNetworkStatus`, networkStatusInfo => {
      console.log(JSON.stringify(networkStatusInfo))
      if (!networkStatusInfo.isConnected) {
        showToast({
          title: '温馨提示',
          desc: '网络连接已断开，请检查网络',
          type: TOAST_TYPE.WARNING,
          duration: 3000
        })
        that.isStopChat = true
        clearInterval(that.timer);
        clearTimeout(that.timeout)
        clearTimeout(that.scrollTopBottomTimer)
        that.timeout = null
        that.timer = null
        that.scrollTopBottomTimer = null
        that.setData({
          disabled: false
        })
      }
    })
  },

  /**
   * 停止获取答案
   */
  onStopChatEvent() {
    this.isStopChat = true
    clearInterval(this.timer);
    clearTimeout(this.timeout)
    clearTimeout(this.scrollTopBottomTimer)
    this.timeout = null
    this.timer = null
    this.scrollTopBottomTimer = null
    let list = this.data.content
    let size = list.length
    //删除loading和问题
    if (list.length > 0 && list[size - 1].type == CHAT_TYPE.LOADING) {
      list.pop()
      list.pop()
    }
    this.setData({
      content: list,
      disabled: false
    })
  }
})