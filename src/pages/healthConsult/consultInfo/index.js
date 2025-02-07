// pages/healthConsult/consultInfo/index.js
import { uploadFileMulti } from "@models/uploadModel";
import { uploadFile, submitApptInfo,  getDistrictList } from "@models/healthConsultModel";
import { completeInformation } from "@models/servicesModel";
import { cosUploadTempSecret } from "@models/commonModels";
import Cos from "cos-wx-sdk-v5";
import env from "@config/env";
import { wxFuncToPromise } from "../../../utils/wxUtils";
import { hideToast, showToast } from "../../../components/toast/index";
import { ORDER_SOURCE_PAGE, THIRD_PARTY_PATH, TOAST_TYPE } from "../../../const/index";
import WxValidate from "@utils/WxValidate";
import { isLogged } from "@utils/index";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    triggerUserOperationValue: false,
    birthdayEnd: new Date().dateFormat("YYYY-MM-DD"),
    formData: {
      name: "", //姓名
      gender: 1, //性别0男 1女
      birthday: "", //出生日期
      mobile: "", //手机号
      purpose: "", //咨询目的
      purposeValue: "",
      content: "", //备注
      preBookUserRequestId:""
    },
    genderItems: [
      {
        value: 1,
        name: "女",
        checked: true,
        imgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nv.png?v=3",
        curImgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nv-cur.png?v=3",
      },
      {
        value: 0,
        name: "男",
        checked: false,
        imgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nan.png?v=3",
        curImgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nan-cur.png?v=3",
      },
    ],
    purposeItems: [
      { value: 1, name: "常规复诊咨询" },
      { value: 2, name: "第二诊疗建议" },
      { value: 3, name: "其他" },
    ],
    regions: [],
    isBtndisable: true,
    imageFilesUrl: [],
    doctorInfo: {},
    apptDate: {},
    timeSolt: "",
    weekNumber: "",
    timeSoldId: "",
    startTime: "",
    endTime: "",
    reports: [],
    editType: 0,
    serviceId:"",
    serviceOrderCode: "",
    districtId:"",
    provinceId:"",
    multiIndex:["",""],
    multiArray:[[],[]],
    allCityGroup:[],
    cityGroup:[],
    province:"",
    city:""
  },
  onLoad() {
    showToast({ type: TOAST_TYPE.LOADING });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("products", data => {
      let { doctorExtInfoRequest, preBookUserRequest, serviceOrderCode } = data;
      const purpose = preBookUserRequest? preBookUserRequest.purpose : "";
      if (data.type) {
        this.setData({
          editType: data.type,
          doctorInfo: doctorExtInfoRequest,
          preBookTime: data.preBookTime,
          imageFilesUrl: preBookUserRequest?.localReports?preBookUserRequest?.localReports?.split(","):[],
          reports: preBookUserRequest?.reports?preBookUserRequest?.reports?.split(","):[],
          formData: {
            name: preBookUserRequest?.name || "",
            gender: preBookUserRequest?.gender || 1,
            birthday: preBookUserRequest?.birthday || "",
            mobile: preBookUserRequest?.linkman || "",
            purposeValue: purpose || "",
            purpose:purpose?Number(purpose)-1:"",
            content: preBookUserRequest?.content || "",
            preBookUserRequestId: preBookUserRequest?.id||""
          },
          serviceOrderCode:serviceOrderCode,
          districtId:preBookUserRequest?.districtId,
          provinceId:preBookUserRequest?.provinceId,
        },()=>{
          this.getDistrictList();
        });
      } else {
        this.setData({
          doctorInfo: data.doctorInfo,
          apptDate: data.selectedDate, // 预约时间（06-20）
          timeSolt: data.selectedTime, // 预约时间段（8:00-8:20）
          timeSoldId: data.selectedTimeId, // 预约时间Id
          startTime: data.startTime, // 起始时间戳
          endTime: data.endTime, // 结束时间戳
          weekNumber: this.getDayOfWeekFromTimestamp(Number(data.startTime)), // 星期几
          serviceId: data.serviceId,
          serviceOrderCode: data.serviceOrderCode
        });
        this.getDistrictList();
      }
    });
  },

  /**
   * 填写实际咨询人姓名
   */
  onNameInput(e) {
    let { value } = e.detail;
    const { formData } = this.data;
    this.setData({
      formData: { ...formData, name: value },
    });
  },
  /**
   * 填写实际咨询人手机号
   */
  onMobileInput(e) {
    let { value } = e.detail;
    const { formData } = this.data;
    this.setData({
      formData: { ...formData, mobile: value },
    });
  },
  /**
   * 选择性别
   */
  genderChange(e) {
    const { genderItems, formData } = this.data;
    for (let i = 0; i < genderItems.length; i++) {
      genderItems[i].checked = genderItems[i].value === Number(e.detail.value);
    }
    this.setData({
      genderItems,
      formData: { ...formData, gender: e.detail.value },
    });
  },
  /*打开时间选择器*/
  onChangeDate(e) {
    const { formData } = this.data;
    this.setData({
      formData: { ...formData, birthday: e.detail.value },
    });
  },
  /**
   * 选择咨询目的
   */
  onChangePurpose(e) {
    const { formData } = this.data;
    this.setData({
      formData: { ...formData, purpose: e.detail.value, purposeValue:Number(e.detail.value) + 1 },
    });
  },
  /**
   * 填写描述
   */
  oncontentInput(e) {
    const { formData } = this.data;
    this.setData({
      formData: { ...formData, content: e.detail.value },
    });
  },
  /**
   * 选择图片上传到服务器
   */
  chooseImage() {
    if (!isLogged()) {
      this.login(this.chooseImage);
      return;
    }
    wx.chooseMedia({
      count: 2,
      mediaType: ["image"],
      sizeType: ["compressed"], // 压缩图片
      sourceType: ["album", "camera"], // 来源：相册或相机
      camera: "back",
      success: async ({ tempFiles }) => {
        // 通过接口上传到服务器 给温暖医生使用
        const { success, error } =
          (await uploadFileMulti({
            url: "/scene/admin/service/doctor/v1/doctor/uploadFile",
            file: tempFiles,
            data: { doctorId: this.data.doctorInfo.doctorId },
          })) || {};
        // 服务器上传成功后 上传至cos
        let { reports } = this.data;
        reports.push(Object.values(success));
        this.setData({ reports });
        Object.keys(success).forEach(key => {
          this.uploadImage(tempFiles[key]);
        });
      },
    });
  },
  /**
   * 上传图片到腾讯云
   */
  async uploadImage(file) {
    // showToast({ type: TOAST_TYPE.LOADING });
    // 初始化实例
    const cos = new Cos({
      SimpleUploadMethod: "postObject",
      async getAuthorization(options, callback) {
        const { result } = await cosUploadTempSecret({ dir: 'image' });
        callback({
          TmpSecretId: result.secretId,
          TmpSecretKey: result.secretKey,
          SecurityToken: result.token,
          // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
          StartTime: result.startTime, // 时间戳，单位秒，如：1580000000
          ExpiredTime: result.endTime, // 时间戳，单位秒，如：1580000900
        });
      },
      Domain: env.VITE_DOMAIN,
      Protocol: env.VITE_PROTOCOL,
    });
    let { tempFilePath, fileType } = file;
    cos.postObject(
      {
        Bucket: env.VITE_BUCKET /* 必须 */,
        Region: env.VITE_REGION /* 存储桶所在地域，必须字段 */,
        // Key: `/${dir}/image/${tempFilePath.substr(tempFilePath.lastIndexOf('/') + 1).replace('.', '')}`,
        Key: `/${fileType}/${tempFilePath.substr(tempFilePath.lastIndexOf(".") + 1)}/${tempFilePath.substr(
          tempFilePath.lastIndexOf("/") + 1
        )}`,
        FilePath: tempFilePath,
        onProgress(info) {
          console.log(JSON.stringify(info));
        },
      },
      (err, data) => {
        if(data){
          let imgUrl = `https://${data.Location || ""}`;
          const { imageFilesUrl } = this.data;
          imageFilesUrl.push(imgUrl);
          this.setData({
            imageFilesUrl: imageFilesUrl,
          });
          // hideToast();
        }
      }
    );
  },
  /**
   * 删除图片
   */
  deleteImage(e) {
    const { index } = e.target.dataset;
    let { imageFilesUrl, reports } = this.data;
    imageFilesUrl.splice(index, 1);
    reports.splice(index, 1);
    this.setData({
      imageFilesUrl: imageFilesUrl,
      reports: reports,
    });
  },
  /**
   * 根据时间戳返回是周几
   */
  getDayOfWeekFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const dayOfWeek = date.getDay();
    // 创建一个数组来存储星期的名称
    const daysOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    // 使用数组索引来获取对应的星期名称
    return daysOfWeek[dayOfWeek];
  },
  watchUserOperation() {
    // 更新数据属性,子组件监听
    this.setData({
      triggerUserOperationValue: !this.data.triggerUserOperationValue,
    });
  },
  /**
   * 区域列表
   */
  getDistrictList() {
    getDistrictList({}).then(({ result }) => {
      this.setData({
        regions: result
      },()=>{
        this.handleDistrictListData(result)
        this.setData({
          province:this.data.provinceId&&this.getDistrictIdOrName(2,this.data.provinceId),
          city:this.data.districtId&&this.getDistrictIdOrName(2,this.data.districtId)
        })
      });
      hideToast();
    });
  },
  /**
   * 保存信息
   */
  saveInfo() {
    if (!isLogged()) {
      this.login(this.saveInfo);
      return;
    }
    const params =  {
      name: this.data.formData.name, // 姓名
      gender: this.data.formData.gender, // 性别
      birthday: this.data.formData.birthday, // 出生日期
      linkman: this.data.formData.mobile, // 手机号
      purpose: this.data.formData.purposeValue, // 咨询目的
      content: this.data.formData.content, // 健康状况
      localReports: this.data.imageFilesUrl.join(","), // 图片
      reports: this.data.reports.join(","), // 文件
      doctorId: this.data.doctorInfo.doctorId, // 医生id
      districtId:this.getDistrictIdOrName(1,this.data.city),
      provinceId:this.getDistrictIdOrName(1,this.data.province)
    }
    this.data.editType == 1 ? this.completeInformation(params): this.submitApptInfo(params);
  },
  /**
   * 提交预约信息
  */
 submitApptInfo(paramsData){
  showToast({type: TOAST_TYPE.LOADING})
  const params = {
    ...paramsData,
    scheduleId: this.data.timeSoldId,
    tmBegin: this.data.startTime,
    tmEnd: this.data.endTime,
    serviceId: this.data.serviceId,
    serviceOrderCode: this.data.serviceOrderCode,
  };
  this.data.serviceId == "null" && delete params.serviceId;
  this.data.serviceOrderCode == "null" && delete params.serviceOrderCode;
  submitApptInfo(params).then(({ result, code }) => {
    hideToast()
    if (result.status == 1) {
      wxFuncToPromise(`navigateTo`, { url: `/pages/order/confirm/index` }).then(({ eventChannel }) => {
        eventChannel.emit(`products`, {
          skuList: [{ skuId: result.skuId, skuNum: 1 }], // 商品SKU列表
          type: ORDER_SOURCE_PAGE.PRODUCT, //类型为温暖医生
          doctorId: this.data.doctorInfo.doctorId, //医生ID
          reducibleDate: this.data.apptDate, // 预约日期 （06-20）
          reducibleTime: this.data.timeSolt, // 预约时间段（08:00-08:20）
          scheduleId: this.data.timeSoldId, // 预约时间ID
          serviceOrderCode: result.serviceOrderCode, // 服务单号
          tmBegin: this.data.startTime, // 可约起始日期
          tmEnd: this.data.endTime, // 可约结束日期
        });
      });
    } else {
      wx.setStorageSync("orderType", ORDER_SOURCE_PAGE.WARMDOCTORCARD);
      wx.setStorageSync("serviceOrderCode", result.serviceOrderCode);
      wx.redirectTo({ url: `/pages/paySuccess/index` });
    }
  }).catch(({msg})=>{
    showToast({
      title: msg || "医生时间已被占用，请重新选择时间",
      type: TOAST_TYPE.WARNING,
    });
  });;
 },
  /**
   * 线上编辑信息
   */
  completeInformation(params){
    showToast({type: TOAST_TYPE.LOADING})
    params.serviceOrderCode = this.data.serviceOrderCode;
    params.id=this.data.formData.preBookUserRequestId;
    completeInformation(params).then(({ result, code, msg }) => {
      hideToast()
      wx.navigateBack({delta: 1})
    }).catch(({code,msg})=>{
      showToast({
        title: msg || "请补信息",
        type: TOAST_TYPE.WARNING,
      });
    });
  },
  /**
   * 登录
   */
  login(fn) {
    //检测是否登录（未登录就出登录半弹层）
    const { openLoginModal } = this.selectComponent(`#authorize`);
    openLoginModal().then(result => {
      if (result.type === "success") {
        fn();
      }
    });
  },
  // 处理返回地址数据
  handleDistrictListData(dataArr){
      let arr = [];
      console.log(provinceId)
      const {multiArray,multiIndex,provinceId,districtId} = this.data;
      Object.keys(dataArr).forEach((o,index) => {
         arr.push(dataArr[o].catName)
         multiArray[0].push(dataArr[o].catName)
         if(dataArr[o].catId==provinceId){
           multiIndex[0]=index
         }
       })
       const isEmptyString = (typeof multiIndex[0] === 'string' && multiIndex[0].trim() === '');
       const isNotZero = (multiIndex[0] >= 0);
      if(provinceId){
        let provinceIndex = multiIndex[0]
        for (var i = 0; i < dataArr[provinceIndex].children.length; i++) {
          //市的初始值
          multiArray[1].push(dataArr[provinceIndex].children[i].catName)
          if(dataArr[provinceIndex].children[i].catId == districtId){
            multiIndex[1]  = i
          }
        }
      }else{
        for (var i = 0; i < dataArr[0].children.length; i++) {
          //市的初始值
          multiArray[1].push(dataArr[0].children[i].catName)
        }
      }
    
      this.setData({
        multiArray:multiArray,
        multiIndex:multiIndex,
        allCityGroup:arr,
        cityGroup:dataArr
      }) 
  },
  // 省市全部选择完
  bindMultiPickerChange(e) {
    //获取所有的市
    let children = this.data.cityGroup[e.detail.value[0]].children
    let list = []
    const {multiArray,multiIndex,} = this.data
    for (var i = 0; i < children.length; i++) {
      list.push(children[i].catName)
    }
    multiArray[1] = list //当前省份的市
    multiIndex[0] = e.detail.value[0]
    multiIndex[1] = e.detail.value[1]
    this.setData({
      multiArray:multiArray,
      multiIndex:multiIndex,
      province: multiArray[0][multiIndex[0]],
      city: multiArray[1][multiIndex[1]]
    })
  },
  // 选择省or选择市
  bindMultiPickerColumnChange(e) {
    let that = this
    const {multiArray,multiIndex} = this.data
    switch (e.detail.column) {
      case 0:
        let children = this.data.cityGroup[e.detail.value].children
        let list = []
        for (var i = 0; i < children.length; i++) {
          list.push(children[i].catName)
        }
        multiIndex[0] = e.detail.value
        multiIndex[1] = 0;
        multiArray[1] = list;
        break;
      case 1:
        multiIndex[1] = e.detail.value
        break;
    }
    this.setData({
      multiArray:multiArray,
      multiIndex:multiIndex
    })
  },
  // 通过名称获取省市id/通过省市id获取名称
  getDistrictIdOrName(type,nameOrId){
    const {regions} = this.data;
    let result;
    if(!nameOrId){
      return ""
    }
    if(type == 1){
      regions.forEach(item=>{
        if(item.catName==nameOrId){
          result = item.catId
          return
        }
        if(item.children){
          for(let i = 0;i<item.children.length;i++){
            if(item.children[i].catName==nameOrId && (item.catName==this.data.province)){
              result = item.children[i].catId
            }
          }
        }
      })
    }else{
      regions.forEach(item=>{
        if(item.catId==nameOrId){
          result = item.catName
          return
        }
        if(item.children){
          for(let i = 0;i<item.children.length;i++){
            if(item.children[i].catId==nameOrId && (item.catId==this.data.provinceId)){
              result = item.children[i].catName
            }
          }
        }
      })
  }
   return result
  }
});
