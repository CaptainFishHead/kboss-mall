import {
  TOAST_TYPE, RECEIVE_COUPON_BTN_TEXT_MAPS, RECEIVE_COUPON_STATUS_TIPS_MAPS
} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";
import back from "../../../behaviors/back";
import {wxFuncToPromise} from "../../../utils/wxUtils";
import {manualReceiveCoupon, queryCouponInfo} from "../../../models/voucherModel";
import {formatDate, getBaseEnterOptions} from "../../../utils/index";
import {getPageShareInfo} from "../../../utils/sharePoster";

const FONT_FAMILY = 'PingFangSC'
const PRICE_FONT_FAMILY = 'DINAlternate-Bold'
const app = getApp()

Page({
  data: {
    couponInfo: {
      receiveLimit: '', //每人限领数量
      couponName: '',
      couponAmount: '',//面值（元）
      couponType: '',//优惠券类型 1单品立减券
      moneyLimit: '',//使用门槛金额
      useType: '',//使用门槛类型1无门槛2满减
      startTime: '',//优惠券开始时间
      endTime: '',//优惠券结束时间
    },
    receiveFlag: true, //是否可以领取
    coupoBtnText: RECEIVE_COUPON_BTN_TEXT_MAPS,
    receiveStatus: 0, //优惠券领取按钮展示(0：立即领取 1：去使用 2：已抢光 3：已结束)
    couponId: '', //优惠券ID
    dpr: 1,
    coefficient: 1,
    shareImage: null,
    productImage: 'https://static.tojoyshop.com/images/wxapp-boss/coupon/voucher-bg-receive.png'
  },
  onLoad(options) {
    const {query} = getBaseEnterOptions()
    let couponId = ''
    if (query.couponId){
      couponId = query.couponId
    }else{
      couponId = options.couponId
    }
    this.setData({
      couponId,
    })
    this.queryCouponInfoHandle()
  },
  behaviors: [back],
  /** 查询优惠券详情-判断领取结果 */
  queryCouponInfoHandle() {
    showToast({type: TOAST_TYPE.LOADING})
    queryCouponInfo({couponId: this.data.couponId}).then(({result}) => {
      hideToast().then(() => {
        this.setData({couponInfo: {...result}, receiveStatus: result.receiveStatus})
        //已抢光(库存不足) ,已结束
        if (result.receiveStatus === 2 || result.receiveStatus === 3) {
          showToast({
            title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
            type: TOAST_TYPE.ERROR
          })
        }
        if (!this.data.shareImage) {
          wxFuncToPromise(`loadFontFace`,{
            family:PRICE_FONT_FAMILY,
            source:`url("https://static.tojoyshop.com/font/DIN-bold.ttf")`,
            scopes:['webview','native']
          })
          .finally(()=>{
            this.createCoverImg()
          })
        }
      })
    }).catch((err) => {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    })
  },
  /**领取券操作*/
  onReceiveCoupon() {
    showToast({type: TOAST_TYPE.LOADING})
    //调用领取接口
    manualReceiveCoupon({couponId: this.data.couponId}).then(({result}) => {
      hideToast().then(() => {
        switch (result.receiveStatus) {
          case 2://已抢光(库存不足)
          case 3://已结束
            showToast({
              title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
              type: TOAST_TYPE.ERROR
            })
            break;
          case 4://领取成功 领取成功后的天数 今天的日期 +天数 为结束日期
            const couponInfo = this.data.couponInfo
            if (couponInfo.timeType === 2) {
              couponInfo.startTime = formatDate(Date.now()).date
              couponInfo.endTime = formatDate(Date.now() + couponInfo.validityDays * 24 * 60 * 60).date
            } else {
              const _startTime = couponInfo.startTime.split(' ')[0]
              const _endTime = couponInfo.endTime.split(' ')[0]
              couponInfo.startTime = formatDate(_startTime, '.').date
              couponInfo.endTime = formatDate(_endTime, '.').date
            }
            this.selectComponent("#receiveCouponDialog").showReceiveCouponDialog({...couponInfo, isReceived: true})
            break;
          case 6://超出领取次数
            let tips = RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus]
            tips = `${tips}${result.receiveLimit}张`
            showToast({
              title: tips,
              type: TOAST_TYPE.WARNING
            })
            break;
          case 5:
          case 7://用户不符合客群(不是新用户)
            showToast({
              title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
              type: TOAST_TYPE.WARNING
            })
            break;
          default:
            break;
        }
        setTimeout(() => {
          this.queryCouponInfoHandle()
        }, 1500)
      })
    }).catch((err) => {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    })
  },
  /**使用优惠券*/
  onUsedCoupon() {
    wx.navigateTo({
      url: `/pages/product/index?spuId=${this.data.couponInfo.spuId}&skuId=none`,
    })
  },
  /** 通过微信分享赠送优惠券*/
  onShareAppMessage(res) {
    const promise = new Promise(async (resolve) => {
      const {v2_code} = await getPageShareInfo({
        pageUrl: '/pages/voucher/info/index',
        pageOptions: {
          couponId: this.data.couponId
        }
      });
      resolve({
        title: '送您一张康老板优惠券',
        path: `/pages/index/index?v2_code=${v2_code}`,
        imageUrl: this.data.shareImage
      })
    })
    return {
      ...app.globalData.shareInfo,
      promise
    }
  },
  /**canvas绘制封面图*/
  createCoverImg() {
    wx.createSelectorQuery().select('#voucher-cover')
    .fields({node: true, size: true})
    .exec((res) => {
      const [{node: canvas, width, height}] = res
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      this.setData({
        dpr,
        coefficient: width / 325
      })
      wx.nextTick(() => {
        //绘制封面背景图
        this.drawProductionImg(canvas, ctx)
        .then(async () => {
          // 绘制商品名
          this.drawVouvherName(canvas, ctx)
          // 绘制长按识别二维码即刻选购
          this.drawVoucherPrice(canvas, ctx)
        })
        .then(() => {
          return this.canvasToImage(res)
        })
        .then(({tempFilePath}) => {
          this.setData({
            shareImage: tempFilePath
          })
        })
        .catch(({msg}) => {
          console.log(msg, '绘制错误')
          showToast({type: TOAST_TYPE.ERROR, title: msg || '加载错误'})
        })
      })
    })
  },
  // 绘制封面图片
  drawProductionImg(canvas, ctx) {
    const {dpr, productImage} = this.data
    return new Promise((resolve => {
      const img = canvas.createImage()
      img.onload = () => {
        ctx.save()
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
        ctx.restore()
        resolve()
      }
      //wx.getImageInfo 网络图片k
      img.src = decodeURIComponent(productImage)
    }))
  },
  // 绘制优惠券名字
  drawVouvherName(canvas, ctx) {
    let {couponName} = this.data.couponInfo
    ctx.save()
    const width = canvas.width / this.data.dpr
    ctx.font = `normal bold ${this.getSize(24)}px ${FONT_FAMILY}`
    ctx.fillStyle = `#CA4542`
    // 商品名称文字长度
    const _w = ctx.measureText(couponName).width
    const maxW = this.getSize(250)
    if (_w > 250) {
      // 每一个字符所占空间
      const size = Math.floor(_w / couponName.length)
      couponName = couponName.substr(0, Math.floor((maxW - size) / size)) + '...'
    }
    const textWidth = ctx.measureText(couponName).width
    ctx.translate((width - textWidth) / 2, this.getSize(70))
    ctx.fillText(couponName, 0, 0)
    ctx.restore()
  },
  // 绘制优惠券价格
  drawVoucherPrice(canvas, ctx) {
    let {couponAmount} = this.data.couponInfo
    let sign = '¥'
    ctx.save()
    const width = canvas.width / this.data.dpr
    //绘制价格
    ctx.font = `normal bold ${this.getSize(44)}px ${PRICE_FONT_FAMILY}`
    ctx.fillStyle = `#CA4542`
    ctx.textBaseline = 'top'
    const textWidth = ctx.measureText(couponAmount).width
    ctx.translate((width - textWidth) / 2, this.getSize(100))
    ctx.fillText(couponAmount, 0, 0)
    ctx.restore()

    //绘制符号
    ctx.font = `normal bold ${this.getSize(24)}px ${PRICE_FONT_FAMILY}`
    ctx.fillStyle = `#CA4542`
    ctx.textBaseline = 'top'
    const signWidth = ctx.measureText(sign).width
    ctx.translate((width - textWidth - signWidth - 20) / 2, this.getSize(116))
    ctx.fillText(sign, 0, 0)
    ctx.restore()
  },
  // canvas 转图片
  canvasToImage([{node: canvas, width, height}]) {
    const [destWidth, destHeight] = [this.data.dpr * width, this.data.dpr * height]
    return wxFuncToPromise(`canvasToTempFilePath`, {
      x: 0, y: 0, width, height, destWidth, destHeight, canvasId: 'cover', canvas
    })
  },
  getSize(size) {
    return size * this.data.coefficient
  },
  /**关闭弹窗*/
  couponClosed() {

  }
});
