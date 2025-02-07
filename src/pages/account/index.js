import {getMemberLevel, queryMemberLevelRule} from "../../models/userModel";
import {TOAST_TYPE, STORAGE_USER_FOR_KEY} from "../../const/index";
import {hideToast, showToast} from "../../components/toast/index";
import { htmlToWxml } from "@utils/index"

const app = getApp()

Page({
  data: {
    memberInfo: {},
  },
  onLoad() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    if (user) {
      this.getLevel() //会员等级关系表
    }
  },
  //会员等级关系
  async getLevel() {
    showToast({type: TOAST_TYPE.LOADING})
    const {result: {levelUrl,sort}} = await getMemberLevel()
    queryMemberLevelRule({})
    .then(({result}) => {
      result.memberLevelRuleRemark = htmlToWxml(result.memberLevelRuleRemark||'') //富文本图片自适应
      this.setData({
        memberInfo: {levelUrl,sort, ...result}
      })
      hideToast()
    })
  },
  onShareAppMessage() {
    return app.globalData.shareInfo
  }
  
})