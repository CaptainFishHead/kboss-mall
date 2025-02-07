import * as API_obh from '../models/obh.js'
import back from "../../../behaviors/back";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money:'',
    name:'',
    wxAppJson:{},
    appId: 'wxcc3540ea25b97878',
    path: 'pages/index/index?source=HOTEL&targetId=aBgvYBURF6',
    id: ''
  },
  behaviors:[back],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      id:options.deviceId,
      name:options.name||'',
      money:options.money||0,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  goRecord(){
    wx.navigateTo({
      url: `/pages/obh/record/index?id=${this.data.id}`,
    })
  },
  backHandler() {
    let pages = getCurrentPages();
    if (pages.length && pages.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      getApp().globalData.backFromBuyTopBar=0//点击上边返回按钮不弹，其他按正常逻辑
      this.restart()
    }
  },
  // 购买氧吧蛋
  buyProduct() {
    let {id}=this.data
    let params={id: id, type: 2}
    API_obh.getSchemeUrl(params).then(res => {
      if(res.result&&res.result.appletPath){
        getApp().globalData.backFromBuyTopBar=0//点击上边返回按钮不弹，其他按正常逻辑
        let isTab=res.result.appletPath.indexOf('pages/index/index')!==-1||res.result.appletPath.indexOf('pages/column/index')!==-1||res.result.appletPath.indexOf('pages/mine/index')!==-1||res.result.appletPath.indexOf('pages/mall/index')!==-1
        if(isTab){
          wx.switchTab({
            url: `/${res.result.appletPath}`,
          })
        }else{
          wx.navigateTo({
            url: `/${res.result.appletPath}&action=sku`,
          })
        }
      }
    }).catch(err => {
      wx.showToast({
        title: '获取购买链接失败，请稍候再试。',
        icon: 'none'
      })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  }
})