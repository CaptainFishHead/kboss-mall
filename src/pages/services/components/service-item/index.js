import env from '@config/env'
import { wxFuncToPromise } from '@utils/wxUtils'
import { hideToast, showToast } from '@components/toast/index'
import { APP_ID, SOURCE, THIRD_PARTY_PATH, WECHAT_MOMENTS_SHARE_ID, STORAGE_USER_FOR_KEY, TOAST_TYPE } from '@const/index'
import { cancelReservation, jumpThird, getDetailByService, queryMyServiceList } from '@models/servicesModel'
import { serviceRelationShip } from "@models/orderModel"
Component({
  properties: {
    serviceInfo: {
      type: Object,
      value: {}
    },
    orderType: {
      type: String,
      value: ''
    },
    current: {
      type: Number,
      value: 0
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  observers: {
    'serviceInfo': function (newVal) {
      this.setData({
        videoType: newVal.videoButton == 3 ? false : true
      });
    }
  },
  data: {
    statusObj: { 1: '待付款', 2: '待预约', 3: '待开始', 4: '已完成', 5: '已关闭', 6: '已过期' },
    serviceOrderCode: '',
    videoType: false
  },
  methods: {
    // 使用说明
    tapExplain () {
      this.selectComponent('#instructions').showUpload()
    },
    /**================线上服务============ */
    // 开始视频
    async toVideo () {
      let orderId = this.data.serviceInfo.serviceOrderCode
      jumpThird({ serviceOrderCode: orderId }).then(({ result, msg, code }) => {
        if (code != 200) {
          showToast({
            type: TOAST_TYPE.ERROR,
            title: msg
          })
          return
        }
        wxFuncToPromise(`navigateToMiniProgram`, {
          appId: APP_ID.DI_YI_FANG_TAI,
          path: result.result,
        })
      }).catch(err => {
        showToast({
          type: TOAST_TYPE.ERROR,
          title: err.msg
        })
      }).finally(() => {
        // hideToast()
      })
    },
    // 预约服务
    tapAppointment () {
      const { self, serviceId, serviceOrderCode, ids ,canUse} = this.data.serviceInfo
      if(!canUse){
        showToast({
          type: TOAST_TYPE.ERROR,
          title: '未到使用时间，请仔细核对使用时间'
        })
        return
      }
      // 0 非自营  1自营
      if (self) {
        wxFuncToPromise('navigateTo', { url: `/pages/healthArchives/healthWaiter/index?scheme='1'` }).then(() => {
          serviceRelationShip({ tradeId: ids[0] }).catch(err => {
            showToast({
              type: TOAST_TYPE.ERROR,
              title: err
            })
          })
        })
      } else {
        wx.navigateTo({
          url: `/pages/healthConsult/index?serviceOrderCode=${serviceOrderCode}&serviceId=${serviceId}`
        })
      }
    },
    // 补全资料
    tapFill () {
      let { serviceOrderCode, preBookTime } = this.data.serviceInfo
      getDetailByService({ serviceOrderCode }).then(({ result }) => {
        wxFuncToPromise(`navigateTo`, { url: `/pages/healthConsult/consultInfo/index` }).then(({ eventChannel }) => {
          let params = { type: 1, preBookTime, ...result }
          eventChannel.emit(`products`, params)
        })
      })
    },
    // 取消预约
    tapCancel () {
      wx.showModal({
        title: '提示',
        content: '确定要取消本次服务么?',
        success: res => {
          if (res.confirm) {
            const { serviceOrderCode, preBookTime } = this.data.serviceInfo
            cancelReservation({ serviceOrderCode })
              .then(({ result, code, msg }) => {
                wx.showToast({
                  title: msg || "取消预约",
                  icon: 'none'
                })
                this.triggerEvent('refresh')
              })
              .catch(err => {
                wx.showToast({
                  title: '取消失败',
                  icon: 'none'
                })
              })
          }
        }
      })
    },
    // 查看健康管家
    tapHealth () {
      wx.navigateTo({
        url: `/pages/healthArchives/healthWaiter/index?scheme='0'`
      })
    },

    /**================到店服务============ */
    // 适用门店
    tapOutlets () {
      const { serviceId } = this.data.serviceInfo
      wx.navigateTo({
        url: `/pages/services/suitOutlets/index?serviceId=${serviceId}`
      })
    },
    // 查看券码
    tapCode () {
      const { serviceId } = this.data.serviceInfo
      wx.navigateTo({
        url: `/pages/services/viewCode/index?serviceId=${serviceId}`
      })
    }
  }
})
