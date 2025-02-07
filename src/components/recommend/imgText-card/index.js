// components/recommend/recommend-card/index.js
import {openPage} from "../../../utils/index";
import {stringify} from "qs";
import { SOURCE } from "../../../const/index";
Component({
  externalClasses: ["img-class"],
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Object,
      value: {}
    },
    // 卡片展示的方向 1、横向 2、纵向
    direction: {
      type: Number,
      value: 1
    },
    // activedName: {
    //   type: String,
    //   value: ''
    // },
    // activedId: {
    //   type: String,
    //   value: ''
    // },
    // options: {
    //   type: Object,
    //   value: {}
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toDetail(){
      this.triggerEvent('go', {info: this.data.info});
      // const {recommendId, type} = this.data.detail;
      // const pages = getCurrentPages()
      // const {source, mid, ssid} = pages.at(-1).options;
      // const params = {};
      // const app = getApp()
      // Object.assign(params,app.globalData.customer_channel?app.globalData.customer_channel:{
      //   source: source || SOURCE.BH_MALL,
      //   position: 'recb',
      //   targetId: recommendId,
      //   ssid: ssid || mid || ''
      // },{ id: recommendId, page_id: this.data.activedId, page_name: this.data.activedName })
      // const link = {
      //   jumpType: type,
      //   href: type === 1 ? `/pages/recommend/graphicDetail/index?${stringify(params)}` :  `/pages/recommend/videoDetail/index?${stringify(params)}`
      // }
      // openPage.call(this, {link}, detailId => this.updateId({
      //   id: recommendId,
      //   // ...options
      // }));
    },

    // updateId({id}){
    //   this.triggerEvent('update', {id});
    // }

  }
})
