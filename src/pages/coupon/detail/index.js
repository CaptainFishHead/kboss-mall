import { wxFuncToPromise } from "../../../utils/wxUtils";
import { activateCardByNo, queryCardDetailById } from "../../../models/cardModel";
import {CONSUMER_HOTLINE, ORDER_SOURCE_PAGE, PRODUCT_TYPE, TOAST_TYPE} from "../../../const/index";
import { checkSkuStatus } from "../../../models/productModel";
import { track, TrackEventName } from "../../../utils/sa";
import { hideToast, showToast } from "../../../components/toast/index";
import back from "../../../behaviors/back";
import env from "../../../config/env";
// gift
// 	accept
// 	give
const BASE_HEIGHT = 290
const BASE_WIDTH = 375
Page({
  data: {
    PRODUCT_TYPE,
    // navigator 背景透明度
    navigatorTransparency: 0,
    // 屏幕系数
    equipmentFactor: 1,
    // 边界值 -> navigatorTransparency：1
    limitHeight: 0,
    dialogShow: false,
    visibleActivate: false,
    // toolTip: false,
    buttons: [
      { text: '去逛逛', extClass: 'cancel' },
      { text: '联系客服', extClass: 'ok', callPhone: true },
    ],
    buttonsActivate: [
      { text: '取消', extClass: 'cancel' },
      { text: '激活', extClass: 'ok', type: 'ok' },
    ],
    card: {},
    productList: []
  },
  behaviors:[back],
  onLoad(options) {
    wxFuncToPromise('getSystemInfo')
      .then(({ windowWidth }) => {
        const equipmentFactor = windowWidth / BASE_WIDTH
        this.setData({
          equipmentFactor,
          limitHeight: equipmentFactor * BASE_HEIGHT
        })
      })
      this.setData({'card.id': options.cardId})
    
  },
  onShow(){
    this.queryCardDetail()
  },
  queryCardDetail(cardId) {
    showToast({ type: TOAST_TYPE.LOADING })
    const {id} = this.data.card || {};
    queryCardDetailById({ id })
      .then(({ result }) => {
        const { productList, ...card } = result
        this.setData({ card, productList })
      })
      .finally(() => {
        hideToast()
      })
  },
  onPageScroll({ scrollTop }) {
    const navigatorTransparency = scrollTop / this.data.limitHeight
    if (navigatorTransparency >= 1 && this.data.navigatorTransparency >= 1) {
      return null
    }
    wx.nextTick(() => {
      this.setData({ navigatorTransparency })
    })
  },
  closeDialog() {
    this.setData({
      dialogShow: false,
      // toolTip: true
    })
  },
  contactCustomerService() {
    track(TrackEventName.Boss_CustomerService, { customer_service_type: '电话客服' });
    wxFuncToPromise('makePhoneCall', {
      phoneNumber: CONSUMER_HOTLINE
    })
  },
  tapDialogButton(e) {
    const { callPhone } = e.detail.item
    if (callPhone) {
      this.contactCustomerService()
    } else {
      this.restart()
    }
    this.closeDialog()
  },
  async exchange() {
    const { eventChannel } = await wxFuncToPromise(`navigateTo`, {
      url: `/pages/order/confirm/index`,
    })
    eventChannel.emit(`products`, {
      cardId: this.data.card.id,
      type: ORDER_SOURCE_PAGE.CARDID
    })
    
/*    const { result } = await checkSkuStatus({
      fetchErrorInfo: 1,
      skuList: this.data.productList
        .map(product => ({ skuId: product.skuId, count: product.productNum }))
    })

    if (result.errorCount === 0) {
      const { eventChannel } = await wxFuncToPromise(`navigateTo`, {
        url: `/pages/order/confirm/index`,
      })
      eventChannel.emit(`products`, {
        cardId: this.data.card.id,
        type: ORDER_SOURCE_PAGE.CARDID
      })
    } else {
      this.setData({ dialogShow: true })
    }*/
  },
  activeHandler(e) {
    const { type } = e.detail.item
    if (type === 'ok') {
      showToast({ type: TOAST_TYPE.LOADING })
      activateCardByNo({ cardNo: this.data.card.cardNo })
        .then(({ result }) => {
          showToast({
            title: '激活成功',
            type: TOAST_TYPE.SUCCESS
          })
          this.queryCardDetail()
          this.reLoadPrePage(result) //执行前一个页面的方法
        })
        .catch(({ msg }) => {
          showToast({
            title: msg || '激活失败，请重试',
            type: TOAST_TYPE.WARNING
          })
        })
    }
    this.setData({
      visibleActivate: false
    })
  },
  activeConfirm() {
    this.setData({
      visibleActivate: true
    })
  },

  // 执行前一个页面的方法
  reLoadPrePage(card) {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage.route === "pages/coupon/index") {
      //更新激活卡片信息
      prevPage.onActivateCardFromDetail(card)
    }
  }
});
