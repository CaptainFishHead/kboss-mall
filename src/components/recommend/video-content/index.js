// components/recommend/video-content/index.js
import { SOURCE } from "../../../const/index";
import {stringify} from "qs";
import { htmlToWxml } from "@utils/index"

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowCont: {
      type: Boolean,
      value: false,
      observer(val) {
        !val && this.setData({isShow: false});
      },
    },
    item: {
      type: Object,
      value: {},
      observer(val) {
        if (val && val.remark) {
          val.remark = htmlToWxml(val.remark);
        }
        this.setData({videoInfo: val});
      }
    }
  },
  options: {
    virtualHost: true,
    styleIsolation: 'apply-shared'
  },
  /**
   * 组件的初始数据
   */
  data: {
    isMore: false,
    isShow: true,
    visible: false, // 默认隐藏文本
    isLogged:false, //登陆状态
  },
  ready() {
    this.initCont()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化内容
    initCont() {
      const query = wx.createSelectorQuery().in(this);
      query.selectAll('.txt').boundingClientRect(res => {
        this.setData({visible: true})
        if (res.length && res[0].height > 60) {
          this.setData({isMore: true, isShow: false})
        }
      }).exec();
    },
    // 展示隐藏内容
    handleShowCont() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    // 跳转商品详情
    goDetail(e) {
      const {goodsid, recommentid, recommendtitle, title} = e.currentTarget.dataset;
      const pages = getCurrentPages()
      const {source, mid, ssid} = pages.at(-1).options;
      const params = {
        pageName: title,
        skuId:'none',
        curr_page_info: JSON.stringify({
          "page_name": recommentid,
          "page_id": recommendtitle,
          "page_source": '种草详情'
        })
        // page_id: recommentid,
        // page_name: recommendtitle
      };
      const app = getApp()
      Object.assign(params,app.globalData.customer_channel?app.globalData.customer_channel:{
        source: source || SOURCE.BH_MALL,
        position: 'recb',
        targetId: recommentid,
        ssid: ssid || mid || ''
      },{spuId: goodsid})
      wx.redirectTo({
        url: `/pages/product/index?${stringify(params)}`
      })
    }
  }
})
