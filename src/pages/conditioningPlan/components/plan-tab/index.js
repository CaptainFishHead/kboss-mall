Component({
  
  /**
   * 组件的属性列表
   */
  properties: {
    current: {
      type: Object,
      value: {}
    },
    planTabItem: {
      type: Object,
      value: {}
    }
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/plan/heart.png',
    imgActiveUrl: 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/plan/heart_active.png'
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    sendCurrentPlanToParent(){
      this.triggerEvent('setCurrentPlan', { current: this.data.planTabItem });
    }
  }
})