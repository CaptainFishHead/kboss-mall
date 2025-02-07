


**接口请求方式**
***

```javascript
/**
 *  成功回调参数
 {
  code: 0,
  data: {},
  message: ''
}
 失败回调参数
 {
      code:Integer,
      message:'失败原因描述'
    }
 *
 **/

//引入
import {post, get} from "../utils/http/index";
import {AUTHENTICATION_MODE, RESPONSE_RETURN} from "../../const/index";

/**
 * post请求
 * @param url : string : 接口地址，不要包含baseURL
 * @param params : object : 请求参数
 * @param config : object : 请求配置信息，参考axios config配置项，默认不用传
 * @returns {Promise<AxiosResponse<any>>}
 */

post('/api/v1/cs/wechat/business/updateBusinessName', {
  //params参数
  businessId: 0
},{
  responseReturn: RESPONSE_RETURN.handle,
                                  // asIs: 不做响应拦截 按api原样返回
                                  // handle: 处理成{result,code,msg}后返回结果
  authenticationMode: AUTHENTICATION_MODE.continue
                                  // continue: 继续不拦截
                                  // break: 终止请求
                                  // afterLoginContinue: 引导登录后继续请求接口
})

/**
 * get请求
 * @param url : string : 接口地址，不要包含baseURL
 * @param params : object : 请求参数
 * @param config : object : 请求配置信息，参考axios config配置项，默认不用传
 * @returns {Promise<AxiosResponse<any>>}
 */

get('/api/v1/cs/program/crmuser/getEmpPartner', {
  //params参数
},{
  responseReturn: RESPONSE_RETURN.handle,
                                  // asIs: 不做响应拦截 按api原样返回
                                  // handle: 处理成{result,code,msg}后返回结果
  authenticationMode: AUTHENTICATION_MODE.continue
                                  // continue: 继续不拦截
                                  // break: 终止请求
                                  // afterLoginContinue: 引导登录后继续请求接口
})


```