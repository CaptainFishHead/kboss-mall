import * as API_obh from '../models/obh.js'
import back from "../../../behaviors/back";
import {
  getQueryVariable
} from "../../../utils/orhParams";
import {
  getEnterOptions
} from "../../../utils/index";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '', //cj,hd
    cjId: '',
    hd: {
      activeId: '',
      hotelId: '',
      shareId: ''
    }
  },
  behaviors: [back],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    // getObhMiddleParam().then(res=>{
    //   console.log(res)
    // })
    // return

    // https://jd.yunshang520.com/cj/场景id
    // 活动：https://jd.yunshang520.com/hd/活动id/分享酒店id/分享人id
    // uat环境扫码规则：
    // https://jd.yunshang520.com/cj2/
    // https://jd.yunshang520.com/hd2/
    // pre和pro环境扫码规则：
    // https://jd.yunshang520.com/cj/
    // https://jd.yunshang520.com/hd/
    let pages = getCurrentPages()
    let options = pages[pages.length - 1].options
    let type = ''
    let cjId = '' //场景id
    let hd = {
      activeId: '',
      hotelId: '',
      shareId: ''
    }
    if (options && options.q) {
      // 获取url参数
      // 1.现在我们用的码地址https://jd.yunshang520.com/dc/865812058340854
      let result = decodeURIComponent(options.q)
      if (result.indexOf("https://jd.yunshang520.com/cj/") != -1) {
        cjId = result.split("/cj/")[1] || ""
        type = 'cj'
      } else if (result.indexOf("https://jd.yunshang520.com/cj2/") != -1) {
        cjId = result.split("/cj2/")[1] || ""
        type = 'cj'
      } else if (result.indexOf("https://jd.yunshang520.com/hd/") != -1) {
        let hdStr = result.split("/hd/")[1] || ""
        type = 'hd'
        let arr = hdStr.split('/')
        hd = {
          activeId: arr[0] || '',
          hotelId: arr[1] || '',
          shareId: arr[2] || ''
        }
      } else if (result.indexOf("https://jd.yunshang520.com/hd2/") != -1) {
        let hdStr = result.split("/hd2/")[1] || ""
        type = 'hd'
        let arr = hdStr.split('/')
        hd = {
          activeId: arr[0] || '',
          hotelId: arr[1] || '',
          shareId: arr[2] || ''
        }
      } else {
        this.restart()
      }
      this.setData({
        type,
        cjId,
        hd
      })
      if (type) {
        this.getData()
      }
    } else {
      this.restart()
    }
  },
  getData() {
    let {
      type,
      hd,
      cjId
    } = this.data
    if (type == 'hd') {
      let params = {
        id: hd.activeId,
        type: '2', //1.场景ID,2.活动id
        sharerSaffId: hd.shareId,
        sharerHotelId: hd.hotelId
      }
      API_obh.hotelGetSchemeUrl(params).then(res => {
        console.log('API_obh.hotelGetSchemeUrl', res)
        if (res && res.code == 200 && res.result) {
          let path = res.result.path
          let param = res.result.param || ''
          let isTab = path.indexOf('pages/index/index') !== -1 || path.indexOf('pages/column/index') !== -1 || path.indexOf('pages/mine/index') !== -1 || path.indexOf('pages/mall/index') !== -1
          if (path.indexOf('/') != 0) path = `/${path}`
          if (path.indexOf('?') != -1 && param) {
            path = `${path}&${param}`
          } else if (path.indexOf('?') == -1 && param) {
            path = `${path}?${param}`
          }
          let getEnterOptionsRes = {
            mid: getQueryVariable(path, 'mid') || '',
            source: getQueryVariable(path, 's') || '',
          }
          getEnterOptions({
              ...getEnterOptionsRes
            }, {}, {
              type: 'product'
            })
            .then(({
              targetId,
              activity_id,
              sharer_id,
              scene_id,
              ssid,
              source,
              position,
              ...more
            }) => {
              if (path.indexOf('?') != -1) {
                if (path.indexOf('targetId') == -1) {
                  path = `${path}&targetId=${targetId}`
                }
                if (path.indexOf('ssid') == -1) {
                  path = `${path}&ssid=${ssid}`
                }
                if (path.indexOf('source') == -1) {
                  path = `${path}&source=${source}`
                }
              } else if (path.indexOf('?') == -1) {
                path = `${path}?targetId=${targetId}&ssid=${ssid}&source=${source}`
              }
              console.log('path', path)
              if (isTab) {
                wx.reLaunch({
                  url: `${path}`,
                })
              } else {
                wx.reLaunch({
                  url: `${path}`,
                })
              }

            })

        } else {
          wx.showToast({
            title: res.message || '网络请求错误',
            icon: 'none'
          })
          setTimeout(() => {
            this.restart()
          }, 2000)
        }
      }).catch(err => {
        wx.showToast({
          title: '网络请求错误',
          icon: 'none'
        })
        setTimeout(() => {
          this.restart()
        }, 2000)
      })
    } else if (type == 'cj') {
      let params = {
        id: cjId,
        type: '1', //1.场景ID,2.活动id
        sharerSaffId: '',
        sharerHotelId: ''
      }
      API_obh.hotelGetSchemeUrl(params).then(res => {
        console.log('API_obh.hotelGetSchemeUrl', res)
        if (res && res.code == 200 && res.result) {
          let path = res.result.path
          let param = res.result.param || ''
          let isTab = path.indexOf('pages/index/index') !== -1 || path.indexOf('pages/column/index') !== -1 || path.indexOf('pages/mine/index') !== -1 || path.indexOf('pages/mall/index') !== -1
          if (path.indexOf('/') != 0) path = `/${path}`
          if (path.indexOf('?') != -1 && param) {
            path = `${path}&${param}`
          } else if (path.indexOf('?') == -1 && param) {
            path = `${path}?${param}`
          }
          let getEnterOptionsRes = {
            mid: getQueryVariable(path, 'mid') || '',
            source: getQueryVariable(path, 's') || '',
          }
          getEnterOptions({
              ...getEnterOptionsRes
            }, {}, {
              type: 'product'
            })
            .then(({
              targetId,
              activity_id,
              sharer_id,
              scene_id,
              ssid,
              source,
              position,
              ...more
            }) => {
              if (path.indexOf('?') != -1) {
                if (path.indexOf('targetId') == -1) {
                  path = `${path}&targetId=${targetId}`
                }
                if (path.indexOf('ssid') == -1) {
                  path = `${path}&ssid=${ssid}`
                }
                if (path.indexOf('source') == -1) {
                  path = `${path}&source=${source}`
                }
              } else if (path.indexOf('?') == -1) {
                path = `${path}?targetId=${targetId}&ssid=${ssid}&source=${source}`
              }
              console.log('path', path)
              if (isTab) {
                wx.reLaunch({
                  url: `${path}`,
                })
              } else {
                wx.reLaunch({
                  url: `${path}`,
                })
              }

            })
        } else {
          wx.showToast({
            title: res.message || '网络请求错误',
            icon: 'none'
          })
          setTimeout(() => {
            this.restart()
          }, 2000)
        }
      }).catch(err => {
        wx.showToast({
          title: '网络请求错误',
          icon: 'none'
        })
        setTimeout(() => {
          this.restart()
        }, 2000)
      })
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage() {

  // }
})