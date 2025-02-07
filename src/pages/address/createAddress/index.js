// pages/address/createAddress/index.js
import WxValidate from "./../../../utils/WxValidate";
import { createAddress, updateAddress, queryMyAdress } from "../../../models/addressModel";
import { delAddress } from "../../../models/addressModel";
import { hideToast, showToast } from "../../../components/toast/index";
import { TOAST_TYPE, ISFIRSTMAPADDRESS } from "../../../const/index";
import { queryProvinceData } from "@models/commonModels";
import { track, TrackEventName } from "@utils/sa";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: "添加收货地址",
    formValue: {}, // 省市区
    addressId: undefined, // 收货地址ID
    visible: false,
    provinceData: [],
    isFirstIn: false, // 是否第一次进入该页面 控制获取地址详情提示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ addressId: options.id, title: "编辑收货地址" });
      this.queryAddressInfo();
    }
    this.initValidate();

    // 获取省市区数据
    queryProvinceData().then(({ result }) => {
      this.setData({ provinceData: result });
    });
    // 设置详细地址提示
    const isFirst = wx.getStorageSync(ISFIRSTMAPADDRESS);
    !isFirst && this.setData({ isFirstIn: true });
  },
  /**
   * 初始化表单校验
   */
  initValidate() {
    const rules = {
      acceptName: {
        required: true,
        minLength: 2,
      },
      receiveMobile: {
        required: true,
        tel: true,
      },
      provinceId: {
        required: true,
      },
      detailAddress: {
        required: true,
        minLength: 30,
      },
    };
    const message = {
      acceptName: {
        required: "请输入姓名",
        minLength: "姓名必须2个或以上字符",
      },
      receiveMobile: {
        required: "请输入手机号",
        tel: "请输入正确的手机号",
      },
      provinceId: {
        required: "请输入所在地区",
      },
      detailAddress: {
        required: "请输入详细地址",
        minLength: "详细地址不能超过30个字符",
      },
    };
    this.WxValidate = new WxValidate(rules, message);
  },
  /**
   * 查询当前收货地址信息 && 反显在页面中
   */
  queryAddressInfo() {
    const { addressId } = this.data;
    showToast({ type: TOAST_TYPE.LOADING });
    queryMyAdress({ addressId })
      .then(({ result }) => {
        this.setData({
          formValue: {
            ...result,
            isDefault: result.isDefault ? true : false,
          },
        });
      })
      .finally(() => {
        hideToast();
      });
  },
  /**
   *  控制位置提示是否显示
   *  */
  togglePos() {
    if (this.data.isFirstIn) {
      wx.setStorageSync(ISFIRSTMAPADDRESS, true);
      this.setData({ isFirstIn: false });
    }
  },
  /**
   * 监听真实姓名输入
   */
  onInputName({ detail }) {
    const { formValue } = this.data;
    this.setData({ formValue: { ...formValue, acceptName: detail.value } });
  },
  /**
   * 监听电话号码输入
   */
  onInputMobile({ detail }) {
    const { formValue } = this.data;
    this.setData({ formValue: { ...formValue, receiveMobile: detail.value } });
  },
  /**
   * 监听详细地址输入
   */
  onInputAddress({ detail }) {
    const { formValue } = this.data;
    this.setData({ formValue: { ...formValue, detailAddress: detail.value } });
  },
  /**
   * 监听是否设为默认地址
   */
  onChangeSwitch({ detail }) {
    this.togglePos();
    const { formValue } = this.data;
    this.setData({ formValue: { ...formValue, isDefault: detail.value } });
  },
  /**
   * 添加收货地址
   */
  onSumint(e) {
    const { value } = e.detail;
    const { addressId } = this.data;
    if (!this.WxValidate.checkForm(value)) {
      const err = this.WxValidate.errorList[0];
      showToast({
        title: err.msg || "暂无信息!",
        type: TOAST_TYPE.WARNING,
      });
      return;
    }
    showToast({ type: TOAST_TYPE.LOADING });
    let params = { ...value, isDefault: value.isDefault ? "1" : "0" };
    if (addressId) params.addressId = addressId;
    (addressId ? updateAddress : createAddress)(params)
      .then(res => {
        if (!addressId){ track(TrackEventName.Boss_ReceiverAddress)}
        wx.navigateBack();
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        hideToast();
      });
    // createAddress({
    //     ...value,
    //     isDefault: value.isDefault ? '1' : '0'
    // }).then(res => {
    //     wx.navigateBack();
    // }).catch(error => {
    //     console.error(error);
    // }).finally(() => {
    //     hideToast()
    // })
  },
  /**
   * 打开城市区选择器
   */
  onOpenCityPicker() {
    this.togglePos();
    this.selectComponent("#cityPicker").open();
  },
  /**
   *  监听城市选择器
   *  */
  onChangeCity({ detail }) {
    const { formValue } = this.data;
    this.setData({ formValue: { ...formValue, ...detail } });
  },
  /**
   * 筛选当前选中的省市区数据
   * @param _provinceName 省名称
   * @param _areaName  区/县名称
   * @param _name  详细地址
   * 注： 市信息是根据省和县循环获取得到的
   */
  chooseAddressFun(_provinceName, _areaName, _name) {
    let addressInfo = {
      provinceId: undefined,
      provinceName: undefined,
      cityId: undefined,
      cityName: undefined,
      areaId: undefined,
      areaName: undefined,
    };
    const { formValue, provinceData } = this.data;
    const province = provinceData.filter(item => item.name === _provinceName);
    if (province.length) {
      addressInfo.provinceId = province[0].id;
      addressInfo.provinceName = province[0].name;
      if (province[0].city && province[0].city.length) {
        province[0].city.forEach(item => {
          if (item.area && item.area.length) {
            item.area.forEach(val => {
              if (_areaName.substr(0, _areaName.length - 1) === val.name.substr(0, val.name.length - 1)) {
                addressInfo.cityId = item.id;
                addressInfo.cityName = item.name;
                addressInfo.areaId = val.id;
                addressInfo.areaName = val.name;
              }
            });
          }
        });
      }
    }
    this.setData({ formValue: { ...formValue, ...addressInfo, detailAddress: _name } });
    showToast({
      title: "请检查或完善详细地址哦",
      icon: null,
    });
  },

  /**
   *  选择详细地址
   */
  onChooseAddress() {
    this.togglePos();
    wx.chooseLocation({
      success: ({ address, name }) => {
        let regex = /.+?(省|自治区|行政区|市|自治州|县|区)|(.+)/g;
        const addressRes = address.match(regex);
        if (address.match(/.+?(省|自治区|行政区)/g) || addressRes[0] === addressRes[1]) {
          const detailAddress = addressRes[3] ? addressRes[3] + name : name;
          this.chooseAddressFun(addressRes[0], addressRes[2], detailAddress);
        } else {
          const _detailAddress = addressRes[2] ? addressRes[2] + name : name;
          this.chooseAddressFun(addressRes[0], addressRes[1], _detailAddress);
        }
      },
      fail: res => {},
    });
  },
  /**
   * 打开确认删除弹窗
   */
  openDelDialog() {
    this.setData({ visible: true });
  },
  /**
   * 删除地址
   */
  onDelAddress() {
    const { addressId } = this.data;
    delAddress({ addressId }).then(() => {
      this.setData({ visible: false });
      showToast({
        title: "删除成功!",
        type: TOAST_TYPE.SUCCESS,
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    });
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo;
  },
});
