// components/recommend/adSwiper/index.js
import {openPage} from "../../../utils/index";
import { queryStatus} from "../../../models/recommendModel";
import { showToast } from "../../../components/toast/index";
import { TOAST_TYPE } from "../../../const/index";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    change(e){
      const {current} = e.detail;
      this.setData({currIndex: current});
    },
    // 点击广告图 跳转
    handleGoPage(e) {
     const {detailid, jumptype} = e.currentTarget.dataset;
     const {link} = e.currentTarget.dataset || {};
     if( jumptype === '10' || jumptype === '11' || jumptype === '12' ){
      this.queryDetail(detailid, link)
     } else {
      openPage.call(this, {link})
     } 
    },
    queryDetail(detailid, link){
      queryStatus({
        recommendId: detailid
      }).then(({result}) => {
        if(result.state) {
          openPage.call(this, {link})
        } else {
          wx.navigateTo({
            url: '/pages/recommend/empty/index?title=人气爆款',
          })
        }
      }).catch((err) => {
        if(err.code === 4004) {
          return wx.navigateTo({
            url: '/pages/recommend/empty/index?title=人气爆款',
          })
        } else {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        }
      })
    }
  }
})
