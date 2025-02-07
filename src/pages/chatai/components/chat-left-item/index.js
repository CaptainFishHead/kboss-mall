// pages/chatai/components/chat-left-item/index.ts

import { hideToast, showToast } from "@components/toast/index";
import { CHAT_TYPE, TOAST_TYPE, CHA_CARD_TYPE } from "@const/index";
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    chatContent: {
      type: String,
      value: ""
    },
    btnInfo: {
      type: Object,
      value: null
    },
    isLogged: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    subcount: 120,
    isMore: false,
    praiseIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_praise_icon.png",
    unpraiseIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_unpraise_icon.png",
    closeIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_close_icon.png"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onBtnClicl() {
     // console.log("是否正在输入" + this.data.disabled)
      if (this.data.disabled) {
        showToast({
          title: '温馨提示',
          desc: '小康正在努力回答，请稍后操作',
          type: TOAST_TYPE.WARNING,
          duration: 1000
        })
        return
      }
      let type = this.data.btnInfo.type
      if (this.data.isLogged) {
        if (type == CHA_CARD_TYPE.CONSULTANT) {
          wx.navigateTo({
            url: '/pages/healthArchives/healthWaiter/index',
          })
        } else if (type == CHA_CARD_TYPE.PHEALTH) {
          wx.navigateTo({
            url: '/pages/healthShoot/index',
          })
        }
      } else {
        this.triggerEvent("onLogin");
      }
    },

    onMoreEvent() {
      this.setData({
        isMore: true
      })
    }
  }
})