// pages/chatai/components/recommend/index.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    questions: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    reTitle: "健康助理小康",
    reDesc: "为您和您的家人提供健康服务",
    botIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_bot_icon.png",
    rightIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_right_icon.png",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onReQuestion(e) {
      //console.log("推荐问题组件：" + e.currentTarget.dataset.question)
      this.triggerEvent("onQuestion", { question: e.currentTarget.dataset.question });
    },
  },
});
