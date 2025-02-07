// pages/healthConsult/doctorInfo/index.js
import { getDoctorDetail, getDoctorSchedule} from "@models/healthConsultModel"
import { hideToast, showToast } from "../../../components/toast/index";
import {  TOAST_TYPE } from "../../../const/index";
import { wxFuncToPromise } from "../../../utils/wxUtils";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isHideDoctorInfo:true,
    triggerUserOperationValue: false,
    doctorId: "",
    doctorInfo:{},
    doctorApptTimeData: [],
    params:{},
    showIntroMore:true,
    serviceId:'',
    serviceOrderCode:'',
    disabledBtn: true, // 是否禁用下一步按钮
  },
  onLoad(options){
    this.setData({
      doctorId:options.doctorId,
      serviceId:options.serviceId,
      serviceOrderCode:options.serviceOrderCode
    })
    this.getDoctorDetail();
  },
  /**
   * 展示医生详细信息
   */
  showDoctorInfo(){
    this.setData({
      isHideDoctorInfo:false
    })
  },
   /**
   * 隐藏医生详细信息
   */
  hideDoctorInfo(){
    this.setData({
      isHideDoctorInfo:true
    })
  },
  /**
   * 展示预约声明
   */
  showIntroduce(){
    this.setData({
      showIntroMore: true
    })
  },
  // 跳转到填写咨询基本信息 页面
  toConsultInfo(){
    wxFuncToPromise(`navigateTo`, {url: `/pages/healthConsult/consultInfo/index`})
    .then(({eventChannel}) => {
      const {serviceId,serviceOrderCode} = this.data
      let params = this.data.params;
      params.serviceId= serviceId;
      params.serviceOrderCode= serviceOrderCode;
      console.log(params)
      eventChannel.emit(`products`, params)
    })
  },
  watchUserOperation() {  
    // 更新数据属性,子组件监听  
    this.setData({  
      triggerUserOperationValue: !this.data.triggerUserOperationValue
    });  
  },
  /**
   * 查询医生详情
   */
  getDoctorDetail(){
    showToast({ type: TOAST_TYPE.LOADING })
    getDoctorDetail({doctorId:this.data.doctorId}).then(({result})=>{
      this.setData({ doctorInfo:result }, () => {
        this.getDoctorSchedule();
      })
    }).catch((err) => {
      showToast({
        title: err.msg || '暂无消息',
        type: TOAST_TYPE.WARNING
      })
    })
  },
  /**
 * 查询医生预约时间
 */
  getDoctorSchedule() {
    showToast({ type: TOAST_TYPE.LOADING })
    wx.nextTick(() => {
      this.selectComponent(`#appttime`).initData({
        doctorId: this.data.doctorId // 必填
      }).then(data => {
        if (data && data.length) this.setData({disabledBtn: false});
      });
    })
  },
  /**
   * 接受子组件数据
   */
  handleChildEvent(e){
    e.detail.doctorInfo = this.data.doctorInfo
    this.setData({
      params: e.detail
    })
  }
})