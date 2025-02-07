// pages/order/components/tips-dialog/index.ts
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
    buttons: [{
			text: '取消'
		}, {
			extClass: {border: 'none'},
			text: '确定'
		}],
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show(desc){
      this.setData({visible: true, content: desc || ''});
    },
    close(){
      this.setData({visible: false})
    },
    tapDialogButton(e) {
      const {index} = e.detail;
			if (index) {
				this.triggerEvent('confirm');
			}
      this.close();
    },
  }
})
