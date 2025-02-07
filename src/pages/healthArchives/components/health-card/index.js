// pages/healthArchives/components/health-card/index.ts
import { formatDateInt } from "@utils/index";

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

  observers: {
    'metric': async function (newValue) {
      const { metric: nMetric } = this.data
      // nMetric.indexData = (function () {
      //   return nMetric.indexName === "血压" ?
      //     `${nMetric.sonIndexList[1].indexData}/${nMetric.sonIndexList[0].indexData}` :
      //     (nMetric.sonIndexList.sort((a, b) => formatDateInt(b.createdTime) - formatDateInt(a.createdTime)))[0].indexData
      // })()
      if(nMetric.sonIndexList && nMetric.sonIndexList.length){
        nMetric.indexLevel = !!nMetric.sonIndexList.filter(item => !!item.indexLevel).length ? 1 : 0
        nMetric.indexUnit = nMetric.sonIndexList[0].indexUnit
      }
      this.setData({ nMetric })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    nMetric: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    navigateToBmi(e) {
      const { indexId } = this.data.metric
      wx.navigateTo({
        url: `/pages/healthArchives/bmi/index?indexId=${indexId}`
      })
    }
  }
})