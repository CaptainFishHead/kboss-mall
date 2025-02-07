// pages/recommend/detail/index.js
import { queryRecommendDetail, getServant, updateLikeNum } from "../../../models/recommendModel";
import { queryProductById } from "../../../models/productModel";
import { hideToast, showToast } from "../../../components/toast/index";
import { SOURCE, TOAST_TYPE, STORAGE_USER_FOR_KEY } from "../../../const/index";
import { track, TrackEventName } from "../../../utils/sa";
import back from "../../../behaviors/back";
import {stringify} from "qs";
import {getPageShareInfo} from "../../../utils/sharePoster";
import carrier from "@behaviors/carrier";
import { htmlToWxml } from "@utils/index"

Page({

  data: {
    recommendId: 0,
    recommendInfo: {}, // 种草详情
    goodsInfo: {}, // 商品信息
    bedienfeldData: {}, // 底部操作区数据
    loading: true,
    showReadMore: false,
    boxHeight: 'auto',
    noReadLength: '0%',
    hasService: true,
    isRecommend: false
  },
  _playTime: 0, // 音频播放时长
  _currentTime: 0, // 音频播放进度
  behaviors: [back, carrier],
  onLoad(options) {
    console.log('种草详情：', options);
    const {id} = options;
    this.setData({ recommendId: id });
    // 获取种草详情
    this.getDetailInfo();
    // 记录预览开始时间
    this._starttime = Date.now();
  },
  //监听页面隐藏
  onHide() {
    this.setPoint();
  },
  onUnload() {
    this.setPoint();
  },
  initReadMore() {
    const { windowHeight } = wx.getSystemInfoSync();
    wx.createSelectorQuery()
      .select(".recommend-detail")
      .boundingClientRect(rect => {
        // 剩余未读占比
        this.setData({ noReadLength: (100 - ((windowHeight * 1.5) / rect.height) * 100).toFixed() + "%" });
        // 文章容器整体高度 超过屏幕高度的1.5倍是显示查看全文按钮
        this.setData({ showReadMore: rect.height / windowHeight > 1.5 });
        // 显示查看全文时 文章容器整体高度限制在屏幕高度的1.5倍
        this.setData({ boxHeight: windowHeight * 1.5 });
        if (!this.data.showReadMore) {
          this.voidServant(); // 服秘归属校验
        }
      })
      .exec();
  },
  // 登录成功
  loginSuccess() {
    // 更新数据
    if (this.data.goodsInfo.spuId) {
      this.selectComponent(`#small_price`).updateIsLogged();
    }
  },
  // 阅读更多
  readMore() {
    const { openLoginModal } = this.selectComponent(`#authorize`);
    openLoginModal().then(res => {
      if (res.type === "success") {
        this.getNumData(); // 更新点赞收藏
        this.loginSuccess();
      }
      this.voidServant(); // 服秘归属校验
      this.setData({ showReadMore: false });
    });
  },
  // 服秘归属校验
  voidServant() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY);
    getServant({ mobile: user.mobile })
      .then(res => {
        if (res.code === 200 && res.result.servantNumber) {
          this.setData({ hasService: true });
        } else {
          this.setData({ hasService: false });
        }
      })
      .catch(() => {
        this.setData({ hasService: false });
      });
  },
  timeUpdate(e) {
    /* 记录累计播放时长 埋点使用 start */
    const innerAudioContext = e.detail;
    if (innerAudioContext.currentTime - this._currentTime > 1) {
      // 减去拖拽的无效时长
      this._playTime = this._playTime - (innerAudioContext.currentTime - this._currentTime);
    }
    this._currentTime = innerAudioContext.currentTime;
    /* 记录累计播放时长 埋点使用 end */
  },
  playEnd() {
    this._playTime = this._playTime + this._currentTime; // 循环播放累计时长
    this._currentTime = 0;
  },
  // 获取视频的收藏、点赞数据
  getNumData() {
    this.selectComponent("#footerHandle").updateNum(1);
    // updateLikeNum({
    // 	subjectId: this.data.recommendId,
    // 	subjectType: 5
    // }).then(({result}) => {
    //   this.setData({recommendInfo: Object.assign({}, this.data.recommendInfo, result || {})})
    // })
  },
  // 查询种草详情
  getDetailInfo() {
    const { recommendId } = this.data;
    showToast({ type: TOAST_TYPE.LOADING });
    queryRecommendDetail({
      recommendId,
    })
      .then(({ result }) => {
        if (result.style) result.sliderSize = JSON.parse(result.style);
        result.remark = htmlToWxml(result.remark);
        result.styleObj = result.style ? JSON.parse(result.style) : {};
        // result.audioUrl = 'https://downsc.chinaz.net/Files/DownLoad/sound1/202309/y2112.mp3'
        this.setData({ recommendInfo: result });
        if (result.spuId) {
          this.setData({ isRecommend: true });
          this.getGoodsInfo(result.spuId);
        }
        wx.nextTick(() => {
          this.initReadMore();
        });
      })
      .finally(() => {
        hideToast();
        this.setData({ loading: false });
      });
  },
  // 查询商品详情
  getGoodsInfo(id) {
    queryProductById({ id }).then(({ result }) => {
      this.setData({ goodsInfo: result });
    });
  },
  // 新页面中预览图片
  onPreviewImg(e) {
    const { index } = e.currentTarget.dataset;
    const { recommendInfo } = this.data;
    wx.previewImage({
      urls: recommendInfo.imgList || [],
      current: recommendInfo.imgList[index],
    });
  },
  // 设置埋点
  setPoint() {
    const { goodsInfo, recommendInfo } = this.data;
    if (recommendInfo.recommendId) {
      const endtime = Date.now();
      const cycle_time = Math.floor((endtime - this._starttime) / 1000);
      this._playTime = this._playTime + this._currentTime;
      track(TrackEventName.Boss_SeedingDetail, {
        commodity_id: goodsInfo.code || "",
        commodity_name: goodsInfo.name || "",
        sku_price: goodsInfo.sellPrice || 0,
        starttime: this._starttime,
        endtime,
        cycle_time,
        video_duration: this._playTime, // 音频累计播放时长
        detail_id: recommendInfo.recommendId,
        content_name: recommendInfo.title || "",
        content_label: recommendInfo.tag || "",
        curr_page_info: this.options.curr_page_info || "",
      });
    }
  },
  // 跳转商品详情
  goDetail() {
    const { goodsInfo, recommendInfo } = this.data;
    const { source, mid, ssid } = this.options;
    const params = {
      pageName: recommendInfo.title,
      skuId: "none",
      curr_page_info: JSON.stringify({
        page_name: recommendInfo.title,
        page_id: recommendInfo.recommendId,
        page_source: "种草详情",
      }),
      // page_id: recommendInfo.recommendId,
      // page_name: recommendInfo.title
    };
    const app = getApp()
    Object.assign(params,app.globalData.customer_channel?app.globalData.customer_channel:{
      source: source || SOURCE.BH_MALL,
      position: 'recb',
      targetId: recommendInfo.recommendId,
      ssid: ssid || mid || ''
    },{spuId: goodsInfo.spuId})
    wx.redirectTo({
      url: `/pages/product/index?${stringify(params)}`,
    });
  },
  // 更新点赞数量
  updateNum() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel && eventChannel.emit && Object.prototype.toString.call(eventChannel.emit).includes("Function")) {
      eventChannel.emit("updateColumns");
    }
  },
  handBack() {
    const pages = getCurrentPages();
    if (pages.length <= 1) {
      wx.reLaunch({
        url: `/pages/index/index`,
      });
    } else {
      wx.navigateBack();
    }
  },
  //分享给朋友
   onShareAppMessage(res) {
    const {recommendInfo} = this.data;
    const app = getApp()
    const pages = getCurrentPages();
    const currentPage = pages[pages.length-1];
    
    const promise = new Promise(async (resolve) => {
      const {v2_code} = await getPageShareInfo({
        pageUrl: '/'+ currentPage.route,
        pageOptions: {...currentPage.options, position: 'recb', targetId: recommendInfo.recommendId}
      });
      
      resolve({
        title: recommendInfo.title || '',
        imageUrl:recommendInfo.imgList[0],
        path: `/pages/index/index?v2_code=${v2_code}`
      })
    })
    return {
      ...app.globalData.shareInfo,
      promise
    }
  }
})
