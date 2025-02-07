import {queryGiftCardRecord, receiveGiftCard} from "../../../../models/cardModel";
import {CARD_ACCEPT_TYPE, themes, TOAST_TYPE} from "../../../../const/index";
import {hideToast, showToast} from "../../../../components/toast/index";
import back from "../../../../behaviors/back";

Page({
  data: {
    cardInfo:{
      cardName: '',
      effectStartDate: '',//卡生效开始日期
      effectEndDate: '',//卡生效截止日期
      effectType: '',
      effectAddDay: '',
    },
    visibleAccept: false, //领取操作弹窗
    receiveFlag: false, //是否可以领取卡
    btnText: '',
    result: '', //领取失败结果
    reason: '', //失败原因
    resultIcon: '', //失败icon-url
    buttonsConfim: [{
      text: '我知道了', type: 2,extClass: 'cancel'
    }],
    popupResult: '',
    nickName: '',//昵称
    userHeadIcourl: '',//头像
    defaultHead: "https://static.tojoyshop.com/images/wxapp-boss/mine/default.png?v=3.0.0",
    presentRecordId: '', //卡赠送记录ID
  },
  onLoad(options) {
    this.setData({
      presentRecordId: options.presentRecordId,
    })
    this.queryGiftCardRecordHandle()
  },
  behaviors:[back],
  /** 查询礼品卡赠送记录-判断卡的领取结果 */
  queryGiftCardRecordHandle() {
    showToast({type: TOAST_TYPE.LOADING})
    queryGiftCardRecord({id: this.data.presentRecordId}).then(({result}) => {
      hideToast().then(() => {
        this.setData({
          receiveFlag: result.receiveFlag,
          nickName: result.holdUserNickName,
          userHeadIcourl: result.holdUserHeadIcourl,
        })
        if (result.receiveFlag) { //未领取，可以领取
          this.setData({
            cardInfo:{...result},
            btnText: '立即领取',
          })
        } else {
          //cardAcceptType 领取结果type( receiveFlag 为false时有值)
          this.setData({
            btnText: '去商城逛逛',
            result: CARD_ACCEPT_TYPE.get(result.cardAcceptType).result, //领取失败结果
            reason: CARD_ACCEPT_TYPE.get(result.cardAcceptType).reason, //失败原因
            resultIcon: CARD_ACCEPT_TYPE.get(result.cardAcceptType).icon,
          })
        }
      })
    }).catch((err) => {
      hideToast().then(() => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
    })
  },
  /** 领取卡操作 or 去商城 */
  onAcceptCard() {
    showToast({type: TOAST_TYPE.LOADING})
    //调用赠送接口
    receiveGiftCard({id: this.data.presentRecordId}).then(({result}) => {
      hideToast().then(() => {
        const buttonsConfim = result.cardAcceptType === 1 ? [{text: '去购物', type: 1,extClass: 'ok'}] : [{text: '我知道了', type: 2,extClass: 'cancel'}]
        this.setData({
          buttonsConfim,
          visibleAccept: true,
          popupResult: CARD_ACCEPT_TYPE.get(result.cardAcceptType).popupResult,
          resultIcon: CARD_ACCEPT_TYPE.get(result.cardAcceptType).icon,
        })
      })
    }).catch((err) => {
      hideToast().then(() => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
    })
  },
  /** 领取弹窗操作*/
  tapDialogButton(e) {
    this.setData({visibleAccept: false})
    const type = e.detail.item.type
    if (type === 1) {
      this.restart()
    } else { //领取失败 更新卡状态
      this.queryGiftCardRecordHandle()
    }
  }
});
