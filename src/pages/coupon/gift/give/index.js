import { presentGiftCard, queryCardDetailById } from "../../../../models/cardModel";
import { STORAGE_USER_FOR_KEY, TOAST_TYPE } from "../../../../const/index";
import { hideToast, showToast } from "../../../../components/toast/index";
import WxValidate from "../../../../utils/WxValidate";

const app = getApp()

Page({
  data: {
    dialogShow: false,
    cardInfo: {
      cardName: '',
      effectStartDate: '',
      effectEndDate: '',
      effectType: '',
      effectAddDay: '',
    },
    formValue: {},
    visibleGiveSucc: false,
    cardId: '',
    presentRecordId: '',//赠送记录ID
    buttonsConfim: [{
      text: '好的',
      type: '1'
    }],
  },
  onLoad(options) {
    this.setData({
      cardId: options.cardId
    })
    wx.setNavigationBarColor({frontColor:"#ffffff",backgroundColor: '#000000'})
    this.initValidate();
    this.getCardInfoHandle();
  },
  onShow(options) {

  },
  /**  获取礼品卡详情信息 */
  getCardInfoHandle() {
    showToast({ type: TOAST_TYPE.LOADING })
    let params = {
      id: this.data.cardId
    }
    queryCardDetailById(params)
      .then(({ result }) => {
        hideToast().then(() => {
          this.setData({
            cardInfo: { ...result }
          })
        })
      })
      .catch((err) => {
        hideToast().then(() => {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
      })
  },
  /**初始化表单校验*/
  initValidate() {
    const rules = {
      mobile: {
        required: true,
        tel: true
      }
    };
    const message = {
      mobile: {
        required: '请输入手机号',
        tel: '请输入正确的手机号'
      }
    }
    this.WxValidate = new WxValidate(rules, message);
  },
  /** 监听电话号码输入*/
  onInputMobile({ detail }) {
    let value = detail.value.replace(/\D/g, '').substr(0, 11) // 不允许输入非数字字符，超过11位数字截取前11位
    let len = value.length
    if (len > 3 && len < 8) {
      value = value.replace(/^(\d{3})/g, '$1 ')
    } else if (len >= 8) {
      value = value.replace(/^(\d{3})(\d{4})/g, '$1 $2 ')
    }
    this.setData({ formValue: { mobile: value } });
  },
  /** 手机号赠送提交 */
  onSumint(e) {
    const { value } = e.detail;
    value.mobile = value.mobile.replace(/\s*/g, "")
    if (!this.WxValidate.checkForm(value)) {
      const err = this.WxValidate.errorList[0];
      showToast({
        title: err.msg || '暂无信息!',
        type: TOAST_TYPE.WARNING
      })
      return;
    }
    showToast({ type: TOAST_TYPE.LOADING })
    /** 调用礼品卡赠送接口*/
    presentGiftCard({ id: this.data.cardId, ...value, presentWay: 2 }).then((res) => {
      hideToast().then(() => {
        this.setData({
          dialogShow: false,
          visibleGiveSucc: true,
        })
        this.reLoadPrePage() //执行前一个页面的方法
      })
    }).catch((err) => {
      //todo 接口返回报错信息 处理
      hideToast().then(() => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
    })
  },
  /** 通过手机号赠送卡*/
  giveFromMobile() {
    this.setData({
      dialogShow: true
    })
  },
  /** 通过微信分享赠送礼品卡*/
  onShareAppMessage(res) {
    const promise = presentGiftCard({ id: this.data.cardId, presentWay: 1 }).then(({ result }) => {
      this.reLoadPrePage() //执行前一个页面的方法
      const { nickName } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
      return Promise.resolve({
        title: `${nickName} 赠送您一张康老板礼品卡，请点击领取`,
        path: `/pages/coupon/gift/accept/index?cardId=${this.data.cardId}&presentRecordId=${result.id}`,
        imageUrl: 'https://static.tojoyshop.com/images/wxapp-boss/coupon/cover-share-crad.png'
      })
    }).finally(() => {
      setTimeout(() => {
        wx.navigateBack()
      }, 100)
    })
    return {
      ...app.globalData.shareInfo,
      promise
    }
  },
  //关闭赠送弹窗
  handleClose() {
    this.setData({
      dialogShow: false
    })
  },
  //赠送成功后操作
  tapDialogButton(e) {
    const type = e.detail.item.type
    if (type === '1') {
      this.setData({ visibleGiveSucc: false })
      wx.navigateBack();
    }
  },

  // 执行前一个页面的方法
  reLoadPrePage() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage.route === "pages/coupon/index") {
      prevPage.onGiveCard() //赠送卡片成功
    }
  }

});
