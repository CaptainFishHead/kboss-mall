import * as API_AfterSale from "../../../../models/afterSaleModel";
import {showToast} from "../../../../components/toast/index";
import {TOAST_TYPE} from "../../../../const/index";
import {track, TrackEventName} from "../../../../utils/sa";

const app = getApp()

Component({
  properties: {
    list:{
      type:Array,
      value:[]
    },
    tabIndex: {
      type: Number,
      value: 0
    }
  },
  data: {
    refundStatusMap: {
      '10': '商家审核中',
      '20': '平台处理中',
      '30': '退款完成',
      '40': '退款驳回',
      '50': '退款取消',
      '60': '平台处理中',
      '70': '等待货物寄回',
      '80': '商家处理中',
    },
    buttonsConfim: [{
      text: '取消',
      type: '1'
    }, {
      text: '确定',
      type: '2'
    }],
    ishowModal: false,
    cancelId: '',
    sessionFrom: '', // 保存联系客服所需数据
  },
  pageLifetimes:{
    show: function() {
      let sessionFrom = app.getContactInfo({title: '售后/退款'})
      this.setData({sessionFrom})
    },
  },
  methods: {
    // 跳转退款订单详情页
    goAfterSaledetail(e) {
      const {orderCode, refundCode} = e.currentTarget.dataset.item || {};
      wx.navigateTo({url: `/pages/afterSale/detail/index?refundCode=${refundCode}&from=list`})
    },
    // 客服埋点
    onService() {
      track(TrackEventName.Boss_CustomerService, {customer_service_type: '售后客服'});
    },
    // 货物寄回
    goFill({currentTarget}) {
      const {orderCode, refundCode} = currentTarget.dataset.item || {};
      wx.navigateTo({
        url: `/pages/afterSale/fill/index?refundCode=${refundCode}&orderCode=${orderCode}&from=list`
      })
    }
  }
});
