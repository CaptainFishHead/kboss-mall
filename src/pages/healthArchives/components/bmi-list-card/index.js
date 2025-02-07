// pages/healthArchives/components/bmi-list-card/index.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    metric: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    className: '',
    standard: ''
  },
	options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},

  observers: {
    "metric": function(newVal){
      let className = ''
      switch (newVal.indexLevel) {
        case -1:
          className = 'num_value_down'
          break;
        case 1:
          className = 'num_value_up'
          break;
        default:
          className = ''
          break;
      }
      const standard = this.convertRange(newVal.indexRange)
      this.setData({ className, standard })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    sendCurrentDetailToParent(){
      this.triggerEvent('sendCurrentDetailToParent', { currentDetail: this.data.metric });
    },
    navigateToUpdateMetric(){
      this.triggerEvent('navigateToUpdateMetric');
    },
    convertRange(rangeStr){
      const lowerBound = rangeStr[0] === '[' ? '≥' : '>';
      const upperBound = rangeStr[rangeStr.length - 1] === ']' ? '≤' : '<';
      
      const [lowerValue, upperValue] = rangeStr.slice(1, -1).split(',');
      
      return `${lowerBound}${lowerValue.trim()}；${upperBound}${upperValue && upperValue.trim()}`;
    }
  }
})