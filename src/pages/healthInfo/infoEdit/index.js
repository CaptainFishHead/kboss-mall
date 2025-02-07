import { TOAST_TYPE, STORAGE_USER_FOR_KEY, } from "../../../const/index";
import { hideToast, showToast } from "../../../components/toast/index";
import { queryUserHealth } from "@models/healthInfo"
import { formatMobile } from '../../../utils/index'
import { HEALTH_SHARE_PARAMS } from '@const/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tagVisible: false, //更多病史标签查看
    personInfo: {},
    tagList: [],
    tagTitle: '',
    list: [],
    bgRgb: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },
  onShow() {
    this.getUserInfo()
  },
  getUserInfo() {
    queryUserHealth().then(({ result }) => {
      const { healthUserBasicInfo, userCategoryVoList } = result
      let formdata = userCategoryVoList.map(item => ({
        categoryName: item.categoryName,
        isHave: item.isHave,
        isMore: false,
        taglist: !item.userCategoryOptionVoList.length ? [] : item.userCategoryOptionVoList.map(subItem => {
          return subItem.isOther !== 1 ? subItem.optionName : subItem.otherOptionName
        })
      }))

      this.setData({
        personInfo: { ...healthUserBasicInfo, mobile: formatMobile(healthUserBasicInfo.mobile) },
        list: formdata
      })
      const _this = this
      setTimeout(function () {
        _this.toggleShow()
      }, 500)

    }).catch((err) => {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    })
      .finally(() => {
        this.setData({
          isLoading: false
        })
        hideToast()
      })
  },
  // height
  toggleShow() {
    const { list } = this.data
    const that = this
    const query = wx.createSelectorQuery()
    list.forEach((el, index) => {
      wx.createSelectorQuery().selectAll(`#tagBox${index} .tagItem`).boundingClientRect(function (rects) {
        let sumWidth = 0;
        rects.forEach((item, idx) => {
          sumWidth += item.width
        })
        list[index].isMore = sumWidth > 342 ? true : false
        that.setData({ list })
      }).exec()
    })
  },
  // 更多
  getMore(e) {
    const { index } = e.currentTarget.dataset
    const { list } = this.data
    this.setData({ tagVisible: true, tagList: list[index]?.taglist, tagTitle: list[index].categoryName })
  },
  // 跳转个人信息  pageSource =’editPage‘ 来源自编辑页面
  onEditPerson() {
    const { id } = this.data.personInfo
    wx.navigateTo({
      url: `/pages/healthInfo/personInfo/index?id=${id}`
    })
  },
  // 跳转健康信息
  onEditHealth() {
    const { id } = this.data.personInfo
    wx.navigateTo({
      url: `/pages/healthInfo/personInfo/index?id=${id}&pageSource=editPage`
    })
  },
  onShareAppMessage(res) {
    return HEALTH_SHARE_PARAMS
  },
  onPageScroll(e) {
    this.setData({ bgRgb: e.scrollTop > 10 ? '188, 253, 229' : '' })
  },
  goBack() {
    wx.switchTab({url: `/pages/mine/index`})
  }
})