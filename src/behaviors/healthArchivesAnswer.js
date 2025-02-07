import { queryInterpretation, queryChatAnswerInfo } from "@models/healthArchivesModel"
import { STORAGE_USER_FOR_KEY } from "@const/index";


export default Behavior({
  data: {
    timer: null,
    answer: '',
    answerStatus: 0
  },
  methods: {
    //除定时器
    clearTimer() {
      clearInterval(this.data.timer)
      this.setData({ timer: null })
    },
    //指标大模型解读
    getInterpretation(indexId) {
      const userInfo = wx.getStorageSync(STORAGE_USER_FOR_KEY)
      const params = {
        parentId: indexId,
        userId: userInfo.userId
      }
      queryInterpretation(params).then(({ result }) => {
        this.answerInterval(result.chatHistoryId)
      })
        .catch(err => {
          console.error(err)
        })
    },
    //每隔3秒查询一次
    answerInterval(chatHistoryId) {
      const timer = setInterval(() => {
        this.getChatAnswerInfo(chatHistoryId)
      }, 3000)
      this.setData({ timer })
    },
    //查询单个聊天问题回复信息
    getChatAnswerInfo(chatHistoryId) {
      queryChatAnswerInfo({ chatHistoryId }).then(({ result }) => {
        const { answer, answerStatus } = result;
        if (answerStatus) {
          //已回复 清除定时器
          this.clearTimer();
          this.setData({ answer, answerStatus })
        }
      })
        .catch(err => {
          console.error(err)
        })
    },
  }
})