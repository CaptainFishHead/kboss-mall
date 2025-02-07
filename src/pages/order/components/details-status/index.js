import { ORDER_COUNT_DOWN, CONSUMER_HOTLINE} from "../../../../const/index"
import '../../../../utils/dateFormat'
import {track, TrackEventName} from "../../../../utils/sa";
import {wxFuncToPromise} from "../../../../utils/wxUtils";
import {checkIsAfterSale} from "../../../../models/afterSaleModel"
import order from "../../behaviors/order";
import { showToast } from "../../../../components/toast/index";
import { TOAST_TYPE, PRODUCT_TYPE } from "../../../../const/index";

Component({
  behaviors: [order],
	data: {
    PRODUCT_TYPE,
    // 倒计时
    countDown: '',
    // 订单售后类型弹窗
    dialogShow: false,
    // 售后服务类型
    serviceType: 0,
    // 未售后的商品
    noRefundList: [],
    // 已发货的商品
    shipList: [],
    // 售后商品列表
    refundList: [],
    // 双氧禁止售后弹窗提示
    deterVisible: false,
    deterBtns: [
      {
        text: '返回',type:'cancel'
      }, {
        extClass: {border: 'none'},
        text: '联系客服'
      }
    ]
  },
  _timer: null,
	properties: {
		orderInfo: {
			type: Object,
			value: {}
    }
	},
	options:{
		styleIsolation: 'apply-shared'
  },
  observers: {
    "orderInfo"(data) {
      const {orderStatus, countDown} = data;
      if (orderStatus === 10 && countDown) {
        this.startTimout(countDown*1000)
      }
    }
  },
  lifetimes: {
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
      clearTimeout(this._timer);
      this._timer = null;
    },
  },
	methods: {

    //订单取消
    cancelOrder({detail}){
      const {reasonVal} = detail;
      const {orderCode} = this.data.orderInfo;
      this.onCancelOrder({
          orderCode,
          cancelRemark: reasonVal
      }).then(() => {
        setTimeout(() => {
					wx.navigateBack()
				}, 2000)
      }).finally(() => {
        this.closeCancelReason();
      })
    },

    // 删除订单
    handleShowTips(){
      this.showTipsDialog('确认要删除订单？')
    },
    handleDelete() {
      this.onDelOrder({
        orderCode: this.data.orderInfo.orderCode
      }).then(() => {
        setTimeout(() => {
					wx.navigateBack()
				}, 2000)
      })
    },
    
		//详情页客服埋点
		onService() {
			track(TrackEventName.Boss_CustomerService, {customer_service_type: '售后在线客服'});
    },
    
    // 展开售后类型弹窗
    onShowSale(){
      // 奖品伴侣订单暂不支持线上售后申请，如需售后请联系平台客服处理
      const {channelName} = this.data.orderInfo || {};
      if (channelName && channelName.includes('RAFFLE')) {
        this.setData({deterVisible: true})
        return;
      }

      const {storeOrderCode, skuList} = this.data.orderInfo.storeList[0] || {};
      const {spuKind} = skuList[0] || {};
      // 查询未售后的商品
      const noRefundList = skuList.filter(item => {
        item.reSaleNum = item.skuNum - item.refundNum;
        return item.reSaleNum;
      })
      // 查询未发货的商品
      const shipList = noRefundList.filter(item => item.shipNum);
      if(spuKind === 1) {
        checkIsAfterSale({
          orderCode: storeOrderCode
        }).then(res => {
          this.setData({dialogShow: true, noRefundList, shipList})
        }).catch(err => {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
      } else {
        this.setData({dialogShow: true, noRefundList, shipList})
      }
    },
		//选择服务类型
		checkServiceType(e) {
      const {type} = e.currentTarget.dataset;
      const {noRefundList, shipList, orderInfo } = this.data;
      const {storeList, orderStatus} = orderInfo || {};
      this.setData({serviceType: type});
      // // 获取预订单下所有商品信息
      if(type === 3 && orderStatus === 30) {
        this.selectComponent("#afterSale").showRefundGoodsList({refundList: shipList})
      } else if(type === 1 && orderStatus === 20) {
        wxFuncToPromise(`navigateTo`, {
          url: `/pages/afterSale/apply/index`,
        }).then(({eventChannel}) => {
          eventChannel.emit(`afterSale`, {
            checkedGoods: noRefundList,
            storeInfo: storeList[0],
            serviceType: type
          })
        })
      } else {
        this.selectComponent("#afterSale").showRefundGoodsList({refundList: noRefundList})
      }
      this.closeServiceType()
		},
		closeServiceType(){
			this.setData({
				dialogShow: false,
			})
    },

    // 选择完售后商品回调
    onChooseAfterSale({detail}){
      const {storeList} = this.data.orderInfo || {};
      const {checkedGoods} = detail;
      const {serviceType} = this.data;
      checkedGoods.forEach(item => {
        if(item.spuKind === 1) {
          item.subSkuList.forEach(val => {
            const subTotalNum = (item.skuNum * val.skuNum) - val.refundNum; // 子品总数量 - 已经售后数量 = 可售后数量
            const chooseSubSaleNum = val.skuNum * (item.reSaleNum || item.skuNum); // 选中的每个子品可售后数量
            val.reSaleNum = subTotalNum < chooseSubSaleNum ? subTotalNum : chooseSubSaleNum;
          })
        }
      })
      wxFuncToPromise(`navigateTo`, {
        url: `/pages/afterSale/apply/index`,
      }).then(({eventChannel}) => {
        eventChannel.emit(`afterSale`, {
          checkedGoods,
          storeInfo: storeList[0],
          serviceType
        })
      })
    },
		
		// 订单倒计时
		startTimout(timeLeft) {
			this._timer = setTimeout(() => {
				const countDown = new Date(timeLeft).dateFormat('mm分ss秒')
				wx.nextTick(() => {
					this.setData({countDown})
				})
				timeLeft -= 1000  //时间差 减1000毫秒
				if (timeLeft > 0) {
					this.startTimout(timeLeft)
				} else {
					wx.nextTick(() => {
            this.setData({countDown: 0})
            clearTimeout(this._timer);
						this.triggerEvent('refresh') // 重新加载数据
					})
				}
			}, 1000)
    },
    // 关闭双氧售后弹窗
    deterTap(e) {
      const isCancel = e.detail.item.type === `cancel`
      if (!isCancel) {
        this.onCallTel()
      }
      this.setData({
        deterVisible: false
      })
    },
    /**拨打客服电话*/
    onCallTel() {
      track(TrackEventName.Boss_CustomerService, {customer_service_type: '电话客服'});
      wx.makePhoneCall({
        phoneNumber: CONSUMER_HOTLINE
      })
    },
		touchMove() {
			return // 解决蒙层下页面滚动问题
		}
	}
})

