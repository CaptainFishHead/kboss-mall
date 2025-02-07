import { TOAST_TYPE, PRODUCT_TYPE } from "../../../const/index";
import { showToast, hideToast } from "../../../components/toast/index";
import { queryCardConsumeList, activateCardByNo, cancelSendCard, queryGiftCardRecord } from "../../../models/cardModel";

Component({
  data: {
    PRODUCT_TYPE,
    dialogShow: false,
    dialogTitle: '',
    dialogType: '',
    buttons: [],
    buttonsInfo: [{
      text: '我知道了',
      extClass: 'only-one-btn'
    }],
    buttonsConfim: [{
      text: '取消'
    }, {
      text: '确定'
    }],
    recordList: [], // 消费记录
    sendRecordInfo: [], // 消费记录
    // cardStatusMap: {
    //   '1': '礼品卡',
    //   '2': '通兑卡'
    // },
  },

  properties: {
    card: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: 0
    },
    isLink: { //是否可点击
      type: Boolean,
      value: false
    },
    isGift: { //是否礼品卡
      type: Boolean,
      value: false
    },
    isCommon: { //是否通兑卡
      type: Boolean,
      value: false
    }
  },
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },
  methods: {
    toDetailPage() {
      const { card, index } = this.data
      this.triggerEvent('getCurId', { curId: card.id, curIndex: index }) //设置当前点击卡片id
      wx.navigateTo({
        url: `/pages/coupon/detail/index?cardId=${card.id}`,
      })
    },
    toGivePage() {
      const { card, index } = this.data
      this.triggerEvent('getCurId', { curId: card.id, curIndex: index }) //设置当前点击卡片id
      wx.navigateTo({
        url: `/pages/coupon/gift/give/index?cardId=${card.id}`,
      })
    },
    showDialog(e) {
      const { type, title } = e.target.dataset
      const { buttonsInfo, buttonsConfim } = this.data
      if (type === 'info') {
        this.setData({ buttons: buttonsInfo })
      } else {
        const btn = buttonsConfim
        btn[1].text = title
        this.setData({ buttons: btn })
      }
      if (title.includes('消费记录')) { // 获取消费记录
        this.getCardConsumeList({ cardId: this.data.card.id })
      }
      if (title.includes('赠送记录')) { // 获取赠送记录详情
        this.getSendCardRecord({ id: this.data.card.presentId })
      }
      this.setData({
        dialogShow: true,
        dialogTitle: title,
        dialogType: type || ''
      })
    },
    closeDialog() {
      this.setData({ dialogShow: false })
    },
    tapDialogButton(e) {
      const text = e.detail.item.text
      const card = this.data.card
      if (text.includes('我知道了') || text.includes('取消')) {
        this.closeDialog()
      }
      if (text.includes('激活')) {
        this.activateCard({ cardNo: card.cardNo })
      }
      if (text.includes('撤销')) {
        this.cancelCard({ id: card.presentId })
      }
    },
    //复制
    copy(e) {
      const { text } = e.target.dataset
      wx.setClipboardData({
        data: text,
        success() {
          wx.hideToast()
          showToast({
            title: '已复制',
            type: TOAST_TYPE.SUCCESS
          })
        }
      })
    },

    // 获取消费列表
    getCardConsumeList(params) {
      showToast({ type: TOAST_TYPE.LOADING })
      queryCardConsumeList(params)
        .then(({ result }) => {
          hideToast().then(() => {
            this.setData({ recordList: result.recordList })
          })
        })
        .catch((err) => {
          this.closeDialog()
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
    },
    // 激活卡
    activateCard(params) {
      showToast({ type: TOAST_TYPE.LOADING })
      activateCardByNo(params)
        .then(({ result }) => {
          const card = { ...this.data.card, ...result }
          this.setData({ card })
          //设置列表data
          this.triggerEvent('activateCard', {
            index: this.data.index,
            card
          })
          showToast({
            title: '激活成功',
            type: TOAST_TYPE.SUCCESS
          })
        })
        .catch((err) => {
          showToast({
            title: err.msg || '激活失败，请重试',
            type: TOAST_TYPE.WARNING
          })
        })
        .finally(() => {
          this.closeDialog()
        })
    },
    // 撤回卡
    cancelCard(params) {
      showToast({ type: TOAST_TYPE.LOADING })
      cancelSendCard(params)
        .then(() => {
          showToast({
            title: '撤回成功',
            type: TOAST_TYPE.SUCCESS
          })
          this.triggerEvent('cancelCard', { index: this.data.index })
          this.reLoadPrePage() //执行前一个页面的方法
        })
        .catch((err) => {
          console.error('撤回失败', err)
          showToast({
            title: err.msg || '撤回失败，请重试',
            type: TOAST_TYPE.WARNING
          })
        })
        .finally(() => {
          this.closeDialog()
        })
    },
    // 赠送记录详情
    getSendCardRecord(params) {
      showToast({ type: TOAST_TYPE.LOADING })
      queryGiftCardRecord(params)
        .then(({ result }) => {
          hideToast().then(() => {
            this.setData({ sendRecordInfo: result })
          })
        })
        .catch((err) => {
          this.closeDialog()
          showToast({
            title: err.msg || '查询失败，请重试',
            type: TOAST_TYPE.WARNING
          })
        })
    },

    // 执行前一个页面的方法
    reLoadPrePage() {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage.route === "pages/coupon/index") {
        prevPage.tabChange(0) //更新列表数据
      }
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
})