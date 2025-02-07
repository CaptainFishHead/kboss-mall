import { HEALTH_INFO_BUSINESS_PAGE, TOAST_TYPE } from "@const/index";
import { hideToast, showToast } from "@components/toast/index";
import { queryUserIsHealth } from "@models/healthInfo";
import { getJkpStatus } from "./models/healthShootModel"
import { getJkpParameter } from "./models/healthShootModel";
import { getNavBar } from "@utils/wxUtils";
import { debounce } from "@utils/index";

Page({
  data: {
    navBar: {},
    dialogShow: false,
    buttons: [{
      text: '完善信息',
      extClass: 'only-two-btn'
    }],
    titleBtn: "0元限时体验", // 0元限时体验/立即测量
    price: '20',  // 价格
    historySign: false,
    // 关于我们
    privateAbout: encodeURIComponent('https://cdn.utours.cn/healthypai-h5/about.html'),
  },
  debounceHandleMeasureNow: null,
  async onLoad(options) {
    this.debounceHandleMeasureNow = debounce(this.handleMeasureNow, 500);
    if (options.code == 101401) {
      this.setData({ dialogShow: true })
    }
    this.setData({ navBar: getNavBar() });
    // this.handleJkpStatus()
  },
  onShow() {
    this.handleJkpStatus()
  },

  handleJkpStatus() {
    getJkpStatus().then(({ result, code }) => {
      this.setData({
        historySign: result.result == 1 ? true : false
      })
    })
  },

  async handleMeasureNow() {
    showToast({ type: TOAST_TYPE.LOADING })
    const { result } = await queryUserIsHealth();
    if (result.isHealthInfo) {
      getJkpParameter().then(() => {
        wx.navigateTo({ url: `/pages/healthShoot/examine/index` });
      }).catch(({ code, msg }) => {
        if (code == 101401) {
          this.setData({ dialogShow: true })
        }
      }).finally(() => {
        hideToast()
      })

    } else {
      this.setData({ dialogShow: true })
      hideToast()
    }
  },


  handleLast() {
    wx.navigateTo({
      url: `/pages/healthShoot/healthShootResult/index?type=true`
    });
  },

  handleConfirm(e) {
    wx.navigateTo({
      url: `/pages/healthInfo/personInfo/index?businessPage=${HEALTH_INFO_BUSINESS_PAGE.HEALTH_FAST}`
    });
    this.setData({ dialogShow: false })
  },

  goBack(e) {
    return wx.switchTab({ url: '/pages/index/index' })
  },
});
