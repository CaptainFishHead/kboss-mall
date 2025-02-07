// pages/order/components/cancel-reason/index.ts
import {TOAST_TYPE} from "../../../../const/index"
import {showToast} from "../../../../components/toast/index";
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false,
    reasonList: [
			{
				id: 1,
				text: '订单不能按预计时间送达',
				checkd: false
			},
			{
				id: 2,
				text: '商品买错了（颜色/型号/数量等弄错了）',
				checkd: false
			},
			{
				id: 3,
				text: '重复下单/误下单',
				checkd: false
			},
			{
				id: 4,
				text: '支付方式有误/无法下单',
				checkd: false
    }],
    reasonVal: "",
    reasonId: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 打开弹窗
    show(){
      this.setData({visible: true});
    },
    // 关闭弹窗
    close(){
      this.setData({visible: false});
    },
    // 切换原因列表
    radioChange(e) {
			const id = e.target.id;
      const text = e.target.dataset.text
			this.setData({reasonVal: text, reasonId: Number(id)})
    },
    // 确定
    onConfirm(){
      const {reasonVal, reasonId} = this.data;
      if (!reasonVal) {
				return showToast({
					title: '请选择取消原因',
					type: TOAST_TYPE.WARNING
				})
			}
      this.triggerEvent('confirm', {reasonVal, reasonId})
    }
  }
})
