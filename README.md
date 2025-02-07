<<<<<<< HEAD
# dsf-boss

- 项目：康老板

  - Direct supply from the boss

- 环境准备
  - `npm i --production `
  - ` // 小程序菜单->工具->构建npm`
  - ` // 小程序验证码->549527`
- UI 库
  - [weui](https://wechat-miniprogram.github.io/weui/docs/#weui%E7%BB%84%E4%BB%B6%E5%BA%93%E7%AE%80%E4%BB%8B)
  - 使用方式可以全局引入，也可以在组件或者页面中使用，切勿重复引用公用组件，如果 app.json 中已经存在组件的引用，那么在组件或者小程序页面.json 中就别再重复引用，使用的时候注意一下
- 网络请求
  - [axios](https://github.com/axios/axios)
  - 注意事项
    - 不要在任何地方导入 axios 库，请直接使用`/utils/http/index.js`中提供的 get 和 post 方法，拦截器也会在这里体现，后续还会继续完善
    - 相关 demo 可以定位到`/utils/http/README.md`中查阅，另外`/utils/http/index.js`中也有详细的注释说明
- 项目目录说明
  - `components`小程序内公用组件
    - `authorize` 微信授权登录，具体查看目录下的 READNE.md
    - `poster` 小程序商品分享海报
      - props
        - productImage : string 商品图片
        - logo : string 产品 logo
        - productName : string 商品名字
        - pid : string 商品 id
  - `config`环境配置
  - `const`静态值和枚举定义
  - `miniprogram_npm`小程序菜单->工具->构建 npm 后自动生成
  - `models`所有和后台交互请求都放在这个目录下
    - 命名规则：模块名+Model，比如用户相关`userModel.js`
  - `pages`小程序页面
    - 页面规则：以订单为例子
      - 订单中心 order/index.js、index.json、index.wxml、index.wxss
      - 订单详情 order/detail/index.js、index.json、index.wxml、index.wxss
  - `sdk`项目依赖第三方 sdk-js 库，并且不支持 npm 时使用
  - `static`公用的静态资源文件，如果是某个组件或者页面单一使用（小程序支持的情况下）请在该组件或者该页面目录下创建一个 images 文件夹（以图片为例），便于维护和管理
  - `styles`全局样式
    - `weui-custom.wxss`这个文件是用于覆盖 weui 组件内部样式使用
    - 这个目录下可以创建多个样式表文件
  - `utils`工具函数目录
    - `http`网络请求封装
    - `sa.js`神策数据埋点配置
    - `wxutil.js`微信小程序相关包装调用封装（小程序函数包装为 promise）
- 下单流程
  - 1、提交订单
  - 2、调用 wxUtils.js->templatePushAuthorization 函数（参数传 const/index.js->MESSAGE_TEMPLATE.get(key).TEMPLATE_ID）
  - 3、调用 messageModel.js->authorizePushTemp
  - 4、立即支付 wxUtils.js->wxPay
=======
# kboss-mall
>>>>>>> kboss-mall/main
