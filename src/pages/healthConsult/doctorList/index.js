// pages/healthConsult/doctorList/index.js
import { isLogged } from "@utils/index";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deptId:""
  },
  onLoad(options){
    this.setData({
      deptId:options.deptId
    })
  },
  onReachBottom() {
    const child = this.selectComponent("#child");
    child.loadData();
  },
  /**
   * 跳转智能小康页面
   */ 
  toChatAi(){
    if (isLogged()){
      wx.navigateTo({
        url: '/pages/chatai/index?from=doctor',
      })
    }else{
      this.login()
    }
  },
  login() {
    //检测是否登录（未登录就出登录半弹层）
    const { openLoginModal } = this.selectComponent(`#authorize`)
    openLoginModal().then(result => {
      if (result.type === 'success') {
        this.toChatAi()
      }
    })
  },
})