// components/recommend/fabulous/index.js
import {addLikeCollection, delLikeCollection, statisticsOperate} from "../../../models/recommendModel";

Component({
  externalClasses: ["icon-class", "num-class"],
  /**
   * 组件的属性列表
   */
  properties: {
    icon: {
      type: String,
      value: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/fabulous-grey.png'
    },
    num: {
      type: Number,
      value: 0
    },
    color: {
      type: String,
      value: '#9C9C9C'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    onPraise(){
      this.triggerEvent('operation')
    }
  },
})
