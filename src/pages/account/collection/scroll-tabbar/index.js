// components/recommend/scroll-tabbar/index.js
Component({
  externalClasses: ["ext-class"],
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type: Array,
      value: [],
      observer(val) {
        if(val && val.length) {
          const {columnId} = val[0];
          this.setData({columnId});
          this.triggerEvent('change', val[0]);
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    categoryId: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTab(e){
      const {item} = e.target.dataset;
      this.setData({columnId: item.columnId, columnName: item.columnName});
      this.triggerEvent('change', item);
    }
  }
})
