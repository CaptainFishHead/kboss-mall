import { getImgBoxSize } from '@utils/index'
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    expand: {
      type: String,
      value: '展开'
    },
    retract: {
      type: String,
      value: '收起'
    },
    maxHeight: {
      type: Number,
      value: 0
    },
    minHeight: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    expandedHeight: 0,
    isExpand: false,
    isHideExpand: false
  },

  observers: {
    'maxHeight, minHeight': async function(newValue) {
      const { isExpand, minHeight } = this.data
      const boxs = (await getImgBoxSize('.container_box', this))[0] || {}
      this.setData({
        expandedHeight: isExpand ? this.data.maxHeight : this.data.minHeight,
        isHideExpand: boxs && boxs.height <= minHeight
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeIsExpand(){
      const isExpand = !this.data.isExpand
      this.setData({
        expandedHeight: isExpand ? this.data.maxHeight : this.data.minHeight,
        isExpand
      })
    }
  }
})