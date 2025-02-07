import * as API_obh from '../models/obh.js'
import {STORAGE_USER_FOR_KEY} from "../../../const/index";
Page({
  data: {
    params: {
      page: {
        index: 1,
        paging: true,
        size: 10
      }
    },
    msg: '',
    list: [],
    isFinish: false,
    showPopupType: 0, //展示弹窗,1,2,3
    tel: '400-101-0505',
    hasTime: false, //当前是否有定时器
    interval: '',
    refundSelectJson: {},
    refundSelectIndex: -1,
    id:''
  },
  onShow() {
    this.getList(true) // 因为撤销刷新问题，以缓存为主不解决，不放onshow
  },
  onLoad: function (options) {
    this.setData({
      id:options.id||''
    })
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
   * 计算传秒数的倒计时【时、分、秒】，没有天
   * @param seconds
   * @returns {{hours : *, minutes : *, seconds : *}}
   */
  countTimeFormate(seconds) {
    seconds = seconds || 0
    const leftTime = (time) => {
      if (time < 10) time = '0' + time
      return time + ''
    }
    return {
      h: leftTime(parseInt(seconds / 60 / 60, 10)),
      m: leftTime(parseInt(seconds / 60 % 60, 10)),
      s: leftTime(parseInt(seconds % 60, 10))
    }
  },
  /** 开始倒计时 */
  startCountDown() {
    //节省性能，倒计时的不会太多，使用一个倒计时，最多差一秒
    let that = this
    clearInterval(that.timer)
    that.timer = null
    that.timer = setInterval(() => {
      let {
        list
      } = that.data
      for (let i = 0; i < list.length; i++) {
        if (list[i].orderStatus == 2&&list[i].surplusSecond) {
          let t = list[i].surplusSecond - 1
          if (t > 0) {
            list[i].surplusSecond = t
            list[i].timeJson = that.countTimeFormate(t)
          } else {
            list[i].surplusSecond = 0
            list[i].orderStatus = 3
          }
        }
      }
      this.setData({
        list
      })
    }, 1000)
  },
  //售后弹窗校验
  showPopHandler(e) {
    let {
      item,
      index
    } = e.currentTarget.dataset
    wx.showLoading({
      mask:true,
      title: '加载中...',
    })
    let params={
      orderCode:item.orderCode
    }
    API_obh.checkRefund(params).then(res=>{
      this.setData({
        "showPopupType": res.result,
        "refundSelectJson": item,
        "refundSelectIndex": index
      })
    }).catch(res=>{
      wx.showToast({
        icon:'none',
        title: res.msg||'网络错误，请稍后再试~',
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  //确认退款
  confirmRefundHandler() {
    let {refundSelectIndex,refundSelectJson,showPopupType} = this.data
    wx.showLoading({
      mask:true,
      title: '加载中...',
    })
    let params={
      "orderCode":refundSelectJson.orderCode
    }
    API_obh.confirmRefund(params).then(res=>{
      this.setData({
        "showPopupType": 0,
        "refundSelectJson": {},
        "refundSelectIndex": -1
      })
      this.getList(true)
    }).catch(res=>{
      wx.showToast({
        icon:'none',
        title: res.msg||'网络错误，请稍后再试~',
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  callHandler() {
    let {
      tel
    } = this.data
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  closePopHandler() {
    this.setData({
      "showPopupType": 0,
      "refundSelectJson": {},
      "refundSelectIndex": -1
    })
  },
  init() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    let that = this
    clearInterval(that.timer)
    this.setData({
      hasTime:false,
      params: {
        createId: user.userId, //	用户信息
        page: {
          index: 1,
          paging: true,
          size: 10
        }
      },
      msg: '',
      list: [],

      isFinish: false
    })
  },
  //获取商品列表
  getList: function (init = false) {
    if (init) {
      this.init()
    }
    let {
      hasTime,
      list
    } = this.data
    API_obh.getList(this.data.params).then(res => {
      if (res && res.code == 200) {
        if (res.result && res.result.length > 0) {
          res.result.map((item, index) => {
            if (item.surplusSecond && item.orderStatus == 2 && !hasTime) {
              this.startCountDown()
            }
            if (item.surplusSecond && item.orderStatus == 2) {
              hasTime = true
            }
            item.timeJson = item.orderStatus == 2&&item.surplusSecond ? this.countTimeFormate(item.surplusSecond) : {}
            return item
          })
        }
        this.setData({
          hasTime,
          list: [...this.data.list, ...res.result]
        })
        if (this.data.params.page.index >= res.page.pages) {
          this.setData({
            isFinish: true
          })
          this.setData({
            msg: '没有更多数据了~'
          })
        }
      }
      if (this.data.list.length == 0) {
        this.setData({
          isFinish: true
        })
        this.setData({
          msg: '暂无数据'
        })
      }
    }).catch(() => {
      this.setData({
        isFinish: true
      })
      if (this.data.list.length == 0) {
        this.setData({
          msg: '暂无数据'
        })
      } else {
        this.setData({
          msg: '网络错误，请稍后再试~'
        })
      }
    })
  },
  onReachBottom: function (e) {
    if (!this.data.isFinish) {
      this.setData({
        'params.page_no': this.data.params.page.index += 1
      });
      this.getList()
    }
  }
})