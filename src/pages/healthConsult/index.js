// pages/healthConsult/index.js
import {getKeynoteDeptList} from "@models/healthConsultModel"
import {hideToast, showToast} from "../../components/toast/index";
import {TOAST_TYPE} from "../../const/index";
import { isLogged } from "@utils/index";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    triggerUserOperationValue: false,
    departmentList:[],
    serviceId:'',
    serviceOrderCode:'',
    robotHide:true
  },
  onPageScroll(e){
    if(e.scrollTop>470){
      this.setData({
        robotHide:false
      })
    }else{
      this.setData({
        robotHide:true
      })
    }
  },
  onLoad(options){
    this.setData({
      serviceId:options.serviceId ,
      serviceOrderCode:options.serviceOrderCode
    })
    this.getKeynoteDeptList();
  },

  onReachBottom() {
    const child = this.selectComponent("#child");
    child.loadData();
  },
  /**
   * 跳转到科室列表
   */
  todoctorList ({currentTarget}) {
    const {deptId} = currentTarget.dataset;
    const {serviceId,serviceOrderCode} = this.data;
    wx.navigateTo({
      url: `/pages/healthConsult/doctorList/index?deptId=${deptId}&serviceId=${serviceId}&serviceOrderCode=${serviceOrderCode}`
    })
  },
  /**
   * 监听用户是否操作，来控制健康顾问悬浮窗口是否高亮弹出提示
   */
  watchUserOperation() {  
    // 更新数据属性,子组件监听  
    this.setData({  
      triggerUserOperationValue: !this.data.triggerUserOperationValue
    });  
  },
  /**
   * 查询重点科室列表 
   */
  getKeynoteDeptList(){
    getKeynoteDeptList({}).then(({result})=>{
       const data = result;
       data.push({deptId:'more',deptName:"更多"})
       this.setData({
        departmentList:data
       })
    })
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
  /**
     * 登录
  */
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