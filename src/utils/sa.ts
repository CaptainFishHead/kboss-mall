import env from "./../config/env";
import sensors from "./../sdk/sensorsdata.es6.full";
import { SOURCE, PAGE_SOURCES } from "@const/index";
import { addUserMark } from "@models/commissionModel";

const IS_OPEN_LOG = env.__environment__ !== "pro";

// @ts-ignore
sensors.setPara({
  name: "sensors",
  server_url: env.SENSORS_DATA_URL,
  // 全埋点控制开关
  autoTrack: {
    appLaunch: true, // 默认为 true，false 则关闭 $MPLaunch 事件采集
    appShow: true, // 默认为 true，false 则关闭 $MPShow 事件采集
    appHide: true, // 默认为 true，false 则关闭 $MPHide 事件采集
    pageShow: true, // 默认为 true，false 则关闭 $MPViewScreen 事件采集
    pageShare: true, // 默认为 true，false 则关闭 $MPShare 事件采集
    mpClick: true, // 默认为 false，true 则开启 $MPClick 事件采集
    mpFavorite: true, // 默认为 true，false 则关闭 $MPAddFavorites 事件采集
  },
  // 自定义渠道追踪参数，如source_channel: ["custom_param"]
  source_channel: [],
  // 是否允许控制台打印查看埋点数据(建议开启查看)
  show_log: false, //IS_OPEN_LOG,
  // 是否允许修改 onShareAppMessage 里 return 的 path，用来增加(登录 ID，分享层级，当前的 path)，在 app onShow 中自动获取这些参数来查看具体分享来源、层级等
  allow_amend_share_path: true,
  batch_send: true,
});

export enum SCENE_TYPE {
  // 1 商品
  PRODUCT = 1,
  // 2 页面
  PAGE,
  // 3 直播
  LIVE,
  OTHER = -1,
}

export const SCENE_NAME = {
  [SCENE_TYPE.PRODUCT]: "商品服务",
  [SCENE_TYPE.LIVE]: "直播服务",
  [SCENE_TYPE.PAGE]: "页面服务",
  [SCENE_TYPE.OTHER]: "其他服务",
};

const saInit = (params = { lby_source: SOURCE.BH_MALL }) => {
  const _params = Object.assign({}, params, { source: "boss-wxapp" });
  // @ts-ignore
  sensors.registerApp(_params);
  sensors.registerPropertyPlugin({
    properties(data: Record<string, any>) {
      for (let key of Object.keys(_params)) {
        // @ts-ignore
        data.properties[key] = _params[key];
      }
    },
  });
  sensors.init();
};
/**
 * 埋点
 * options
 * eventName : 事件名
 * params: {
 *   自定义参数，需求方定义的参数
 * }
 * @type {function(*, *, *): void}
 */
export const track = (eventName: string, param?: any) => {
  const _params = param || {};

  try {
    _params.curr_page_info = JSON.parse(decodeURIComponent(_params.curr_page_info));
  } catch (e) {}

  // @ts-ignore
  const pages = getCurrentPages();
  const prevPage = pages.at(-2) || {};
  const currentPage = pages.at(-1) || {};
  const pre_page_source = (PAGE_SOURCES[prevPage.route] || {}).title || "";
  const current_page = (PAGE_SOURCES[currentPage.route] || {}).title || "";
 /* console.log('pre_page_source',pre_page_source,prevPage.route)
  console.log('current_page',current_page,currentPage.route)*/
  const options = currentPage.options || {};
  let page_info: any = {};
  // @ts-ignore
  if (_params.curr_page_info && Object.keys(_params.curr_page_info).length !== 0) {
    // 如果curr_page_info参数中page_source有值 表示取当前页面信息需重置page_id、page_name
    const { page_id, page_name, page_source } = _params.curr_page_info || {};
    if (page_source) page_info.page_source = page_source;
    if (page_name) page_info.page_name = decodeURIComponent(page_name);
    if (page_id) page_info.page_id = page_id;
    delete _params.curr_page_info;
  } else {
    // 注：默认取上一个页面的page_id、page_name、page_source
    page_info.page_source = pre_page_source || "";
    page_info.page_name = options.page_name ? decodeURIComponent(options.page_name) : "";
    page_info.page_id = options.page_id || "";
  }
  // @ts-ignore
  sensors.track(eventName, {
    ..._params,
    current_page,
    ...page_info,
  });
};

export interface ISaGlobalParams {
  lby_source: string;
  lby_skipscene?: string;
  lby_detailid?: string;
  lby_shareid?: string;
}

export enum TrackEventName {
  // ======= 直播相关 star =======
  Sdk_Live_Detail = "Sdk_Live_Detail",
  Sdk_Live_Like = "Sdk_Live_Like",
  Sdk_Live_Share = "Sdk_Live_Share",
  Sdk_Live_ShopperDetail = "Sdk_Live_ShopperDetail",
  Sdk_ShopperCommodity = "Sdk_ShopperCommodity",
  Sdk_Live_ReadCard = "Sdk_Live_ReadCard",
  Sdk_CommodityEposure = "Sdk_CommodityEposure",
  Sdk_CommodityDetail = "Sdk_CommodityDetail",
  Boss_LiveExplanation = "Boss_LiveExplanation",
  Boss_LiveExplanation_Detail = "Boss_LiveExplanation_Detail",
  Boss_LiveIn = "Boss_LiveIn",
  // ======= 直播相关 end =======
  Boss_CommodityDetail = "Boss_CommodityDetail",
  Boss_Module = "Boss_Module",
  Boss_Share = "Boss_Share",
  Boss_Share_Detail = "Boss_Share_Detail",
  Boss_AddCart = "Boss_AddCart",
  Boss_BuyNow = "Boss_BuyNow",
  Boss_Clearing = "Boss_Clearing",
  Boss_CustomerService = "Boss_CustomerService",
  Boss_LbyReturn = "Boss_LbyReturn",
  Boss_HcbReturn = "Boss_HcbReturn",
  Boss_FavouriteList = "Boss_FavouriteList",
  Boss_Favourite = "Boss_Favourite",
  Boss_Special_Detail = "Boss_Special_Detail",
  Boss_Msso = "Boss_Msso",
  Boss_CollectList = "Boss_CollectList",
  Boss_SearchColumClick = "Boss_SearchColumClick",
  Boss_SearchResultClick = "Boss_SearchResultClick",
  Boss_SeedingDetail = "Boss_SeedingDetail",
  Boss_SeedingInteract = "Boss_SeedingInteract",
  Boss_HomePage = "Boss_HomePage",
  Boss_SeedingList = "Boss_SeedingList",
  Boss_TabClick = "Boss_TabClick",
  Boss_WechatLogin = "Boss_WechatLogin",
  Boss_SharePublic = "Boss_SharePublic",
  Boss_GiftBeans = "Boss_GiftBeans",
  // =============================
  Boss_Health_uploading = "Boss_Health_uploading",
  Boss_TieCard = "Boss_TieCard",
  Boss_ReceiverAddress = "Boss_ReceiverAddress",
  Boss_NoviceGuide = "Boss_NoviceGuide",
  Boss_Rotation_Click = "Boss_Rotation_Click",
  Boss_KBossAI = "Boss_KBossAI",
  Boss_Column_Click = "Boss_Column_Click",
  Boss_HealthTips = "Boss_HealthTips",
  Boss_PHREntrance_Click = "Boss_PHREntrance_Click",
  Boss_PersonalPage_Click = "Boss_PersonalPage_Click",
  Boss_Health_BasicInfo = "Boss_Health_BasicInfo",
  Boss_Health_Info = "Boss_Health_Info",
  Boss_Health_loggingData = "Boss_Health_loggingData",
  Boss_HealthBat= "Boss_HealthBat",
  Boss_TabBar_Click = "Boss_TabBar_Click",
  Boss_Counselor_Detail= "Boss_Counselor_Detail",
  Boss_HealthTesting= "Boss_HealthTesting",
}

export const saLogin = (userId: string, isAuto?: boolean, pageSource?: string) => {
  // @ts-ignore
  sensors.login(userId);
  if (!isAuto) {
    // 埋点 授权登录
    track("Boss_Msso", { page_source: pageSource || "其他", is_success: 1 });
  }
  try {
    // @ts-ignore
    addUserMark();
  } catch (e) {
    console.error("addUserMark error", e);
  }
};

export default saInit;
