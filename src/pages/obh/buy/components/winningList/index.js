// pages/obh/promotion/components/winningList/index.ts
import * as API_Obh from '../../../models/obh'
import { STORAGE_USER_FOR_KEY } from '@const/index'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    activity: {
      type: Object,
      value: {},

      observer(val) {
        if (val && val.activityId) {
          setTimeout(() => {
            this.requestWinningList(val)
          }, 100)
        }
      }
    },

    backgroundImg: {
      type: 'String',
      value: ''
    },

    txtColor: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dataList: undefined,
  },

  pageLifetimes: {
    show() {
      let {activity} = this.data
      if (activity && activity.activityId) {
        this.requestWinningList(activity)
      }
    }
  },

  lifetimes: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    requestWinningList(params) {
      API_Obh.queryWinningListNL(params).then(({result}) => {

        for (let item of result) {
          if (item.prizeName && item.prizeName.length > 11) {
            item.prizeName = `${item.prizeName.slice(0, 11)}..`
          }
        }
        
        this.setData({
          dataList: result
        })
      }).catch(({msg}) => {
        wx.showToast({
          title: msg ? msg : '获取中奖列表失败，请稍后再试。',
          icon: 'none'
        })
      })
    }
  }
})
