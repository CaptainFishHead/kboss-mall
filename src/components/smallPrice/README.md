# 微信授权登录

* 组件完成整个授权登录的流程，需要登录的按钮应该使用authorize组件，支持插槽
  * （slot）授权用户信息换取token按钮需要显示的内容
  * 如果服务端没有返回token，那么组件会弹出授权手机号登录的弹框引导用户去执行注册登录的逻辑
  * 组件支持监听事件类型
    * success：授权登录成功时被调用，返回{result, code, msg}，接口：/api/v1/cs/program/crmuser/registerAndLogin 返回的结果
    * fail：授权登录失败时调用，会根据接口返回相应的错误信息
  * 为了满足在页面或者在组件中调用时修改样式，支持props: ext-class,这个类名下只支持修改显示在界面上的button相关样式，引导微信授权手机号弹框不能通过这个类名修改样式
  * demo请查看/pages/demo/index