// pages/order/components/warm-doctor-info/index.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    doctorInfo: {
      type: Object,
      value: {}
    },
    reducibleDateInfo: {
      type: Object,
      value: {}
    },
    goodsList:{
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    onEditMessage({currentTarget, detail}) {
      const {value} = detail;
      const {storeid} = currentTarget.dataset;
      this.triggerEvent('oneditmessage', {storeId: storeid, userMessage: value})
    },
    openTimeDialog(){
      this.triggerEvent('openDatePopup')
    }
    
  }
})