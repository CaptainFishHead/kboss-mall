// components/service-btn/index.ts
import { CONSUMER_HOTLINE } from "../../const/index";
import {track, TrackEventName} from "@utils/sa";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    serviceVisible: {
      type: Boolean, value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false,
    sessionFrom: '', // 保存联系客服所需数据
  },
  lifetimes: {
    // attached() {
    //   this.getSessionFrom()
    // },
    ready() {
      // debugger
      this.getSessionFrom() //获取客服个人信息
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /*显示半弹窗*/
    serviceBtn() {
      this.setData({ visible: true });
    },
    /* btns*/
    buttontap(e) {
      console.log(e.detail)
    },
    closeService() {
      this.triggerEvent('showServices', false)
    },
    /*拨打电话*/
    onCallTel() {
      track(TrackEventName.Boss_CustomerService, { customer_service_type: '电话客服' });
      wx.makePhoneCall({
        phoneNumber: CONSUMER_HOTLINE
      })
    },
    /*获取客服 个人信息*/
    getSessionFrom() {
      const app = getApp()
      const sessionFrom = app.getContactInfo({ title: '首页客服' })
      this.setData({ sessionFrom })
    },
    onService() {
      track(TrackEventName.Boss_CustomerService, { customer_service_type: '在线客服' });
    },
  }
})
