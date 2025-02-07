import { track, TrackEventName } from "../../utils/sa";

Component({
  properties: {
    title: String,
    style: { type: String },
    type: {
      type: String, value: 'default'
    }
  },
  externalClasses: ['class'],
  options: { virtualHost: true },
  data: {
    sessionFrom: '', // 保存联系客服所需数据
  },
  lifetimes: {
    ready() {
      this.getSessionFrom() //获取客服个人信息
    }
  },
  methods: {
    /**
     * 获取客服 个人信息
     */
    getSessionFrom() {
      const app = getApp()
      const sessionFrom = app.getContactInfo({ title: this.data.title || '客服' })
      console.log('获取客服 个人信息')
      this.setData({ sessionFrom })
    },
    /**
     * 客服埋点
     */
    onService() {
      console.log('客服埋点')
      track(TrackEventName.Boss_CustomerService, { customer_service_type: '在线客服' });
    },
  }
});
