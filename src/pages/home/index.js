import carrier from "../../behaviors/carrier";
import { APP_ID, SOURCE, THIRD_PARTY_PATH, WECHAT_MOMENTS_SHARE_ID, STORAGE_USER_FOR_KEY } from "../../const/index";
import {
  addUserMark,
  queryPidByDirectSupplyShareId,
  queryUserIdentity,
  silentLoginByBhTkCode,
} from "../../models/commissionModel";
import { stringify } from "qs";
import { wxFuncToPromise, getWechatMoments, getNavBar } from "../../utils/wxUtils";
// import { queryWxQRCodeModel } from "../../models/wxQRCodeModel";
import { interceptionPrivacyProtocol, parsePageOnLoadOptions } from "../../utils/index";
import { getPageShareInfo, toPosterPage } from "../../utils/sharePoster";
import { hideToast } from "../../components/toast/index";
import saInit, { saLogin, track, TrackEventName } from "../../utils/sa";
import { getLocalUser, getHCBToken } from "@models/userModel";
import env from "../../config/env";
import { queryScene } from "@models/commonModels";

const app = getApp();
Page({
  behaviors: [carrier],
  data: {
    navBar: {},
    isTest: env.__environment__ !== "pro",
  },
  onShow(options) {
    hideToast();
    /****end***/
    this.setData({
      pointParamsDetail: { ...this.data.pointParamsDetail, start_time: new Date() },
    });
    this.queryThemeByPageId(undefined, {});
    this.queryColumnCellByPageId({});

    // this.pageInit({ ...options, reboot: SOURCE.BH_MALL, pageId: undefined })
  },
  onPageScroll(e) {
    this.pageScrolling(e);
  },
  async onLoad(options) {
    this.setData({
      navBar: getNavBar(),
    });
    if (options.redirect) {
      wx.navigateTo({ url: decodeURIComponent(options.redirect) });
    }
    const momentsShareId = getWechatMoments();
    const { v2_code, bhTkCode } = momentsShareId ? { v2_code: momentsShareId } : parsePageOnLoadOptions(options);
    if (bhTkCode) {
      // 静默登录
      await silentLoginByBhTkCode(bhTkCode);
    }
    // 解析目标页面信息
    if (v2_code) {
      try {
        addUserMark(v2_code);
      } catch (e) {}
      const {
        result: { extra },
      } = await queryPidByDirectSupplyShareId({ shareId: v2_code });
      if (extra) {
        const { path, params } = extra;
        const app = getApp();
        app.globalData.customer_channel = {
          source: params.source || SOURCE.BH_MALL,
          position: params.position,
          targetId: params.targetId,
          ssid: v2_code,
        };
        this._options = app.globalData.customer_channel;
        saInit({
          lby_source: params.source || SOURCE.BH_MALL,
          lby_skipscene: params.position || "",
          lby_liveid: params.targetId || "",
          lby_detailid: params.targetId || "",
          lby_shareid: v2_code || "",
          // lby_fourth: params.targetId || ''
        });
        const { userId } = getLocalUser();
        if (userId) {
          try {
            const { page_source } = JSON.parse(decodeURIComponent(params.curr_page_info));
            saLogin(userId, false, page_source);
          } catch (e) {
            saLogin(userId, false);
          }
        }
        track(TrackEventName.Boss_HomePage);
        await interceptionPrivacyProtocol();
        // const isContinue = await this.selectComponent(`#privacy`).isContinuing()
        if (!"/pages/index/index".includes(extra.path) /* && isContinue*/) {
          const _params = {};
          for (let [key, value] of Object.entries(params)) {
            if (typeof value === "object") {
              value = JSON.stringify(value);
            }
            _params[key] = value;
          }
          await wxFuncToPromise(`navigateTo`, {
            url: `${/^\//.test(path) ? path : "/" + path}?${stringify({ ..._params, ssid: v2_code })}`,
          });
        }
      }
    }
    // this.pageInit({...options, reboot: SOURCE.BH_MALL, pageId: undefined})
    // this.hold_up = Number(this.options.hold_up) || 0
  },
  // hold_up: 0,
  // 跳转到搜索页面
  toSearchPage: function () {
    wx.navigateTo({
      url: "/pages/search/index",
    });
  },
  // 获取分享信息
  async getShareInfo({ pageUrl, pageOptions }) {
    const { shareInfo } = app.globalData;
    const { v2_code: shareId, wxQrCode: shareCode } = await getPageShareInfo({ pageUrl, pageOptions });
    const { title, imgUrl } = this.data;
    return {
      imgUrl: imgUrl || shareInfo.imageUrl,
      title: title || shareInfo.title,
      shareId,
      shareCode,
    };
  },
  // 生成海报
  async createPoster(e) {
    const { imgUrl, title, shareId, shareCode } = await this.getShareInfo(e.detail);
    const posterParams = [
      {
        width: 596,
        height: 804,
        background: "#fff",
        elements: [
          {
            type: "IMG",
            content: imgUrl,
            width: 520,
            height: 384,
            borderRadius: 4,
            align: "center", // 对齐方式
            zIndex: 0,
            x: 38,
            y: 37,
          },
          {
            type: "TEXT", // TODO 文字换行和省略号
            content: title,
            width: 520,
            height: 42,
            align: "center", // 对齐方式
            fontFamily: "",
            fontWeight: 400,
            color: "#333333",
            fontSize: 30,
            maxLine: 2, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 38,
            y: 461,
          },
          {
            type: "LINE", // 线条
            width: 522, // 线条宽度
            height: 1, // 线条高度
            align: "center", // 对齐方式
            color: "#F1F1F1", // 线条颜色
            zIndex: 0,
            x: 38,
            y: 564,
          },
          {
            type: "TEXT", // TODO 文字换行和省略号
            content: "长按识别二维码",
            width: 200,
            height: 38,
            align: "left", // 对齐方式
            fontFamily: "",
            fontWeight: 400,
            color: "#333333",
            fontSize: 25,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 38,
            y: 632,
          },
          {
            type: "TEXT", // TODO 文字换行和省略号
            content: "即刻选购",
            width: 200,
            height: 38,
            align: "left", // 对齐方式
            fontFamily: "",
            fontWeight: 400,
            color: "#333333",
            fontSize: 25,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 38,
            y: 670,
          },
          {
            type: "IMG",
            content: shareCode,
            width: 166,
            height: 166,
            align: "left", // 对齐方式
            zIndex: 0,
            x: 385,
            y: 587,
          },
        ],
      },
    ];
    toPosterPage({
      type: 1,
      shareId,
      shareParams: posterParams,
      title,
      imgUrl,
    });
  },
  // 生成分享码
  async createShareCode(e) {
    const { imgUrl, title, shareId, shareCode } = await this.getShareInfo(e.detail);
    const shareCodeParams = [
      {
        width: 596,
        height: 920,
        background: {
          rotate: 90, // 渐变角度，取0到90度 从上到下渐变取90度， 从左到右渐变取0度  对角为45度
          colors: [
            [0, "#FFF5E8"],
            [0.6, "#FFFFFF"],
          ], // 建变过程控制，0 到 1，可设置多个 0.2 0.5 等等
        },
        elements: [
          {
            type: "RECT", // 矩形
            width: 536, // 矩形宽度
            height: 490, // 矩形高度
            align: "center", // 对齐方式
            color: "rgba(255, 255, 255, 1)", // 矩形颜色
            borderRadius: 8,
            zIndex: 0,
            x: 30,
            y: 40,
          },
          {
            type: "IMG",
            content: shareCode,
            width: 400,
            height: 400,
            align: "left", // 对齐方式
            zIndex: 1,
            x: 98,
            y: 80,
          },
          {
            type: "TEXT", // TODO 文字换行和省略号
            content: "长按二维码 即刻选购",
            width: 536,
            height: 26,
            align: "center", // 对齐方式
            fontFamily: "",
            fontWeight: 400,
            color: "#333333",
            fontSize: 28,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 30,
            y: 555,
          },
          {
            type: "TEXT", // TODO 文字换行和省略号
            content: "分享自 康老板小程序",
            width: 536,
            height: 24,
            align: "center", // 对齐方式
            fontFamily: "",
            fontWeight: 400,
            color: "#666666",
            fontSize: 24,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 30,
            y: 602,
          },
          {
            type: "LINE", // 线条
            width: 490, // 线条宽度
            height: 1, // 线条高度
            align: "center", // 对齐方式
            color: "#F1F1F1", // 线条颜色
            zIndex: 0,
            x: 53,
            y: 712,
          },
          {
            type: "IMG",
            content: imgUrl,
            width: 87,
            height: 87,
            mode: "aspectFill",
            borderRadius: 4,
            align: "left", // 对齐方式
            zIndex: 0,
            x: 57,
            y: 775,
          },
          {
            type: "TEXT", // TODO 文字换行和省略号
            content: title,
            width: 300,
            height: 28,
            align: "left", // 对齐方式
            fontFamily: "",
            fontWeight: 400,
            color: "#333333",
            fontSize: 28,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 164,
            y: 790,
          },
        ],
      },
    ];
    toPosterPage({
      type: 2,
      shareId,
      shareParams: shareCodeParams,
      title,
      imgUrl,
    });
  },
  //分享给朋友
  onShareAppMessage(res) {
    const { title, imgUrl } = this.data
    const { shareInfo } = app.globalData
    const promise = new Promise(async (resolve) => {
      const { v2_code } = await getPageShareInfo();
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
  // 分享朋友圈
  // async onShareTimeline() {
  //   const {title, imgUrl} = this.data
  //   const {shareInfo} = app.globalData
  //   const {v2_code} = await getPageShareInfo();
  //   return {
  //     title: title || shareInfo.title,
  //     imageUrl: imgUrl || shareInfo.imageUrl,
  //     path: `/pages/index/index?v2_code=${v2_code}`
  //   }
  // }
  /*返回顶部*/
  goTop() {
    interceptionPrivacyProtocol();
    if (wx.pageScrollTo) {
      wx.pageScrollTo({ scrollTop: 0 });
    } else {
      wx.showModal({
        title: "提示",
        content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。",
      });
    }
  },
  // 打开红促宝，去康豆页面
  async navigateToMiniHongCuBao() {
    const { result } = await queryScene();
    if (!result.sceneId) {
      return null;
    }
    const { result: hcbResult } = await getHCBToken();
    //跳转红促宝 埋点
    track(TrackEventName.Boss_HcbReturn, { lb_name: result.sceneId });
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
});
