// components/recommend/scroll-tabbar/index.js
Component({
  externalClasses: ["ext-class", "item-class"],
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type: Array,
      value: [],
      observer(val) {
        if(val && val.length) {
          const {recommendCategoryId, categoryName} = val[0];
          this.setData({categoryId: recommendCategoryId});
          this.triggerEvent('change', {categoryId: recommendCategoryId, categoryName: categoryName});
        }
      }
    },
    isRecommend: {
      type: Boolean,
      value: false
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
      const {id, name} = e.target.dataset;
      this.setData({categoryId: id, categoryName: name});
      this.triggerEvent('change', {categoryId: id, categoryName: name});
    }
  }
})
