import carrier from "../../behaviors/carrier";
import { APP_ID, SOURCE, THIRD_PARTY_PATH, STORAGE_USER_FOR_KEY, HEALTH_INFO_BUSINESS_PAGE,HEALTHARCHIVES_SOURCE_PAGE } from "@const/index";
import {
  addUserMark,
  queryPidByDirectSupplyShareId,
  queryUserIdentity,
  silentLoginByBhTkCode,
} from "@models/commissionModel";
import { stringify } from 'qs'
import { wxFuncToPromise, getWechatMoments, getNavBar } from "@utils/wxUtils";
import {
  interceptionPrivacyProtocol,
  parsePageOnLoadOptions,
  openPage,
  urlAppendQuery,
  getLoggedUser,
  isLogged
} from "@utils/index";
import { getPageShareInfo, toPosterPage } from "@utils/sharePoster";
import { hideToast } from "../../components/toast/index";
import saInit, { saLogin, track, TrackEventName } from "@utils/sa";
import { getLocalUser, getHCBToken, queryUserInfo } from "@models/userModel";
import env from "@config/env";
import { queryScene } from "@models/commonModels";
import { listRecommend, newcomerList, newcomerRecord, welcome } from '@models/carrierModel'
import { queryStatus } from "@models/recommendModel"
import { queryUserIsHealth, queryUserHealth } from "@models/healthInfo"
const app = getApp()
Page({
  behaviors: [carrier],
  data: {
    navBar: {},
    isLogged: isLogged(),
    isTest: env.__environment__ !== "pro",
    adsList: [], //首页轮播
    categoryList: [
      {
        img: "https://static.tojoyshop.com/images/wxapp-boss/home/img_detection.png",
        title: "扫脸在线检测",
        tipText: "1分钟扫脸测健康",
        path: "/pages/healthShoot/index",
        num: "2",
      },
      {
        img: "https://static.tojoyshop.com/images/wxapp-boss/home/img_advice.png",
        title: "专家视频咨询",
        tipText: "2000+知名专家",
        path: "/pages/healthConsult/index",
        num: "1",
      },
      {
        img: "https://static.tojoyshop.com/images/wxapp-boss/home/img_assess.png",
        title: "AI 健康评测",
        tipText: "3分钟智能评估",
        path: "/pages/healthAI/index",
        num: "3",
      },
      {
        img: "https://static.tojoyshop.com/images/wxapp-boss/home/img_archives.png?v=1.0.0",
        title: "个人健康档案",
        tipText: "健康动态管理",
        path: "/pages/healthArchives/index",
        num: "4",
      },
    ],
    consultant: {}, //医师信息
    iswelcome: false,
    healthObj: {
      nullNum: 0, // 有数据的指标数量
      abnormalNum: 0, //异常指标数量
      basicMetrics: []
    },
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    scrollTop: "0",
    recommendList: [], // 推荐数据
    newcomerList: [], //新人引导数据
    newcomerShow: false
  },
  onShow(options) {
    let that = this;
    hideToast();
    /****end***/
    this.setData({
      pointParamsDetail: {
        ...this.data.pointParamsDetail,
        start_time: new Date()
      }
    })
    this.queryThemeByPageId('undefined', 'undefined', 'pages/index/index')
    this.getNewUserInfo();
  },
  //新用户引导、推荐列表
  getNewUserInfo() {
    let userinfo = wx.getStorageSync(STORAGE_USER_FOR_KEY);
    // 判断登录状态
    if (isLogged()) {
      let nomore = wx.getStorageSync("noMore");
      if (!nomore) {
        newcomerList().then(({ result }) => {
          if (result && result.length) {
            this.setData({
              newcomerShow: true,
              newcomerList: result,
            });
          }
        });
      }
    }
    // 顶部轮播 小康指标和顾问医生接口调用
    this.welcomeFun();
    listRecommend().then(({ result }) => {
      if (result && result.length) {
        this.setData({
          recommendList: result,
        });
      }
    });
  },
  onPageScroll(e) {
    this.pageScrolling(e);
  },
  async onLoad(options) {
    this.setData({ navBar: getNavBar(), });
    if (options.redirect) {
      wx.navigateTo({
        url: decodeURIComponent(options.redirect),
      });
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
      } catch (e) {
      }
      const { result: { extra }, } = await queryPidByDirectSupplyShareId({ shareId: v2_code, });
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
  },
  // 首页接口调用
  welcomeFun() {
    welcome().then(({ result }) => {
      let errNum = 0 // 异常指标数量 无数据指标不算在异常指标数量内
      let nullNum = 0 // 有数据的指标数量
      if (result.basicMetrics && result.basicMetrics.length) {
        result.basicMetrics.forEach((item, index) => {
          item.isdata = false
          if (item.sonIndexList && item.sonIndexList.length) {
            item.isabnormal = !!item.sonIndexList.filter(val => val.indexLevel).length
            if (item.isabnormal) {
              errNum += 1
            }
            // 需求:指标就判断为有值 每个指标都至少有一个子集
            // 判断是否有值 子集有一个有值  
            item.isdata = !!item.sonIndexList.filter(val => val.indexData).length
            if(item.isdata){
              nullNum += 1
            }
          }
        })
      }
      let adsLists = result && result.adsList ? result.adsList : []
      this.setData({
        iswelcome: true,
        adsList: adsLists,
        consultant: result.consultant,
        healthObj: {
          nullNum,
          abnormalNum: errNum,
          basicMetrics: result.basicMetrics
        }
      })
    });
  },
  // 点击广告图 跳转
  handleGoPage(e) {
    const { detailid, jumptype, id, title } = e.currentTarget.dataset;
    const link = e.currentTarget.dataset.item || {};
    // 轮播图埋点
    track(TrackEventName.Boss_Rotation_Click, { rotation_name: title, rotation_id: id });
    if (jumptype === "10" || jumptype === "11" || jumptype === "12") {
      this.queryDetail(detailid, link);
    } else {
      link.href = urlAppendQuery(link.href, { page_id: id, page_name: title })
      openPage.call(this, {
        link
      });
    }
  },
  queryDetail(detailid, link) {
    queryStatus({
      recommendId: detailid,
    })
      .then(({ result }) => {
        if (result.state) {
          openPage.call(this, {
            link,
          });
        } else {
          wx.navigateTo({
            url: "/pages/recommend/empty/index?title=人气爆款",
          });
        }
      })
      .catch(err => {
        if (err.code === 4004) {
          return wx.navigateTo({
            url: "/pages/recommend/empty/index?title=人气爆款",
          });
        } else {
          showToast({
            title: err.msg || "暂无信息",
            type: TOAST_TYPE.WARNING,
          });
        }
      });
  },
  // 固定入口跳转
  async categoryClick(e) {
    let num = '';
    if (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.num) {
      num = e.currentTarget.dataset.num //num=4 健康档案
    } else {
      num = e
    }
    // 首页栏目固定入口埋点
    let column_name = this.data.categoryList[this.data.categoryList.findIndex(char => char.num == num)].title
    track(TrackEventName.Boss_Column_Click, {
      column_name: column_name,
      column_id: num
    });
    // 健康档案埋点
    if (num == 4) {
      track(TrackEventName.Boss_PHREntrance_Click, {
        curr_page_info: {
          page_source: '首页'
        }
      });
    }
    if (isLogged()) {
      let { result } = await queryUserHealth(); //是否已填写健康信息 0 否-创建信息页 1 是-健康档案页
      const _url = result.healthUserBasicInfo && result.healthUserBasicInfo.isHealthInfo ? "/pages/healthArchives/index" : `/pages/healthInfo/createInfo/index?businessPage=${HEALTH_INFO_BUSINESS_PAGE.HEALTH_ARCHIVES}`
      const wxMethods = result.healthUserBasicInfo && result.healthUserBasicInfo.isHealthInfo ? 'redirectTo' : 'navigateTo'
      if (num == 4){
        wxFuncToPromise(wxMethods, {url: _url}).then(res => {
          wx.setStorageSync(HEALTHARCHIVES_SOURCE_PAGE,'home')
        });
      }
      if (num != 4) {
        this.onHrefPage({
          target: e.currentTarget,
        });
      }
    } else {
      //未登录
      if (num == 1) {
        wx.navigateTo({
          url: "/pages/healthConsult/index",
        });
      } else {
        this.selectComponent("#authHealthCoponents").openAuthorize(true);
      }
    }
  },
  // 点击虚拟人物区
  healthfun() {
    this.categoryClick(4)
  },
  // 点击AI小康
  onclickAikang(e) {
    let obj = {
      type: 'AIkang',
      btn: e.detail.btn
    }
    this.isNeedLogin(obj)
  },
  // 跳转AI对话
  navigateAi(e) {
    let btn = e.btn
    let url = '/pages/chatai/index'
    if (!btn) {
      url = '/pages/chatai/index?from=home'
    }
    wx.navigateTo({
      url: url
    })
    // 小康AI点击埋点
    track(TrackEventName.Boss_KBossAI, {
      curr_page_info: {
        page_source: '首页'
      }
    });
  },
  /**
   * 授权成功后跳转对应的页面
   */
  onHrefPage({ target }) {
    const { href } = target.dataset;
    wx.navigateTo({
      url: href,
    });
  },
  // 健康顾问跳转
  healthwaiter(e) {
    let str = this.data.consultant && this.data.consultant.isBind ? 0 : 1
    if (isLogged()) {
      wx.navigateTo({
        url: "/pages/healthArchives/healthWaiter/index?str=" + str,
      });
    } else {
      this.selectComponent("#authHealthCoponents").openAuthorize(true);
    }

  },
  // 为我推荐跳转详情
  clickRecommend(e) {
    let href = "";
    let currentRow = e.currentTarget.dataset.item;
    if (currentRow.type == 1) {
      // 图文种草
      href = `/pages/recommend/graphicDetail/index?id=${currentRow.recommendId}`;
    } else if (currentRow.type == 2) {
      // 视频种草
      href = `/pages/recommend/videoDetail/index?id=${currentRow.recommendId}`;
    } else if (currentRow.type == 3) {
      // 直播种草
      href = `/pages/live/player/index?roomId=${currentRow.roomId}`;
    }
    wx.navigateTo({
      url: href,
    });
  },
  // 获取新用户推荐子组件返参
  getAddInfo(e) {
    this.setData({
      newcomerShow: e.detail.newcomerShow,
    });
  },
   /**
   * 获取授权后的用户信息
   */
  async getAuthUserinfo () {
    this.getNewUserInfo();
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
  /*返回顶部*/
  goTop() {
    interceptionPrivacyProtocol();
    this.setData({
      scrollTop: 0
    });
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
  isNeedLogin(e) {
    //后台开关是否登录，否并且未登录、否并且已登录、是并且未登录、 是并且已经登录
    //检测是否登录（未登录就出登录半弹层）
    const { openLoginModal } = this.selectComponent(`#authorize`)
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
    const type = e.type == 'AIkang' ? e.type : e.currentTarget.dataset.type
    switch (type) {
      case 'HOMELB':
        this.handleGoPage(e)
        break;
      case 'AIkang':
        this.navigateAi(e)
        break;
      case 'GDRK':
        this.categoryClick(e)
        break;
      case 'ZXGW':
        this.healthwaiter(e)
        break;
      case 'WNTJ':
        this.clickRecommend(e)
        break;
    }
  }
});
