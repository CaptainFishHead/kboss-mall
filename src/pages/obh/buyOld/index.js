import * as API_obh from '../models/obh.js'
import back from "../../../behaviors/back";
import {
  STORAGE_USER_FOR_KEY,
  USER_SOURCE_KEY,
  USER_SOURCE_TYPE_KEY,
  ORDER_SOURCE_PAGE,
} from "../../../const/index";
import {
  queryProductById
} from "../../../models/productModel";
import {
  wxFuncToPromise
} from "../../../utils/wxUtils";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startPoint: [0, 0],
    /* 初始化 touchStart 坐标*/
    animationData: null,
    orderInfo: {},
    showPopup: false,
    list: [],
    canPayClick: true,
    wxCode: null,
    fromUrl: '', // 回跳来源
    isProtocolChecked: true,
    isLogin: false,
    selectInfo: {},
    current: 0,
    errorTime: '', //弹窗的错误信息
    showError: false,
    errorMsg: '设备参数异常，即将返回到首页',
    listError: false,
    hotelId: '',
    timeInfo: {
      remainingDuration: 0,
      totalDuration: 0
    },
    topTimeShowJson: { //顶部展示的时间
      h: 0,
      m: 0,
      s: 0
    },
    showInfoPop: false,
    t: new Date().getTime(),
    popCntBottom: 0,
    tip: '*使用心脏起搏器等医疗仪器的人群切勿使用',
    "popInfoList": [],
    skinList: [ //皮肤list
      {
        maskerBg: 'rgba(1, 0, 6, 0.1)',
        bg: 'https://static.tojoyshop.com/images/wxapp-obh/buy/bg0.jpg', //总背景
        selectIcon: 'https://static.tojoyshop.com/images/wxapp-obh/buy/select0-on.png', //选中的图标
        selectBgOn: 'https://static.tojoyshop.com/images/wxapp-obh/buy/select0-bg-on.png', //选中商品的背景
        selectBgOff: 'https://static.tojoyshop.com/images/wxapp-obh/buy/select0-bg-off.png', //未选中商品背景
        tuijianIcon: 'https://static.tojoyshop.com/images/wxapp-obh/buy/tuijian0.png' //推荐的图标
      }, {
        maskerBg: 'rgba(1, 0, 6, 0.4)',
        bg: 'https://static.tojoyshop.com/images/wxapp-obh/buy/bg2.jpg', //总背景
        selectIcon: 'https://static.tojoyshop.com/images/wxapp-obh/buy/select1-on.png', //选中的图标
        selectBgOn: 'https://static.tojoyshop.com/images/wxapp-obh/buy/select1-bg-on.png', //选中商品的背景
        selectBgOff: 'https://static.tojoyshop.com/images/wxapp-obh/buy/select1-bg-off.png', //未选中商品背景
        tuijianIcon: 'https://static.tojoyshop.com/images/wxapp-obh/buy/tuijian1.png' //推荐的图标
      }
    ],
    bgType: 0, //背景的类型，0默认图片，1视频
    muted: false, //是否静音，true静音
    playStatus: 0, //当前的播放状态，0:播放停止，1，正在播放，2，暂停
    videoInfo: {
      "mutedOn": "",
      "mutedOff": "",
      videoUrl: '',
      videoBgUrl: '' //视频背景封面的url
    },
    showSourceLoading: true, //预加载loading
    videoShowCnt: false, //视频展示内容的时候
    autoplay: true,
    isFullScreen: false, //
    hideLoadingTime: '',
    intoView: "intoId0",
    skuList: [],
    showLoginPop:false,//弹窗时候登录状态，兼容授权展示不全
    "source":'',
    "targetId":'',
    ssid:''
  },
  behaviors: [back],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //点击上边返回按钮不弹，其他按正常逻辑
    if (getApp().globalData.backFromBuyTopBar && getApp().globalData.backFromBuyTopBar == 1) {
      this.setData({
        showInfoPop: false,
      })
      getApp().globalData.backFromBuyTopBar = 0
    } else if (options.buyPopInfo && options.buyPopInfo == 1) {
      this.setData({
        showInfoPop: true,
        intoView: "intoId0"
      })
    }
    console.log("onLoad--options", options)
    this.getSkinList()
  },
  //设置图标过期时间戳
  setFlagTime(id) {
    let value = {
      id: id,
      expired: '', //过期时间（时间戳）,当日中午12点，或下日中午12点
    }
    let myDate = new Date();
    let time = myDate.getTime()
    let y = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
    let m = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    let d = myDate.getDate(); //获取当前日(1-31)
    let date = `${y}-${m}-${d} 12:00:00`
    let timeStamp = Date.parse(date)
    if (timeStamp > time) {
      value.expired = timeStamp
    } else {
      value.expired = timeStamp + 86400000
    }
    wx.setStorageSync(`SCAN_DEVICE`, value)
  },
  //商品输入的格式处理
  handleInput(e) {
    let value = e.detail.value
    let {
      index
    } = e.currentTarget.dataset
    let {
      skuList
    } = this.data
    let {
      sinceMax
    } = skuList[index]
    let num = 'skuList[' + index + '].productNum';
    value = value.replace(/[^\d]/g, '')
    if (value > sinceMax) {
      value = sinceMax
    }
    value=parseFloat(value)
    this.setData({
      [num]: value
    })
  },
    //商品输入的格式处理
  handleBlur(e) {
    let value = e.detail.value
    let {
      index
    } = e.currentTarget.dataset
    let {
      skuList
    } = this.data
    let {
      sinceMax
    } = skuList[index]
    let num = 'skuList[' + index + '].productNum';
    value = value.replace(/[^\d]/g, '')||0
    if(value<1){value=1}
    if (value > sinceMax) {
      value = sinceMax
    }
    value=parseFloat(value)
    this.setData({
      [num]: value
    })
  },
  //商品的减
  minusHandler(e) {
    let {
      index
    } = e.currentTarget.dataset
    let {
      skuList
    } = this.data
    let {
      productNum
    } = skuList[index]
    let num = 'skuList[' + index + '].productNum';
    productNum=parseFloat(productNum)
    if (productNum > 1) {
      this.setData({
        [num]: productNum - 1
      })
    }
  },
  //商品的加
  addHandler(e) {
    let {
      index
    } = e.currentTarget.dataset
    let {
      skuList
    } = this.data
    let {
      productNum,
      sinceMax
    } = skuList[index]
    let num = 'skuList[' + index + '].productNum';
    let selected= 'skuList[' + index + '].selected';
    productNum=parseFloat(productNum)
    if (productNum < sinceMax) {
      this.setData({
        [num]: productNum + 1,
        [selected]:true
      })
    }
  },
  selectGoods(e){
    let {
      index
    } = e.currentTarget.dataset
    let {
      skuList
    } = this.data
    let {
    selected
    } = skuList[index]
    let num = 'skuList[' + index + '].selected';
      this.setData({
        [num]: !selected
      })
    
  },
  //展示视频放大
  showVideo() {
    this.setData({
      videoShowCnt: true
    })
  },
  //展示视频缩小
  hideVideo() {
    this.setData({
      videoShowCnt: false
    })
  },
  fullscreenchange(e) {
    let {
      fullScreen
    } = e.detail
    // event.detail = {fullScreen, direction}，direction 有效值为 vertical 或 horizontal
    this.setData({
      isFullScreen: fullScreen
    })

  },
  fullScreenHandler() {
    let that = this
    wx.createSelectorQuery().select('#myVideo').context(function (res) {
      let videoContext = res.context
      videoContext.requestFullScreen()
    }).exec()

  },
  //防止快速点击
  quickClick() {
    let data = false
    let timeQuick = this.timeQuick || 0
    let nowTime = new Date().getTime()
    if (timeQuick) {
      if (nowTime - timeQuick > 1000) {
        data = true
        this.timeQuick = nowTime
      }
    } else {
      data = true
      this.timeQuick = nowTime
    }
    return data
  },
  //视频播放结束
  endVideo(e) {
    this.setData({
      playStatus: 2
    })
  },
  //监听视频的播放
  playHandler(e) {
    let {
      playStatus
    } = this.data
    if (playStatus != 1) {
      this.setData({
        showSourceLoading: false,
        playStatus: 1
      })
    }
  },
  //监听视频的暂停
  pauseHandler(e) {
    this.setData({
      playStatus: 2
    })
  },
  //changePlay,更改播放状态
  changePlay(type = 0) {
    //type=1,播放，2，停止，0，切换
    //playStatus:0,//当前的播放状态，0:播放停止，1，正在播放，2，暂停
    let {
      playStatus
    } = this.data
    let that = this
    wx.createSelectorQuery().select('#myVideo').context(function (res) {
      let videoContext = res.context
      if ((type == 0 || type == 1) && (playStatus == 0 || playStatus == 2)) {
        videoContext.play()
        playStatus = 1
      } else if ((type == 0 || type == 2) && playStatus == 1) {
        videoContext.pause()
        playStatus = 2
      }
      // videoContext.stop()
      // playStatus=0
      that.setData({
        playStatus: playStatus
      })
    }).exec()
  },
  //点击播放按钮
  clickPlay() {
    this.changePlay()
  },
  //切换视频声音
  changeMuted(e) {
    this.setData({
      muted: !this.data.muted
    })
  },
  bindprogressVideo(e) {
    let {
      showSourceLoading,
      videoInfo
    } = this.data
    let {
      buffered
    } = e.detail
    //buffered//视频的缓冲加载的进度百分比,0-100
    if (showSourceLoading && buffered && buffered > (videoInfo.buffered || 0)) {
      this.setData({
        autoplay: true,
        showSourceLoading: false
      }, () => {})
    }
  },
  //获取皮肤
  getSkinList() {
    let that = this
    wx.showLoading({
      title: '加载中...',
      icon: 'none',
      mask: true
    })
    wx.request({
      url: 'https://static.tojoyshop.com/data/wxapp-obh/buyInfo20221212.json?t=' + new Date().getTime(),
      method: 'GET',
      success(res) {
        if (res.data.data) {
          let skinList = res.data.data.skinList || []
          let popInfoList = res.data.data.popInfoList || []
          let tip = res.data.data.tip
          let bgType = res.data.data.bgType || 0 //背景视频还是图片，0默认图片，1视频
          let videoInfo = res.data.data.videoInfo || {}
          let videoSkinList = res.data.data.videoSkinList || []
          let videoShowCnt = false
          if (bgType == 1) {
            videoShowCnt = false
            skinList = videoSkinList
            clearTimeout(that.hideLoadingTime)
            that.hideLoadingTime = setTimeout(() => {
              if (that.data.showSourceLoading) {
                that.setData({
                  playStatus: 2,
                  videoShowCnt: false,
                  autoplay: true,
                  showSourceLoading: false
                })
              }
              clearTimeout(that.hideLoadingTime)
            }, that.data.videoInfo.timeHide || 10000)
          } else {
            that.setData({
              showSourceLoading: false
            })
          }
          that.setData({
            videoShowCnt,
            videoInfo,
            bgType,
            "skinList": skinList,
            "popInfoList": popInfoList,
            'tip': tip
          })
        }
      },
      complete() {
        wx.hideLoading()
      },
      fail(res) {
        that.setData({
          showSourceLoading: false
        })
      },
    })
  },
  popInfobinddragend(e) {
    let scrollTop = e.detail.scrollTop
    if (scrollTop < -50) {
      this.closePopInfoHandler()
    } else {
      this.setData({
        popCntBottom: 0
      })
    }
  },
  popInfobinddragging(e) {
    let scrollTop = e.detail.scrollTop
    if (scrollTop < 0) {
      this.setData({
        popCntBottom: scrollTop
      })
    } else {
      this.setData({
        popCntBottom: 0
      })
    }
  },
  mytouchStart: function (e) {
    // 开始触摸，获取触摸点坐标
    this.setData({
      startPoint: [e.touches[0].pageX, e.touches[0].pageY]
    })
  },

  mytouchMove: function (e) {
    var curPoint = [e.touches[0].pageX, e.touches[0].pageY]
    var startPoint = this.data.startPoint
    let h = (curPoint[1] - startPoint[1])
    if (h > 0) {
      this.setData({
        popCntBottom: -h
      })
    } else {
      this.setData({
        popCntBottom: 0
      })
    }
  },
  /**
   * 触摸结束事件，主要的判断在这里
   */
  mytouchEnd: function (e) {
    let {
      startPoint
    } = this.data
    var endX = e.changedTouches[0].pageX;
    var endY = e.changedTouches[0].pageY;
    if (endY - startPoint[1] > 20) {
      this.setData({
        startPoint: [0, 0]
      })
      this.closePopInfoHandler()
    } else {
      this.setData({
        popCntBottom: 0
      })
    }
  },

  /* 圆环进度条 上的点
  注意此处 传参 step 取值范围是0到2，相当于2的时候是满圆，0的时候空圆
  */
  drawProgressbg: function (step) {
    let {
      radius
    } = this.data
    wx.createSelectorQuery()
      .select('#canvasProgressbg').fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        // let systemInfo = wx.getSystemInfoSync()
        // let scaleNum = systemInfo.windowWidth / 375
        let w = res[0].width
        let h = res[0].height
        radius = (w) / 2
        canvas.width = w + 10
        canvas.height = h + 10
        let x = (w + 12) / 2 + radius * Math.cos(step * Math.PI - Math.PI / 2)
        let y = (h + 12) / 2 + radius * Math.sin(step * Math.PI - Math.PI / 2)
        // 使用 wx.createContext 获取绘图上下文 context
        ctx.fillStyle = '#ffffff'; // 设置圆环的颜色
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath(); //开始一个新的路径
        ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
        ctx.fill();
        //设置一个原点(100,100)，半径为90的圆的路径到当前路径
        ctx.stroke(); //对当前路径进行描边
      })
  },
  /* 圆环进度条
  注意此处 传参 step 取值范围是0到2，相当于2的时候是满圆，0的时候空圆
  */
  drawCircle: function (step) {
    let radius = 0
    wx.createSelectorQuery()
      .select('#canvasProgress').fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const context = canvas.getContext('2d')
        // let systemInfo = wx.getSystemInfoSync()
        // let scaleNum = systemInfo.windowWidth / 375
        let w = res[0].width
        let h = res[0].height
        radius = (w) / 2
        canvas.width = w + 10
        canvas.height = h + 10
        // 设置渐变
        var gradient = context.createLinearGradient(radius * 2, radius * 2, 0, 0);
        gradient.addColorStop(1, '#ffffff')
        gradient.addColorStop(0, '#ffffff')
        context.lineWidth = 2;
        context.strokeStyle = gradient;
        context.lineCap = 'round'
        context.beginPath();
        // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
        context.arc((w + 10) / 2, (h + 10) / 2, radius, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
        context.stroke();
      })
  },
  // 根据时间展示，倒计时还是显示当前选择
  topTimeShow() {
    let that = this
    let {
      timeInfo,
      current,
      topTimeShowJson,
      list
    } = that.data
    let timeStep = 1 //时间间隔秒
    clearInterval(that.topTimeInterval)
    that.topTimeInterval = null
    if (timeInfo.remainingDuration) {
      let t = timeInfo.remainingDuration
      this.drawCircle(t * 2 / timeInfo.totalDuration)
      this.drawProgressbg(t * 2 / timeInfo.totalDuration)
      topTimeShowJson.h = parseInt(t / 60 / 60)
      topTimeShowJson.m = parseInt(t / 60 % 60)
      topTimeShowJson.s = parseInt(t % 60)
      this.setData({
        topTimeShowJson
      })
      that.topTimeInterval = setInterval(() => {
        let {
          list
        } = that.data
        t = t - timeStep
        if (t > 0) {
          /* 圆环进度条
          注意此处 传参 step 取值范围是0到2，相当于2的时候是满圆，0的时候空圆
          */
          this.drawCircle(t * 2 / timeInfo.totalDuration)
          this.drawProgressbg(t * 2 / timeInfo.totalDuration)
          timeInfo.remainingDuration = t
          topTimeShowJson.h = parseInt(t / 60 / 60)
          topTimeShowJson.m = parseInt(t / 60 % 60)
          topTimeShowJson.s = parseInt(t % 60)
          this.setData({
            timeInfo,
            topTimeShowJson
          })
        } else {
          clearInterval(that.topTimeInterval)
          that.topTimeInterval = null
          timeInfo.remainingDuration = 0
          let nowTime = list[current].goodsTimeJson
          this.setData({
            timeInfo,
            'topTimeShowJson': nowTime
          })
        }
      }, timeStep * 1000)
    } else {
      clearInterval(that.topTimeInterval)
      that.topTimeInterval = null
      timeInfo.remainingDuration = 0
      let nowTime = list[current].goodsTimeJson
      this.setData({
        timeInfo,
        'topTimeShowJson': nowTime
      })
    }

  },
  getDeviceTime() {
    let params = {
      id: this.data.id
    }
    API_obh.queryDeviceTime(params).then(res => {
      // res.result={
      //   remainingDuration: 600,
      //   totalDuration: 1000
      // }
      if (res.result) {
        this.setData({
          timeInfo: res.result || {}
        })
      } else {
        this.setData({
          timeInfo: {}
        })
      }
    }).catch(res => {
      this.setData({
        timeInfo: {}
      })
    }).finally(() => {
      this.topTimeShow()
    })

  },
  getId() {
    let pages = getCurrentPages()
    let options = pages[pages.length - 1].options || {}
    let id = ''
    let {
      showError,
      errorMsg
    } = this.data
    if (options && options.q) {
      // 获取url参数
      // 1.现在我们用的码地址https://jd.yunshang520.com/dc/865812058340854
      let result = decodeURIComponent(options.q)
      if (result.indexOf("jd.yunshang520.com/dc/") != -1) {
        let str = result.split("/dc/")[1] || ""
        //兼容 https://jd.yunshang520.com/dc/http://win.kjsjair.com/app/h5kjsj/index.html?id=864531069785615
        if (str.indexOf('http://win.kjsjair.com/app/h5kjsj/index.html') !== -1) {
          id = str.split("http://win.kjsjair.com/app/h5kjsj/index.html?id=")[1] || ""
        } else {
          id = str
        }
      } else if (result.indexOf("jd.yunshang520.com/dc2/") != -1) {
        id = result.split("/dc2/")[1] || ""
      }

    } else {
      id = options.deviceId || ''
    }
    console.log('buy-onshow-getId-options', options)
    getApp().globalData.deveiceCode = id //设备id
    this.setData({
      id,
    })
    this.setFlagTime(id)
    API_obh.checkShareDeviceExsits({
      'deviceId': id
    }).then(res => {
      //deviceType设备分类(1氧吧房设备2共享氧吧房)
      if (res && res.code == 200 && res.result && res.result.deviceType && res.result.deviceType == 2) {
        this.setData({
          hotelId: res.result.hotelId,
          showError: false
        })
        // wx.setStorageSync(USER_SOURCE_KEY, {
        // 	"thirdId":res.result.hotelId , "registerType":        USER_SOURCE_TYPE_KEY.HOTEL
        // })
        this.findList()
        if(this.data.skuList.length==0){
          this.getGoods()
        }
      } else {
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        })
        setTimeout(() => {
          getApp().globalData.backFromBuyTopBar = 0 //点击上边返回按钮不弹，其他按正常逻辑
          this.restart()
        }, 2000)
      }
    }).catch(err => {
      this.setData({
        showError: true
      })
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      })
      setTimeout(() => {
        getApp().globalData.backFromBuyTopBar = 0 //点击上边返回按钮不弹，其他按正常逻辑
        this.restart()
      }, 2000)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  stopHandler() {},
  closePopInfoHandler() {
    var animation = wx.createAnimation({
      duration: 250,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(800).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showInfoPop: false
      })
    }.bind(this), 250)
  },
  showInfoPopHandler() {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 250,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(800).step()
    this.setData({
      popCntBottom: 0,
      animationData: animation.export(),
      showInfoPop: true,
      intoView: "intoId0"
    })
    this.getGoods()
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 250)
  },
  getQueryVariable(link, variable) {
    var query = link.split('?')[1]
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=')
      if (pair[0] == variable) {
        return pair[1]
      }
    }
    return false
  },
  getGoodsList(id) {
    queryProductById({
        id
      })
      .then(res => {
        let list = res.result.omsProductSkus || [] //规格列表
        console.log(res)
        let skuList = []
        for (let i = 0; i < list.length; i++) {
          list[i].selected = false
          list[i].productNum = 1
          list[i].name = list[i].name||res.result.name
          skuList.push(list[i])
        }
        console.log('skuList', skuList)
        this.setData({
          skuList
        })
      })
  },
  //获取弹窗时候状态
  popStatus(e){
    console.log(e)
    this.setData({showLoginPop:e.detail.showPop})
  },
  //获取商品信息
  getGoods() {
    let {
      id
    } = this.data
    let params = {
      id: id,
      type: 2
    }
    API_obh.getSchemeUrl(params).then(res => {
      if (res.result && res.result.appletPath) {
        // pages/product/index?targetId=ZWnS6ttFWj&pid=05fc0b4db8134f2d94f1ab5d3e173098&source=HOTE
        let pid = this.getQueryVariable(res.result.appletPath, 'pid')
        let targetId = this.getQueryVariable(res.result.appletPath, 'targetId')||''
        let source = this.getQueryVariable(res.result.appletPath, 'source')||''
        let ssid = this.getQueryVariable(res.result.appletPath, 'ssid')||''
        
        this.getGoodsList(pid)
        this.setData({
          "ssid":ssid,
          "source":source,
          "targetId":targetId
        })
      }
    }).catch(err => {
      wx.showToast({
        title: '获取购买链接失败，请稍候再试。',
        icon: 'none'
      })
    }).finally(() => {

    })
  },
  // 购买氧吧蛋
  buyProduct() {
    this.getLogin()
    let {
      skuList,
      source,
      targetId,
      ssid
    } = this.data
    let selectArr = []
    skuList.map(item => {
      if (item.selected) {
        selectArr.push(item)
      }
    })
    if (selectArr.length == 0) {
      this.setData({
        intoView: 'intoId1'
      })
      wx.showToast({
        icon: 'none',
        title: '请选择商品',
      })
    } else {
      wxFuncToPromise(`navigateTo`, {
        url: `/pages/order/confirm/index`
      }).then(res => {
        let products = []
        let sortSkuList = []
        selectArr.map(item => {
          sortSkuList.push(item.id)
          products.push({
            productAttributes: item.ruleVal + item.natureVal,
            productId: item.id,
            productNum: item.productNum,
            productSellerPrice: item.firstPrice||0,
          })
        })
        res.eventChannel.emit(`products`, {
          "extra":{ 
            "channelName":source,
            "channelId":targetId,
            "distributionId":ssid
          },
          "products": products, //商品sku集合，
          "sortSkuList": sortSkuList, //购买商品顺序 skuid 集合
          "type": ORDER_SOURCE_PAGE.SUIT
        })
      })



    }
  },
  selectItemHandler(e) {
    let {
      item,
      index
    } = e.detail
    let {
      list,
      timeInfo
    } = this.data
    if (index == -1) {
      this.showInfoPopHandler()
      return false
    }
    if (!timeInfo.remainingDuration) {
      let nowTime = list[index].goodsTimeJson
      this.setData({
        current: index,
        selectInfo: item,
        'topTimeShowJson': nowTime
      })
    } else {
      this.setData({
        current: index,
        selectInfo: item
      })
    }

  },
  findList() {
    let {
      hotelId
    } = this.data
    let params = {
      'hotelId': hotelId
    }
    let selectInfo = {}
    let current = 0
    wx.showLoading({
      mask: true,
      title: '加载中...',
    })
    API_obh.findList(params).then(res => {
      if (res.code == 200) {
        if (res.result && res.result.length > 0) {
          this.getDeviceTime()
          res.result.map((item, index) => {
            let timeStr = ''
            let duration = item.duration || 0
            //type  1.时间  2.次数
            // item.type=index%2
            if (item.type == 2) {
              timeStr = ''
            } else {
              if (parseInt(duration / 60)) timeStr += parseInt(duration / 60) + '小时'
              if (duration % 60) timeStr += duration % 60 + '分钟'
            }
            item.timeStr = timeStr || '无时间'
            item.goodsTimeJson = {
              h: parseInt(duration / 60),
              m: duration % 60,
              s: 0,
            }
          })
          selectInfo = res.result[0]
          current = 0
          this.setData({
            listError: ''
          })
        } else {
          this.setData({
            listError: '暂无可选择服务'
          })
        }
        this.setData({
          selectInfo,
          current,
          list: res.result || []
        })
      } else {
        wx.showToast({
          title: res.msg || '网络请求失败，稍后再试！',
          icon: 'none'
        })
        this.setData({
          listError: res.msg || '网络请求失败，稍后再试！'
        })
      }
    }).catch(res => {
      this.setData({
        listError: res.msg || '网络请求失败，稍后再试！'
      })
      wx.showToast({
        title: res.msg || '网络请求失败，稍后再试！',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getLogin()
    this.getId()
    this.getWxCode()
  },
  getLogin() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    this.setData({
      isLogin: !!user.userId
    })
  },
  closePopHandler() {
    this.setData({
      showPopup: false
    })
  },
  backHandler() {
    let pages = getCurrentPages();
    if (this.data.videoShowCnt) {
      this.setData({
        videoShowCnt: false
      })
      return false
    }
    //点击上边返回按钮不弹，其他按正常逻辑
    getApp().globalData.backFromBuyTopBar = 1
    this.restart()
    // if (pages.length && pages.length > 1) {
    //   wx.navigateBack({
    //     delta: 1
    //   })
    // } else {
    //   this.restart()
    // }
  },
  goRecord() {
    wx.navigateTo({
      url: `/pages/obh/record/index?id=${this.data.id}`,
    })
  },
  //获取code
  getWxCode(callBack) {
    let that = this
    wx.login({
      success(res) {
        that.setData({
          wxCode: res.code
        }, () => {
          callBack && callBack()
        })
      },
      fail() {
        that.getWxCode(callBack)
      }
    })
  },
  showProtocolToast() {
    wx.showToast({
      title: '请勾选下方协议',
      icon: 'none'
    })
  },
  authoBuyHandler(e) {
    let loginType = e.currentTarget.dataset.loginType || 0
    this.getLogin()
    if (loginType == 1) {
      this.confirmPay()
    } else if (loginType == 2) {
      this.goRecord()
    }
  },
  toggleProtocol() {
    this.setData({
      isProtocolChecked: !this.data.isProtocolChecked
    })
  },

  isShowAgreement(e) {
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/obh/agreement/agreement?type=${type}`
    })
  },
  //检验是否能创建订单
  checkConfirm() {
    let callBackValue = false
    let {
      id,
      selectInfo
    } = this.data
    if (!id) {
      wx.showToast({
        title: '没有设备id',
        icon: 'none'
      })
      callBackValue = false
    } else if (!selectInfo.id) {
      wx.showToast({
        title: '没有选择服务',
        icon: 'none'
      })
      callBackValue = false
    } else {
      callBackValue = true
    }
    return callBackValue
  },
  // 确认支付
  confirmPay() {
    let that = this
    let {
      canPayClick,
    } = this.data
    if (!canPayClick) return false
    if (!this.checkConfirm()) return false
    that.setData({
      canPayClick: false
    })
    wx.login({
      success: function (loginRes) {
        if (loginRes && loginRes.code) {
          let wxCode = loginRes.code
          that.createOrder(wxCode)
        } else {
          wx.showToast({
            title: '获取微信code异常，支付失败',
            icon: 'none'
          })
          that.setData({
            canPayClick: true
          })
        }
      },
      fail: function (loginRes) {
        wx.showToast({
          title: '获取微信code异常，支付失败',
          icon: 'none'
        })
        that.setData({
          canPayClick: true
        })
      }
    })

  },

  createOrder(wxCode) {
    let that = this
    let {
      id,
      selectInfo,
      canPayClick,
      orderInfo
    } = this.data
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    //创建订单
    let params = {
      customerMobile: user.mobile, //	下单人手机		false
      customerName: '', //下单人名称		false
      deviceNo: id, //设备编号		false
      goodsId: selectInfo.id, //商品id		false
      createId: user.userId, //	用户信息
    }
    API_obh.buyOrder(params)
      .then((res) => {
        if (res && res.code == 200) {
          let payParams = {
            alipayUserId: '', //支付宝授权auth_code获取的buyer_id 也就是user_id		false
            authCode: '', //	支付宝授权auth_code		false
            browserType: '', //	页面访问环境类型（1：非微信浏览器、2：微信浏览器）【必填】		false
            clientIp: '', //	客户端IP地址		false
            mobile: '', //	手机号		false
            openId: '', //	微信openId【browserType=2时必填】		false
            channelInner: 2, //	1 微信APP 2 微信小程序 3 微信公众号 4 支付宝APP 5 支付宝H5 6 微信H5 7 支付宝生活号		false
            payType: 1, //	支付平台类型（1：微信、2：支付宝）【必填】		false
            returnUrl: '', //	跳转url		false
            orderId: res.result.id || '', //	交易流水号，用于发起支付【必填】		false
            userId: '', //	用户ID【必填】		false
            wxCode: wxCode //	微信个人code，小程序登录唯一code码
          }
          orderInfo = res.result
          that.setData({
            orderInfo: res.result
          })
          API_obh.pay(payParams).then((payres) => {
            if (payres.code && payres.code == 200 && payres.result) {
              if (payres.result.mockPayStatus == 'YES') {
                //走挡板
                wx.navigateTo({
                  url: `/pages/obh/success/index?deviceId=${id}&name=${selectInfo.name}&money=${selectInfo.price}`
                })
                that.setData({
                  canPayClick: true
                })
                that.getWxCode()
              } else {
                that.payWeixin(payres.result)
              }
            } else {
              if (payres.code && payres.code == 402) {
                that.getLogin()
              }
              wx.showToast({
                title: payres.msg || '网络请求失败，请稍后再试',
                icon: 'none'
              })
              that.setData({
                canPayClick: true
              })
              that.getWxCode()
            }
          }).catch(err => {
            if (err.code && err.code == 402) {
              that.getLogin()
            }
            wx.showToast({
              title: err.msg || '网络请求失败，请稍后再试',
              icon: 'none'
            })
            that.setData({
              canPayClick: true
            })
            that.getWxCode()
          })
        } else {
          if (res && res.code == -4007) {
            that.setData({
              errorTime: res.msg,
              showPopup: true
            })
          } else {
            wx.showToast({
              title: res.msg || '网络请求失败，请稍后再试',
              icon: 'none'
            })
          }
          that.setData({
            canPayClick: true
          })
          that.getWxCode()
        }
      }).catch((res) => {
        that.getWxCode()
        if (res && res.code == -4007) {
          that.setData({
            errorTime: res.msg,
            showPopup: true
          })
        } else {
          if (res.code && res.code == 402) {
            that.getLogin()
          }
          wx.showToast({
            title: res.msg || '网络请求失败，请稍后再试',
            icon: 'none'
          })
        }
        that.setData({
          canPayClick: true
        })
      })
  },

  //微信支付
  payWeixin(payParams) {
    let that = this
    let {
      orderInfo,
      selectInfo,
      canPayClick,
      id
    } = this.data
    wx.requestPayment({
      timeStamp: payParams.timestamp.toString(),
      nonceStr: payParams.noncestr,
      package: payParams.prepayid,
      signType: payParams.signType,
      paySign: payParams.sign,
      success: function (res) {
        wx.navigateTo({
          url: `/pages/obh/success/index?deviceId=${id}&name=${selectInfo.name}&money=${selectInfo.price}`
        })
        that.getWxCode()
        that.setData({
          canPayClick: true
        })
      },
      fail: function (err) {
        that.getWxCode()
        // wx.showToast({
        //   icon: 'none',
        //   title: '支付失败',
        // })
        that.setData({
          canPayClick: true
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    let that = this
    clearInterval(that.topTimeInterval)
    clearTimeout(that.hideLoadingTime)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    let that = this
    clearInterval(that.topTimeInterval)
    clearTimeout(that.hideLoadingTime)
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
})