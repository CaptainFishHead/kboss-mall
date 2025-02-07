import {showToast} from "../../../../components/toast/index";
import {TOAST_TYPE} from "../../../../const/index";

Component({
  properties: {
    logisticsCode:{
      type:String,
      value:''
    },
    logisticsName:{
      type:String,
      value:''
    },
    detailJson:{
      type:Object,
      value:{}
    }
  },
  data: {},
  methods: {
    //复制
    copy(e) {
      let {val} = e.currentTarget.dataset
      wx.setClipboardData({
        data: val,
        success(res) {
          showToast({type: TOAST_TYPE.SUCCESS, title: '复制成功'})
        },
        fail() {
        }
      })
    },
  }
});
