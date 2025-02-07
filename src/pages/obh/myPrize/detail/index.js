import { TOAST_TYPE, PRIZE_PLAT } from "@const/index";
import { hideToast, showToast } from "@components/toast/index";
import carrier from "@behaviors/carrier";
import { findPrizeInfo, findPrizePartner, findShareUserList, findLogistics } from "../../models/myPrize"
import { shareForLottery } from "../../models/obh"
import { track } from "@utils/sa";

const app = getApp()

Page({
  behaviors:[carrier],
  data: {
    platformMap: PRIZE_PLAT,
    prizeInfo: {},
    logisticsVisible: false,
    noShareList: [],
    shareList: [],
    shareUserList: [],
    logisticsInfo: [],
    statusMap: {
      '1': 2,
      '2': 2,
      '3': 2,
      '4': 3,
      '5': 4,
      '6': 5,
      '7': 5
    },
    statusTypeMap: {
      '1': 'ing',
      '2': 'ok',
      '3': 'ok',
      '4': 'ok',
      '5': 'ok',
      '6': 'timeout',
      '7': 'timeout'
    },
    defaultPlatformIcon: 'https://static.tojoyshop.com/images/obh/lottery/ic-oo-hotel-logo.png' 
  },
  onShow(options) {
    // claimStatus说明
    // 待兑奖: 1 奖品伴侣待购买、2奖品伴侣待收货、3待兑奖;
    // 兑奖中: 4 兑奖中、
    // 已兑奖: 5 已兑奖、
    // 已失效: 6 已过期、7已作废
    this.findPrizeInfoFn()
    // 记录预览开始时间
    this._starttime = Date.now();
  },
  onPageScroll(e) {
    this.pageScrolling(e)
  },
  showLogistic() {
    this.setData({ logisticsVisible: true})
  },
  closeLogistics() {
    this.setData({ logisticsVisible: false })
  },
  prizeTimeout() {
    this.findPrizeInfoFn()
  },
  // 获取兑奖详情
  findPrizeInfoFn() {
    const { statusMap } = this.data
    const params = {
      id: this.options.prizeLogId,
    }
    showToast({ type: TOAST_TYPE.LOADING })
    findPrizeInfo(params).then(({result}) => {
      hideToast()
      const seconds = new Date(result.failureDateTime).getTime() - new Date().getTime()
      const prizeInfo = {
        ...result,
        claimStatus: seconds <= 0 && result.claimStatus === 1 ? 6 : result.claimStatus // 时间到期且状态没变成过期的 强制改成过期
      }
      this.setData({ prizeInfo })
      if (prizeInfo.claimStatus === 1) { // 奖品伴侣待购买-获取伴侣奖品
        this.findPrizePartnerFn()
        this.findShareUserListFn()
      }
      if (prizeInfo.claimStatus === 4 || prizeInfo.claimStatus === 5) { //  兑奖中或者已兑奖-获取物流信息
        this.findLogisticsFn()
      }
    }).catch((err) => {
        if (err && err.msg) {
          showToast({
            title: err.msg || '兑奖信息获取失败',
            type: TOAST_TYPE.WARNING
          })
        }
      })
  },
  // 获取奖品伴侣列表
  findPrizePartnerFn() {
    findPrizePartner({prizeId: this.data.prizeInfo.rafflePrizeId}).then(({result}) => {
      this.setData({
        noShareList: result.noShareList,
        shareList: result.shareList
      })
    })
  },
  // 获取分享用户列表
  findShareUserListFn() {
    findShareUserList({raffleUserLogId: this.options.prizeLogId}).then(({result}) => {
      this.setData({
        shareUserList: result
      })
    })
  },
  // 获取物流信息
  findLogisticsFn() {
    findLogistics({id: this.options.prizeLogId}).then(res => {
      this.setData({
        logisticsInfo: res.result
      })
    })
  },
  //分享
  onShareAppMessage(res) {
    const { prizeInfo } = this.data
    // 通知后端分享，用于统计分享次数
    shareForLottery({activityId: prizeInfo.activityId, hotelId: prizeInfo.hotelId})
    // console.log(`/pages/obh/buy/lottery/index?prizeLogId=${prizeInfo.id}&activityId=${prizeInfo.activityId}&userId=${prizeInfo.userId}&hotelId=${prizeInfo.hotelId}`)
    track('Boss_Obh_Share', {
      // deviceId: prizeInfo.deviceId,
      share_page: '兑奖详情页',
      hotel_id: prizeInfo.hotelId,
      hotel_name: prizeInfo.hotelName,
      activity_id: prizeInfo.activityId,
      activity_name: prizeInfo.activityName,
      share_type: '分享小程序',
    })
		return {
      title: prizeInfo.shareTitle,
      path: `/pages/obh/buy/lottery/index?prizeLogId=${prizeInfo.id}&activityId=${prizeInfo.activityId}&userId=${prizeInfo.userId}&hotelId=${prizeInfo.hotelId}`,
      imageUrl: prizeInfo.shareImg
    }
  },
  onHide() {
    this.setPoint()
  },
  onUnload() {
    this.setPoint()
  },
  // 设置埋点
  setPoint() {
    const { prizeInfo } = this.data
    const endtime = Date.now();
    const cycle_time = Math.floor((endtime - this._starttime) / 1000)
    track('Boss_Obh_PrizeDetail', {
      starttime: this._starttime,
      endtime,
      cycle_time,
      commodity_id: prizeInfo.rafflePrizeId,
      commodity_name: prizeInfo.rafflePrizeName,
      // deviceId: prizeInfo.deviceId,
      hotel_id: prizeInfo.hotelId,
      hotel_name: prizeInfo.hotelName,
      activity_id: prizeInfo.activityId,
      activity_name: prizeInfo.activityName,
    })
  },
});
