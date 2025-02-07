import {TOAST_TYPE} from "@const/index";
import {wxFuncToPromise} from "@utils/wxUtils";
import {hideToast, showToast} from "@components/toast/index";
// import { findLogistics } from "../../../models/myPrize"
const app = getApp()

Component({
    /**
   * 组件的属性列表
   */
  properties: {
    logisticsVisible: {
      type: Boolean, value: false,
    },
    // 物流信息
    logisticsInfo: {
      type: Object, value: {},
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {
    // visible: false,
    // logisticsInfo: {}
  },
  pageLifetimes:{
    show() {
      // 页面被展示
      // this.findLogisticsFn({})
    }
  },
  lifetimes: {
    ready() {
      // this.findLogisticsFn({})
    },
  },
  methods: {
    /*显示半弹窗*/
    // logisticsBtn() {
    //   this.setData({ visible: true });
    // },
    /* btns*/
    buttontap(e) {
      console.log(e.detail)
    },
    closeLogistics() {
      this.triggerEvent('closeLogistics')
    },
    // findLogisticsFn(params) {
    //   showToast({type: TOAST_TYPE.LOADING})
    //   findLogistics(params)
    //   .then(({result}) => {
    //     this.setData({
    //       logisticsInfo: result 
    //     })
    //   })
    //   .finally(() => {
    //     hideToast()
    //   })
    // },
    // 复制按钮
    bindCopy(e) {
      const {sn: data} = e.currentTarget.dataset
      wxFuncToPromise(`setClipboardData`, {
        data
      })
      .then(() => {
        wx.hideLoading()
        // return wxFuncToPromise(`getClipboardData`)
      })
      .then(() => {
        showToast({title: '复制成功', type: TOAST_TYPE.SUCCESS})
      })
    },
  },
  //分享
  onShareAppMessage(res) {
    return app.globalData.shareInfo
  },
});