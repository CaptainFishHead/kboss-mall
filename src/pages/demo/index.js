import {queryUserInfo} from "../../models/userModel";
import {qqmapsdk} from "@utils/map"
import { wxFuncToPromise } from "@utils/wxUtils";
import {COORDINATE_TYPE,ENTERPRISE_WX_SERVICE_PLUGID} from "@const/index";
/*app.json
*     企业微信联系客服插件
*     "contactPlugin": {
      "version": "1.4.3",
      "provider": "wx104a1a20c3f81ec2"
    },
    *
    *     "cell": "plugin://contactPlugin/cell"
    * */
Page({
  data: {
    plugId: ENTERPRISE_WX_SERVICE_PLUGID, //企业微信客服ID
    latitude: '',  // 纬度
    longitude: '', // 经度
    customerUrl:'https://work.weixin.qq.com/ca/cawcde43ca8c6d33dc',
    testHtml:'https://static.tojoyshop.com/html/boss/webviewtoH5/index.html'
  },
  onLoad: function (options) {
    this.getLocation()
    queryUserInfo()
    .then(({result}) => {
      console.log(result)
    })
  },
  authSuccess(e) {
    console.log(e)
    const {result, msg} = e.detail
    console.log(result)
    wx.showToast({title: msg})
  },
  authFail(e) {
    console.error(e)
    const {result, msg} = e.detail
    console.log(result)
    wx.showToast({
      icon: 'error',
      title: msg
    })
  },
  clickButton() {
    wx.nextTick(() => {
      wx.createSelectorQuery()
      .select('#poster')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
    })
  },
  init(res) {
    console.log(res)
    const canvas = res[0].node
    const dpr = wx.getSystemInfoSync().pixelRatio
    this.setData({
      dpr
    })
    const ctx = canvas.getContext('2d')
    canvas.width = this.width * dpr
    canvas.width = this.height * dpr
    ctx.scale(dpr, dpr)
    ctx.fillRect(0, 0, this.width, this.height)
  },
  startmessage(res) {
    console.log('startmessage', res)
  },
  completemessage(res) {
    console.log('completemessage', res)
    /*{
    errcode: 0,  // 消息发送状态
    name: '',  // 推送的客服人员姓名
    headurl: ''  // 推送的客服人员头像
  notifytype: 0,  // 0: 表示消息通知的方式  1：表示二维码的方式
}*/
  
  },
  onLocation() {
  
  },
  async getLocation () {
    var that = this;
    try {
      // 检查用户是否已经授权过位置信息权限
      const res = await wxFuncToPromise(`getSetting`)
      // 用户未授权，请求用户授权
      if (res.authSetting['scope.userLocation'] !== undefined && res.authSetting['scope.userLocation'] !== true) {
        wxFuncToPromise(`authorize`,{ scope: 'scope.userLocation'}).then(res => {
          that.getUserLocation();
        }).catch(()=>{
          wx.showModal({
            title:'打开位置授权',
            content: '需要获取您的位置，以便为您更好地推荐线下服务',
            success(res){
              if (res.confirm) {
                wx.openSetting({
                  success (res) {
                    // res.authSetting = {
                    //   "scope.userInfo": true,
                    //   "scope.userLocation": true
                    // }
                  }
                });
              }
            }
          })
        })
      } else {
        that.getUserLocation();
      }
    }catch (e) {
      console.log(e)
    }
  },
  // 用户已授权，直接获取位置信息
  getUserLocation () {
    wxFuncToPromise(`getLocation`, {
      type: COORDINATE_TYPE, // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的 坐标系 coordinateType
    }).then(res=>{
      // console.log('UserLocation',res)
      this.setData({
        latitude: res.latitude, // 纬度，浮点数，范围为-90~90，负数表示南纬
        longitude: res.longitude, // 经度，浮点数，范围为-180~180，负数表示
      })
    })
  },
  //打开地图
  openMap() {
    var mapSdk = qqmapsdk();
    mapSdk.geocoder({
      address: '北京市 朝阳区 仰山公园 8号楼',
      success({result}) {
        const {location, title, address_components} = result || {};
        wx.openLocation({
          latitude: location.lat,
          longitude: location.lng,
          name: title,
          address: `${address_components.province}${address_components.city}${address_components.district}`,
          // scale: 18,
          success(res) {
            console.log('打开地图成功')
          },
          fail(err) {
            console.log('打开地图失败', err)
          }
        })
      },
      fail(error) {
        console.log(error)
      }
    })
  }
});