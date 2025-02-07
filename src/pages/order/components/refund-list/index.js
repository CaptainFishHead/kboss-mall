import {moneyFormat} from "../../../../utils/index";

Component({
  properties: {
    systemInfo: {
      type: Object,
      value: {}
    }
  },
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared',
  },
  data: {
    refundVisbale: false,
    refundList: [],
    systemInfo: '', //当前设备 iOS/安卓
    disabledBtn: true,
    checkedGoods: [] // 选中售后的商品
  },
  lifetimes: {
    attached() {
      const that = this;
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            systemInfo: res
          });
        }
      })
    }
  },
  methods: {
    //获取售后商品列表
    showRefundGoodsList({refundList}) {
      this.setData({
        refundList: JSON.parse(JSON.stringify(refundList)),
        refundVisbale: true,
        disabledBtn: true,
        checkedGoods: []
      })
    },
    //勾选商品
    checkeChange(e) {
      const {checked, index} = e.currentTarget.dataset;
      this.setData({[`refundList[${index}].checked`]: !checked});
      const checkedGoods = this.data.refundList.filter(item => item.checked);
      this.setData({
        disabledBtn: !checkedGoods.length,
        checkedGoods
      });
    },
    //加减产品数量
    changeNum ({detail}) {
      const {productNum, skuId} = detail;
      const updateRenfundList = this.data.refundList.map(item => {
        if(item.skuId === skuId) item.reSaleNum = productNum;
        return item;
      })
      this.setData({refundList: updateRenfundList});
    },
    /**确定售后商品*/
    confrimRefundGoods(e) {
      const {checkedGoods} = this.data;
      this.triggerEvent('success', {checkedGoods});
      this.close();
    },
    close() {
      this.setData({
        refundList:  [],
        refundVisbale: false,
        disabledBtn: false,
        checkedGoods: []
      })
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
