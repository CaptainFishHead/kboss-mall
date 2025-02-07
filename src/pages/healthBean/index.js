import { hideToast, showToast } from "../../components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, operateTypeMap, APP_ID, THIRD_PARTY_PATH, SOURCE } from "../../const/index";
import { queryBillList, queryScene, queryYasumeByScene, queryHealthBeanRules, queryBeansConfig } from "@models/commonModels";
import { wxFuncToPromise } from "../../utils/wxUtils";
import env from "../../config/env";
import "../../utils/dateFormat";
import { track, TrackEventName } from "../../utils/sa";
import { getHCBToken } from "@models/userModel";

Page({
  data: {
    isLogged: true,
    operateTypeMap,
    isLoading: false,
    refreshText: "下拉加载更多",
    refreshPosition: "static",
    statusBarHeight: "100px",
    tipsDialog: false,
    buttons: [
      {
        text: "我知道了",
        extClass: "only-one-btn",
      },
    ],
    isTest: env.__environment__ !== "pro",
    billList: {}, // 归类后数据
    getBillParams: {
      createBeginDate: "2022-01-01 00:00:00",
      createEndDate: new Date().dateFormat("YYYY-MM-DD HH:mm:ss"),
      page: { page: 1, rows: 10 },
    },
    page: {},
    isShowPullText: false,
    healthBeanRules: {},
    backToPage: null,
    sceneId: "",
    isShowBeansSend: false,
  },
  onLoad(options) {
    const { statusBarHeight } = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: `${Number(statusBarHeight) + 44}px`,
      refreshPosition: "fixed",
      backToPage: options.backToPage || null,
    });
    this.getRules(); //获取康豆规则
  },
  onShow() {
    this.loadPage(); //加载页面
  },
  onPageScroll(e) {
    if (e.scrollTop > 0) {
      this.setData({ refreshPosition: "static" });
    } else {
      this.setData({ refreshPosition: "fixed" });
    }
  },
  // 加载页面
  loadPage() {
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY);
    // console.log(user)
    if (!user) {
      this.setData({ isLogged: false });
    } else {
      this.setData({ isLogged: true });
    }
    this.getScene(); //获取场景id
    this.getBeansConfig(); //获取是否展示转赠康豆
  },

  // 获取康豆规则
  getRules() {
    queryHealthBeanRules().then(({ result }) => {
      this.setData({ healthBeanRules: result });
    });
  },
  // 获取场景id
  getScene() {
    showToast({ type: TOAST_TYPE.LOADING });
    this.setData({ isLoading: true });
    const { isTest } = this.data;
    const { token } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || { token: "" };
    queryScene().then(({ result }) => {
      if (!result.sceneId) {
        if (isTest) showToast({ type: TOAST_TYPE.INFO, title: "未获取到场景id" });
        return null;
      }
      const params = {
        sceneId: result.sceneId || "11d56e722bfe06db46e935659e8aeba8",
        token,
      };
      this.setData({
        sceneId: result.sceneId,
      });
      this.getBeans(params); //获取康豆
    });
  },
  // 获取康豆
  getBeans(param) {
    queryYasumeByScene(param)
      .then(({ result }) => {
        const data = result ? result.find(item => item.sceneId === param.sceneId) : result;
        if (data) {
          const yasume = ((Number(data.surplusPoint) * 100) / 100).toFixed(2);
          this.setData({ yasume });
          const params = {
            ...this.data.getBillParams,
            jfUserId: data.jfUserId,
            sceneId: param.sceneId,
          };
          this.setData({
            getBillParams: params,
          });
          this.getBillList(params); //获取列表
        } else {
          this.setData({
            hasDatas: false,
            isLoading: false,
          });
          hideToast();
        }
      })
      .catch(err => {
        if (err.code.toString() !== "-4001") {
          showToast({
            title: err.msg || "获取失败，请重试",
            type: TOAST_TYPE.WARNING,
          });
        }
        this.setData({ isLoading: false });
        hideToast();
      });
  },
  // 获取列表
  getBillList(params) {
    if (!params.isBottom) {
      showToast({ type: TOAST_TYPE.LOADING });
    }
    if (params.page.page <= 1 || !params.page.page) {
      this.setData({
        billList: {},
      });
    }
    this.setData({ isLoading: true });
    queryBillList(params)
      .then(({ result = [], page }) => {
        const { jfPointLogListVos = [] } = result[0];
        const billList = this.formatBillList({ billData: jfPointLogListVos, isByMonth: params.isByMonth });
        const hasDatas = Object.keys(billList).length > 0;
        if (hasDatas) {
          this.setData({ hasDatas: true });
        }
        this.setData({
          billList,
          page,
          isShowPullText: hasDatas,
        });
      })
      .catch(err => {
        showToast({
          title: err.msg || "暂无信息",
          type: TOAST_TYPE.WARNING,
        });
      })
      .finally(() => {
        this.setData({
          isLoading: false,
          isHideLoadMore: false,
        });
        hideToast();
      });
  },
  //加载更多
  onReachBottom() {
    const { getBillParams, page } = this.data;
    if (page.index >= page.pages) return null;
    this.setData({ isHideLoadMore: true });
    const params = {
      ...getBillParams,
      page: { page: page.index + 1 },
      isBottom: true,
      isByMonth: false,
    };
    this.getBillList(params); //更新列表
  },
  // 下拉加载上个月列表
  onPullDownRefresh() {
    const { hasDatas, chooseDate } = this.data;
    if (!hasDatas) return;

    this.setData({ refreshText: "加载中..." });
    const nextMonth = this.getNextMonth(chooseDate);
    let createEndDate = this.getEndDate(nextMonth);

    setTimeout(() => {
      this.setData({ refreshText: "下拉加载更多" });
      wx.stopPullDownRefresh();
    }, 300);
    // 如果当前月最新，刷新当前数据
    if (new Date(nextMonth + " 00:00:00").getTime() > new Date().getTime()) {
      createEndDate = new Date().dateFormat("YYYY-MM-DD HH:mm:ss");
    } else {
      this.setData({ chooseDate: nextMonth });
    }

    const { getBillParams } = this.data;
    const params = {
      ...getBillParams,
      createEndDate,
      page: { page: 1 },
      isBottom: false,
      isByMonth: true,
    };
    this.setData({
      getBillParams: params,
    });
    this.getBillList(params); //更新列表
  },
  // 打开日期选择
  openDatePicker(e) {
    const { i, value } = e.currentTarget.dataset;
    this.selectComponent("#datePickerBtn").openDatePicker({ i, value });
  },
  // 选择完日期 返回值
  onChangeDate(e) {
    const { chooseDate } = e.detail;

    const createEndDate = this.getEndDate(chooseDate);

    this.setData({
      chooseDate,
    });

    const params = {
      ...this.data.getBillParams,
      createEndDate,
      page: { page: 1 },
      isBottom: false,
      isByMonth: true,
    };
    this.setData({
      getBillParams: params,
    });
    this.getBillList(params);
  },
  goBack() {
    const { backToPage } = this.data;
    if (backToPage) {
      wx.switchTab({ url: backToPage });
    }
    // 判断是否有上一页
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (!prevPage) {
      wx.switchTab({ url: "/pages/mine/index" });
    }
  },
  toDetail(e) {
    const { cell } = e.currentTarget.dataset;
    wxFuncToPromise(`navigateTo`, {
      url: `/pages/healthBean/detail/index`,
    }).then(res => {
      res.eventChannel.emit("pageData", { dataDetail: cell });
    });
  },
  showTips() {
    this.setData({ tipsDialog: true }); //显示
  },
  tapDialogButton() {
    this.setData({ tipsDialog: false }); //关闭
  },
  //按月归类列表
  formatBillList({ billData, isByMonth }) {
    const { billList = {} } = this.data;
    billData.forEach(item => {
      const date = new Date(item.monthStr.replaceAll("-", "/") + "/01");
      const monthStr = date.dateFormat("YYYY年M月");
      const monthStrShow = date.dateFormat("YYYY年M月d日");

      if (!billList[item.monthStr]) {
        billList[item.monthStr] = {
          monthStr,
          monthStrShow,
          subBillList: [],
        };
      }
      billList[item.monthStr].subBillList.push({
        ...item,
        createDateShow: new Date(item.createDate.replaceAll("-", "/")).dateFormat("M月dd HH:mm"),
      });
    });
    if (!Object.keys(billList).length && isByMonth) {
      const { chooseDate } = this.data;
      const date = new Date(chooseDate.replaceAll("-", "/"));
      const monthStr = date.dateFormat("YYYY年M月");
      const monthStrShow = date.dateFormat("YYYY年M月d日");
      billList[monthStr] = {
        monthStr,
        monthStrShow,
        subBillList: [],
      };
    }
    return billList;
  },
  // 设置本月最后一天 23:59:59
  getEndDate(date) {
    const end = new Date(date);
    // console.log(date, end, new Date(end.getFullYear(), end.getMonth() + 1, 0).dateFormat('YYYY-MM-dd') + ' 23:59:59')
    return new Date(end.getFullYear(), end.getMonth() + 1, 0).dateFormat("YYYY-MM-dd") + " 23:59:59";
  },
  // 获取下个月分
  getNextMonth(chooseDate = Date.now()) {
    const date = new Date(chooseDate);
    return new Date(date.getFullYear(), date.getMonth() + 1, 1).dateFormat("YYYY/MM/dd");
  },
  getNowMonth(chooseDate = Date.now()) {
    return new Date(chooseDate).dateFormat("YYYY/MM/dd");
  },
  //打开红促宝，去赠送康豆页面
  async navigateToMiniHongCuBao() {
    track(TrackEventName.Boss_GiftBeans);
    const { result: hcbResult } = await getHCBToken();

    wxFuncToPromise(`navigateToMiniProgram`, {
      appId: APP_ID.HONG_CU_BAO,
      path: THIRD_PARTY_PATH.HONG_CU_BAO_SEND_KANG_DOU,
      extraData: {
        token: hcbResult.result,
        source: SOURCE.BH_MALL,
      },
      envVersion: env.envVersion,
    });
  },
  //打开红促宝，康豆商城兑换商品
  async beansExchange() {
    const { result: sceneResult } = await queryScene();
    const { result: hcbResult } = await getHCBToken();
    //跳转红促宝 埋点
    track(TrackEventName.Boss_HcbReturn, { lb_name: sceneResult.sceneId });
    wxFuncToPromise(`navigateToMiniProgram`, {
      appId: APP_ID.HONG_CU_BAO,
      path: THIRD_PARTY_PATH.HONG_CU_BAO_KANG_DOU,
      extraData: {
        token: hcbResult.result,
        source: SOURCE.BH_MALL,
        sceneId: sceneResult.sceneId,
      },
      envVersion: env.envVersion,
    });
  },
  // 获取康豆转赠可见配置
  getBeansConfig() {
    queryBeansConfig()
      .then(({ result }) => {
        this.setData({
          isShowBeansSend: result.remark === "1",
        });
      })
      .catch(err => {
        console.log(err);
      });
  },
});
