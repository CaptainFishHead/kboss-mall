import { CHAT_TYPE, TOAST_TYPE } from "@const/index";
import { queryRecommendDetail } from "@models/recommendModel";
import { hideToast, showToast } from "@components/toast/index";
import { openPage } from "@utils/index";

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Object,
      value: null
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    CHAT_TYPE
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCardClick(e) {
      if(this.data.disabled){
        showToast({
          title: '温馨提示',
          desc: '小康正在努力回答，请稍后操作',
          type: TOAST_TYPE.WARNING,
          duration: 1000
        })
        return
      }
      let { type, relId, contentType } = this.data.info
      let url = ""
      if (CHAT_TYPE.GOODS == type) {
        url = `/pages/product/index?spuId=${relId || ''}`
      } else if (CHAT_TYPE.ARTICLE == type) {
        if (contentType == 1) {
          url = `/pages/recommend/graphicDetail/index?id=${relId}`
        } else if (contentType == 2) {
          url = `/pages/recommend/videoDetail/index?id=${relId}`
        } else if (contentType == 3) {
          this.getRecommendDetail(relId)
        }
      } else if (CHAT_TYPE.DOCTOR == type) {
        url = `/pages/healthConsult/doctorInfo/index?doctorId=${relId}`
      }
      wx.navigateTo({
        url: url,
      })
    },
    // 获取种草详情信息 直播需要
    getRecommendDetail(id) {
      showToast({ type: TOAST_TYPE.LOADING });
      queryRecommendDetail({
        recommendId: id
      }).then(({ result }) => {
        const { state, livingId } = result;
        if (state) {
          let link = {
            href: `/pages/live/player/index?roomId=${livingId}`,
            jumpType: 8
          };
          openPage.call(this, { link });
        } else {
          wx.navigateTo({
            url: '/pages/recommend/empty/index',
          })
        }
      }).catch(({ code }) => {
        if (code === 4004) {
          wx.navigateTo({
            url: '/pages/recommend/empty/index',
          })
        }
      })
        .finally(() => {
          hideToast();
        })
    },
  }
})