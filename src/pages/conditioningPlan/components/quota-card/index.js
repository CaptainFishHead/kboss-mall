import { wxFuncToPromise } from "@utils/wxUtils";
Component({
  
  /**
   * 组件的属性列表
   */
  properties: {
    hideModeBtn: {
      type: Boolean,
      value: false
    },
    quotaInfo: {
      type: Object,
      value: {}
    }
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    indexNumStr: ''
  },
  
  observers: {
    'quotaInfo': function(newValue) {
      if(!newValue) return
      let indexNumStr = ""
      let rout = ''
      if(newValue.detailVoList){
        newValue.detailVoList.forEach((item,index) =>{
          if(item.numberMinValue && item.numberMaxValue){
            indexNumStr += item.numberMinValue + '-' + item.numberMaxValue + '/'
            rout = '1'
          }else if(item.textReferenceValue){
            indexNumStr = item.textReferenceValue
          }else{
            indexNumStr = ""
          }
          
        })
      }
      if(indexNumStr && rout){
        indexNumStr = indexNumStr.slice(0, indexNumStr.length - 1);
      }
      this.setData({ indexNumStr })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toQueryString(params){
      return Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    },
    navigateToDetails(e){
      const { quotaInfo } = this.data
      wxFuncToPromise(`navigateTo`, {
        url: `/pages/conditioningPlan/indicatorDetails/index`,
      }).then(({ eventChannel }) => {
        eventChannel.emit(`reportResult`, {
          healthProblemsItem: quotaInfo
        })
      })
    },
  }
})