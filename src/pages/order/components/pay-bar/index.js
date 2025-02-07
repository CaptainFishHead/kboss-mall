import {track, TrackEventName} from "../../../../utils/sa";
import {
  CONSUMER_HOTLINE,
} from "../../../../const/index";

Component({
  externalClasses: ["ext-class"],
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    isNotEnough: {
      type: Boolean,
      value: false
    },
    orderPayInfo: {
      type: Object,
      value: {}
    },
    txt: {
      type: String,
      value: '立即支付'
    },
    type: {
      type: Number,
      value: 0
    }
  },
  data: {},

  methods: {
    /** 拨打电话*/
    onCallTel() {
      track(TrackEventName.Boss_CustomerService, {customer_service_type: '电话客服'});
      wx.makePhoneCall({
        phoneNumber: CONSUMER_HOTLINE
      })
    },
    /** 确认支付操作*/
    payHandle() {
      this.triggerEvent('payhandle')
    },
  }
})
