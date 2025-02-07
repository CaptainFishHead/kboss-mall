import "../../../utils/dateFormat";
import {formatMobile,isLogged} from "@utils/index";
import {hideToast, showToast} from "@components/toast/index";
import {ORDER_SOURCE_PAGE, TOAST_TYPE,HEALTH_SHARE_PARAMS,HEALTH_INFO_BUSINESS_PAGE} from "@const/index";
import {queryUserHealth, saveUserCategory, reqHealthCategoryInfo, queryUserIsHealth} from "@models/healthInfo";
import {decrypt} from "@utils/crypto";
import {reqGainBeansReceive, reqGetOpendId} from "@models/gainBeansModel";
import {wxFuncToPromise} from "@utils/wxUtils";
import {track, TrackEventName} from "@utils/sa";

const turingSDK = require("../rick-sdk/turingSDK_1025_28_FJKRF3IO8NM8KYBG_20240328220812.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    businessPage: "", //业务 页面
    haveBeans: false, //康豆跳转过来true
    isActive: true,
    tabbarList: [{text: "有"}, {text: "无"}], //tabar菜单
    current: 0,
    indcurindexex: 0,
    categoryOptions: [], //健康信息填写
    list: [], //列表菜单选中的数据
    isBtndisable: true,
    listInit: [], //列表菜单数据
    bgRgb: "",
    // 步骤条配置
    stepList: [
      {
        stepText: "基本信息", //每步的文字
        stepNum: "1", //第几步
        isActive: false, //每步是否当前步骤的文字
        isShowArrow: false, //是否显示右箭头,
        isShow: true, //是否显示
      },
      {
        stepText: "健康信息", //每步的文字
        stepNum: "2", //第几步
        isActive: true, //每步是否当前步骤的文字
        isShowArrow: false, //是否显示右箭头
        isShow: true, //是否显示
      },
      {
        stepText: "领豆成功", //每步的文字
        stepNum: "3", //第几步
        isActive: false, //每步是否当前步骤的文字
        isShowArrow: false, //是否显示右箭头
        isShow: false, //是否显示
        // pageSource: "", //来源自编辑页面 editPage
      },
    ],
    // 领康豆==========
    isRce: false,
    activityId: "", //康豆活动id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {id = '', businessPage = '', activityId = '', /*pageSource = ''*/} = options
    this.setData({id, businessPage, activityId, /*pageSource*/});
    this.getUserInfo(); //健康档案信息查询
    this.getCategoryTags(); //分类标签查询
    // this.isvalate()
    this.setStepList();
  },
  onShow() {
  },
  async onReady() {
    const openId = await this.getWechatOpenId();
    const decryptOpenId = await decrypt(openId);
    const pageObj = this;
    turingSDK.init(
        {
          channel: "109030",
          page: pageObj, //为Page时可不传，Component必传
          openid: decryptOpenId || "",
          implement: {
            getTouch(cb) {
              //获取到SDK传递的cb对象，⽤以传递接⼊侧获取到的touch evnet数据
              callback = cb;
            },
          },
        },
        function (res) {
          //检测res是否初始化成功，成功为res.ret == 0
          if (res.ret == 0) {
            //初始化成功，请参考
          }
        }
    );
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
  // 分类标签查询
  async getCategoryTags() {
    reqHealthCategoryInfo()
    .then(({result}) => {
      let {categoryOptions} = this.data;
      let formdata = result.map(item => ({...item, current: 0, otherOptionName: ""})); //current:1默认当前菜单项 无
      this.setData({list: formdata, listInit: result});
      // this.isvalate()
    })
    .catch(err => {
      showToast({
        title: err.msg || "暂无信息",
        type: TOAST_TYPE.WARNING,
      });
    })
    .finally(() => {
      hideToast();
    });
  },
  // 健康档案详情信息查询
  async getUserInfo() {
    const {result} = await queryUserIsHealth(); //是否已填写健康信息 0 否 1 是
    const isHealthInfo = result.isHealthInfo;
    let storeinfolist = wx.getStorageSync("infolist");
    queryUserHealth()
    .then(({result}) => {
      const {healthUserBasicInfo, userCategoryVoList} = result;
      const {list} = this.data;
      this.setData({infoId: healthUserBasicInfo.id});
      if (isHealthInfo) {
        //已填写用户资料
        this.setData({list: userCategoryVoList.length ? userCategoryVoList : storeinfolist || []});
        const arr = [];
        // isHave 0无  1有（‘有’ ’无‘tab菜单） null无菜单 回显
        userCategoryVoList?.forEach(item => {
          let itemList = list.map(sub => {
            if (item.categoryId === sub.categoryId) {
              let itemObj = {
                ...sub,
                // current: item.isHave ? 0 : 1,
                current: item.isHave ? 0 : item.isHave === null ? 0 : 1,
                optionList: [...sub.optionList].map(n => {
                  let option = {};
                  const index = item?.userCategoryOptionVoList.findIndex(m => {
                    option = {...m};

                    return n.optionId === m.categoryOptionId;
                  });
                  return {
                    ...n,
                    tagLength: n.optionName.length,
                    checked: index !== -1 ? true : false,
                    otherOptionName: option.isOther ? option.otherOptionName : "", //其他
                  };
                }),
              };
              return itemObj;
            }
          });
          arr.push(...itemList.filter(i => i !== undefined));
        });
        this.setData({list: arr});
        this.isvalate();
      } else {
        //为实现样式添加tagLength （未填写资料)
        let arr1 = [];
        arr1 = list.map(el => {
          return {
            ...el,
            optionList: el?.optionList.map(i => ({
              ...i,
              tagLength: i.optionName.length,
              otherOptionName: "",
            })),
          };
        });
        this.setData({list: arr1});
        this.isvalate();
      }
    })
    .catch(err => {
      showToast({
        title: err.msg || "暂无信息",
        type: TOAST_TYPE.WARNING,
      });
    })
    .finally(() => {
      this.setData({
        isLoading: false,
      });
      hideToast();
    });
  },
  // 分类有无选择
  async tabChange(e) {
    const {detail, currentTarget} = e;
    const curindex = currentTarget.dataset.curIndex; //当前分类的index
    const listCurrent = `list[${curindex}].current`;
    this.setData({[listCurrent]: detail.index});
    await this.getFormDataParams();
    this.isvalate();
  },
  // 分类标签选择结果
  async onMedicalSelect(e) {
    const {lists, index, multiple} = e.detail;
    const {list} = this.data;
    const optionList = list[index].optionList;
    if (multiple === 1) {
      //单选
      optionList?.forEach(item => {
        //list
        item.checked = item.optionId === lists.optionId;
      });
    } else {
      //多选
      const idKeys = lists.map(item => item.optionId);
      list[index].optionList.forEach(item => (item.checked = false));
      idKeys.forEach(id => {
        list[index].optionList.forEach(item => {
          if (id === item.optionId) {
            item.checked = true;
          }
        });
      });
    }
    this.setData({list});
    await this.getFormDataParams();
    this.isvalate();
  },
  // 其他
  onMedicalOther(e) {
    const {index, multiple, value, curItem, optionIndex} = e.detail;
    const {list} = this.data;
    const otherName = `list[${index}].otherOptionName`;
    const subOtherName = `list[${index}].optionList[${optionIndex}].otherOptionName`; //回显用
    if (Number(multiple) === 1) {
      //单选
      this.setData({[otherName]: value, [subOtherName]: value});
    } else {
      //多选

      this.setData({[otherName]: value, [subOtherName]: value});
    }
    this.setData({list});

    this.isvalate();
  },
  // 校验是否都填写
  async isvalate() {
    await this.getFormDataParams();
    const {categoryOptions, list} = this.data;
    console.log(categoryOptions, "categoryOptions############");
    let isValate = false;
    let isHaveCount = 0;
    if (!categoryOptions.length) {
      this.setData({isBtndisable: true});
      return;
    }
    categoryOptions.forEach(item => {
      isHaveCount += item.isHave === 0 ? 1 : 0;
    });
    if (isHaveCount === categoryOptions.length) {
      //都是无情况
      this.setData({isBtndisable: false});
      return true;
    }

    // 非都填
    const idx = categoryOptions.findIndex(item => {
      return (
          (item.isHave === 1 && !item.userCategoryOptionParamList.length) === true ||
          (item.isShowNo === 0 && !item.userCategoryOptionParamList.length) === true
      );
    });
    if (idx !== -1) {
      this.setData({isBtndisable: true});
      isValate = false;
      return isValate;
    } else {
      for (let i = 0; i < categoryOptions.length; i++) {
        const index = categoryOptions[i].userCategoryOptionParamList.findIndex(item => {
          return item.isOther === 1 && item.otherOptionName == "";
        });
        if (index !== -1) {
          this.setData({isBtndisable: true});
          isValate = false;
          break;
        } else {
          this.setData({isBtndisable: false});
          isValate = true;
        }
      }
    }

    return isValate;
  },
  // 统一服务端保存和查询的入参
  getFormDataParams() {
    let {categoryOptions, list} = this.data;
    return new Promise((resolve, reject) => {
      categoryOptions = list.map(item => {
        return {
          categoryId: item.categoryId,
          isHave: item.current === 0 ? 1 : 0, //当前的选择菜单
          isShowNo: item.isShowNo,
          categoryName: item.categoryName, //提示分未填写分类名字用
          userCategoryOptionParamList:
              item.current === 1 && item.isShowNo
                  ? []
                  : [
                    ...item.optionList.map(subItem => {
                      if (subItem.checked === true) {
                        return {
                          categoryOptionId: subItem.optionId,
                          isOther: subItem.isOther,
                          otherOptionName: subItem.isOther === 1 ? subItem.otherOptionName : "",
                        };
                      }
                    }),
                  ].filter(i => i !== undefined),
        };
      });
      this.setData({categoryOptions});
      resolve();
    });
  },
  // 上一步
  onPreBtn() {
    wx.setStorageSync("infolist", this.data.list);
    // wx.navigateBack();
    const {businessPage, activityId} = this.data;
    wx.redirectTo({
      url: `/pages/healthInfo/personInfo/index?businessPage=${businessPage}&activityId=${activityId}`,
    });
  },
  // 保存
  async onSave() {
    let {categoryOptions, infoId} = this.data;
    try {
      await this.getFormDataParams();
    } catch (err) {
      showToast({
        title: err.msg || "",
        type: TOAST_TYPE.WARNING,
      });
    }
    if (this.isvalate()) {
      if (this.data.isBtndisable) {
        showToast({
          title: "请补充完整后保存",
          type: TOAST_TYPE.WARNING,
        });
        return;
      }
      let params = {id: infoId, userCategoryParamList: categoryOptions};
      const {businessPage} = this.data;
      track(TrackEventName.Boss_Health_Info)
      saveUserCategory(params)
      .then(({result}) => {
        switch (businessPage) {
          case HEALTH_INFO_BUSINESS_PAGE.BEANS:
            this.getGainBeansReceive();
            // 走防刷页面-阻拦提示弹框，不阻拦跳转领取成功页面。。。。
            break;
          case HEALTH_INFO_BUSINESS_PAGE.HEALTH_FAST:
            /* 如果从健康拍进来，保存后直接去 健康拍-摄像头页面 */
            this.savedToPage({url:"/pages/healthShoot/examine/index",methods:'redirectTo'})
            break;
          case HEALTH_INFO_BUSINESS_PAGE.HEALTH_ARCHIVES:
            /* 如果从健康档案页面，保存后 回到健康档案*/
            this.savedToPage({url:'/pages/healthArchives/index',methods:'reLaunch'})
            break;
          default:
            /* 如果从健康档案页面，保存后 回到健康档案*/
          /*  showToast({
              title: "保存信息成功",
              type: TOAST_TYPE.SUCCESS,
            });
            wx.reLaunch({url:"/pages/healthArchives/index"});*/
            this.savedToPage({url:"/pages/healthArchives/index",methods:'reLaunch'})
            break;
        }
      })
      .catch(err => {
        showToast({
          title: err.msg || "暂无信息",
          type: TOAST_TYPE.WARNING,
        });
      });
    } else {
      showToast({
        title: "请补充完整后保存",
        type: TOAST_TYPE.WARNING,
      });
    }
  },
  savedToPage({url,methods}){
    showToast({
      title: "保存信息成功",
      type: TOAST_TYPE.SUCCESS,
    });
    wxFuncToPromise(methods, {url});
    // wx.redirectTo({url});
  },

  onShareAppMessage(res) {
    return HEALTH_SHARE_PARAMS;
  },
  // 领康豆====================
  closeRce() {
    this.setData({
      isRce: false,
    });
  },
  openRce() {
    this.setData({
      isRce: true,
    });
  },
  goGains() {
    const isShowDialog = ![1, 6, 8].includes(this.data.gainBeansData.receiveState);
    if (isShowDialog) {
      this.setData({visible: true});
    } else if (this.data.gainBeansData.receiveState === 8) {
      this.openRce();
    } else {
      let {receiveState} = this.data.gainBeansData;
      let gainBeansData = JSON.stringify(this.data.gainBeansData);
      wx.redirectTo({url: `/pages/healthBean/draw/result/index?data=` + encodeURIComponent(gainBeansData)});
    }
  },
  // 获取微信的openid
  getWechatOpenId() {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          reqGetOpendId(res.code)
          .then(({result, code, msg}) => {
            // encryptContext 加密后的openId    ,context 明文openId
            if (code == 200) {
              hideToast();
              if (result && result.encryptContext) {
                resolve(result.encryptContext);
              }
            }
          })
          .catch(err => {
            showToast({
              title: err.msg || "获取信息失败",
              type: TOAST_TYPE.WARNING,
              duration: 2000,
            });
          });
        },
      });
    });
  },
  //获取图灵盾sdk的token
  getTuringSDKToken() {
    //确保init完成后再进⾏deviceToken获取(缓存接⼝)
    return new Promise((resolve, reject) => {
      turingSDK.getDeviceTokenV2(function (res) {
        //返回结果
        if (res.ret == 0) {
          // res.deviceToken;//返回结果token标识
          resolve(res.deviceToken);
        }
      });
    });
  },
  // 去领取康豆 decrypt
  async getGainBeansReceive(paramExtraObj) {
    //正常领豆
    showToast({
      type: TOAST_TYPE.LOADING,
    });
    const deviceToken = await this.getTuringSDKToken(); //获取deviceToken
    // platform: '1':Android,'2':iOS,'3':H5,'4':小程序
    let params = {
      activityId: this.data.activityId,
      deviceToken,
      platform: "4",
    };
    if (paramExtraObj !== null) {
      params.retention = paramExtraObj;
    }
    reqGainBeansReceive(params)
    .then(({result, code}) => {
      hideToast();
      this.setData({
        gainBeansData: result,
        retainedVisible: false,
      });
      this.goGains(); //领豆
      hideToast();
    })
    .catch(async err => {
      showToast({
        title: err.msg || "暂无信息",
        type: TOAST_TYPE.WARNING,
        duration: 2000,
      });
    });
  },
  onPageScroll(e) {
    this.setData({bgRgb: e.scrollTop > 10 ? "188, 253, 229" : ""});
  },
});
