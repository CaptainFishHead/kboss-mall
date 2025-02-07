import carrier from "../../behaviors/carrier";
import {
	getBaseEnterOptions,
	urlAppendQuery
} from "../../utils/index";
import { SOURCE } from "../../const/index";
import { getPageShareInfo, toPosterPage } from "../../utils/sharePoster";
import { setWechatMoments } from "../../utils/wxUtils";
import { getSource } from "@models/commonModels";
import saInit, { saLogin } from "@utils/sa";
import { getLocalUser } from "@models/userModel";

const app = getApp()
const _home_params = {
  pageUrl: `/pages/index/index`, pageOptions: {}
}
Page({
  behaviors: [carrier],
  data: {
    isBack: false
  },
  onShow() {
    this.setData({
      pointParamsDetail: { ...this.data.pointParamsDetail, start_time: new Date() }
    })
    this.pageInit(this.options)
  },
  onLoad(options) {
    this.setData({
      isBack: !(options.source && options.source.startsWith('AD-'))
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
      const { userId } = getLocalUser()
      if (userId) {
        saLogin(userId, false)
      }
    }
    if (options.v2_code) return setWechatMoments(options);  // 从朋友圈进入时调用
    // this.pageInit(options)
    // debugger
    // this.hold_up =Number(this.options.hold_up) || 0
    // this.setData({
    // 	_hold_up:Number(this.options.hold_up) || 0
    // })
  },
  // hold_up: 0,
  // 获取分享信息
  async getShareInfo({pageUrl, pageOptions}){
    const {source} = await getSource()
    const { v2_code: shareId, wxQrCode: shareCode } = await getPageShareInfo(source==='sdk'?_home_params:{ pageUrl, pageOptions });
    const {title, imgUrl} = this.data;
    const {shareInfo} = app.globalData;
      return {
        imgUrl: imgUrl || shareInfo.imageUrl,
        title: title || shareInfo.title,
        shareId,
        shareCode
      }
  },
  // 生成海报
  async createPoster (e) {
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
  async createShareCode(e){
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
  onShareAppMessage() {
    const {title, imgUrl, pageId} = this.data
    const {shareInfo} = app.globalData
    const promise = new Promise(async (resolve) => {
      const {query: {source}} = await getBaseEnterOptions()
      // fix: 旧版本兼容，来源未sdk统一分享首页
      const {v2_code} = await getPageShareInfo(source === 'sdk' ? _home_params : undefined);
      resolve({
        title: title || shareInfo.title,
        imageUrl: imgUrl || shareInfo.imageUrl,
        path: urlAppendQuery(
            `/pages/index/index`,
            Object.assign(
                {},
                {pageId, source},
                source === SOURCE.PLUGIN ? getApp().globalData.cloud : {},
                {v2_code}
            ),
        )
      })
    })
    return {
      title: title || shareInfo.title,
      imageUrl: imgUrl || shareInfo.imageUrl,
      promise
    }
  }
});