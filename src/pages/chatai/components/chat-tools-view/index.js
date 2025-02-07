// pages/chatai/components/chat-tools-view/index.ts
import {
  track,
  TrackEventName
} from "../../../../utils/sa";
import {
  APP_ID,
  SOURCE,
  STORAGE_USER_FOR_KEY,
  THIRD_PARTY_PATH,
  TOAST_TYPE,
  CONSUMER_HOTLINE,
  STORAGE_HONG_CU_BAO_KEY
} from "../../../../const/index";
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    isLogged: {
      type: Boolean,
      value: false
    } 
  },

  /**
   * 组件的初始数据
   */
  data: {
    counselorIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_counselor_icon.png",
    serviceIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_service_icon.png",
    phoneIcon: "https://static.tojoyshop.com/images/wxapp-boss/aichat/chat_phone_icon.png",
  },

  /**
   * 组件的方法列表
   */
  methods: {
     onToolsClick(e) {
      console.log(JSON.stringify(e))
      console.log(e.currentTarget.dataset.type)
      let type = parseInt(e.currentTarget.dataset.type)
      switch (type) {
        case 0:
          if(this.data.isLogged) {
            wx.navigateTo({
              url: '/pages/healthArchives/healthWaiter/index',
            })
          } else {
            this.triggerEvent("onLogin");
          }
          break;
        case 1:
          this.triggerEvent("onLogin");
          break;
        case 2:
          track(TrackEventName.Boss_CustomerService, {
            customer_service_type: '电话客服'
          });
          wx.makePhoneCall({
            phoneNumber: CONSUMER_HOTLINE
          })
          break
      }
    }
  }
})