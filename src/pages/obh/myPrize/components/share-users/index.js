// import { findShareUserList } from "../../../models/myPrize"
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    userList:{
      type:Array,
      value:[]
    },
    allNum: {
      type: Number,
      value: 1
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    // 头像缺省图
    headImg: 'https://static.tojoyshop.com/images/obh/lottery/my_prize_detail/touxiang.png',
    // 默认头像
    defaultHead: "https://static.tojoyshop.com/images/wxapp-boss/mine/icon-mine-default-head.png?v=3.0.1",
    // PRODUCT_TYPE
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  pageLifetimes:{
    show() {
      // 页面被展示
    }
  },
  lifetimes: {
    ready () {
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
  }
})
