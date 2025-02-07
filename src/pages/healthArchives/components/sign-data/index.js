Component({

  /**
   * 组件的属性列表
   */
  properties: {
    tags: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tagGroups: []
  },
  observers: {
    tags: function (newTags) {
      let abnormal = 0
      let abnormalStatus = 0 //指标全部为空（指标都是灰色的）
      const groups = newTags.reduce((result, value, index, array) => {
        value.className = (function () {
          let { sonIndexList = [] } = value
          if (!sonIndexList) {
            return 'not_entered'
          } else {
            abnormalStatus = 1
          }
          const isAbnormal = !!sonIndexList.filter(item => item.indexLevel).length

          if (isAbnormal) {
            abnormal++
            return 'un_normal'
          }

          return 'normal'

        })()

        index % 2 === 0 && result.push(array.slice(index, index + 2))
        return result;
      }, []);
      let offsetSize = 0
      const offsetNumber = 20
      const middle = groups.length / 2
      let tagGroups = groups.map((item, index) => {
        if (index <= middle) {
          offsetSize += offsetNumber
        } else {
          offsetSize -= offsetNumber
        }
        return {
          styleOffset: `margin-left: -${offsetSize}rpx;  width: calc(100% + ${offsetSize * 2}rpx)`,
          group: item
        }
      })
      this.setData({ tagGroups })
      this.triggerEvent('sendAbnormal', { abnormal, abnormalStatus })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    navigateToBmi(e) {
      const { indexId } = e.currentTarget.dataset.metric
      this.triggerEvent('toBmiPage', { indexId })
    }
  }
})