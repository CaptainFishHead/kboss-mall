import "@utils/dateFormat";
import {formatMobile} from "@utils/index";
import {TOAST_TYPE, STORAGE_USER_FOR_KEY, HEALTH_INFO_BUSINESS_PAGE} from "@const/index";
import {hideToast, showToast} from "@components/toast/index";
import {isLogged} from "@utils/index";
import {queryUserHealth, saveUserBasicInfo} from "@models/healthInfo";
import {HEALTH_SHARE_PARAMS} from "@const/index";
import WxValidate from "@utils/WxValidate";
import {wxFuncToPromise} from "@utils/wxUtils";
import {track, TrackEventName} from "@utils/sa";
import {updateArchiveMetricsToDb} from "@models/healthArchivesModel";

Page({
  data: {
    infoId: "",
    haveBeans: false, //康豆跳转过来true
    isBtndisable: true,
    isActive: true,
    birthdayEnd: new Date().dateFormat("YYYY-MM-DD"),
    formData: {
      // channelId: "",
      // id: "",
      // customerId: "",
      name: "",
      gender: '', //性别1男 2女
      birthday: "",
      mobile: "",
      weightKg: 60,
      heightCm: 170,
    },
    defineWeight: 40,
    defineHeight: 140,
    formDataMoible: "", //脱敏手机号
    mobile: "",
    activityId: "", //康豆活动id
    genderItems: [
      {
        value: 2,
        name: "女",
        checked: false,
        imgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nv.png?v=3",
        curImgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nv-cur.png?v=3",
      },
      {
        value: 1,
        name: "男",
        checked: false,
        imgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nan.png?v=3",
        curImgUrl: "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/baseInfo/img-nan-cur.png?v=3",
      },
    ],
    // 步骤条配置
    stepList: [
      {
        stepText: "基本信息", //每步的文字
        stepNum: "1", //第几步
        isActive: true, //每步是否当前步骤的文字
        isShowArrow: false, //是否显示右箭头,
        isShow: true, //是否显示
      },
      {
        stepText: "健康信息", //每步的文字
        stepNum: "2", //第几步
        isActive: false, //每步是否当前步骤的文字
        isShowArrow: false, //是否显示右箭头
        isShow: true, //是否显示
      },
      {
        stepText: "领豆成功", //每步的文字
        stepNum: "3", //第几步
        isActive: false, //每步是否当前步骤的文字
        isShowArrow: false, //是否显示右箭头
        isShow: false, //是否显示
      },
    ],
    // pageSource: "", //来源自编辑页面 editPage
    businessPage: "", //来源自其他 业务页面
    hidePage: true,
    weights: [],
    statures: []
  },
  onLoad(options) {
    const {activityId = '', id = '', businessPage = ''} = options
    this.setData({
      // infoId: id || "",
      businessPage,
      activityId,
    });
    this.calcStatureAndWeight();
  },
  onShow() {
    this.getUserInfo(); //获取用户信息详情
    this.getMobile(); //手机号
    this.initValidate(); //初始化校验
  },
  setStepList() {
    const {businessPage, stepList} = this.data;
    if (businessPage === HEALTH_INFO_BUSINESS_PAGE.BEANS) {
      stepList[2] = {
        stepText: "领豆成功", //每步的文字
        stepNum: "3", //第几步
        isActive: false, //每步是否当前步骤的文字
        isShowArrow: false, //是否显示右箭头
        isShow: true, //是否显示
      };
      this.setData({stepList});
    }
  },
  // 初始化校验
  initValidate() {
    const rules = {
      name: {
        required: true,
      },
      gender: {
        required: true,
      },
      birthday: {
        required: true,
      },
      // mobile: {
      //   required: true,
      //   tel: true,
      // },
    };
    
    const message = {
      name: {
        required: "请输入姓名",
      },
      gender: {
        required: "请选择性别",
      },
      birthday: {
        required: "请选择出生日期",
      },
      mobile: {
        required: "请填写手机号",
        tel: "手机号格式不正确",
      },
      weightKg: {
        required: "请选择体重",
      },
      heightCm: {
        required: "请选择身高",
      },
    };
    this.WxValidate = new WxValidate(rules, message);
  },
  // checkform
  checkForm(formData) {
    if (!this.WxValidate.checkForm(formData)) {
      const err = this.WxValidate.errorList[0];
      this.setData({isBtndisable: true});
      return {msg: err.msg, isValSecuss: true};
    }
    this.setData({isBtndisable: false});
    return {msg: "", isValSecuss: false};
  },
  // 获取手机号
  getMobile() {
    const {mobile} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {mobile: ""};
    this.setData({
      mobile: mobile,
      formDataMoible: formatMobile(mobile),
    });
  },
  // 个人信息详情
  getUserInfo() {
    showToast({type: TOAST_TYPE.LOADING});
    queryUserHealth().then(({result}) => {
      const {genderItems, formData, weights, statures, defineWeight, defineHeight} = this.data;
      const {healthUserBasicInfo: userInfos} = result;
      // if (userInfos.isHealthInfo === 0) return;
      const _this = this;
      const weightIndex = weights.findIndex(item => item === userInfos.weightKg)
      const heightIndex = statures.findIndex(item => item === userInfos.heightCm)
      const weight = weightIndex !== -1 ? weightIndex : defineWeight
      const height = heightIndex !== -1 ? heightIndex : defineHeight
      this.setData({
        formData: {
          ...formData, ...userInfos,
          mobile: userInfos.mobile || this.data.mobile,
          gender: userInfos.gender || ''
        },
        infoId: userInfos.id || "",
        defineWeight: weight,
        defineHeight: height
      }, () => {
        _this.checkForm(this.data.formData);
      });
      // 性别
      for (let i = 0; i < genderItems.length; i++) {
        genderItems[i].checked = userInfos?.gender === genderItems[i].value;
        this.setData({genderItems: [...genderItems]});
      }
      hideToast();
    }).catch(err => {
      showToast({
        title: err.msg || "暂无信息",
        type: TOAST_TYPE.WARNING,
      });
    });
  },
  // 校验姓名
  checkName() {
    const {name} = this.data.formData;
    const regex = /^[a-zA-Z0-9\u4e00-\u9fa5()]+$/;
    if (!regex.test(name)) {
      showToast({
        title: "姓名只能输入文字、字母",
        type: TOAST_TYPE.WARNING,
      });
      return false;
    }
    return true;
  },
  onNameInput(e) {
    let {value} = e.detail;
    const {formData} = this.data;
    this.setData({
      formData: {...formData, name: value},
    });
    this.checkForm(this.data.formData);
  },
  //选择性别
  genderChange(e) {
    const {genderItems, formData} = this.data;
    for (let i = 0; i < genderItems.length; i++) {
      genderItems[i].checked = genderItems[i].value === Number(e.detail.value);
    }
    this.setData({
      genderItems,
      formData: {...formData, gender: e.detail.value},
    }, () => {
      this.checkForm(this.data.formData);
    });
  },
  /*打开时间选择器*/
  onChangeDate(e) {
    const {formData} = this.data;
    this.setData({
      formData: {...formData, birthday: e.detail.value},
    });
    this.checkForm(this.data.formData);
  },
  // 体重
  onChangeWeight(e) {
    const {formData, weights} = this.data;
    this.setData({
      formData: {...formData, weightKg: weights[e.detail.value], defineWeight: e.detail.value},
    });
    this.checkForm(this.data.formData);
  },
  // 身高
  onChangeStature(e) {
    const {formData, statures} = this.data;
    this.setData({
      formData: {...formData, heightCm: statures[e.detail.value], defineHeight: e.detail.value},
    });
    this.checkForm(this.data.formData);
  },
  // 保存基本信息
  submitForm() {
    const {formData, infoId, businessPage, activityId} = this.data;
    const {msg, isValSecuss} = this.checkForm(formData);
    if (isValSecuss) {
      const err = this.WxValidate.errorList[0];
      showToast({title: "请补充完整后保存" || ""});
      return;
    }
    if (!this.checkName()) {
      return;
    }
    if(!formData.weightKg){
      showToast({title: "请选择体重！"});
      return;
    }
    if(!formData.heightCm){
      showToast({title: "请选择身高！"});
      return;
    }
    track(TrackEventName.Boss_Health_BasicInfo)
    showToast({type: TOAST_TYPE.LOADING});
    let params = {
      ...formData,
      id: infoId
    }
    saveUserBasicInfo(params).then(({result}) => {
      hideToast().then(() => {
        this.updateDataBMI()
        wx.redirectTo({
          url: `/pages/healthInfo/fitnessInfo/index?businessPage=${businessPage}&activityId=${activityId}`,
        });
      });
    }).catch(err => {
      showToast({
        title: err.msg || "暂无信息",
        type: TOAST_TYPE.WARNING,
      });
    });
  },
  async updateDataBMI() {
    const {formData} = this.data;
    const params = [{
      indexId: "1",
      parentIndexId: "1",
      indexData: "",
      heightCm: formData.heightCm,
      weightKg: formData.weightKg,
    }]
    await updateArchiveMetricsToDb({data: params})
  },
  onShareAppMessage(res) {
    return HEALTH_SHARE_PARAMS;
  },

  calcStatureAndWeight() {
    const max = 300;
    const weights = [];
    const statures = [];
    let newStature = 30;
    let newWeight = 5;
    
    while (newStature <= max || newWeight <= max) {
      if (newStature <= max) {
        statures.push(newStature);
        newStature++;
      }
      
      if (newWeight <= max) {
        weights.push(newWeight);
        newWeight++;
      }
    }
    
    this.setData({weights, statures});
  }
});
