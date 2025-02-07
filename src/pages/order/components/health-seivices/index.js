import {TOAST_TYPE} from "@const/index";
import {showToast} from "@components/toast/index"
import { wxFuncToPromise } from '@utils/wxUtils'
import {serviceRelationShip} from "../../../../models/orderModel"
import mapNav from "@behaviors/mapNav";
Component({
  behaviors: [mapNav],
  properties: {
    orderInfo: {
      type: Object,
      value: {},
    },
    serviceList: {
      type: Array,
      value: [],
    },
    storeList: {
      type: Array,
      value: [],
    },
    serviceId: String,
  },
  data: {
    isExpand: false,
    expandedHeight: 0,
  },
  methods: {
    // 获取展开高度
    handleExpand() {
      const that = this
      this.setData({isExpand: !that.data.isExpand}, () => {
        if (that.data.isExpand) {
          const query = wx.createSelectorQuery().in(that)
          query.selectAll('.explain-item').boundingClientRect(rects => {
            let expandedHeight = 0
            rects.forEach(rect => {
              expandedHeight = expandedHeight + rect.height
            })
            that.setData({
              expandedHeight: expandedHeight
            })
          }).exec();
        } else {
          this.setData({
            expandedHeight: 0
          })
        }
      })
    },
    copy(e) {
      const {text} = e.target.dataset
      wx.setClipboardData({
        data: text,
        success() {
          wx.hideToast()
          showToast({
            title: '复制成功',
            type: TOAST_TYPE.SUCCESS
          })
        }
      })
    },
    //跳转服务列表
    onViewBooking() {
      //已完成 跳到- 我的服务-线上服务页
      if (this.data.orderInfo.orderStatus === 40 || this.data.orderInfo.orderStatus === 50) {
        wx.navigateTo({url: '/pages/services/index'})
      }
    },
    //联系顾问
    onViewCounselors() {
      if (this.data.orderInfo.orderStatus === 40 || this.data.orderInfo.orderStatus === 50 ) {
        if(this.data.serviceList[0].self === 1 && this.data.serviceList[0].serviceType === 1 &&  this.data.serviceList[0].reservationStatus==='0'){
          if(this.data.serviceList[0].showButton === false){
            showToast({title: '未到使用时间，请仔细核对使用时间'})
            return 
          }else{
          serviceRelationShip({tradeId:this.data.serviceList[0].tradeId}).then(({result}) => {
            wx.navigateTo({url: '/pages/healthArchives/healthWaiter/index?scheme=1'})
          }).catch((err)=>{
            console.log(err)
          })
        }
        }else{
          if(this.data.serviceList[0].showButton === false){
            showToast({title: '未到使用时间，请仔细核对使用时间'})
            return 
          }else{
            wx.navigateTo({url: '/pages/healthArchives/healthWaiter/index?scheme=0'})
          }
        }
      }
    },
    //查看门店
    viewStores(){
      wx.navigateTo({ url: `/pages/services/suitOutlets/index?spuId=${this.data.orderInfo.spuId}` })
    },
    handleNav(){
      this.getLocation({isShowModal:true,isOpenMap:true})
    },
    /*联系方式*/
    onCallTel() {
      wxFuncToPromise(`navigateTo`, { url: `/pages/services/serviceStaff/index` }).then(({ eventChannel }) => {
            let params = this.data.storeList[0]
        eventChannel.emit(`staff`, params)
      })
    },
  }
});
