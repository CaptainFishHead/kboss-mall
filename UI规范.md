- 康老板全局公用 UI 规范+组件：(如有需要，可随时更新)

  ```html
  ```

<!-- button宽度默认100% -->
  <button type="primary">金色按钮</button>
  <button type="primary" class="success">绿色按钮</button>
  <button type="primary" plain>幽灵按钮</button>

<!-- 底部操作行 (fixed固定在底部)，直接用就行，样式已经定义好了 -->
  <view class="btn-box-bottom">
    <button type="primary" plain>取消</button>
    <button type="primary">完成</button>
  </view>

<!-- 公用弹窗 -->
<!-- 
      dialog-common：标题黑色背景图（基础弹窗，每个弹窗都要引用的初始化样式）

                dialog-beans：标题绿色背景图
                dialog-voucher：标题金色背景图
                receipt-dialog：标题无背景，左对齐（温馨提示弹窗）
                dialog-noheader：单纯无标题（自定义内容）
                dialog-nofooter：单纯无底部（自定义内容）
                dialog-confim：无标题（二次确认弹窗）
                dialog-tips：提示内容少，需要单独撑开空白面积
                ......
                如果现有样式不满足新需求，可以在weui-custom.scss文件里，找到对应的位置下面，再添加新样式。
 -->
 <!-- 需要组合搭配，下面为示例：dialog-common receipt-dialog：（其中dialog-common为基础样式，后面再根据需求添加更多的class） -->
  <mp-dialog
    ext-class="dialog-common receipt-dialog"
    show="{{visible}}"
    bindbuttontap=""
    title="温馨提示"
    buttons="{{}}"
    catchtouchmove="touchMove"
    >
    <text>标题左对齐，无背景图片</text>
  </mp-dialog>

  ```
  ```
