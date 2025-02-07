// 用户信息存储KEY
export const STORAGE_USER_FOR_KEY = `TOJO_STORAGE_USER_FOR_KEY`;

// 存储扫码信息
export const STORAGE_SCAN_DEVICE = `SCAN_DEVICE`;

// api版本号
export const API_VERSION = `v2`;

// 环境信息KEY
export const ENVIRONMENT_KEY = `TOJO_STORAGE_ENVIRONMENT_FOR_KEY`;
//第三方业务对接-healthAI-信息存储KEY
export const STORAGE_JKYY_KEY = `STORAGE_JKYY_KEY`;

// xhr原样返回标识不做响应拦截处理，比如说直接请求json或者其他file 时需要，拦截器不对响应类型做处理，配置在config里即可,使用请直接导入该变量，便于维护和扩展
export const RESPONSE_RETURN = {
  // 不做响应拦截，按api原样返回
  asIs: 1,
  // 处理成{result,code,msg}后返回结果
  handle: 2,
};

// 接口请求拦截模式
export const AUTHENTICATION_MODE = {
  // 继续不拦截
  continue: 0,
  // 终止请求
  break: 1,
  // TODO:引导登录后继续请求接口,暂不支持，先别使用，需要自己在业务代码中做处理，引用authorize组件，查看pages/demo/index.js
  afterLoginContinue: 2,
};
export const PLAT_FORM = {
  // 康老板平台标识
  BDS: 10,
  // 氧吧酒店平台标识
  OBH: 6,
};

// 订单倒计时过期值   默认 1小时，0～23 单位小时
export const ORDER_COUNT_DOWN = 1;

// 码小宝分佣分享码shareUniId标识后缀 source SOURCE
export const SOURCE = {
  // 码小宝
  CODE_XIAO_BAO: "tbh",
  // 老板云标识
  BOSS_CLOUD: ["laobanyun", "laobanyunmp", "laobanyunh5"],
  // 康老板
  BH_MALL: "bh-mall",
  // sdk
  PLUGIN: "bh-mall-plugin",
  HOTEL: "HOTEL_M",
};

//下单渠道
export const SDK_APPLET = `${SOURCE.BH_MALL}_live`;

//订单页状态
// export const orderStatusMap = {
//   '10': { type: '待付款', text: '取消订单', btn: '立即支付', dialog_title: '确认取消订单？', orderResult: '' },
//   '20': { type: '待发货', text: '申请售后', btn: '提醒发货', dialog_title: '确定退款？', orderResult: '订单待发货' },
//   '30': { type: '待收货', text: '申请售后', btn: '确认收货', dialog_title: '确定退款？', orderResult: '订单待收货' },
//   '40': { type: '已完成', text: '申请售后', btn: '联系客服', dialog_title: '确定申请售后', orderResult: '订单已完成' },//待收货
//   '50': { type: '已完成', text: '申请售后', btn: '联系客服', dialog_title: '确定申请售后？', orderResult: '订单已完成' },
//   '60': { type: '已取消', text: '删除订单', btn: '再次购买', dialog_title: '是否确定删除订单？', orderResult: '订单已取消' },
//   '70': { type: '已取消', text: '删除订单', btn: '再次购买', dialog_title: '是否确定删除订单？', orderResult: '订单已超时' } //已超时
// }
export const orderStatusMap = {
  "10": {
    type: "待付款",
    text: "取消订单",
    btn: [
      {
        type: "primary",
        txt: "继续支付",
      },
    ],
    dialog_title: "确认取消订单？",
    orderResult: "",
  },
  "20": {
    type: "待发货",
    text: "申请售后",
    btn: [
      {
        type: "primary",
        txt: "提醒发货",
      },
    ],
    // dialog_title: '确定退款？',
    orderResult: "订单待发货",
  },
  "30": {
    type: "待收货",
    text: "申请售后",
    btn: [
      {
        type: "default",
        txt: "查看物流",
      },
      {
        type: "primary",
        txt: "确认收货",
      },
    ],
    // dialog_title: '确定退款？',
    orderResult: "订单待收货",
  },
  "40": {
    type: "已完成",
    text: "申请售后",
    btn: [
      {
        type: "default",
        txt: "查看物流",
      },
      {
        type: "default",
        txt: "联系客服",
      },
      {
        type: "primary",
        txt: "再次购买",
      },
    ],
    // dialog_title: '确定申请售后',
    orderResult: "订单已完成",
  }, //待收货
  "50": {
    type: "已完成",
    text: "申请售后",
    btn: [
      {
        type: "primary",
        txt: "联系客服",
      },
    ],
    // dialog_title: '确定申请售后？',
    orderResult: "订单已完成",
  },
  "60": {
    type: "已取消",
    text: "删除订单",
    btn: [
      {
        type: "primary",
        txt: "再次购买",
      },
    ],
    dialog_title: "是否确定删除订单？",
    orderResult: "订单已删除",
  },
  "70": {
    type: "已取消",
    text: "删除订单",
    btn: [
      {
        type: "primary",
        txt: "再次购买",
      },
    ],
    dialog_title: "是否确定删除订单？",
    orderResult: "订单已超时",
  }, //已超时
};
// 消息模版
export const MESSAGE_TEMPLATE = {
  // 订单待支付
  TO_BE_PAID_NOTICE: {
    // 推送接口用
    TEMPLATE_TYPE: "1",
    // 微信授权用
    TEMPLATE_ID: "eEvcnFcj_OosnosECScwVR6mICDCGTAfC_wz1dVxOMs",
  },
  // 订单发货
  SHIPPING_NOTICE: {
    TEMPLATE_TYPE: "2",
    TEMPLATE_ID: "SddJFWEtjenQut8Pc8EvrzXNpmem2fCoryMVwXO8sq8",
  },
  // 直播提醒
  LIVE_NOTICE: {
    TEMPLATE_TYPE: "3",
    TEMPLATE_ID: "Je4JVGnt-0RXweoi4hwM5MkriQ6ok8OGzeMbBRY6TkY",
  },
};
// 取消支付或者支付出现错误
export const WX_PAY_CANCEL = "WX_PAY_CANCEL";

// 订单来源页面
export const ORDER_SOURCE_PAGE = {
  CART: 2, // 购物车页面
  PRODUCT: 1, // 商品详情页面
  CARDID: 3, // 商品卡详情页面
  SUIT: 4, // 随心配详情页面
  WARMDOCTOR: 5, // 温暖医生(无服务卡直接支付)
  WARMDOCTORCARD: 6 // 温暖医生(有服务卡直接预约)
};

// 商品类型
export const PRODUCT_TYPE = {
  VIRTUAL: 2, // 虚拟商品
  REAL: 1, // 实物
  VIRTUAL_CARD: 1, //是虚拟商品卡
  REAL_CARD: 2, //是实体商品卡
};

//核销方式-> 0: 无 | 1: 兑换码（暂不支持）| 2: 其他 | 3: 虚拟商品卡 | 4: 线上服务 | 5: 线下服务
export const CHARGEOFF_TYPE = {
  0:'',
  1:'兑换码',
  2:'其他',
  3:'虚拟商品卡',
  4:'线上服务',
  5:'线下服务',
}

// 用户行为类型
export const FAVORITE_TYPE = {
  LIKE: 1, //收藏
  THUMBSUP: 2, //点赞
  FOLLOW: 3, //关注
};

// 标的物类型
export const SUBJECT_TYPE = {
  PRODUCT: 1, //商品、组合品
  ARTICLE: 2, //文章
  SHOP: 3, //商铺
  SUIT: 4, //随心配
};

export const LOADING_TEXT = {
  LOADING: "拼命加载中",
  SUBMIT: "请稍后···",
};

//  orderPayType: 1, //支付平台类型（1：微信、2：支付宝）
export const ORDER_PAY_TYPE = {
  WECHAT: 1,
  ALIPAY: 2,
};

//订单来源 13=电商小程序采购
export const ORDER_SOURCE = 13;

// 吐司提示类型
export const TOAST_TYPE = {
  INFO: "info",
  ERROR: "error",
  WARNING: "warning",
  SUCCESS: "success",
  LOADING: "loading",
  CIRCLE_LOADING: "circle_loading",
};

// 小程序返回场景值
// https://developers.weixin.qq.com/miniprogram/dev/reference/scene-list.html
export const SCENE_CODE = {
  // app
  1069: "app",
  // h5
  1065: "h5",
  // 小程序返回小程序
  // 1038: 'mini',
  // 小程序打开小程序
  1037: "mini",
};
// 云平台接口
export const TEMP_CLOUD = "/TEMP_CLOUD";
// 云平台sdk接口
export const CLOUD_SDK = "/CLOUD_SDK";
//健康有益 HEALTH_AI 第三方接口
export const HEALTH_AI = "/HEALTH_AI";
export const JKYY_4_API = "https://api4.jiankangyouyi.com";
export const JKYY_3_API = "https://api3.jiankangyouyi.com";
export const JKYY_BIZ_TYPE = "012502";
export const JKYY_APP_ID = "665923c5837fee54d26de710";
export const JKYY_API_KEY = "08d002a1a36640efbcadcef371da30b9";

// 类首页配置模版组件id
export const START_UP = 1901;
export const TITLE_TEXT = 1906;
export const SWIPER = 1902;
export const BIG_PICTURE = 1903;
export const SCROLL_X = 1904;
export const RUBIK_S_CUBE = 1905;
export const DIVIDING_LINE = 1907;

export const themes = new Map([
  [
    1,
    {
      frontColor: "#ffffff",
      backgroundColor: "#000000",
    },
  ],
  [
    2,
    {
      frontColor: "#000000",
      backgroundColor: "#ffffff",
    },
  ],
]);

// 三方小程序APPID
export const APP_ID = {
  // 红促宝
  HONG_CU_BAO: "wx5b0519abf204cf1e", //pre环境
  // HONG_CU_BAO: 'wxc734a01678a0120a', //uat 环境
  // 金豆宝商城
  JIN_DOU_BAO: "wx69fc8549c486c957",
  // 第医服务台
  DI_YI_FANG_TAI: "wx7df4718effe4cc62",
};

// 三方小程序链接
export const THIRD_PARTY_PATH = {
  // 红促宝康豆
  HONG_CU_BAO_KANG_DOU: "pages/activity/sceneActivity/index",
  // 红促宝赠送康豆
  HONG_CU_BAO_SEND_KANG_DOU: "pages/sendHb/index",
  // 金豆宝金豆
  JIN_DOU_BAO_JIN_DOU: "pages/home/home",
  // 第医服务台
  DI_YI_FANG_TAI_HOME: "pages/trtc/trtc",
};

export const STORAGE_HONG_CU_BAO_KEY = `STORAGE_HONG_CU_BAO_KEY`;

// 领取商品结果类型
const ISON_ACCEPT_NOT = "https://static.tojoyshop.com/images/wxapp-boss/coupon/icon-receive-fail-1.png";
const ISON_ACCEPT_FAIL = "https://static.tojoyshop.com/images/wxapp-boss/coupon/icon-receive-fail-2.png";
const ISON_ACCEPT_SUCCESS = "https://static.tojoyshop.com/images/wxapp-boss/coupon/icon-receive-success.png";
export const CARD_ACCEPT_TYPE = new Map([
  [
    1,
    {
      result: "您已领取朋友赠送的礼品卡",
      reason: "欢迎前往康老板兑换礼品",
      popupResult: "领取成功",
      icon: ISON_ACCEPT_SUCCESS,
    },
  ],
  [
    2,
    {
      result: "您来晚了",
      reason: "很抱歉，由于超过48小时无人领取，礼品卡已退回到赠送人",
      popupResult: "领取失败, 礼品卡已过期",
      icon: ISON_ACCEPT_FAIL,
    },
  ],
  [
    3,
    {
      result: "礼品卡过期了",
      reason: "很抱歉，礼品卡过期了，不能领取了",
      popupResult: "领取失败, 礼品卡已过期",
      icon: ISON_ACCEPT_FAIL,
    },
  ],
  [
    4,
    {
      result: "礼品卡撤回了",
      reason: "很抱歉，该礼品卡已被撤回了",
      popupResult: "领取失败, 礼品卡已被撤回",
      icon: ISON_ACCEPT_FAIL,
    },
  ],
  [
    5,
    {
      result: "礼品卡已被别人领取",
      reason: "",
      popupResult: "领取失败, 礼品卡已被别人领取",
      icon: ISON_ACCEPT_FAIL,
    },
  ],
  [
    6,
    {
      result: "您已领取朋友赠送的礼品卡",
      reason: "欢迎前往康老板兑换礼品",
      popupResult: "礼品卡已被您领取，请勿重复领取",
      icon: ISON_ACCEPT_NOT,
    },
  ],
  [
    7,
    {
      result: "这张礼品卡是您自己发的自己不能领取",
      reason: "",
      popupResult: "这张礼品卡是您自己发的自己不能领取",
      icon: ISON_ACCEPT_NOT,
    },
  ],
]);

// 通用分享
export const DEFAULT_SHARE_PARAMS = {
  title: "老板健康生活一站式服务平台",
  path: "/pages/index/index",
  imageUrl: "https://static.tojoyshop.com/images/wxapp-boss/default-share.jpg",
};
// 健康档案分享
export const HEALTH_SHARE_PARAMS = {
  title: "建立档案，享受健康专家关怀",
  imageUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-share-info.png",
  path: `/pages/healthInfo/createInfo/index?isShare=1`,
};

// 用户来源，注册需要
export const USER_SOURCE_KEY = "USER_SOURCE_KEY";
export const USER_SOURCE_TYPE_KEY = {
  HOTEL: 40,
  // 氧疗堂
  ORH: 70,
};
export const CONSUMER_HOTLINE = "400-101-0505";

// 商品详情页
export const PRODUCT_DETAIL_PAGES = {
  // 单品
  SINGLE_PRODUCT: "pages/product/index",
  // 随心配
  MATCH_AS_YOU_LIKE: "pages/product/suit/index",
};

// 商品类型功能（用于加入心愿单subjectType和jumpType值关系映射）
export const PRODUCT_LIKE_SUBJECT = {
  5: SUBJECT_TYPE.SUIT,
  2: SUBJECT_TYPE.PRODUCT,
};

// 全站通用基本参数映射关系
export const BASE_COMMON_PARAMS = {
  roomLiveId: "targetId",
  skipScene: "position",
  tjid: "ssid",
  s: "source",
  uid: "mid",
  shareUniId: "mid",
  member_userId: "code",
  payLoad: "payLoad",
  v2_code: "v2_code",
};

// 商品详情、组合品、随心配 参数映射关系
export const PRODUCT_PARAMS_MAP = {
  pid: "id",
  spuId: "id",
};

// 首页
export const CARRIER_PARAMS_MAP = {
  pageId: "pageId",
  activeId: "actId",
};

//康豆操作类型
export const operateTypeMap = {
  2: "平台发放",
  3: "平台扣减",
  6: "康豆过期",
  11: "平台发放",
  12: "下单抵现",
  13: "售后退还",
  14: "获赠康豆",
  15: "转赠康豆",
  16: "转赠康豆退回",
  19: "平台扣减",
};

// 缓存5分钟
export const DELAY = 5 * 60 * 1000;

// 承载页面
export const CARRIER_PAGES = ["pages/carrier/index", "pages/index/index"];
// 第一次进入添加收货地址 通过地图获取位置标记
export const ISFIRSTMAPADDRESS = "ISFIRSTMAPADDRESS";
// 领取康豆活动页
export const GET_BEANS_ACTIVE_TIPS = {
  2: "活动未开始",
  3: "活动已经结束",
  4: "仅限指定用户参与呦!",
  5: "您来晚一步 康豆已被抢光了!",
  7: "活动已经结束",
  41: "仅限新客户参与哟！",
};

// 领取优惠券状态按钮
export const RECEIVE_COUPON_BTN_TEXT_MAPS = {
  0: "立即领取",
  1: "去使用",
  2: "已抢光",
  3: "已结束",
};

//领取优惠券结果提示
export const RECEIVE_COUPON_STATUS_TIPS_MAPS = {
  2: "来晚了～优惠券已被抢光",
  3: "来晚了～活动已结束",
  4: "领取优惠券成功",
  5: "您不符合领取条件",
  6: "每位用户最多领取",
  7: "您不是新用户，无法领取",
};

// 储存朋友圈分享ID
export const WECHAT_MOMENTS_SHARE_ID = "WECHAT_MOMENTS_SHARE_ID";

// 页面来源种类
export declare type PageSource = {
  [key: string]: string;
};
export type TWxPage = {
  [key: string]: {
    route?: string;
    title: string;
  };
};

export const PAGE_SOURCES: TWxPage = {
  "pages/index/index": {
    title: "首页",
  },
  "pages/cart/index": {
    title: "购物车",
  },
  "pages/coupon/gift/accept/index": {
    title: "领取优惠券",
  },
  "pages/voucher/index": {
    title: "我的优惠券",
  },
  "pages/order/confirm/index": {
    title: "订单确认",
  },
  "pages/order/detail/index": {
    title: "订单详情",
  },
  "pages/live/player/index": {
    title: "直播",
  },

  "pages/recommend/graphicDetail/index": {
    title: "种草详情（图文）",
  },
  "pages/recommend/videoDetail/index": {
    title: "种草详情（视频）",
  },
  "pages/product/index": {
    title: "商品详情",
  },
  "pages/account/collection/index": {
    title: "我的收藏",
  },
  "pages/recommend/index": {
    title: "种草列表页",
  },
  "pages/recommend/special/index": {
    title: "种草专题页",
  },
  "pages/recommend/ipList/index": {
    title: "专家列表页",
  },
  "pages/recommend/ipDetail/index": {
    title: "专家详情页",
  },
  "pages/mine/index": {
    title: "个人中心",
  },
  "pages/obh/myPrize/index": {
    title: "我的奖品列表",
  },
  "pages/classify/index": {
    title: "分类页",
  },
  "pages/search/index": {
    title: "搜索页",
  },
  "pages/account/favorite/index": {
    title: "关注商品页",
  },
  "pages/account/footPrint/index": {
    title: "足迹",
  },
  "pages/carrier/index": {
    title: "专题页",
  },
  "pages/obh/buy/lottery/index": {
    title: "抽奖页面",
  },
  "pages/obh/myPrize/detail/index": {
    title: "兑奖详情",
  },
  "pages/column/index": {
    title: "专栏",
  },
  "pages/mall/index": {
    title: "商城",
  },
  "pages/chatai/index": {
    title: "AI小康",
  },
  "pages/healthArchives/index": {
    title: "健康档案",
  },
  "pages/healthArchives/healthWaiter/index": {
    title: "健康管家",
  },
  "pages/healthAI/reportResults/index": {
    title: "测评报告",
  }
};

// export const PAGE_SOURCE:PageSource = {
// 	'1': '首页',
// 	'2': '购物车',
// 	'3': '领取优惠券',
// 	'4': '我的优惠券',
// 	'5': '订单确认',
// 	'6': '订单详情',
// 	'7': '直播',
// 	'8': '分享', // 暂定
// 	'9': '种草详情',
// 	'10': '商品详情',
// 	'11': '我的收藏',
// 	'12': '种草列表',
// 	'13': '种草专题页',
// 	'14': '个人中心',
// 	'15': '我的奖品列表',
// 	'16': '兑奖详情', // 暂留
//   '17': '抽奖页面',// 暂留
//   '18': '分类页',
//   '19': '搜索页',
//   '20': '关注的商品',
//   '21': '足迹',
//   '22': '氧吧转盘', // 暂留
//   '23': '专题页',
// }

// 分享链接类型
export const SHARE_TYPE = {
  SHARE_TYPE_POSTER: 0,
  SHARE_TYPE_FRIEND: 1,
  SHARE_TYPE_LINK: 2,
  SHARE_TYPE_CODE: 3,
};

// 抽奖平台
export const PRIZE_PLAT = {
  // 2: '互助购',
  6: "康老板-氧吧酒店",
  // 7: '氧疗堂',
  // 10: '康老板'
};

// 收货地址
export const RECEIVER_ADDRESS = "RECEIVER_ADDRESS";
// 坐标系
export const COORDINATE_TYPE = "gcj02";
// 企业微信客服ID
export const ENTERPRISE_WX_SERVICE_PLUGID = "85acbe40522d841df6ecc5ab1835b921";

export const GOODS_SUGGEST_BUTTON_TEXT_STYLE = {
  2: {
    TXT: "立即购买",
    CLASSNAME: 'buy'
  },
  3: {
    TXT: "立即评测",
    CLASSNAME: 'evaluating '
  },
  1: {
    TXT: "查看全文",
    CLASSNAME: 'article'
  },
  4: {
    TXT: "立即预约",
    CLASSNAME: 'reservation'
  },
  5: {
    TXT: "解读报告",
    CLASSNAME: 'report'
  },
  0: {
    TXT: "立即购买",
    CLASSNAME: 'buy'
  },
};

// 用户健康信息页面的 业务来源
export const HEALTHARCHIVES_SOURCE_PAGE = `HEALTHARCHIVES_SOURCE_PAGE`;

export const HEALTH_INFO_BUSINESS_PAGE = {
  HEALTH_FAST: 'healthFast',//健康拍
  HEALTH_ARCHIVES: 'healthArchives',//健康档案
  BEANS: 'beans' //领康豆页面
};



export const CHAT_TYPE = {
  // 问题
  QUESTION: 1,
  // 答案
  ANSWER: 2,
  //推荐问题
  REQUESTIONS: 3,
  //人工咨询
  CONSULT: 4,
  //loading
  LOADING: 5,
  //商品
  GOODS: 6,
  //文章
  ARTICLE: 7,
  //医生
  DOCTOR: 8,
  //报告
  REPORT: 9
};

export const CHAT_FROM_TYPE = {
  //home
  HOME: 'home',
  //医生
  DOCTOR: 'doctor',
  //健康档案
  HEALTH: 'health',
  //底部导航
  BOTTOMTAB: 'tab'
};

export const CHA_CARD_TYPE = {
  //医生
  DOCTOR: 1,
  //商品
  GOODS: 2,
  //内容
  ARTICLE: 3,
  //顾问
  CONSULTANT: 4,
  //健康拍
  PHEALTH: 5
};

// 数据来源：0用户记录 1管家记录 2设备同步 3健康拍
export const CREATOR_TYPE_MAPS = {
  0: "用户记录",
  1: "管家记录",
  2: "设备同步",
  3: "健康拍",
};

