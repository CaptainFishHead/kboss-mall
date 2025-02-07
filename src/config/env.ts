import api from "./api";
const {miniProgram: {envVersion, version}} = wx.getAccountInfoSync()
// 注意审核的时候需要将体验版本替换成生产版本
// 开发环境:dev  生产环境:pro  预发布:pre  预发布1:pre1  测试:uat  测试1:uat1
export type TWXEnv = 'release' | 'develop' | 'trial' | undefined
type TAPI_TYPE = {
	envVersion: TWXEnv,
	version: string,
	__environment__: string,
	RSDX_API: string,
	// MICROLIFE_HOST: string,
	YUNSHANG_API: string,
	PROXY_MALL_API: string,
	BASE_API: string,
	COMMISSION_BASE_URL: string,
	VITE_BUCKET: string,
	VITE_REGION: string,
	VITE_DOMAIN: string,
	VITE_PROTOCOL: string,
	KBOSS_WEB_API: string,
	APP_KEY: string,
	APP_ID: string,
	APP_SECRET: string,
	ACCOUNT_ID: string, SDK_API: string, IM_SDK_APPID: number,
	SENSORS_DATA_URL: string,
	FACE_DETECT_API: string
}


// const api = {
// 	// 开发环境
//   dev: 'http://dev-api.yunshang520.com',
// 	// 测试
// 	// uat: 'https://dev-tojoy-mall-api.tojoyshop.com',
// 	uat: 'http://uat-api.yunshang520.com',
// 	// 测试
// 	uat1: 'http://uat1-api.yunshang520.com',
// 	// 预发布
// 	// pre: 'https://dev-tojoy-mall-api.tojoyshop.com',
// 	pre: 'https://app-pre-test.yunshang520.com',
// 	// 生产环境
// 	pro: 'https://app.yunshang520.com'
// }
//
// // 开发版
// const develop = {
// 	// 小程序接口
// 	YUNSHANG_API: `http://dev-api.yunshang520.com`,
//   RSDX_API: `http://engine-test-api.rsdx.com`,
// 	// RSDX_API: `https://uat-steamengine-api.kang-boss.com`,
//
// 	// 分佣
// 	COMMISSION_BASE_URL: 'https://test-tbhgw.shanghuiyun.com',
// 	SENSORS_DATA_URL: `https://shence.tojoyshare.com:8443/sa?project=default`,
// 	version: '1.0.0',
// 	envVersion,
// 	SDK_API: 'https://uat-platform-api.kang-boss.com',
// 	APP_KEY: 'HI4xF6F5',
//   APP_SECRET: 'c4b05eceb5ff1a37bc6a8f84a2dbbc785ce6d217',
//   APP_ID: '10012',
//   ACCOUNT_ID: '100000',
//   VITE_BUCKET: "test-1314672876",
//   VITE_REGION: "ap-nanjing",
//   // 生成二维码
//   KBOSS_WEB_API: "https://uat-mall.kang-boss.com"
// }
//
// // 体验、测试
// const trial = {
// 	YUNSHANG_API: `http://uat-api.yunshang520.com`,
//   // RSDX_API: `https://uat-steamengine-api.kang-boss.com`,
//   RSDX_API: `http://engine-test-api.rsdx.com`,
//
// 	COMMISSION_BASE_URL: 'https://test-tbhgw.shanghuiyun.com',
// 	SENSORS_DATA_URL: `https://shence.tojoyshare.com:8443/sa?project=default`,
// 	version,
// 	envVersion,
// 	SDK_API: 'https://uat-platform-api.kang-boss.com',
// 	APP_KEY: 'HI4xF6F5',
//   APP_SECRET: 'c4b05eceb5ff1a37bc6a8f84a2dbbc785ce6d217',
//   APP_ID: '10012',
//   ACCOUNT_ID: '100000',
//   VITE_BUCKET: "test-1314672876",
//   VITE_REGION: "ap-nanjing",
//   // 生成二维码
//   KBOSS_WEB_API: "https://uat-mall.kang-boss.com",
// }
//
// // 生产
// const release = {
// 	YUNSHANG_API: `https://app.yunshang520.com`,
// 	RSDX_API: `https://lbzg.api.rsdx.com`,
//
// 	COMMISSION_BASE_URL: 'https://lbb-gw.tojoycloud.com',
// 	SENSORS_DATA_URL: `https://shence.tojoyshare.com:8443/sa?project=production`,
// 	version,
// 	envVersion,
// 	SDK_API: 'https://platform-api.kang-boss.com',
// 	APP_KEY: 'hRso13kD',
//   APP_SECRET: '9b1320d98445935e7ddb05d03574d36b1ab22758',
//   APP_ID: '10012',
//   ACCOUNT_ID: '100000',
//   VITE_BUCKET: "steamengine-1314672876",
//   VITE_REGION: "ap-nanjing",
//   // 二维码链接
//   KBOSS_WEB_API: "https://mall.kang-boss.com"
// }
//
// let wx_env = null
// switch (envVersion) {
// 	case develop.NODE_ENV:
// 		wx_env = env === 'pro' ? release : develop
// 		break;
// 	case trial.NODE_ENV:
// 		wx_env = env === 'pro' ? release : trial
// 		break;
// 	case release.NODE_ENV:
// 		wx_env = release
// 		break
// }
//env = trial
// export default {...wx_env, YUNSHANG_API: api[env], __environment__: env}
const env:TAPI_TYPE = {
	...api,
	version,
	envVersion,
}
export default env