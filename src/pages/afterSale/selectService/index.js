import {findOrder} from "../../../models/afterSaleModel";
import {TOAST_TYPE} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";

const app = getApp()

Page({
  data: {
    showEmpty: false,
    errMsg: '',
    list: [],
    id: ''
  },
  onLoad: function (options) {
    this.setData({
      id: options.id || ''
    }, () => {
      this.getDetail()
    })
  },
  reloadHandler() {
    this.setData({
      showEmpty: false
    })
    this.getDetail()
  },
  getDetail() {
    showToast({type: TOAST_TYPE.LOADING})
    findOrder({id: this.data.id}).then(({result}) => {
      hideToast().then(() => {
        let list = result.groups.reduce((total, item) => {
          return [...total, ...item.products]
        }, [])
        this.setData({list})
        wx.setStorageSync('afterSaleApplyInfo', result)
      })
    }).catch((error) => {
      if (error && error.msg) {
        showToast({
          type: TOAST_TYPE.WARNING,
          title: error.msg,
        })
        this.setData({
          showEmpty: true,
          errMsg: error.msg || ''
        })
      }
    });
  },
  //选择服务类型
  checkServiceType(e) {
    let {id} = this.data
    let {type} = e.currentTarget.dataset
    wx.redirectTo({
      url: `/pages/afterSale/apply/index?from=selectService&type=${type}&id=${id}`,
    })
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  }
})