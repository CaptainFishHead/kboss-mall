// components/recommend/label/index.js
Component({
  externalClasses: ["ext-class"],
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: String,
      value: '',
      observer(val){
        if(val){
          let tagList = val.split(',');
          this.setData({tagList});
        } else {
          this.setData({tagList: []});
        }
      }
    },
    limit: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tagList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
