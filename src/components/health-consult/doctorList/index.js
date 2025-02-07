import { getDeptList, getRegionList, getPageList } from "@models/healthConsultModel"
import { hideToast, showToast } from "../../toast/index";
import {  TOAST_TYPE } from "../../../const/index";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    deptId: String,
    serviceId: String,
    serviceOrderCode: String
  },
  /**
   * 组件的初始数据
   */
  data: {
    selectedCityIndex: 0,
    selectedDepartmentsIndex: 0,
    departments: [],
    regions:[],
    doctorList: [],
    pageNumber: 1,
    totalPage: 0
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      showToast({ type: TOAST_TYPE.LOADING })
      this.getDeptList();
      this.getRegionList();
      if(!this.data.deptId|| (this.data.deptId=="more")){
        this.getPageList();
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 城市选择
     */
    bindPickerChangeCity(e) {
      this.setData({
        selectedCityIndex: e.detail.value,
        pageNumber:  1,
        doctorList: []
      });
      this.getPageList();
    },
    /**
     * 科室选择
     */
    bindPickerChangeDepartments(e) {
      this.setData({
        selectedDepartmentsIndex: e.detail.value,
        pageNumber:1,
        doctorList: []
      });
      this.getPageList();
    },
    /**
     * 跳转到医生页面
     */
    toDoctorInfo({currentTarget}) {
      const {doctorId} = currentTarget.dataset;
      const {serviceId,serviceOrderCode} = this.data;
      wx.navigateTo({
        url: `/pages/healthConsult/doctorInfo/index?doctorId=${doctorId}&serviceId=${serviceId}&serviceOrderCode=${serviceOrderCode}`,
      })
    },
    /**
     * 全部科室列表 
     */
    getDeptList() {
      getDeptList({}).then(({
        result
      }) => {
        this.setData({
          departments:result
        })
        if(this.data.deptId && (this.data.deptId!="more")){
          result.forEach((item,index)=>{
            if(item.deptId==this.data.deptId){
              this.setData({
                selectedDepartmentsIndex: index
              },()=>{
                this.getPageList()
              })
            }
          })
        }
      })
    },
     /**
     * 区域列表 
     */
    getRegionList() {
      getRegionList({
        type:"ALL"
      }).then(({
        result
      }) => {
        this.setData({
          regions:result
        })
      })
    },
    /**
     * 查询医生列表
     */
    getPageList(){
      const { regions, selectedCityIndex, departments, selectedDepartmentsIndex} = this.data;
      let regionId, deptId;
      if(this.data.regions.length>0){
        regionId = regions[selectedCityIndex].regionId;
        deptId = departments[selectedDepartmentsIndex].deptId;
      }
      const params = {
        page: this.data.pageNumber,
        regionId: regionId || '',
        deptId:  deptId || ''
      }
      if(this.data.pageNumber>1&&(this.data.pageNumber>this.data.totalPage)){
        return;
      }
      getPageList(params).then(({
        result
      }) => {
        let doctorList = this.data.doctorList;
        doctorList.push(...result.list)
        this.setData({
          doctorList:doctorList,
          totalPage:result.totalPage
        })
      }).finally(()=>{
        hideToast();
      })
    },
    /**
     * 上拉加载数据
     */
    loadData(){
      this.setData({
        pageNumber:++this.data.pageNumber
      },()=>{
        this.getPageList()
      })
    }
  }
})