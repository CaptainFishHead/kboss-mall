import {  isLogged } from "@utils/index";
import { getAdviserHead } from "@models/healthConsultModel"
import { reqCounselor } from "@models/healthWaiter";
Component({
  externalClasses:['props-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    triggerUserOperationValue: {  
      type: Boolean,  
      observer(newVal, oldVal) {  
         this.onTouchStart();
      },  
    },  
  },
  /**
   * 组件的初始数据
   */
  data: {
    adiverShow:true,
    lightShow:false,
    imageSrc:"https://static.tojoyshop.com/images/wxapp-boss/healthConsult/adviser.png"
  },
  lifetimes: {  
    attached() {  
      // 页面挂载时设置定时器  
      this.setData({  
        timeoutId: this.startTimer()  
      }); 
    },  
    detached() {  
      // 页面卸载时清除定时器  
      clearTimeout(this.data.timeoutId);  
    },  
  }, 
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      this.getAdviserHead();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 关闭健康顾问浮窗
     */
    close(){
      this.setData({
        adiverShow:false
      })
    },
    /**
     * 超过10秒，客户仍未有任何操作健康顾问悬浮窗口高亮弹出提示
     */
    startTimer() {  
      return setTimeout(() =>{  
         this.setData({
          lightShow:true
         })
      }, 10000); 
    }, 
    onTouchStart() {  
      // 清除当前定时器  
      clearTimeout(this.data.timeoutId);  
      // 重新设置定时器  
      this.setData({  
        timeoutId: this.startTimer()  
      });  
    },
    /**
     * 跳转健康顾问页面
    */
    toHealthWaiter(){
      if (isLogged()){
        wx.navigateTo({
          url: '/pages/healthArchives/healthWaiter/index?str=1',
        })
      }else{
        this.login()
      }
    },
    /**
     * 登录
     */
    login() {
      //检测是否登录（未登录就出登录半弹层）
      const { openLoginModal } = this.selectComponent(`#authorize`)
      openLoginModal().then(result => {
        if (result.type === 'success') {
          this.toHealthWaiter()
        }
      })
    },
    /**
     * 获取健康顾问头像
     */
    getAdviserHead(){
      if(!isLogged()){
        return;
      }
      reqCounselor().then(({
        result
      }) => {
        if(result){
            const {consultantAvatar} = result
            this.setData({
              imageSrc:consultantAvatar || "https://static.tojoyshop.com/images/wxapp-boss/healthConsult/adviser.png"
            })
        }
      })
    }
  }
})