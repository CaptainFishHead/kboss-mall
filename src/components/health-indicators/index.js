// components/health-indicators/health-indicators.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    healthlist: { //指标数据
      type: Array,
      value: []
    },
    abnormalNum:{ // 异常指标个数
      type: Number,
      value: 0
    },
    nullNum:{ // 有数据指标数量
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击虚拟人物形象区：跳转健康档案
    clickhealthInfo(){
      this.triggerEvent('childFun')
    },
    // 点击AI小康
    clickAikang(e){
      let { btn } = e.currentTarget.dataset
      this.triggerEvent('aikang',{btn})
    },
    // 点击具体指标 进入指标详情页面
    clickTarget(e){
      let { indexid } = e.currentTarget.dataset
      wx.navigateTo({
        url: '/pages/healthArchives/bmi/index?indexId=' + indexid
      })
    }
  }
})