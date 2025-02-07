import { queryUserInfo, getMemberLevel } from '../../models/userModel';
import { queryUserIdentity, queryTotalStatistics } from '../../models/commissionModel';
import { getCardStatistics } from '../../models/cardModel';
import { myPrizeNum } from '../../models/myPrize';
import { queryUserIsHealth, queryUserHealth } from '@models/healthInfo';
import {
  APP_ID,
  SOURCE,
  STORAGE_USER_FOR_KEY,
  THIRD_PARTY_PATH,
  TOAST_TYPE,
  CONSUMER_HOTLINE,
  STORAGE_HONG_CU_BAO_KEY,
  HEALTH_INFO_BUSINESS_PAGE,
  HEALTHARCHIVES_SOURCE_PAGE
} from '../../const/index';
import env from '../../config/env';
import { showToast } from '../../components/toast/index';
import { track, TrackEventName } from '@utils/sa';
import { wxFuncToPromise } from '../../utils/wxUtils';
import { queryYasumeByScene, queryScene, getAllMall } from '@models/commonModels';
import { queryOrderCount } from '../../models/orderModel';
import back from '../../behaviors/back';
import { queryCouponNum } from '../../models/voucherModel';
import { getLoggedUser, isLogged } from '@utils/index';
import { getNavBar } from '../../utils/wxUtils';
import { reqCounselor } from '@models/healthWaiter';
// mineModel
import { reqtipsMine, reqtipsRead } from '@models/mineModel';
const { enableDebug } = wx.getSystemInfoSync();
const app = getApp();

// 防抖函数封装
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

Page({
  data: {
    enableDebug: enableDebug || env.envVersion !== 'release',
    sessionFrom: '', // 保存联系客服所需数据
    commissionVisible: true,
    orderNavList: [
      {
        path: '/pages/order/index?current=1',
        name: '待付款',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/order-pay.v2.png'
      },
      {
        path: '/pages/order/index?current=2',
        name: '待发货',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/order-send.v2.png'
      },
      {
        path: '/pages/order/index?current=3',
        name: '待收货',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/order-get.v2.png'
      },
      {
        path: '/pages/afterSale/applyList/index',
        name: '退换货',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/order-return.v2.png'
      }
    ],
    adminTopMenu: [
      {
        path: '/pages/voucher/index',
        name: '优惠券',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/voucher-icon.png',
        isShowVoucher: true
      },
      {
        path: '/pages/coupon/index',
        name: '礼品卡',
        iconPath:
          'https://static.tojoyshop.com/images/wxapp-boss/mine/card-icon.png?v=202207121455',
        isShowText: true
      },
      {
        path: '/pages/account/commission/index',
        name: '我的预估收益',
        iconPath:
          'https://static.tojoyshop.com/images/wxapp-boss/mine/card-icon.png?v=202207121455',
        isShowMoney: true
      },
      {
        path: '/pages/obh/myPrize/index',
        name: '奖品',
        iconPath:
          'https://static.tojoyshop.com/images/wxapp-boss/mine/card-icon.png?v=202207121455',
        isShowPrize: true
      }
    ],
    adminNavList: [
      {
        path: '/pages/account/favorite/index',
        name: '关注商品',
        isLine: true,
        num: 1,
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/like-icon.png'
      },
      {
        path: '/pages/account/collection/index',
        name: '我的收藏',
        isLine: true,
        num: 2,
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/collection-icon.png?v=1'
      },
      {
        path: '/pages/account/footPrint/index',
        name: '我的足迹',
        isLine: false,
        num: 3,
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/foot-icon.png'
      },
      {
        path: '/pages/address/index?isCheckbox=false',
        name: '收货地址',
        isLine: true,
        num: 4,
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/address-icon.png'
      }
    ],
    notepadList: [
      {
        path: '/pages/healthArchives/index',
        name: '健康档案',
        num: '1',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/icon_card.png'
      },
      {
        path: '/pages/conditioningPlan/index',
        name: '调理方案',
        num: '2',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/icon_notepad.png'
      },
      {
        path: '/pages/services/index',
        name: '我的服务',
        num: '3',
        iconPath: 'https://static.tojoyshop.com/images/wxapp-boss/mine/icon_service.png'
      }
      // {
      //   path: '',
      //   name: '我的设备',
      //   num: '4',
      //   iconPath: "https://static.tojoyshop.com/images/wxapp-boss/mine/icon_equipment.png"
      // }
    ],
    userInfo: {},
    // defaultHead: "https://static.tojoyshop.com/images/wxapp-boss/mine/default.png?v=3.0.0",
    defaultHead:
      'https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/icon-default-head.png',
    isEmployee: false,
    beansVisible: true,
    isTest: env.__environment__ !== 'pro',
    isLogged: isLogged(),
    totalCommission: '0.00',
    yasume: '0', // 康豆
    goldenBean: '0.00', // 金豆
    levelIcon: null, // 会员等级
    cardNumber: 0, //礼品卡
    voucherNumber: 0, //优惠券
    prizeNum: 0, // 我的奖品数量
    waiterData: {}, //医生信息
    iswelcome: false,
    recuperateSchemeCount: 0, //我的-调理方案数
    serviceCount: 0 // 我的-我的服务数
  },
  debouncedNotepadLiClick: null,
  onLoad() {
    this.debouncedNotepadLiClick = debounce(this.notepadLiClick, 500);
    const user = getLoggedUser();
    if (user) {
      this.setData({
        userInfo: user
      });
      this.getEmployeeInfo();
    }
    this.setData({
      navBar: getNavBar()
    });
  },

  onShow() {
    const user = getLoggedUser();
    if (user) {
      this.setData({
        userInfo: user
      });
    }
    this.getSessionFrom(); //获取客服个人信息

    if (user && user.userId) {
      this.getLevel();
      // this.queryGoldenBeanId();
      this.queryKangDouBySceneId();
      this.getCardNumber(); //更新卡片数量
      this.getVoucherNumber(); //更新优惠券数量
      this.getSessionFrom(); //获取客服个人信息
      this.queryOrderNumers(); //订单数量
      this.queryMyPrizeNum(); // 我的奖品数量
      this.getDetail();
      this.reqtipsMineFun();
    } else {
      this.getAuthUserinfo();
    }
    const { isEmployee } = this.data;
    if (isEmployee) {
      this.queryUserStatistics();
    }
  },
  /**
   * 获取授权后的用户信息
   */
  async getAuthUserinfo() {
    const userInfo = await queryUserInfo();
    this.setData({
      userInfo
    });
    this.getSessionFrom(); //获取客服个人信息
    this.queryOrderNumers();
    this.getLevel();
    // this.queryGoldenBeanId();
    this.queryKangDouBySceneId();
    this.getEmployeeInfo();
    this.getCardNumber(); //更新卡片数量
    this.getVoucherNumber(); //更新优惠券数量
    this.queryMyPrizeNum(); // 更新奖品数量
    this.getDetail();
    this.reqtipsMineFun();
  },
  // 调理方案/我的服务信息数量
  reqtipsMineFun() {
    reqtipsMine()
      .then(({ result }) => {
        this.setData({
          recuperateSchemeCount: result.recuperateSchemeCount,
          serviceCount: result.serviceCount
        });
      })
      .catch(err => {
        showToast({
          title: err.msg || '获取信息失败',
          type: TOAST_TYPE.WARNING,
          duration: 2000
        });
      });
  },
  // 获取健康医生信息
  getDetail() {
    reqCounselor({ str: 0 })
      .then(({ result }) => {
        this.setData({
          iswelcome:true,
          waiterData: result
        });
      })
      .catch(err => {
        showToast({
          title: err.msg || '获取信息失败',
          type: TOAST_TYPE.WARNING,
          duration: 2000
        });
      });
  },
  // 点击咨询专属顾问
  advatar() {
    let str = this.data.waiterData && this.data.waiterData.isBind ? 0 : 1;
    wx.navigateTo({
      url: '/pages/healthArchives/healthWaiter/index?str=' + str
    });
  },
  /**
   * 获取客服 个人信息
   */
  getSessionFrom() {
    const sessionFrom = app.getContactInfo({
      title: '我的'
    });
    this.setData({
      sessionFrom
    });
  },
  /**
   * 获取授权后的会员等级
   */
  getLevel() {
    getMemberLevel({}).then(({ result }) => {
      this.setData({
        levelIcon: result.levelUrl
      });
    });
  },
  /**
   * 是员工的时候请求分佣相关接口
   */
  getEmployeeInfo() {
    const { userInfo } = this.data;
    queryUserIdentity().then(({ result }) => {
      const { isEmployee, ...params } = result;
      this.setData({
        isEmployee,
        userInfo: {
          ...userInfo,
          ...params
        }
      });
      if (isEmployee) {
        this.queryUserStatistics();
      }
    });
  },

  /**
   * 跳转编辑用户信息
   */
  gotoEditUserInfo() {
    if (isLogged()) {
      wx.navigateTo({
        url: `/pages/account/edit/index`
      });
    }
  },
  goEnvConfig() {
    wx.navigateTo({
      url: `/pages/envConfig/index`
    });
  },
  /**
   * 获取员工分佣总收益
   */
  queryUserStatistics() {
    queryTotalStatistics({}).then(({ result }) => {
      const res = (result.totalCommission / 100).toFixed(2);
      this.setData({
        totalCommission: res
      });
    });
  },
  // 我的奖品数量
  queryMyPrizeNum() {
    // userId: this.data.userInfo.userId
    myPrizeNum({}).then(({ result }) => {
      this.setData({
        prizeNum: result.num > 99 ? '99+' : result.num
      });
    });
  },
  // 获取卡片数量
  getCardNumber() {
    getCardStatistics()
      .then(({ result }) => {
        this.setData({
          cardNumber: result.enableSum > 99 ? '99+' : result.enableSum
        });
      })
      .catch(err => {});
  },
  //获取优惠券数量
  getVoucherNumber() {
    queryCouponNum().then(({ result }) => {
      this.setData({
        voucherNumber: result > 99 ? '99+' : result
      });
    });
  },
  /**
   * 显示/隐藏康豆
   */
  toggleBeans() {
    const { beansVisible } = this.data;
    this.setData({
      beansVisible: !beansVisible
    });
  },
  /**
   * 显示/隐藏收益
   */
  toggleCommission() {
    const { commissionVisible } = this.data;
    this.setData({
      commissionVisible: !commissionVisible
    });
  },
  /**
   * 客服埋点
   */
  onService() {
    track(TrackEventName.Boss_CustomerService, {
      customer_service_type: '在线客服'
    });
  },
  /**
   * 查看会员权益
   */
  toMemberPage() {
    wx.navigateTo({
      url: `/pages/account/index`
    });
  },
  /**
   * 拨打电话
   */
  onCallTel() {
    track(TrackEventName.Boss_CustomerService, {
      customer_service_type: '电话客服'
    });
    wx.makePhoneCall({
      phoneNumber: CONSUMER_HOTLINE
    });
  },
  /**
   * 授权成功后跳转对应的页面
   */
  onHrefPage({ target }) {
    let { href, num, isBind } = target.dataset;
    if(href == '/pages/conditioningPlan/index' && num == 2){
      href = href + "?str=" + isBind
    }
    wx.navigateTo({
      url: href
    });
  },
  clearData() {
    wx.setStorageSync(STORAGE_USER_FOR_KEY, null);
    wx.setStorageSync(STORAGE_HONG_CU_BAO_KEY, null);
    showToast({
      title: '清除成功，2秒后将重启'
    });
    setTimeout(() => {
      this.restart();
    }, 2000);
  },
  copyToken() {
    const user = getLoggedUser();
    wx.setClipboardData({
      data: user.token
    });
  },
  // 打开红促宝，去康豆页面
  async navigateToMiniHongCuBao() {
    wx.navigateTo({
      url: '/pages/healthBean/index'
    });
    return;

    // const { token } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || { token: '' }
    // const { result } = await queryScene()

    // if (!result.sceneId) {
    //   if (this.data.isTest) showToast({ type: TOAST_TYPE.INFO, title: '未获取到场景id' })
    //   return null
    // }

    // //跳转红促宝 埋点
    // track(TrackEventName.Boss_HcbReturn, { lb_name: result.sceneId })

    // wxFuncToPromise(`navigateToMiniProgram`, {
    //   appId: APP_ID.HONG_CU_BAO,
    //   path: THIRD_PARTY_PATH.HONG_CU_BAO_KANG_DOU,
    //   extraData: {
    //     token,
    //     source: SOURCE.BH_MALL,
    //     sceneId: result.sceneId
    //   },
    //   envVersion: env.envVersion
    // });
  },
  // 获取康豆数据
  async queryKangDouBySceneId() {
    const {
      result: { sceneId }
    } = await queryScene();
    const { token } = getLoggedUser();
    if (sceneId) {
      try {
        const { result = [] } = await queryYasumeByScene({
          sceneId,
          token
        });
        const data = result.find(item => item.sceneId === sceneId);
        if (data) {
          const yasume = ((Number(data.surplusPoint) * 100) / 100).toFixed(2);
          this.setData({
            yasume
          });
        }
      } catch (e) {}
    }
  },
  // 获取金豆数据
  async queryGoldenBeanId() {
    const { token } = getLoggedUser();
    const { result } = await getAllMall();
    const goldenBeanMall = result.filter(item => item.mallType === 2);
    if (goldenBeanMall.length) {
      const { result = [] } = await queryYasumeByScene(
        {
          token
        },
        {
          mallId: goldenBeanMall[0].mallId
        }
      );
      const sum = result.reduce((total, item) => total + item.surplusPoint, 0);
      const res = ((sum * 100) / 100).toFixed(2);
      this.setData({
        goldenBean: res
      });
    }
  },
  // 打开金豆宝，去金豆页面
  async navigateToMiniJinDouBao() {
    const { token } = getLoggedUser();

    wxFuncToPromise(`navigateToMiniProgram`, {
      appId: APP_ID.JIN_DOU_BAO,
      path: THIRD_PARTY_PATH.JIN_DOU_BAO_JIN_DOU,
      extraData: {
        token,
        source: SOURCE.BH_MALL
        // sceneId: result.sceneId
      },
      envVersion: env.envVersion
    });
  },
  //不同状态订单数量
  queryOrderNumers() {
    queryOrderCount().then(({ result }) => {
      const orderNavList = this.data.orderNavList;
      let orderCount = {};
      result.forEach(item => {
        orderCount[item.orderStatus] = item.total;
      });
      orderNavList[0].number = this.handleNums(orderCount[10]); //待付款
      orderNavList[1].number = this.handleNums(orderCount[20]); //待发货
      orderNavList[2].number = this.handleNums(orderCount[30]); //待收货
      orderNavList[3].number = this.handleNums(orderCount[99]); //退换货
      this.setData({
        orderNavList
      });
    });
  },
  //去订单中心
  toOrderList({ currentTarget }) {
    const { href } = currentTarget.dataset;
    wx.redirectTo({
      url: href ? href : '/pages/order/index'
    });
  },
  handleNums(num) {
    return num ? (num > 99 ? '99+' : num) : 0;
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo;
  },
  // 点击健康档案等模块
  async notepadLiClick(e) {
    let { num } = e.currentTarget.dataset; //num=1 健康档案
    // 健康档案等四个模块埋点
    let column_name =
      this.data.notepadList[this.data.notepadList.findIndex(char => char.num == num)].name;
    track(TrackEventName.Boss_PersonalPage_Click, {
      action_code: num,
      action_name: column_name
    });
    // 健康档案埋点
    if (num == 1) {
      track(TrackEventName.Boss_PHREntrance_Click, {
        curr_page_info: {
          page_source: '我的'
        }
      });
    }
    if (isLogged()) {
      let { result } = await queryUserHealth(); //是否已填写健康信息 0 否 1 是
      const _url = result.healthUserBasicInfo && result.healthUserBasicInfo.isHealthInfo
        ? '/pages/healthArchives/index'
        : `/pages/healthInfo/createInfo/index?businessPage=${HEALTH_INFO_BUSINESS_PAGE.HEALTH_ARCHIVES}`;
      const wxMethods = result.healthUserBasicInfo && result.healthUserBasicInfo.isHealthInfo ? 'redirectTo' : 'navigateTo';
      if (num == 1) {
        wxFuncToPromise(wxMethods, { url: _url }).then(res => {
          wx.setStorageSync(HEALTHARCHIVES_SOURCE_PAGE, 'mine');
        });
      }
      if (num != 1) {
        if (
          (num == 2 && this.data.recuperateSchemeCount > 0) ||
          (num == 3 && this.data.serviceCount > 0)
        ) {
          let params = {
            str: num == 2 ? '1' : '2'
          };
          this.reqtipsReadFun(params);
        }
        if(num == 2){
          e.currentTarget.dataset.isBind =  this.data.waiterData && this.data.waiterData.isBind ? 0 : 1;
        }
        this.onHrefPage({
          target: e.currentTarget
        });
      }
    } else {
      //未登录
      if (num === 1) {
        wx.navigateTo({
          url: '/pages/healthInfo/createInfo/index'
        });
      } else {
        this.selectComponent('#authHealthCoponents').openAuthorize(true);
      }
    }
  },
  // 上报消除未读信息 调理方案/我的服务
  reqtipsReadFun(params) {
    reqtipsRead(params)
      .then(({ result }) => {})
      .catch(err => {
        console.log(err);
      });
  },
  // 查询用户是否填写健康档案
  // 我的管理菜单点击
  async onMineClick(e) {
    const { num } = e.currentTarget.dataset; //num=1 健康档案
    if (isLogged()) {
      this.onHrefPage({
        target: e.currentTarget
      });
    } else {
      //未登录
      this.selectComponent('#authHealthCoponents').openAuthorize(true);
    }
  }
});
