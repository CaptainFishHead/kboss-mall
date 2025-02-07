import carrier from "../../behaviors/carrier";
import {isLogged} from "@utils/index";
import {SOURCE,APP_ID,THIRD_PARTY_PATH} from "@const/index";
import {getPageShareInfo, toPosterPage} from "@utils/sharePoster";
import {getNavBar, setWechatMoments, wxFuncToPromise} from "@utils/wxUtils";
import {queryScene} from "@models/commonModels";
import saInit, {saLogin, track, TrackEventName} from "@utils/sa";
import {getLocalUser, getHealthKnow, getHCBToken} from "@models/userModel";
import env from "@config/env";

const app = getApp()

Page({
  behaviors: [carrier],
  data: {
    navBar: {},
    isLogged: isLogged(),
    isBack: false,
    scrollTop: '0',
    isstopAudio: false,
    healthKnow: {} //健康早知道
  },
  _audioTime: 0, // 音频的多次累加时间
  _playTime: 0,
  _currentTime: 0,
  onShow() {
    this.setData({
      pointParamsDetail: {
        ...this.data.pointParamsDetail,
        start_time: new Date()
      }
    })
    this.queryThemeByPageId({pageType: 3})
    this.queryColumnCellByPageId({pageType: 3});
  },
  onPageScroll(e) {
    this.pageScrolling(e);
  },
  onLoad(options) {
    this.setData({
      navBar: getNavBar()
    })
    if (options.source && getCurrentPages().length === 1) {
      saInit({
        lby_source: options.source,
        lby_skipscene: options.position || '',
        lby_liveid: options.targetId || '',
        lby_detailid: options.targetId || '',
        // lby_shareid: v2_code || '',
        // lby_fourth: params.targetId || ''
      })
      const {userId} = getLocalUser()
      if (userId) {
        saLogin(userId, false)
      }
    }
    // if (options.v2_code) return setWechatMoments(options); // 从朋友圈进入时调用
    // 调用健康早知道接口
    this.getHealthKnowFun()
  },
  // 健康早知道
  getHealthKnowFun() {
    getHealthKnow().then(({result}) => {
      if (result) {
        if(result.createdTime){
          result.createdTime = result.createdTime.replace(new RegExp("-", 'g'), '/')
        }
        let data = new Date(result.createdTime)
        let month = data.getMonth() + 1
        let day = data.getDate()
        let week = data.getDay()
        let weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        result.month = month > '9' ? month : '0' + month
        result.day = day > '9' ? day : '0' + day
        result.week = weekDays[week]
        this.setData({
          healthKnow: result
        })
      }
    })
  },
  // 健康早知道往期内容
  clickPrevious() {
    wx.navigateTo({
      url: '/pages/recommend/index?columnId=' + this.data.healthKnow.columnId
    })
  },
  // 健康早知道跳转详情
  clickBtndetail() {
    wx.navigateTo({
      url: '/pages/recommend/graphicDetail/index?id=' + this.data.healthKnow.recommendId
    })
  },
  timeUpdate(e) {
    /* 记录累计播放时长 埋点使用 start */
    const innerAudioContext = e.detail
    if (innerAudioContext.currentTime - this._currentTime > 1) {
      // 减去拖拽的无效时长
      this._playTime = this._playTime - (innerAudioContext.currentTime - this._currentTime)
    }
    this._currentTime = innerAudioContext.currentTime
    /* 记录累计播放时长 埋点使用 end */
  },
  playEnd() {
    this._playTime = this._playTime + this._currentTime // 循环播放累计时长
    this._currentTime = 0
  },
  // 获取分享信息
  async getShareInfo({pageUrl, pageOptions}) {
    const {shareInfo} = app.globalData;
    const {v2_code: shareId, wxQrCode: shareCode} = await getPageShareInfo({pageUrl, pageOptions});
    const {title, imgUrl} = this.data;
    return {
      imgUrl: imgUrl || shareInfo.imageUrl,
      title: title || shareInfo.title,
      shareId,
      shareCode,
    };
  },
  // 生成海报
  async createPoster(e) {
    const {imgUrl, title, shareId, shareCode} = await this.getShareInfo(e.detail);
    const posterParams = [{
      width: 596,
      height: 804,
      background: '#fff',
      elements: [
        {
          type: 'IMG',
          content: imgUrl,
          width: 520,
          height: 384,
          borderRadius: 4,
          align: 'center', // 对齐方式
          zIndex: 0,
          x: 38,
          y: 37
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: title,
          width: 520,
          height: 42,
          align: 'center', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 30,
          maxLine: 2, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 38,
          y: 461
        },
        {
          type: 'LINE', // 线条
          width: 522, // 线条宽度
          height: 1, // 线条高度
          align: 'center', // 对齐方式
          color: '#F1F1F1', // 线条颜色
          zIndex: 0,
          x: 38,
          y: 564
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '长按识别二维码',
          width: 200,
          height: 38,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 25,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 38,
          y: 632
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '即刻选购',
          width: 200,
          height: 38,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 25,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 38,
          y: 670
        },
        {
          type: 'IMG',
          content: shareCode,
          width: 166,
          height: 166,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 385,
          y: 587
        }
      ]
    }];
    toPosterPage({
      type: 1,
      shareId,
      shareParams: posterParams,
      title,
      imgUrl
    });
  },
  // 生成分享码
  async createShareCode(e) {
    const {imgUrl, title, shareId, shareCode} = await this.getShareInfo(e.detail);
    const shareCodeParams = [{
      width: 596,
      height: 920,
      background: {
        rotate: 90, // 渐变角度，取0到90度 从上到下渐变取90度， 从左到右渐变取0度  对角为45度
        colors: [[0, '#FFF5E8'], [0.6, '#FFFFFF']] // 建变过程控制，0 到 1，可设置多个 0.2 0.5 等等
      },
      elements: [
        {
          type: 'RECT', // 矩形
          width: 536, // 矩形宽度
          height: 490, // 矩形高度
          align: 'center', // 对齐方式
          color: 'rgba(255, 255, 255, 1)', // 矩形颜色
          borderRadius: 8,
          zIndex: 0,
          x: 30,
          y: 40
        },
        {
          type: 'IMG',
          content: shareCode,
          width: 400,
          height: 400,
          align: 'left', // 对齐方式
          zIndex: 1,
          x: 98,
          y: 80
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '长按二维码 即刻选购',
          width: 536,
          height: 26,
          align: 'center', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 28,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 30,
          y: 555
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '分享自 康老板小程序',
          width: 536,
          height: 24,
          align: 'center', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#666666',
          fontSize: 24,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 30,
          y: 602
        },
        {
          type: 'LINE', // 线条
          width: 490, // 线条宽度
          height: 1, // 线条高度
          align: 'center', // 对齐方式
          color: '#F1F1F1', // 线条颜色
          zIndex: 0,
          x: 53,
          y: 712
        },
        {
          type: 'IMG',
          content: imgUrl,
          width: 87,
          height: 87,
          mode: 'aspectFill',
          borderRadius: 4,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 57,
          y: 775
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: title,
          width: 300,
          height: 28,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 28,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 164,
          y: 790
        }
      ]
    }];
    toPosterPage({
      type: 2,
      shareId,
      shareParams: shareCodeParams,
      title,
      imgUrl
    });
  },
  //分享朋友
  onShareAppMessage(res) {
    const {title, imgUrl} = this.data
    const {shareInfo} = app.globalData
    const promise = new Promise(async (resolve) => {
      const {v2_code} = await getPageShareInfo();
      resolve({
        title: title || shareInfo.title,
        imageUrl: imgUrl || shareInfo.imageUrl,
        path: `/pages/index/index?v2_code=${v2_code}`
      })
    })
    return {
      title: title || shareInfo.title,
      imageUrl: imgUrl || shareInfo.imageUrl,
      promise
    }
  },
  /*返回顶部*/
  goTop() {
    this.setData({
      scrollTop: 0
    })
  },
  // 打开红促宝，去康豆页面
  async navigateToMiniHongCuBao() {
    const {result} = await queryScene();
    if (!result.sceneId) {
      return null;
    }
    const {result: hcbResult} = await getHCBToken();
    //跳转红促宝 埋点
    track(TrackEventName.Boss_HcbReturn, {lb_name: result.sceneId});
    wxFuncToPromise(`navigateToMiniProgram`, {
      appId: APP_ID.HONG_CU_BAO,
      path: THIRD_PARTY_PATH.HONG_CU_BAO_KANG_DOU,
      extraData: {
        token: hcbResult.result,
        source: SOURCE.BH_MALL,
        sceneId: result.sceneId,
      },
      envVersion: env.envVersion,
    });
  },
  isNeedLogin(e) {
    //后台开关是否登录，否并且未登录、否并且已登录、是并且未登录、 是并且已经登录
    //检测是否登录（未登录就出登录半弹层）
    const {openLoginModal} = this.selectComponent(`#authorize`)
    if (Number(this.data.theme.isForceLogin) === 1 && !isLogged()) {
      openLoginModal().then(result => {
        if (result.type === 'success') {
          this.switchNavigateto(e)
        }
      })
    } else {
      this.switchNavigateto(e)
      // return false
    }
  },
  // 跳转调用封装
  switchNavigateto(e) {
    const type = e.currentTarget.dataset.type
    switch (type) {
      case 'WQSJ':
        this.clickPrevious()
        break;
      case 'QWNR':
        this.clickBtndetail()
        break;
    }
  },
  onUnload() {
    this.setPoint()
  },
  onHide() {
    this.setPoint()
  },
  setPoint() {
    let healthKnow = this.data.healthKnow
    this._audioTime = this._playTime + this._currentTime
    track(TrackEventName.Boss_HealthTips, {
      detail_id: healthKnow.recommendId,
      content_name: healthKnow.title,
      video_duration: this._audioTime
    })
  }
});