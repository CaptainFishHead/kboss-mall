import {HEALTH_INFO_BUSINESS_PAGE, TOAST_TYPE,} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import {isLogged} from "@utils/index";
import {queryUserIsHealth, queryUserHealth} from "@models/healthInfo"
import {HEALTH_SHARE_PARAMS} from "@const/index"
import {wxFuncToPromise} from "@utils/wxUtils";

Page({
  
  data: {
    isHealthInfo: 0,//是否填写健康信息： 0：否，1：是,
    isShare: 0,//1是分享过来的，
    isOnLoad: false,
    hidePage: true,
    businessPage: '',
  },
  async onLoad(options) {
    await this.setData({isShare: options.isShare || 0, businessPage: options.businessPage})
  },
  onShow() {
  },
  createInfohandle() {
    if (isLogged()) {
      this.onCreateInfo()
    } else {
      this.selectComponent("#authHealthCoponents").openAuthorize(true)
    }
  },
  // 跳转创建档案
  async onCreateInfo() {
    const {result} = await queryUserIsHealth()
    const wxMethods = this.data.isShare ? 'navigateTo' : 'redirectTo'
    if (result.isHealthInfo) {
      wx.redirectTo({url: '/pages/healthArchives/index'})
    } else {
      wxFuncToPromise(wxMethods, {url: `/pages/healthInfo/personInfo/index?businessPage=${this.data.businessPage}`});
    }
  },
  onShareAppMessage(res) {
    return HEALTH_SHARE_PARAMS
  },
  goBack() {
    const {isShare} = this.data
    if (isShare) {//分享进来的
      wx.switchTab({
        url: '/pages/index/index',
      })
    } else {
      wx.navigateBack()
    }
  },
})


