# showToast组件
***

```javascript


      wxml文件头部引用：
      <import src="./../../components/toast/index.wxml" />
      <template is="toast" data="{{...tj_toast}}" />


      wxss文件头部引用：
      @import "./../../components/toast/index.wxss";


      js文件头部引用：
      import { TOAST_TYPE } from "../../const/index";
      import { hideToast, showToast } from "../../components/toast/index";
      

具体可以参考'/pages/index/index'里的相关用法

```