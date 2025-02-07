# 会员升级弹窗

---

```javascript


// json文件内引用组件路径：
"member-upgrade-dialog": "/pages/member/upgrade-dialog/index"


// js文件内触发方法：
showUpgradeDialog() {
  const memberInfo = {
    url: 'https://static.tojoyshop.com/images/wxapp-boss/mine/vip.png',
    name: '黄金会员'
  }
  this.selectComponent("#upgradeComponents").showDialog(memberInfo)
},

// 关闭升级弹窗 触发
upgradeClosed() {
  console.log('upgradeClosed')
}


// wxml文件内引用方法：
<member-upgrade-dialog id="upgradeComponents" bind:closed="upgradeClosed" />



```
