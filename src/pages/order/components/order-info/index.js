// pages/order/components/order-info/index.ts
import '../../../../utils/dateFormat'
import {TOAST_TYPE} from "../../../../const/index"
import {showToast} from "../../../../components/toast/index";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
		orderInfo: {
			type: Object,
			value: {}
		}
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCopy(e){
      const {ordercode} = e.target.dataset || {};
      wx.setClipboardData({
        data: ordercode || '',
        success() {
          wx.hideToast()
          showToast({
            title: '复制成功',
            type: TOAST_TYPE.SUCCESS
          })
        }
      })
    }
  }
})
