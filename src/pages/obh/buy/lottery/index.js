// pages/obh/promotion/lottery/index.ts
import { STORAGE_USER_FOR_KEY } from '@const/index'
import * as API_Obh from '../../models/obh'
import back from "../../../../behaviors/back";
import { interceptionPrivacyProtocol, parsePageOnLoadOptions, isLogged } from "@utils/index";
import { track } from "../../../../utils/sa";
import { wxFuncToPromise } from "@utils/wxUtils";
import { downloadLotteryGifs } from '../../../../utils/loadGif'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAnimCircle: false,
    type: '',
    lotteryDetail: {},
    prizeId: '', // 抽中结果id
    config: {
      titleLength: 7
    },
    shareTimes: 3,
    surplusRaffleNum: 0,
    pageHeight: 0,
    isLoaded: false,
    showPoster: false,
    posterData: [],
    canvasImgUrl: '',
    employeeId: '',
    userId: '',
    isEnterLogin: false,
    drawNum: 0,
    activityId: '', 
    openId: '', 
    deviceId: '',
    hotelName: '',
    hotelId: '',
    raffleIllustrates: [],
    topImgs: [],
    mainConfig: {},
    activity: {},
    lotteryEnable: false,
    lotteryResult: {},
    promptMsg: '',
    prizeLogId: '',
    lotteryEmpty: false,
    showPrivacy: false,
    pageStartTime: '',
    checkInType: '',
  },

  behaviors: [back],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let { activityId, openId, hotelId, drawNum, type, prizeLogId, userId, employeeId, scene, checkInType, deviceId, hotelName } = options
    this.setData({checkInType, deviceId, hotelName})
    let user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    if (user && user.userId) {
      this.setData({isEnterLogin: true, activityId, openId, hotelId, drawNum, type, prizeLogId, userId, employeeId, scene}, () => {
        this.checkShareLogin()
      })
    } else {
      let that = this
      wx.login({
        success: (res) => {
          API_Obh.getWechatOpenId({ code: res.code }).then(({ result, code }) => {
            // 增加抽奖次数。
            if (userId) {
              API_Obh.addShareCount({activityId, hotelId, driveUserId: userId, openId: result.openid, driveUserType: 1}).then(res => { that.queryLotteryTimes() })
            } else {
              API_Obh.addShareCount({activityId, hotelId, driveUserId: employeeId, openId: result.openid, driveUserType: 2}).then(res => { that.queryLotteryTimes() })
            }
          })
        }
      })
    }

    if (scene) {
      wx.showLoading({
        title: '加载中……',
      })
      API_Obh.queryShareParams(scene).then(({result}) => {
        wx.hideLoading()
        if (result && result.parameterJson) {
          let { activityId, hotelId, shareCrmUserId, shareOpenId } = JSON.parse(result.parameterJson)
          this.setData({openId: shareOpenId, activityId, hotelId, drawNum: 0, userId: shareCrmUserId}, () => {
            this.requestLotteryDetail()
          })
        }
      }).catch(({msg}) => {
        wx.hideLoading()

        wx.showToast({
          title: msg ? msg : '获取分享信息失败，请稍后重试。',
          icon: 'none'
        })
      })
    } else if (!openId && !type) {
      let that = this
      wx.login({
        success: (res) => {
          API_Obh.getWechatOpenId({ code: res.code }).then(({ result, code }) => {
            if (code == 200) {
              if (result && result.openid) {
                that.setData({openId: result.openid, activityId, hotelId, drawNum, type, prizeLogId, userId, employeeId}, () => {
                  this.requestLotteryDetail()
                })
              }
            }
          }).catch(({msg}) => {
            wx.showToast({
              title: msg ? msg : '登录失败，请稍后再试。',
              icon: 'none'
            })
          })
        },
      })
    } else {
      this.setData({
        activityId, openId, hotelId, drawNum, type, prizeLogId, userId, employeeId
      }, () => {
        this.requestLotteryDetail()
      })
    }

    wxFuncToPromise(`getPrivacySetting`, {}).then((res) => {
      const { needAuthorization } = res
      this.setData({showPrivacy: needAuthorization})
    })

    this.isLogged = isLogged()
  },

  // 显示隐私协议弹窗
  showPrivacyFn() {
    let { type } = this.data
    if(type) return
    interceptionPrivacyProtocol()
    this.setData({showPrivacy: false})
  },

  // 获取抽奖详情
  requestLotteryDetail() {
    let { activityId, openId, hotelId, type } = this.data
    let params = { activityId, openId, hotelId }
    let user = wx.getStorageSync(STORAGE_USER_FOR_KEY)


    if(type) {
      // 活动预览
      this.previewActivity({activityId, hotelId})
      return
    }
    let promise = user ? API_Obh.getLotteryActivity(params) : API_Obh.getLotteryActivityNL(params)

    promise.then(({result, code}) => {
      this.setData({
        lotteryDetail: result, mainConfig: result ? result.mainConfig : {}, 
        topImgs: result && result.mainConfig && result.mainConfig.topBackgroundImg ? result.mainConfig.topBackgroundImg.split(',') : [],
        raffleIllustrates: result && result.raffleIllustrateJson ? result.raffleIllustrateJson.split(',') : []
      }, ()  => {
        this.queryLotteryTimes()
      })
    }).catch(({msg}) => {
      this.setData({lotteryEmpty: true})

    })
  },

  // 活动预览
  previewActivity(params) {
    API_Obh.previewActivity(params).then(({result}) => {
      this.setData({
        lotteryDetail: result, mainConfig: result ? result.mainConfig : {}, topImgs: result && result.mainConfig && result.mainConfig.topBackgroundImg ? result.mainConfig.topBackgroundImg.split(',') : [],
        raffleIllustrates: result && result.raffleIllustrateJson ? result.raffleIllustrateJson.split(',') : []
      })
    }).catch(err => {
      wx.showToast({
        title: msg ? msg : '获取抽奖详情失败，请稍后再试。',
        icon: 'none'
      })
    })
  },
  
  backHandler(e) {

    const pages = getCurrentPages()
    if (pages.length <= 1) {
      this.restart()
    } else {
      wx.navigateBack()
    }
    let { hotelId, lotteryDetail, deviceId, hotelName, userId, employeeId, checkInType } = this.data

    let type = e.currentTarget.dataset.type
    if (type) {
      let { id, raffleTitle } = lotteryDetail
      track('Boss_Obh_ClosePrize', {
        hotel_id: hotelId,
        activity_id: id,
        deviceId,
        hotel_name: hotelName,
        activity_name: raffleTitle,
        page_id: checkInType ? checkInType : userId || employeeId,
        page_name: checkInType ? (checkInType == 1 ? '直接开启' : '引导开启') : '分享抽奖',})
    }
  },

		/** 返回app 异常监听*/
		launchAppError(e) {
      this.backHandler()
		},
  /**
   * 次数不足回调
   * @param e
   */
  onNotEnoughHandle(e) {
    wx.showToast({
      icon: 'none',
      title: e.detail
    })
  },

  /**
   * 抽奖回调
   */
  onLuckDrawHandle() {
    this.addLotteryTimes()

    if (this.data.type) {
      wx.showToast({
        title: '活动预览不可以参与抽奖',
        icon: 'none'
      })
      return
    }

    if (this.data.surplusRaffleNum <= 0) {
      this.setData({lotteryEnable: true})
      wx.showToast({
        title: '没有抽奖机会了',
        icon: 'none'
      })
      return
    }

    let { activityId, lotteryDetail, hotelId, userId, employeeId, checkInType, deviceId, hotelName } = this.data
    API_Obh.lottery({activityId, hotelId, promoterId: userId || employeeId}).then(({result}) => {
      if (result.awardsPrizeType == -1) {
        this.setData({lotteryEnable: true})
        wx.showToast({
          title: '没有抽奖机会了',
          icon: 'none'
        })
        this.setData({surplusRaffleNum: 0})
      } else {
        let awardsId = lotteryDetail.awardsVoList[result.awardsLocation - 1].id
        this.setData({prizeId: awardsId, surplusRaffleNum: this.data.surplusRaffleNum - 1, promptMsg: result.promptMsg}, () => {
          this.queryLotteryTimes()
        })
      }

      this.queryShareNum()
    }).catch(err => {

      console.log(err, 'errrr')


      this.setData({lotteryEnable: true})
      wx.showToast({
        title: msg ? msg : '抽奖失败，请稍后再试。',
        icon: 'none'
      })
    })

    let { id, raffleTitle } = lotteryDetail


    track('Boss_Obh_Prize', {
      activity_id: id,
      activity_name: raffleTitle,
      hotel_id: hotelId,
      deviceId,
      hotel_name: hotelName,
      page_id: checkInType ? checkInType : userId || employeeId,
      page_name: checkInType ? (checkInType == 1 ? '直接开启' : '引导开启') : '分享抽奖',

    })
  },

  /**
   * 查询分享次数
   */
  queryShareNum() {
    let { activityId } = this.data
    API_Obh.queryShareNum({activityId}).then(({result}) => {
      if (result) {
        this.setData({shareTimes: result.shareNum})
      }
    }).catch(err => {})
  },

  /**
   * 动画旋转完成回调
   */
  onLuckDrawFinishHandle() {
    const datas = this.data.lotteryDetail.awardsVoList;
    const data = datas.find((item) => {
      return item.id === this.data.prizeId;
    });
    this.setData({
      prizeId: '',
      lotteryResultShow: true,
      showAnimCircle: false,
      lotteryResult: data
    }, () => {
      wx.pageScrollTo({scrollTop: 0, duration: 300})
    });
  },

  closeLotteryResultPopup() {
    this.setData({lotteryResultShow: false})
  },

  // 大转盘加载完毕
  onLuckLoaded(e) {
    let that = this
    let { activityId, openId, hotelId } = this.data
      this.setData({isLoaded: true, canvasImgUrl: e.detail.canvasImgUrl}, () => {
        that.setData({activity: {activityId, openId, hotelId}})
        setTimeout(() => {

          wx.createSelectorQuery().in(that).select('.root').boundingClientRect(res =>{
            if (res &&  res.height) {
              that.setData({
                pageHeight: res.height
              })
            }
          }).exec()

          downloadLotteryGifs()
        }, 400)
      })
  },


  goBack() {
    wx.navigateBack({delta: 1})
    
    let { hotelId, lotteryDetail, deviceId, hotelName, userId, employeeId, checkInType } = this.data


    let { id, raffleTitle } = lotteryDetail
    track('Boss_Obh_ClosePrize', {
      hotel_id: hotelId,
      activity_id: id,
      deviceId,
      hotel_name: hotelName,
      activity_name: raffleTitle,
      page_id: checkInType ? checkInType : userId || employeeId,
      page_name: checkInType ? (checkInType == 1 ? '直接开启' : '引导开启') : '分享抽奖',})
  },

  gotoGift1() {
    let {openId} = this.data
    // 保存康老板用户信息
    this.gotoGift()
  },

  gotoGift() {
    if (this.data.type) {
      wx.showToast({
        title: '活动预览不可跳转',
        icon: 'none'
      })
      return
    }
    this.addLotteryTimes()
    this.setData({lotteryResultShow: false})

    let { hotelId, lotteryDetail, hotelName } = this.data
    let {id, raffleTitle} = lotteryDetail

    wx.navigateTo({
      url: `/pages/obh/myPrize/index?hotelId=${hotelId}&hotelName=${hotelName}&activityId=${id}&activityName=${raffleTitle}`,
    })
  },

  onShareClick1() {
    let {openId} = this.data
    // 保存康老板用户信息
    this.onShareClick()
  },

  onShareClick() {
    if (this.data.type) {
      wx.showToast({
        title: '活动预览不可分享',
        icon: 'none'
      })
      return
    }
    this.setData({ lotteryResultShow: false })
    this.addLotteryTimes()
    this.selectComponent('#sharePopup').shareBtn()
  },

  onShowPoster() {
    this.selectComponent('#sharePopup').showPoster()
  },


  // 增加抽奖次数
  addLotteryTimes() {
    if (!this.data.isEnterLogin) {
      let { activityId, openId, hotelId, prizeLogId, userId } = this.data
      if (!userId) {
        // let params = { activityId, openId, hotelId }
        // API_Obh.addLotteryTimes(params).then(res => {
          this.queryLotteryTimes()
        // }).catch(err => {
        //   this.queryLotteryTimes()
        // })
      }

      this.checkShareLogin()
      this.setData({isEnterLogin: true})
    }
  },

  checkShareLogin() {
    let { activityId, openId, hotelId, prizeLogId, userId, employeeId } = this.data

    // 如果需要保存分享信息
    if (prizeLogId) {
      API_Obh.saveShareLogin({raffleUserLogId: prizeLogId, driveUserType: 1}).then(res => {}).catch(err => {})
    } else if (userId || employeeId) {
      API_Obh.saveShareLogin({raffleActivityId: activityId, hotelId: hotelId, shareUserId: userId || employeeId, driveUserType: userId ? 1 : 2})
    }
  },

  queryLotteryTimes() {
    let { activityId, openId, hotelId } = this.data
    let user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    if (!activityId) return
    let params = { userId: user.userId, activityId, openId, hotelId }
    API_Obh.queryLotteryTimes(params).then(({result, code}) => {
      if (code == 200) {
        this.setData({surplusRaffleNum: result.surplusRaffleNum})
      }
    }).catch(err => {
    })
  },

  // 保存海报
  onSavePoster() {
    this.selectComponent('#posterPopup').saveImageToPhotos()
    let { hotelId, lotteryDetail, deviceId, hotelName } = this.data
    let { id, raffleTitle } = lotteryDetail
    track('Boss_Obh_Share', {
      activity_id: id,      
      activity_name: raffleTitle,
      hotel_name: hotelName,
      deviceId,
      share_type: '保存海报',
      hotel_id: hotelId
    })
  },

  // 生成海报
  async onCreatePoster() {
    wx.showLoading({
      title: '海报生成中……',
    })
    
    wx.pageScrollTo({scrollTop: 0, duration: 300})
    let user = wx.getStorageSync(STORAGE_USER_FOR_KEY)

    let { lotteryDetail, activityId, hotelId, openId, deviceId, hotelName } = this.data
    let { result } = await API_Obh.requestSunQr({shareType: 2, activityId, hotelId, shareOpenId: openId})

    const posterData = [{
      width: 500,
      height: 1000,
      background: '#51E4A1',
      elements: [
        {
          type: 'IMG',
          content: lotteryDetail.sharePosterImg,
          width: 500,
          height: 1000,
          gaussBlur: false, // 开启高斯模糊
          gaussRadius: false,
          align: 'center', // 对齐方式
          zIndex: 0,
          x: 0,
          y: 0
        },
        {
          type: 'IMG',
          content: lotteryDetail.exposureImg,
          width: 500,
          height: 91,
          align: 'center', // 对齐方式
          zIndex: 0,
          x: 0,
          y: 0
        },
        {
          type: 'IMG',
          content: lotteryDetail.hotelLogo,
          width: 40,
          height: 40,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 197,
          y: 50
        },
        {
          type: 'IMG',
          content: 'https://static.tojoyshop.com/images/obh/lottery/ic-oo-hotel-logo.png',
          width: 40,
          height: 40,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 263,
          y: 50
        },
        {
          type: 'IMG',
          content: lotteryDetail.raffleTitleImg,
          width: 500,
          height: 129,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 0,
          y: 91
        },
        {
          type: 'IMG',
          content: lotteryDetail.mainConfig.largeTurntableBackgroundImg,
          width: 416,
          height: 416,
          align: 'left', // 对齐方式
          zIndex: 1,
          x: 42,
          y: 219
        },
        {
          type: 'RECT', // 矩形
          width: 460, // 矩形宽度
          height: 349, // 矩形高度
          align: 'center', // 对齐方式
          color: 'rgba(255, 255, 255, 1)', // 矩形颜色
          borderRadius: 25,
          zIndex: 0,
          x: 20,
          y: 616
        },
        {
          type: 'IMG',
          content: user.headimg || user.avatarUrl || 'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/icon-default-head.png',
          width: 46,
          height: 46,
          borderRadius: 23,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 49,
          y: 641
        },
        {
          type: 'TEXT',
          content: `来自你的好友${user.nickname || user.mobile}`,
          width: 346,
          height: 46,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#000000',
          fontSize: 19,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 105,
          y: 650
        },
        {
          type: 'TEXT',
          content: result.title,// `我正在参加“住氧吧房赢大奖”活动，奖品丰厚，有森林氧吧、苹果14手机、53°飞天茅台等，快来和我一起参与吧`,
          width: 410,
          height: 46,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#000000',
          fontSize: 19,
          maxLine: 4, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 46,
          y: 703
        },
        {
          type: 'RECT', // 矩形
          width: 180, // 矩形宽度
          height: 35, // 矩形高度
          align: 'left', // 对齐方式
          color: '#E9E9E9', // 矩形颜色
          borderRadius: 7,
          zIndex: 0,
          x: 46,
          y: 839
        },
        {
          type: 'TEXT',
          content: `长按识别二维码`,
          width: 160,
          height: 32,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 600,
          color: '#000000',
          fontSize: 23,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 53,
          y: 840
        },
        {
          type: 'TEXT',
          content: `好运带回家`,
          width: 100,
          height: 28,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#000000',
          fontSize: 20,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 53,
          y: 880
        },
        {
          type: 'IMG',
          content: `data:image/png;base64,${result.qrCode}`, // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQAAAACoxAthAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAd2KE6QAAAAJcEhZcwAAFxEAABcRAcom8z8AAAM1SURBVHja7Zw9juswDIQZpEjpI+QoPppzNB/FR3CZwrBWGv5IeXhbbJGAAYZVYPlzQ5GiRlSk/NmECBEib0ZWUSuPeZPpeT3bZzaRG16oo/VZfVHtSiQzcm9DJ+BJHfyYS9nxylKf1V+XIksbeBLJjdRn7vPpqV6+71M5xOYBfL7EPCDyWaRGZXXlcamulObUA66so7fjQuSrEHgfq2H1fkEsImYtKol8AeIJtmVVeFqQYHv4/p6TiaRChrJn2i1oa05+enDrs98qJSJ5kG4Ke06Gz+s80BnRjUhiZEd9VF+8W6haIMP7pddMkwcykZxILJuLwsi/W9uCNKt7TauUUBITSY3A5ye8b0gLX/9MK4RLjBJJj2iBK7qU+k4GwR02e/VE5DOINMXtHFKtCjY322HG6EuCJZIQaW9CPIXPo27FsHk/RFYhkhxBClVrsIeueX8q9sFYK4kkRVzjsd2kCgMtkLsGe2pOhhFJjEyqt6LYiQOPXTPxCmEdpVATC4hkRlYJ5VWkn4JYIEMiKKcMVS2RvIjuIVU6vx2ekeH9itjiq+8RyYzAVJrb7KHMvpu05gCHiaRGcCLZQnVBH4AJdy7X+ULbrOdkIu9HvMMGZ1Imo4opc6hbRZF561FJJCeCgwwRk1GvOg9UJR+LIpwtE8mMqKDq4fuMYsdTrWhIPwbvE0mKiIaqNQeoXNd+2bZExGfELn0zQiQj4gEq2ml10UYdtYd7/9+GECIJEW9GHbclUTN1n3ctiEhiRPUcLK/DeYgFt46qEUmOuDDgx/8Wvi7ciYgLd0IkNYKsa51W+3ByiUXVEf00kc8hulaG4uaHG5OtlZF+h8NHIjmRLhFo27EXQN373rXaEyyRlEg0UA033tDJIahbt35Zp3Stj0hGJMxOp8z2+DV0ZL10dxDJhqzqW69WTVgvux1ubH6bY5WXNi0iCZF787AND1eKy6sCpEeThUhqZB9uPuqi2nPyCgVI58cg2xJJjRSIBaVEt7gdfJVhh0nkK5DHHD1XfnPDms6b9Ws7RD6EuLOa6dWpaDY26UakF0VE8iJD2TN0kA933+IfHeQ/FSyRPMhfjQgRIm9FfgAcCIPJFUuJxQAAAABJRU5ErkJggg==',// this.data.canvasImgUrl,
          width: 129,
          height: 129,
          borderRadius: 0,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 318,
          y: 808
        },
      ]
    }];


    if (lotteryDetail.exposureStatus == 2) {
      posterData[0].elements.splice(1, 3)
    }

    this.setData({
      showPoster: true, posterData: {posterParams: posterData, canvasImgUrl: this.data.canvasImgUrl, activityId, hotelId, draft: this.data.mainConfig.startLotteryButtonImg}
    })
    
    let { id, raffleTitle, } = lotteryDetail
    track('Boss_Obh_Share', {
      activity_id: id,      
      activity_name: raffleTitle,
      share_type: '分享海报',
      hotel_id: hotelId,
      deviceId,
      hotel_name: hotelName
    })
  },

  // 关闭分享
  onCloseShare() {
    this.setData({
      showPoster: false
    })
  },

  onShow() {
    this.queryLotteryTimes()
    this.setData({
      pageStartTime: new Date()
    })
  },

  onHide() {
    this.onPageUnload()
  },

  onUnload() {
    this.onPageUnload()
  },

  onPageUnload() {
    let { pageStartTime, activityId, lotteryDetail, hotelId, hotelName, deviceId, pageHeight, userId, employeeId } = this.data
    let pageEndTime = new Date()
    let {raffleTitle} = lotteryDetail


    if (!this.scrollTop) {
      this.scrollTop = 0
    }
    if (!pageHeight) {
      pageHeight = 1
    }

    let page_scale = this.scrollTop / pageHeight * 100
    if (page_scale > 100) page_scale = 100

    track('Boss_Obh_Special_Detail', {
      deviceId,
      hotel_id: hotelId,
      hotel_name: hotelName,
      activity_id: activityId,
      activity_name: raffleTitle,
      special_id: activityId,
      special_name: raffleTitle,
      page_scale: page_scale, // 需要计算
      video_duration: 0,
      is_loggedIn: this.isLogged, // 需要进入页面时确定 
      start_time: pageStartTime,
      end_time: pageEndTime,
      cycle_time: Math.floor((pageEndTime.getTime() - pageStartTime.getTime()) / 1000),
      sharer_id: userId || employeeId,
    })

  },

  // 分享小程序卡片
  onShareFriend() {
    let { activityId, hotelId, lotteryDetail, deviceId, hotelName  } = this.data
    API_Obh.shareForLottery({activityId, hotelId}).then(res => {
      this.queryLotteryTimes()
    }).catch(err => {
      this.queryLotteryTimes()

    })

    this.setData({
      showPoster: false,
    }, () => {
      wx.showShareMenu()
    })
    
    let { id, raffleTitle } = lotteryDetail
    track('Boss_Obh_Share', {
      activity_id: id,      
      activity_name: raffleTitle,
      share_type: '分享小程序',
      hotel_id: hotelId,
      deviceId,
      hotel_name: hotelName
    })
  },

  touchMove() {
    return
  },


  onShareAppMessage(res) {
    let { activityId, hotelId, lotteryDetail  } = this.data
    let user = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
    return {
      title: lotteryDetail.shareTitle || '住氧吧房赢大奖',
      path: `/pages/obh/buy/lottery/index?activityId=${activityId}&hotelId=${hotelId}&userId=${user.userId}`,
      imageUrl: lotteryDetail.shareImg || 'https://static.tojoyshop.com/images/obh/lottery/lottery-set/wx-share.png'
    }
  },

  
  onPageScroll(e) {
    let { scrollTop } = e
    if (!this.scrollTop) this.scrollTop = 0
    if (scrollTop > this.scrollTop) {
      this.scrollTop = scrollTop
    }
  },

  onShowAnimCircle(e) {
    this.setData({showAnimCircle: true})
  }

})