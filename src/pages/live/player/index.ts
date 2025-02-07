// pages/live/player/index.ts
import { CONSUMER_HOTLINE, SOURCE, STORAGE_USER_FOR_KEY } from "@const/index";
import { getPoster } from "@models/commonModels";
// import { queryWxQRCodeModel } from "@models/wxQRCodeModel";
import { ENUM_LIVE_STATE, IGoodsInfo } from "../models/types/live";
import { TOAST_TYPE } from "@const/index";
import { showToast, hideToast, showLoadingToast } from "@components/toast/index";
import { exitPictureInPicture } from '@utils/index'
import { wxFuncToPromise } from "@utils/wxUtils";
import { stringify } from "qs";
// import ENV from "@config/env";
import Tim from "tim-wx-sdk";
import {SCENE_TYPE, track, TrackEventName} from "@utils/sa";
import { getPageShareInfo } from "@utils/sharePoster";



Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isLogin: false,
    roomId: '',
    shareShow: false,
    roomInfo: <any>{},
    liveState: <ENUM_LIVE_STATE>ENUM_LIVE_STATE.PENDING,
    tim: Tim,
    disabledClick: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    exitPictureInPicture()
    this.setData({ roomId: options.roomId || '' })
    const userInfo = wx.getStorageSync(STORAGE_USER_FOR_KEY);
    if(userInfo) {
      this.setData({isLogin: true, isLoading: false});
    } else {
      this.setData({isLogin: false, isLoading: false });
    }
  },
  /**
   * 初始化直播间信息
   */
  onInit(e: { detail: any; }) {
    this.setData({ roomInfo: e.detail });
    this.setData({liveState: e.detail.liveState})
    this.liveInTrack()
  },
  /**
   * 登录成功
   */
  loginSuccess(){
    this.setData({isLogin: true, isLoading: false});
  },
  /**
   * 跳转详情页购买
   */
  goBuy(e: { detail: IGoodsInfo }) {
    const { position, source, targetId, ssid,roomId } = this.options
    const { spuId, skuId } = e.detail
    const _ssid = targetId||ssid||source||position?JSON.stringify({serialNo:targetId,shareCode:ssid,source,position}):undefined
    wx.navigateTo({
      url: `/pages/product/index?${stringify({
        position:'live', source: SOURCE.BH_MALL, targetId: roomId, ssid:_ssid, spuId, skuId/*, agentId, storeId*/
      })}`
    });
  },
  /**
   * 返回上一个页面
   */
  goBack() {
    wx.navigateBack();
  },
  /**
   * 监听直播间状态变化
   */
  onliveStateChange(e: { detail: { liveState: ENUM_LIVE_STATE; }; }) {
    const {liveState} = e.detail;
    this.setData({liveState})
  },
  /**
   * 跳转购物车
   */
  goCart() {
    wx.navigateTo({ url: `/pages/plugins/cart/index` });
  },
  /**
   * 跳转订单列表
   */
  goOrder() {
    wx.navigateTo({ url: "/pages/order/index" });
  },
  /**
   * 打开分享
   */
  onShowShare(e: { detail: any; }) {
    if (this.data.disabledClick) return;
    this.selectComponent('#shareDialog').shareBtn()
    this.setData({ roomInfo: e.detail });
  },
  // 联系客服
  onContact() {
    wx.makePhoneCall({
      phoneNumber: CONSUMER_HOTLINE
    })
  },
  // 获取分享信息
  async getShareInfo({pageUrl/*, pageOptions*/}: any) {
    const { roomId } = this.data;
    const baseOption = {roomId,targetId:roomId, source: 'bh-mall', position: 'live'}
    const { v2_code: shareId, wxQrCode: shareCode } = await getPageShareInfo({pageUrl, pageOptions:{...baseOption,page_source:'分享'}});
    const { roomInfo } = this.data;
    return {
      ...baseOption,
      targetId: roomId,
      title: roomInfo.title || '',
      imageUrl: roomInfo.coverUrl || '',
      shareId,
      shareCode,
      page_source: '分享'
    }
  },
  // 海报分享
  async onCreatePoster(e) {
    this.setData({disabledClick: true});
    showLoadingToast();
    wx.$tls.share()
    const { shareCode } = await this.getShareInfo(e.detail);
    this.getPosterInfo(shareCode);
    this.shareTrack()
  },
  // 分享码分享
  async onCreateShareCode(e) {
    this.setData({disabledClick: true});
    showLoadingToast();
    wx.$tls.share()
    const { shareCode } = await this.getShareInfo(e.detail);
    this.getSunCodeInfo(shareCode);
    this.shareTrack()
  },
  /**
   * 朋友分享
   */
  onShareAppMessage() {
    wx.$tls.share()
    this.shareTrack()
    const { roomInfo } = this.data;
    const roomId=this.options.roomId||roomInfo.roomId
    const promise = new Promise(async(resolve) => {
      const {v2_code} = await getPageShareInfo({ pageUrl:'/pages/live/player/index',pageOptions:{roomId ,targetId:roomId,source: 'bh-mall', position: 'live'} });
      // const { shareId } = await this.getShareInfo(e.detail);
      hideToast();
      this.setData({disabledClick: false});
      resolve({
        title: roomInfo.title || '',
        imageUrl: roomInfo.coverUrl || '',
        path: `/pages/index/index?v2_code=${v2_code}`
      })
    });
    return {
      title: roomInfo.title || '',
      imageUrl: roomInfo.coverUrl || '',
      promise
    }
  },
  // 分享链接分享
  onCopyUrl() {
    // this.setData({disabledClick: true});
    wx.$tls.share()
    this.shareTrack()
  },
  /**
   * 生成海报信息
   */
  getPosterInfo(shareCode: any) {
    const { roomInfo } = this.data;
    const userInfo = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    const picData = [{
      width: 750,
      height: 1143,
      background: {
        rotate: 90, // 渐变角度，取0到90度 从上到下渐变取90度， 从左到右渐变取0度  对角为45度
        colors: [[0, '#FFF5E8'], [0.8, '#FFFFFF']] // 建变过程控制，0 到 1，可设置多个 0.2 0.5 等等
      },
      elements: [
        {
          type: 'IMG',
          content: userInfo.avatarUrl || '',
          width: 80,
          height: 80,
          mode: 'aspectFill',
          borderRadius: 40,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 65,
          y: 43
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: userInfo.nickName || '',
          width: 515,
          height: 32,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 500,
          color: 'rgba(0,0,0,.75)',
          fontSize: 30,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 1,
          x: 167,
          y: 48
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '邀请您观看',
          width: 515,
          height: 31,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: 'rgba(0,0,0,.75)',
          fontSize: 28,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 1,
          x: 168,
          y: 87
        },
        {
          type: 'IMG',
          content: roomInfo.coverUrl,
          width: 629,
          height: 629,
          mode: 'aspectFill',
          borderRadius: 5,
          align: 'center', // 对齐方式
          zIndex: 2,
          x: 60,
          y: 146
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: roomInfo.title,
          width: 621,
          height: 50,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#000000',
          fontSize: 36,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 1,
          x: 60,
          y: 800
        },
        {
          type: 'LINE', // 线条
          width: 631, // 线条宽度
          height: 1, // 线条高度
          align: 'center', // 对齐方式
          color: '#F1F1F1', // 线条颜色
          zIndex: 0,
          x: 59,
          y: 885
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '请使用微信识别二维码',
          width: 339,
          height: 31,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#000000',
          fontSize: 30,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 65,
          y: 978
        },
        {
          type: 'IMG',
          content: shareCode,
          width: 201,
          height: 201,
          borderRadius: 0,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 480,
          y: 913
        }
      ]
    }];
    this.createShareImg(picData);
  },

  /**
   * 生成分享码
   */
  getSunCodeInfo(shareCode: any) {
    const { roomInfo } = this.data;
    const userInfo = wx.getStorageSync(STORAGE_USER_FOR_KEY)
    const picData = [{
      width: 630,
      height: 865,
      background: {
        rotate: 90, // 渐变角度，取0到90度 从上到下渐变取90度， 从左到右渐变取0度  对角为45度
        colors: [[0, '#FFF5E8'], [0.6, '#FFFFFF']] // 建变过程控制，0 到 1，可设置多个 0.2 0.5 等等
      },
      elements: [
        {
          type: 'RECT', // 矩形
          width: 572, // 矩形宽度
          height: 450, // 矩形高度
          align: 'center', // 对齐方式
          color: 'rgba(255, 255, 255, 1)', // 矩形颜色
          borderRadius: 8,
          zIndex: 0,
          x: 29,
          y: 37
        },
        {
          type: 'IMG',
          content: shareCode,
          width: 388,
          height: 388,
          borderRadius: 8,
          align: 'center', // 对齐方式
          zIndex: 1,
          x: 122,
          y: 67
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '长按识别二维码，观看直播',
          width: 384,
          height: 26,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 32,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 1,
          x: 123,
          y: 540
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: `分享自 ${userInfo.nickName}`,
          width: 552,
          height: 40,
          align: 'center', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#666666',
          fontSize: 28,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 1,
          x: 36,
          y: 597
        },
        {
          type: 'LINE', // 线条
          width: 551, // 线条宽度
          height: 1, // 线条高度
          align: 'center', // 对齐方式
          color: '#F1F1F1', // 线条颜色
          zIndex: 0,
          x: 37,
          y: 679
        },
        {
          type: 'IMG',
          content: roomInfo.coverUrl,
          width: 100,
          height: 100,
          mode: 'aspectFill',
          borderRadius: 16,
          align: 'left', // 对齐方式
          zIndex: 1,
          x: 29,
          y: 716
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: roomInfo.title,
          width: 420,
          height: 41,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 500,
          color: '#333333',
          fontSize: 30,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 1,
          x: 153,
          y: 746
        }
      ]
    }];
    this.createShareImg(picData);
  },

  /**
   * 生成分享图
   */
  async createShareImg(picData: any) {
    try {
      let {result, msg} = await getPoster({datas: picData});
      if (result && result.length > 0) {
        wxFuncToPromise(`downloadFile`, {url: result[0]})
          .then(({tempFilePath}: any) => {
            wxFuncToPromise(`showShareImageMenu`, {path: tempFilePath}).catch(() => {})
          })
          .then(() => {
            this.setData({disabledClick: false});
            hideToast();
          })
      } else {
        showToast({
          type: TOAST_TYPE.ERROR,
          desc: msg || '获取分享信息失败，请稍候再试。',
          title: ''
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({disabledClick: false});
    }

  },

  /**
  * 分享埋点
  */
  shareTrack() {
    // 分享埋点
    const {title, roomId} = this.data.roomInfo;
    track(TrackEventName.Sdk_Live_Share, {
      sceneType: SCENE_TYPE.LIVE,
      detail_id: roomId,
      live_name: title
    });
  },
  liveInTrack() {
    const {title, roomId} = this.data.roomInfo;
    const { page_id, page_name } = this.options;
    track(TrackEventName.Boss_LiveIn, {
      detail_id: roomId,
      live_name: title,
      curr_page_info: {
        page_id: page_id,
        page_name: page_name
      }
    });
  },
  onUnload() {
    // 退出im房间
    this.selectComponent('#liveCom').exitRoom()
  }
})