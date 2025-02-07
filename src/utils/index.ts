import {isHttp, wxFuncToPromise} from "./wxUtils";
import {getHCBToken} from "@models/userModel";

import {
  // APP_INFO,
  BASE_COMMON_PARAMS,
  // CARRIER_PARAMS_MAP,
  PRODUCT_DETAIL_PAGES, SOURCE,
  // SOURCE,
  STORAGE_USER_FOR_KEY, STORAGE_HONG_CU_BAO_KEY, APP_ID
} from "../const/index";
import env from "../config/env";
import {addCallback} from "../components/LoginPage/callbacks";
import {queryBdsNeedsParamsByMid} from "@models/commonModels";
import {parse, stringify} from "qs";
import {get} from "@utils/http/index";

/** 人民币格式化 */
export const moneyFormat = (num, digit = 2) => {
  // return num.toFixed(digit).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return Number(num).toFixed(digit)
}
export const moneyNumber = (num) => {
  return Number(num)
}
/**
 * 计算传秒数的倒计时【天、时、分、秒】
 * @param seconds
 * @returns {{day : *, hours : *, minutes : *, seconds : *}}
 */
export const countTimeDown = (seconds) => {
  const leftTime = (time) => {
    if (time < 10) time = '0' + time
    return time + ''
  }
  return {
    day: leftTime(parseInt(seconds / 60 / 60 / 24, 10)),
    hours: leftTime(parseInt(seconds / 60 / 60 % 24, 10)),
    minutes: leftTime(parseInt(seconds / 60 % 60, 10)),
    seconds: leftTime(parseInt(seconds % 60, 10))
  }
}

/**
 * 将时间戳(1570550400)格式转为 yyyy-MM-dd hh:mm:ss格式
 */
export const formatDate = function (datetime, str = '-') {
  function add0(m) {
    return m < 10 ? '0' + m : m
  }

  if (!datetime) return
  var date = new Date(datetime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  var d = date.getDate();
  var h = date.getHours();
  var mm = date.getMinutes();
  var s = date.getSeconds();
  return {
    dateTime: y + str + add0(m) + str + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s),
    dateTimeMM: y + str + add0(m) + str + add0(d) + ' ' + add0(h) + ':' + add0(mm),
    date: y + str + add0(m) + str + add0(d)
  };
}

// 字符串时间格式化 为时间戳
export const formatDateInt = function (timeStr) {
  const dateStr = timeStr.replace(" ", "T")
  const date = new Date(dateStr)
  return date.getTime()
}

/**格式化日期时间参数*/
export const formatDateTime = function (date) {
  const _date = date.split(' ')
  const day = _date[0].split('-')
  const time = _date[1].split(':')
  return new Date(day[0], day[1] - 1, day[2], time[0], time[1], time[2]);
}

/**
 * 对象转url str query
 * @param options
 * @returns {string}
 */
export const objToUrlStr = (options = {}) => {
  const arr = []
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      arr.push(`${key}=${value}`)
    }
  }
  return arr.join('&')
}

export const urlAppendQuery = (url, query = {}) => {
  const _query = getQuery(url)
  const queryStr = objToUrlStr(Object.assign({}, query, _query))
  if (!queryStr) return url
  const [_url] = url.split('?')
  return `${_url}?${queryStr}`
  // url += url.includes('?') ? `&${queryStr}` : `?${queryStr}`;
  // return url
}


/**
 * 解析参数
 * @param name
 * @param queryStr
 * @returns {string|null}
 */
export const parseQuery = (name, queryStr) => {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
  if (!wx && !queryStr) {
    queryStr = location.search.substr(1)
  } else if (wx && !queryStr) {
    return null
  } else if (wx && queryStr && queryStr.includes('?')) {
    queryStr = queryStr.split('?')[1]
  }
  let r = queryStr.match(reg)
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return null
}

/**
 * 参数解析
 * @param path
 * @returns {{}}
 */
export const getQuery = (path: string): Record<string, any> => {
  const result = {}, param = /([^?=&]+)=([^&]+)/ig;
  let match = true
  if (!path) return result
  while ((match = param.exec(path)) !== null) {
    result[match[1]] = decodeURIComponent(match[2]);
  }
  return result;
}

/**
 * 将unix时间戳转换为指定格式
 * @param unix   时间戳【秒】
 * @param format 转换格式
 * @returns {*|string}
 */
export function unixToDate(unix, format) {
  if (!unix) return unix
  let _format = format || 'yyyy-MM-dd hh:mm:ss'
  const d = ('' + unix).length < 13 ? new Date(unix * 1000) : new Date(unix)
  const o = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    S: d.getMilliseconds(),
  }
  if (/(y+)/.test(_format)) _format = _format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o) if (new RegExp('(' + k + ')').test(_format)) _format = _format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  return _format
}

/**
 * 手机号中间4位格式化为*号
 */
export const formatMobile = (mobile) => {
  return `${mobile.substring(0, 3)}****${mobile.substring(7)}`
}

/**
 * px 转换为 rpx ，传参类型是数字（Number）
 * */
export const pxToRpx = (px) => {
  let deviceWidth = wx.getSystemInfoSync().windowWidth; //获取设备屏幕宽度
  let rpx = (750 / deviceWidth) * Number(px)
  return Math.floor(rpx);
}

/**
 * hex to rgb
 * @param hex
 * @returns {string|*}
 */
export const hexToRgba = hex => {
  const hexs = hex.match(/([0-9a-fA-F]{2})/g)
  if (hexs.length !== 3) return '0,0,0'
  return hexs.map(_hex => parseInt(`0x${_hex}`, 16)).join(',')
}
const openMiniProgram = ({applets, appId, envVersion, params}) => {
  const path = applets.split('?')[0]
  wxFuncToPromise(`navigateToMiniProgram`, {
    appId,
    path,
    extraData: {...params},
    envVersion: envVersion || env.envVersion
  })
}
/**
 * 获取当前页面参数
 */
export const getCurrentPageOptions = () => {
  const pages = getCurrentPages();
  const currentPage = pages.at(-1) || {}
  return currentPage.options
}

/**
 * 打开页面
 * @param link
 * cell中的link对象（跳转信息）
 * @param reboot : string
 * 区分加载云平台还是康老板
 * @param updateColumns
 */
export async function openPage({link, reboot}, updateColumns = () => void 0) {
  await interceptionPrivacyProtocol()
  const {href, applets} = link
  const {appId, ghId, envVersion, ...params} = getQuery(applets)
  // 检查登录状态
  const {token} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {token: ''}
  if (appId) {//第三方小程序
    if (params.hasOwnProperty('token') && !token) {
      // @ts-ignore
      await this.login()
      if (APP_ID.HONG_CU_BAO === appId) {
        const {result: hcbResult} = await getHCBToken({})
        wx.setStorageSync(STORAGE_HONG_CU_BAO_KEY, {token: hcbResult.result})
        params.token = hcbResult.result
      } else {
        const {token} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {token: ''}
        params.token = token
      }
      openMiniProgram({applets, envVersion, appId, params})
      // this.setData({
      //   loginPageVisible: true
      // })
      // addCallback(() => {
      //   const { token } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || { token: '' }
      //   params.token = token
      //   openMiniProgram({ applets, envVersion, appId, params })
      // })
      return false
    } else if (token && params.hasOwnProperty('token')) {
      // 清理hcb token
      if (APP_ID.HONG_CU_BAO === appId) {
        const {token: hcbToken} = wx.getStorageSync(STORAGE_HONG_CU_BAO_KEY) || {token: ''}
        if (hcbToken) {
          params.token = hcbToken
        } else {
          const {result: hcbResult} = await getHCBToken({})
          wx.setStorageSync(STORAGE_HONG_CU_BAO_KEY, {token: hcbResult.result})
          params.token = hcbResult.result
        }
      } else {
        params.token = token
      }
    }
    openMiniProgram({params, applets, appId, envVersion})
  } else if (applets) {//内部小程序页面
    const [mpPath, query] = applets.split('?')
    const {..._query} = Object.assign({}, parse(query))
    let url = mpPath
    if (params.hasOwnProperty('token') && !token) {
      // @ts-ignore
      await this.login()
    }
    url = `/${mpPath}?${stringify({..._query})}`
    console.log('url----', url, 'mpPath--:', mpPath)
    wxFuncToPromise(`navigateTo`, {
      url,
      events: {
        updateColumns // : shineUpon => updateColumns({shineUpon})
      }
    })
  } else if (href) {//H5链接
    const [path, query] = href.split('?')
    const {source, position, targetId} = getCurrentPageOptions()
    const {id, spuId, ..._query} = Object.assign({}, parse(query), {reboot}, {source, position, targetId})
    const url = !isHttp(href) ? (
      // SOURCE.BOSS_CLOUD.includes(extra.source) ? href.replace('?id=', '?pid=') : href
      href.includes(PRODUCT_DETAIL_PAGES.SINGLE_PRODUCT) || href.includes(PRODUCT_DETAIL_PAGES.MATCH_AS_YOU_LIKE) ?
        // urlAppendQuery(href, {skuId: 'none'})
        `${path}?${stringify({skuId: 'none', spuId: id || spuId, ..._query})}`
        : `${path}?${stringify({..._query, id})}`
    ) : `/pages/webview/index?&url=${encodeURIComponent(`${path}?${stringify({..._query, id})}`)}`
    wxFuncToPromise(`navigateTo`, {
      url,
      events: {
        updateColumns // : shineUpon => updateColumns({shineUpon})
      }
    })
  }
}

// 处理参数映射关系，删除完成映射的字段
export const parameterMergeMapping = (query = {}, map = {}, _params = {}, isSimple = false) => {
  let params = _params
  for (let [key, value] of Object.entries(map)) {
    if (query.hasOwnProperty(key) && typeof value === 'string') {
      params[value] = query[key]
      delete query[key]
    } else if (typeof value === 'object') {
      params = parameterMergeMapping(query[key], value, params, isSimple)
    }
  }
  return {...params, ...(isSimple ? {} : query)}
}

// export const respMapping = (result = {}, map = {}) => {
// 	const params = {}
// 	for (let [key, value] of Object.entries(map)) {
// 		if (result.hasOwnProperty(value) && result[value]) {
// 			params[key] = result[value]
// 			delete result[value]
// 		}
// 	}
// 	return {...params, ...result}
// }
export const getBaseEnterOptions = (options = {}, payload = {}) => {
  const {referrerInfo, query: _query = {}, path} = wx.getEnterOptionsSync()
  const {scene, ...params} = _query
  // 存在二维码分享的第一个参数没有key的情况，key位uid ====== start =======
  const _scene = decodeURIComponent(scene || '')
  const paramsLen = _scene ? _scene.split('&').length : 0
  let sceneParams = getQuery(_scene)
  if (Object.keys(sceneParams).length !== paramsLen && paramsLen) {
    sceneParams = getQuery('uid=' + _scene)
  }
  // 存在二维码分享的第一个参数没有key的情况，key位uid ====== end =======
  const query = parameterMergeMapping(
    Object.assign({}, {
        ...(referrerInfo.extraData || {})
      },
      {...params}, {...sceneParams}, {...options}
    ),
    {...BASE_COMMON_PARAMS, ...payload}
  )
  return {query, path}
}
/**
 * 整合启动参数和当前参数
 * @param options : object onload options
 * @param business : {type:string} 业务
 * @param payload : object 业务参数映射关系
 * @param isCadence
 * @returns {{[p: string]: *}}
 */
export const getEnterOptions = async (options = {}, payload = {}, business = {}, isCadence?: boolean) => {
  const {query, path} = getBaseEnterOptions(options, payload)
  const startPage = {__start_page__: path}
  if (isCadence) return Object.assign({}, query, startPage)
  try {
    if (query.mid) {
      const type = business.type || path.split('/')[1]
      const result = await queryBdsNeedsParamsByMid({mid: query.mid, source: query.source, type})
      for (let [key, value] of Object.entries(parameterMergeMapping(
        Object.assign({}, query, result),
        {...BASE_COMMON_PARAMS, ...payload}
      ))) {
        query[key] = value
      }
    }
  } catch (e) {
    console.error(e)
  }
  return Object.assign({}, query, options, startPage)
}

/** filter 金额小数点两位*/
export const clearNum = (value) => {
  let filterValue = value.toString();
  filterValue = filterValue.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
  filterValue = filterValue.replace(/^\./g, "");  //  不能以“.”开头
  filterValue = filterValue.replace(/(^[0]{2,})|(^[0][1-9])/g, "0"); //首位不能为类似于 01、02的金额
  filterValue = filterValue.replace(/\.[0]{2,}/g, ".0"); //. 后面不能有连续的0
  filterValue = filterValue.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
  filterValue = filterValue.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");//保证.只出现一次，而不能出现两次以上
  filterValue = filterValue.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
  return filterValue;
}

export const isAgainOpenProgram = () => JSON.stringify(wx.getLaunchOptionsSync()) === JSON.stringify(wx.getEnterOptionsSync())
/**
 * 解析 页面 onload参数
 * @param options
 * @returns {Omit<*, "scene">}
 */
export const parsePageOnLoadOptions = (options) => {
  const {scene, ...query} = options
  if (scene) Object.assign(query, parse(decodeURIComponent(scene)))
  return query
}

/**
 * 获取页面来源
 * （判断是否来自：首页、专题页）
 */
export const isDynamicPage = () => {
  const page = {
    'pages/index/index': '首页',
    'pages/carrier/index': '专题页'
  };
  const pages = getCurrentPages()
  const pagesParams = pages[pages.length - 2];
  const {route, data} = pagesParams || {};
  if (route && page[route]) {
    return {
      page_id: data.pageId,
      page_name: data.title,
      page_source: page[route] || ''
    };
  }
  return null;
}

export type AppInfo = {
  appKey: string,
  appId: string,
  appSecret: string,
  plugin_api_env: 'release' | 'develop' | 'trial' | undefined,
  customer: string,
  logo?: string,
  name?: string
}

export const getAppInfo = (): AppInfo => {
  return {
    appId: env.APP_ID, appKey: env.APP_KEY, appSecret: env.APP_SECRET, plugin_api_env: env.envVersion, customer: ''
  }
}

export const exitPictureInPicture = () => {
  try {
    const livePlayerContext = wx.createLivePlayerContext('live-player')
    livePlayerContext.exitPictureInPicture()
  } catch (e) {
    console.error(`livePlayerContext.exitPictureInPicture`, e)
  }
}

export const getRandom = (min: number, max: number, reverse?: boolean) => {
  const num = Math.floor(Math.random() * max + min)
  return reverse && Math.random() > .5 ? -num : num
}

export const fnv32a = (str: string): number => {
  const FNV1_32A_INIT = 0x811c9dc5;
  let hval = FNV1_32A_INIT;
  for (let i = 0; i < str.length; ++i) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

export const isLogged = () => {
  const { /*userId,*/token} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
  return !!token

}

export const getLoggedUser = () => {
  return wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
}

// 富文本图片自适应
export function htmlToWxml(html: string): string {
  return html.replace(/(\<([a-z]+))/g, `$1 class="wxml_$2"`)
    .replace(/(\<([a-z-\W-\"-_]+)(\>\<img))/g, arg => arg.replace('><', ' data-line="0" style="font-size:0"><'))
    .replace(/(\<([a-z-\W-\"-_]+)(\>\<video))/g, arg => arg.replace('><', ' data-line="0" style="font-size:0"><'))
    .replace(/<video [^>]*>/g, `<video controls="controls" width="100%" object-fit="cover">`)
}

export const objectComparison = (target?: Record<string, any>, compare?: Record<string, any>): boolean => {
  if (!target && !compare) return true
  else if (!target || !compare) return false
  else {
    let count = 0
    const targetEntries = Object.entries(target)
    for (let [key, value] of targetEntries) {
      count += Number(compare[key] === value)
    }
    return count === targetEntries.length
  }
}

export const checkHistoryOpenedPage = (path: string, options?: Record<string, any>): number => {
  const pages = getCurrentPages()
  const index = pages.findIndex(page => {
    return page.route === path && objectComparison(options, page.options)
  })
  return index !== -1 ? pages.length - 1 - index : 0
}

/**
 * 隐私协议询问
 */
export const interceptionPrivacyProtocol = async () => {
  const pages = getCurrentPages()
  const current = pages.at(-1)
  const {openPrivacySetting} = current.selectComponent(`#privacy`) || {}
  if (openPrivacySetting) {
    await openPrivacySetting()
  }
}

export const getAppSecret = async (): Promise<{
  targetId?: string | number,
  appKey: string,
  appSecret: string,
  appId: string,
  accountId: string
}> => {

  const {result} = (await get(`/bh/app/info`, {}, {
    baseURL: env.KBOSS_WEB_API
  })) as {
    result: {
      environment: string, APP_ID: string, APP_KEY: string, APP_SECRET: string, ACCOUNT_ID: string
    }
  }
  const app_info = {
    targetId: '',
    appKey: result.APP_KEY,
    appSecret: result.APP_SECRET,
    appId: result.APP_ID,
    accountId: result.ACCOUNT_ID
  }
  return app_info
}

export const getChannelInfo = (params?: { channelName?: string, channelId?: string }): { channelName: string, channelId?: string } => {
  const {customer_channel} = getApp().globalData
  if (!customer_channel && params && params.channelName) return {
    channelName: params.channelName,
    channelId: params.channelId || ''
  }
  const {position, source, targetId} = customer_channel || {source: SOURCE.BH_MALL}
  const channelName = position && source ? `${source}_${position}` : source
  return {
    channelName, channelId: targetId || ''
  }
}

export function getImgBoxSize(className: string, _this: any) {
  return new Promise((resolve, reject) => {
    _this.createSelectorQuery()
      .selectAll(className)
      .boundingClientRect()
      .exec((res: any) => {
        if (res && res[0]) {
          resolve(res[0]);
        } else {
          reject('unable to obtain size');
        }
      });
  });
}

export function addDecimal(a: number, b: number) {
  const aStr = a.toString();
  const bStr = b.toString();

  const aDecimalPlaces = (aStr.split('.')[1] || '').length;
  const bDecimalPlaces = (bStr.split('.')[1] || '').length;

  const maxDecimalPlaces = Math.max(aDecimalPlaces, bDecimalPlaces);
  const multiplier = Math.pow(10, maxDecimalPlaces);

  return (Math.round(a * multiplier) + Math.round(b * multiplier)) / multiplier;
}

export function debounce(fn: (...args: any[]) => void, delay = 600) {
  let timer: any = null
  return function () {
    timer && clearTimeout(timer)
    // @ts-ignore
    timer = setTimeout(() => fn.apply(this, arguments), delay)
  }
}

export function getDecimalPlaces(num: number) {
  const numStr = num.toString();
  const match = numStr.match(/\.(\d+)/);
  if (!match) return 0
  return match[1].length;
}

export function getDecimalRound(num: number, precision: number) {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

export const nextTick = (cb) => {
  if (wx.canIUse('nextTick')) {
    wx.nextTick(cb);
  } else {
    setTimeout(() => {
      cb();
    }, 1000 / 30);
  }
}

export const getRect = (context, selector) => {
  return new Promise((resolve) => {
    wx.createSelectorQuery()
      .in(context)
      .select(selector)
      .boundingClientRect()
      .exec((rect = []) => resolve(rect[0]));
  });
}

export const getAllRect = (context, selector) => {
  return new Promise((resolve) => {
    wx.createSelectorQuery()
      .in(context)
      .selectAll(selector)
      .boundingClientRect()
      .exec((rect = []) => resolve(rect[0]));
  });
}


export const isArrayContained = (arr1, arr2) => {
  const isObjectEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
      if (!keys2.includes(key) || !isObjectEqual(obj1[key], obj2[key])) return false;
    }
    return true;
  };

  return arr2.every(item2 => arr1.some(item1 => isObjectEqual(item1, item2)));
}
// 深拷贝
export const deepClone = (obj) => {
  const cache = new WeakMap();
  function _deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (cache.has(obj)) {
      return cache.get(obj);
    }
    const result = Array.isArray(obj) ? [] : {};
    cache.set(obj, result);
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = _deepClone(obj[key]);
      }
    }
    return result;
  }
  return _deepClone(obj);
}
// 将数组转化为字符串
export const isArray = (data) => {
  if (data) {
    let dataType = Object.prototype.toString.call(data);
    return dataType ? data.toString() : data;
  }
}