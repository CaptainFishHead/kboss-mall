import { post } from "./http/index";
import { SOURCE, STORAGE_USER_FOR_KEY, WX_PAY_CANCEL, WECHAT_MOMENTS_SHARE_ID } from "../const/index";

/**
 * 小程序函数包装为promise
 * @param scheme : string : 需要掉用的方法名
 * @param params : object : 掉用小程序方法所需参数，无需传success和fail参数，直接使用promise的then和catch方法即可
 * @returns {Promise<unknown>}
 */
export const wxFuncToPromise = (scheme, params = {}) => {
  // console.log(scheme, params);
  return new Promise((resolve, reject) => {
    if (!wx[scheme]) {
      console.log(scheme, `当前微信版本不支持`);
      resolve({});
    } else {
      wx[scheme]({
        ...params,
        success(res) {
          // console.log(res, scheme)
          resolve(res);
        },
        fail(err) {
          console.log(err, scheme);
          reject(err);
        },
      });
    }
  });
};

/**
 * 小程序请求授权
 * @param scope : string : 授权码，
 * 参考 https://developers.weixin.qq.com/miniprogram/dev/api/open-api/authorize/wx.authorize.html
 * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/authorize.html#scope-%E5%88%97%E8%A1%A8
 * @param params
 * @returns {Promise<*>}
 */
export const wxReqAuthorize = async ({ scope, ...params }) => {
  const { authSetting } = await wxFuncToPromise("getSetting");
  if (!authSetting[scope]) {
    return await wxFuncToPromise("authorize", { scope, ...params });
  }
};

/**
 * 提交订单拿到订单id后调用
 * @param orderId
 * @returns {Promise<void>}
 */
export const wxPay = async orderId => {
  const { code: wxCode } = await wxFuncToPromise("login");
  console.log(wx.getStorageSync(STORAGE_USER_FOR_KEY), "userId-mobile");
  const { userId, mobile } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {};
  const {
    result: { mockPayStatus, /*rewardBean,*/ ...more },
  } = await post(`/order/app/v2/tojoyshop/pay/unifiedOrder`, {
    orderCode: orderId,
    wxCode,
    clientType: "MINI",
    payType: 1,

    // payFormType: 2, channelInner: 2,
    // userId, mobile
  });
  // wx.setStorageSync('rewardBean',rewardBean); //下单后是否存在康豆奖励
  if (mockPayStatus === "YES") {
    // 已经支付去订单中心，业务去实现
    return Promise.resolve({});
  }
  // 支付成功后去订单中心
  try {
    return await wxFuncToPromise("requestPayment", {
      provider: "wxpay",
      timeStamp: more.timestamp,
      nonceStr: more.noncestr,
      package: more.prepayid,
      signType: more.signType,
      paySign: more.sign,
    });
  } catch (e) {
    return Promise.reject({ code: WX_PAY_CANCEL });
  }
};

/**
 * 消息通知授权 https://developers.weixin.qq.com/miniprogram/dev/api/open-api/subscribe-message/wx.requestSubscribeMessage.html
 * @param tmplIds : array : 消息模版
 * @returns {Promise<*>}
 */
export const templatePushAuthorization = tmplIds => {
  return wxFuncToPromise(`requestSubscribeMessage`, { tmplIds });
};

const _styleFix = (styleStr, filterText) => {
  const arr = [
    "width",
    "height",
    "font-size",
    "left",
    "top",
    "right",
    "bottom",
    "margin-top",
    "margin-bottom",
    "margin-left",
    "margin-right",
    "padding-left",
    "padding-right",
    "padding-top",
    "padding-bottom",
  ];
  const style = JSON.parse(styleStr || "{}", (key, value) => {
    if (filterText && key.includes(filterText)) {
      return undefined;
    }
    return arr.includes(key) ? `${value}rpx` : value;
  });
  const _style = [];
  for (let [key, value] of Object.entries(style)) {
    const _value = key === "background-image" ? `url(${value})` : value;
    _style.push(`${key}:${_value}`);
  }
  return _style.join(";");
};

export const styleFix = (modules = [], extra = {}) => {
  modules.forEach(item => {
    const style = item.style;
    if (item.style) {
      item.style = _styleFix(item.style, "margin");
    }
    if (Array.isArray(item.cells)) {
      item.cells.forEach(cell => {
        cell.reboot = extra.reboot;
        if (cell.style) {
          cell.style = _styleFix(cell.style);
          cell.designerImageUrl.extra = JSON.parse(cell.designerImageUrl.extra || "{}");
          if (item.componentId === 1908) {
            const left = JSON.parse(style || "{}")["padding-left"] || 0;
            const { width, height } = cell.designerImageUrl;
            const scale = width / height;
            const resultWidth = width - 2 * left;
            cell.designerImageUrl.resultWidth = resultWidth;
            cell.designerImageUrl.resultHeight = Math.round(resultWidth / scale);
          }
        }
      });
    }
  });
  return modules;
};

/**
 * 判断url是否是http或https
 * @returns {Boolean}
 * @param url
 */
export function isHttp(url = "") {
  return /^http(s)?:\/\//.test(url);
}

/**
 * 从朋友圈分享卡片进入-储存数据
 */
export const setWechatMoments = options => {
  wx.setStorageSync(WECHAT_MOMENTS_SHARE_ID, options.v2_code);
  wx.switchTab({ url: "/pages/index/index" });
};

/**
 * 从朋友圈分享卡片进入-获取数据
 */
export const getWechatMoments = () => {
  const momentsShareId = wx.getStorageSync(WECHAT_MOMENTS_SHARE_ID);
  if (momentsShareId) {
    wx.setStorageSync(WECHAT_MOMENTS_SHARE_ID, "");
    return momentsShareId;
  }
};

export const getNavBar = () => {
  const { statusBarHeight } = wx.getSystemInfoSync(); //系统信息
  const { top, height } = wx.getMenuButtonBoundingClientRect(); //胶囊按钮位置信息
  return {
    navBarHeight: (top - statusBarHeight) * 2 + height + statusBarHeight, //计算得出导航栏高度
    statusBarHeight,
    menuButtonHeight: height,
  };
};
