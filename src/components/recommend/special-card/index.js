// components/recommend/special-card/index.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Object,
      value: {}
    },
    isMulti: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goDetail(){
      this.triggerEvent('go', {info: this.data.info})
    }
  }
})