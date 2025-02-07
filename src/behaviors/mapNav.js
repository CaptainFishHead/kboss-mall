import { COORDINATE_TYPE } from '@const/index'
import { wxFuncToPromise } from '@utils/wxUtils'
import { qqmapsdk } from '@utils/map'
import { getStoreList } from '@models/servicesModel'
import { hideToast, showToast } from '@components/toast/index'
import { STORAGE_USER_FOR_KEY, TOAST_TYPE } from '@const/index'
const app = getApp()

export default Behavior({
  data: {
    isShowDistance: false,
    isLoading: true,
    storeList: [],
    storeLength: 0
  },
  lifetimes: {
    attached: function () { }
  },
  pageLifetimes: {
    show() {
      this.getLocation({})
    }
  },
  methods: {
    //授权获取位置
    async getLocation({ isShowModal = false, isOpenMap = false }) {
      var that = this
      try {
        // 检查用户是否已经授权过位置信息权限
        const { authSetting } = await wxFuncToPromise(`getSetting`)
        // 用户未授权，请求用户授权
        if (authSetting['scope.userLocation'] !== undefined && authSetting['scope.userLocation'] !== true) {
          wxFuncToPromise(`authorize`, { scope: 'scope.userLocation' })
            .then(() => {
              that.getUserLocation()
            })
            .catch(() => {
              if (isShowModal) {
                wx.showModal({
                  title: '打开位置授权',
                  content: '需要获取您的位置，以便为您更好地推荐线下服务',
                  success(res) {
                    if (res.confirm) wx.openSetting()
                  }
                })
              } else {
                this.clearUserLocation()
              }
            })
        } else {
          that.getUserLocation(isOpenMap)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 用户已授权，直接获取位置信息
    getUserLocation(isOpenMap = false) {
      wxFuncToPromise(`getLocation`, {
        type: COORDINATE_TYPE
      }).then(({ latitude, longitude }) => {
        app.globalData.userLocation = {
          latitude, // 纬度，浮点数
          longitude// 经度，浮点数
        }
        this.setData({ isShowDistance: true })
        if (isOpenMap) {
          this.openMap()
        } else {
          this.queryStoreInfo()
        }
      })
    },
    //请求门店信息接口
    queryStoreInfo() {
      let { latitude, longitude } = app.globalData.userLocation
      this.setData({ isLoading: true })
      const params = {
        latitude: latitude,
        longitude: longitude
      }
      if (this.data.serviceId) {
        params.serviceId = this.data.serviceId
      }
      if (this.data?.spuId || this.data?.orderInfo?.spuId) {
        params.spuId = this.data.spuId || this.data.orderInfo.spuId
      }
      getStoreList(params)
        .then(({ result }) => {
          this.setData({ storeList: result || [], isLoading: false })
        })
        .catch(err => {
          console.log(err)
        })
    },
    clearUserLocation() {
      app.globalData.userLocation = {
        latitude: '',
        longitude: ''
      }
      this.setData({ isShowDistance: false })
      this.queryStoreInfo()
    },
    //打开地图
    openMap(address = '') {
      showToast({ type: TOAST_TYPE.LOADING })
      var mapSdk = qqmapsdk()
      let { latitude, longitude } = app.globalData.userLocation
      mapSdk.reverseGeocoder({
        location: {
          latitude: latitude,
          longitude: longitude
        },
        success({ result }) {
          const { location, address, address_component } = result || {}
          wx.openLocation({
            latitude: location.lat,
            longitude: location.lng,
            name: address,
            address: address,
            scale: 18,

            success(res) {
              console.log('打开地图成功')
              hideToast()
            },
            fail(err) {
              console.log('打开地图失败', err)
              hideToast()
            }
          })
        }
      })
    }
  }
})
