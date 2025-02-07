import axios from "axios"
import mpAdapter from "axios-miniprogram-adapter"
import env from "../../config/env";
import {
  STORAGE_USER_FOR_KEY,
  AUTHENTICATION_MODE,
  RESPONSE_RETURN,
  TEMP_CLOUD, CLOUD_SDK, PLAT_FORM, STORAGE_HONG_CU_BAO_KEY,HEALTH_AI,STORAGE_JKYY_KEY
} from "../../const/index";
import { queryUserInfo, wxAuthorizeLogin } from "../../models/userModel";
import eventEmitter from "./Events";
import { hexMD5 } from "../md5";
import { channelInfo, getChannelInfo, getEnterOptions } from "../index";

axios.defaults.adapter = mpAdapter
/**
 * 验证登录拦截
 * @param authenticationMode : number : 接口请求拦截模式
 * @returns {Promise<never>|Promise<AxiosResponse<*>>|Promise<{result:
 *   (WechatMiniprogram.GetStorageInfoSyncOption|{token: string})}>}
 */
const verifyLogin = ({ authenticationMode }) => {
  // 检查登录状态
  const result = wx.getStorageSync(STORAGE_USER_FOR_KEY) || { token: '' }
  // if (result.token) return Promise.resolve({result})
  switch (authenticationMode) {
      // 终止请求
    case AUTHENTICATION_MODE.break:
      // 验证登录是否失效，成功会继续执行，失败会结束请求返回失败
      if (result.token) {
        return Promise.resolve({ result })
      }
      return Promise.reject({ request: { msg: "终止" } })
      // 如果用户没有等静默请求登录后继续请求接口(如果没有授权必须用户触发)
    case AUTHENTICATION_MODE.afterLoginContinue:
      return queryUserInfo()
      .then(() => {
        return { result }
      })
      .catch(() => {
        // 静默登录
        return wxAuthorizeLogin()
      })
    default:
      return Promise.resolve({ result })
  }
}

const tempCloud = async (config, { token, userId }) => {
  const { data } = config
  const { targetId, channelName:_channelName, channelId:_channelId, ...params } = data || {}
  const { channelName,channelId } = getChannelInfo({channelName:_channelName,channelId:_channelId})
  
  if (/*config.baseURL === env.RSDX_API && */config.url.startsWith(TEMP_CLOUD) || config.baseURL.includes(env.BASE_API)) {
    config.url = config.url.replace(TEMP_CLOUD, '')
    config.data = {
      clientInfo: {
        clientSource: 'APPLET', platform: 'YUNSHANG', token: token || undefined, userId,
      },
      requestInfo: { ...params, channelName, channelId }
    }
  }
  if (config.url.startsWith(CLOUD_SDK)) {
    config.data.userInfo = { userId }
    const {
      targetId,
      appKey = env.APP_KEY,
      appSecret = env.APP_SECRET
    } = getApp().globalData.cloud || env // getEnterOptions((wx.getEnterOptionsSync() || {}).query || {}, BASE_COMMON_PARAMS)
    const timestamp = Date.now()
    const nonce = timestamp.toString(36)
    config.url = config.url.replace(CLOUD_SDK, '')
    config.headers.sign = hexMD5(`appKey=${appKey}&nonce=${nonce}&timestamp=${timestamp}&appSecret=${appSecret}`).toUpperCase()
    config.headers.appKey = appKey
    config.headers.timestamp = timestamp
    config.headers.nonce = nonce
    if (targetId) {
      config.headers['x-tojoy-appId'] = targetId
    }
  } else
    config.headers['x-tojoy-source'] = `bh-mall`
  
  config.headers['x-tojoy-channel'] = channelName
  config.headers['x-tojoy-channelId'] = channelId
  return config
}

// 请求拦截
axios.interceptors.request.use(async config => {
  try {
    // 强制登录接口过滤
    const { result } = await verifyLogin(config)
    const JKYY_KEY = wx.getStorageSync(STORAGE_JKYY_KEY) || { token: '' }
    //第三方业务API对接
    if (config.url.startsWith(HEALTH_AI)) {
      config.url = config.url.replace(HEALTH_AI, '')
      config.headers.token = JKYY_KEY.token
      return config
      
    }else{
      let authType = 'mobile'
      if (config && config.baseURL && config.baseURL && config.baseURL.indexOf('yunshang520.com') > -1) {
        authType = 'kang-boss-mimi'
      }
      // TODO：配置token 或者更多请求头信息
      let customerHeader = {
        'X-Auth-Token': result.token || '',
        'X-Auth-Type': authType,
        'X-Auth-Belong': 'miniprogram',
        'x-tojoy-appId': env.APP_ID,
        'x-tojoy-accountId': env.ACCOUNT_ID,
        'x-tojoy-app': `bh-mall`
      }
      config.headers = Object.assign({}, config.headers, customerHeader)
      return tempCloud(config, result || {})
    }
  } catch (e) {
    console.error(config.url, '请求拦截', e)
    // 需要终止请求或者登录失败（含用户取消收取授权等操作）
    return Promise.reject(e)
  }
})

// 请求成功
const isSuccess = code => (!code || code === 200 || code === '000000')

// 网络请求状态200时认为请求成功，拦截处理响应数据，统一返回:{code, result, msg},在处理xhr请求时不需要在resolve函数中判断code是否为正常，即只有当服务端返回code === 200或者0时 才会掉用resolve，其他状态统一掉用reject，减少繁琐的接口错误逻辑判断，当config中包含returnAsIs并且config.returnAsIs !== false(包含其他js类型转换为boolen值的false)
const responseInterceptor = ({ data, config: { responseReturn, url, baseURL } }) => {
  console.log(url)
  // 原样返回不做响应拦截处理，比如说直接请求json或者其他file 时需要
  if (responseReturn === RESPONSE_RETURN.asIs) return data
  const { code, data: result, message: msg, ...more } = data
  if (isSuccess(code)) {
    return { code, result, msg, ...more };
  } else if ([402, 401].includes(code)) {
    wx.setStorageSync(STORAGE_USER_FOR_KEY, null)
    wx.setStorageSync(STORAGE_HONG_CU_BAO_KEY, null)
    eventEmitter.emit(`updateIsLogged`, false)
  }
  return Promise.reject({ code, result, msg, ...more });
}

// 请求失败处理
const reqFileResponseInterceptor = err => {
  let error = {};
  try {
    if (err.message === 'Network Error' && request.status === 0) {
      error.msg = '网络请求错误，请检查您的网络';
    } else if (request.status === 404) {
      error.msg = '服务器跑到火星上去了';
    } else if (request.status === 500) {
      error.msg = '服务器发生故障';
    } else {
      error = err;
    }
  } catch (e) {
    console.error(err)
  }
  return Promise.reject(error);
}

// Add a response interceptor 响应拦截
axios.interceptors.response.use(responseInterceptor, reqFileResponseInterceptor);

/**
 * post请求
 * @param url : string : 接口地址，不要包含baseURL
 * @param params : object : 请求参数
 * @param config : object : 请求配置信息，参考axios config配置项，默认不用传, 如果不需要统一拦截处理响应信息请传入
 * {
 * 	responseReturn:RESPONSE_RETURN.handle
 * 	authenticationMode:AUTHENTICATION_MODE.continue
 * }
 * @returns {Promise<AxiosResponse<any>>}
 */
const post = async (url, params = {}, config = {
  // responseReturn: RESPONSE_RETURN.handle
}) => {
  const { headers = {}, ..._config } = config
  return axios.post(url, params, {
    baseURL: env.BASE_API,
    responseReturn: RESPONSE_RETURN.handle,
    authenticationMode: AUTHENTICATION_MODE.continue,
    headers: {
      platformId: PLAT_FORM.BDS,
      ...headers
    },
    ..._config
  })
}

/**
 * get请求
 * @param url : string : 接口地址，不要包含baseURL
 * @param params : object : 请求参数
 * @param config : object : 请求配置信息，参考axios config配置项，默认不用传, 如果不需要统一拦截处理响应信息请传入
 * {
 * 	responseReturn:RESPONSE_RETURN.handle
 * 	authenticationMode:AUTHENTICATION_MODE.continue
 * }
 * @returns {Promise<AxiosResponse<any>>}
 */
const get = async (url, params = {}, config = {
  // responseReturn: RESPONSE_RETURN.handle
}) => {
  const { headers = {}, ..._config } = config
  return axios.get(url, {
    baseURL: env.BASE_API,
    params,
    responseReturn: RESPONSE_RETURN.handle,
    authenticationMode: AUTHENTICATION_MODE.continue,
    headers: {
      platformId: PLAT_FORM.BDS,
      ...headers
    },
    ..._config
  })
}

export {
  get,
  post
}