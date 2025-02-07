// 生成小程序码
// https://blog.csdn.net/qq_41473887/article/details/81335977
// https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.get.html
import { queryWxQRCodeModel } from "../../models/wxQRCodeModel";
import { wxFuncToPromise, wxReqAuthorize } from "../../utils/wxUtils";
import { PRODUCT_DETAIL_PAGES, SOURCE, TOAST_TYPE } from "../../const/index";
import { showToast, hideToast } from "../toast/index";

const FONT_FAMILY = ' PingFangSC, Microsoft YaHei, Arial, sans-serif'

Component({
  properties: {
    productImage: String,
    logo: {
      type: String,
      value: 'https://static.tojoyshop.com/images/wxapp-boss/logo-2.png'
    },
    productName: {
      type: String,
      value: '康老板商品名字'
    },
    pid: String,
    commission: {
      type: Object,
      value: {}
    },
    sharePath: String,
  },
  data: {
    dpr: 1,
    coefficient: 1,
    shareImage: null,
  },
  lifetimes: {
    ready() {
      wx.createSelectorQuery().in(this)
        .select('#poster')
        .fields({
          node: true,
          size: true,
        })
        .exec(this.init.bind(this))
    }
  },
  methods: {
    getSize(size) {
      return size * this.data.coefficient
    },
    init(res) {
      showToast({ type: TOAST_TYPE.LOADING })
      const [{ node: canvas, width, height }] = res
      const dpr = wx.getSystemInfoSync().pixelRatio
      const ctx = canvas.getContext('2d')
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
        // 绘制品牌logo
        this.drawLogo(canvas, ctx)
          .then(() => {
            // 绘制商品图
            return this.drawProductionImg(canvas, ctx)
          })
          .then(async () => {
            ctx.restore()
            // 绘制商品名
            this.drawProductName(canvas, ctx)
            // 绘制长按识别二维码即刻选购
            this.drawGuide(ctx)
            const { pid, productName } = this.data

            // 获取小程序码
            return queryWxQRCodeModel({
              params: {
                spuId: pid,
                source: SOURCE.BH_MALL,
                productName
              },
              page: PRODUCT_DETAIL_PAGES[this.data.sharePath]
            })
          })
          .then(({ result }) => {
            return this.drawQRCode(canvas, ctx, { url: result.wxQrCode })
          })
          .then(() => {
            return this.canvasToImage(res)
          })
          .then(({ tempFilePath }) => {
            this.setData({
              shareImage: tempFilePath
            })
          })
          .catch((err) => {
            console.log(11111111111111, err)
            showToast({ type: TOAST_TYPE.ERROR, title: err.msg || '加载错误' })
            wx.navigateBack()
          })
          .finally(() => {
            hideToast()
          })
      })
    },
    // 绘制logo
    drawLogo(canvas, ctx) {
      return new Promise(( resolve => {
        const img = canvas.createImage()
        const width = canvas.width / this.data.dpr
        img.onload = () => {
          ctx.save()
          const x = ( width - 165 ) / 2
          ctx.translate(x, this.getSize(38))
          // 110 30
          const [imgWidth, imgHeight] = [this.getSize(165), this.getSize(29)]
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
          ctx.restore()
          resolve()
        }
        img.src = this.data.logo
      } ))
    },
    // 绘制圆角矩形
    drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.save()
      // 圆心坐标
      const [cx, cy] = [x + width - radius, y + radius]
      ctx.moveTo(x + radius, y)
      ctx.lineTo(cx, y)
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
      ctx.restore()
    },
    radiusRect(ctx, left, top, width, height, r) {
      const pi = Math.PI;
      ctx.beginPath();
      const [_topLX, _topRX, _topY, _bottomY] = [left + r, left + width - r, top + r, top + height - r]
      // 上
      ctx.arc(_topLX, _topY, r, -pi, -pi / 2);
      // 右
      ctx.arc(_topRX, _topY, r, -pi / 2, 0);
      // 下
      ctx.arc(_topRX, _bottomY, r, 0, pi / 2);
      // 左
      ctx.arc(_topLX, _bottomY, r, pi / 2, pi);
      ctx.closePath();
    },
    // 绘制商品图片
    drawProductionImg(canvas, ctx) {
      return new Promise(( resolve => {
        const img = canvas.createImage()
        const width = canvas.width / this.data.dpr
        img.onload = () => {
          ctx.save()
          const imgWidth = this.getSize(260)
          const dx = ( width - this.getSize(260) ) / 2
          const dy = this.getSize(88)
          // 创建圆角矩形
          this.radiusRect(ctx, dx, dy, imgWidth, imgWidth * 1, this.getSize(4))
          // 画布裁切
          ctx.clip()
          ctx.translate(dx, dy)
          ctx.drawImage(img, 0, 0, imgWidth, imgWidth)
          ctx.restore()
          // 绘制分割线
          ctx.save()
          ctx.translate(( width - this.getSize(261) ) / 2, this.getSize(397.5))
          const lineY = this.getSize(16)
          ctx.moveTo(0, lineY)
          ctx.lineTo(this.getSize(261), lineY)
          ctx.lineWidth = 1
          ctx.strokeStyle = '#F1F1F1'
          ctx.stroke()
          ctx.restore()
          resolve()
        }
        img.src = decodeURIComponent(this.data.productImage)
      } ))
    },
    // 绘制长按识别二维码即刻选购
    drawGuide(ctx) {
      ctx.save()
      ctx.font = `${this.getSize(12)}px ${FONT_FAMILY}`
      ctx.fillStyle = `#000000`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('长按识别二维码即刻选购', this.getSize(34.5), this.getSize(466 + 6))
      ctx.restore()
    },
    // 绘制商品名字
    drawProductName(canvas, ctx) {
      let productName = this.data.productName
      ctx.save()
      const width = canvas.width / this.data.dpr
      ctx.font = `${this.getSize(14)}px ${FONT_FAMILY}`
      ctx.fillStyle = `#000000`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      // 商品名称文字长度
      const _w = ctx.measureText(productName).width
      const maxW = this.getSize(260)
      if (_w > 260) {
        // 每一个字符所占空间
        const size = Math.floor(_w / productName.length)
        productName = productName.substr(0, Math.floor(( maxW - size ) / size)) + '...'
      }
      const textWidth = ctx.measureText(productName).width
      ctx.translate(( width - textWidth ) / 2, this.getSize(378))
      ctx.fillText(productName, 0, 0)
      ctx.restore()
    },
    // 绘制小程序码
    drawQRCode(canvas, ctx, { url }) {
      return new Promise(( resolve => {
        const img = canvas.createImage()
        img.onload = () => {
          ctx.save()
          ctx.translate(this.getSize(207.5), this.getSize(428))
          const imgWidth = this.getSize(90)
          ctx.drawImage(img, 0, 0, imgWidth, imgWidth)
          ctx.restore()
          resolve()
        }
        img.src = url
      } ))
    },
    // 保存图片
    saveImage() {
      if (this.data.shareImage) {
        this.saveImageToPhotos(this.data.shareImage)
      }
    },
    // canvas 转图片
    canvasToImage([{ node: canvas, width, height }]) {
      const [destWidth, destHeight] = [this.data.dpr * width, this.data.dpr * height]
      return wxFuncToPromise(`canvasToTempFilePath`, {
        x: 0, y: 0, width, height, destWidth, destHeight, canvasId: 'poster', canvas
      })
    },
    // 保存图片到相册
    saveImageToPhotos(tempFilePath) {
      return wxFuncToPromise(`saveImageToPhotosAlbum`, {
        filePath: tempFilePath
      })
        .catch(res => {
          if (res.errMsg === "saveImageToPhotosAlbum:fail auth deny" || res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
            // 请求授权
            this.doAuth()
          }
          console.error(res)
        })
        .then(() => {
          showToast({ type: TOAST_TYPE.SUCCESS, title: '保存成功' })
        })
    },
    doAuth() {
      wxReqAuthorize({ scope: 'scope.writePhotosAlbum' })
        .then(() => {
          showToast({ title: '获取权限成功，再次点击保存海报到相册' })
        })
        .catch(() => {
          showToast({ title: '获取权限失败' })
        })
    },
    // 分享给好友
    shareToFriend() {
      console.log(666, this.data.shareImage)
      wxFuncToPromise(`showShareImageMenu`, { path: this.data.shareImage })
      // .then(res => {
      // 	const eventChannel = this.getOpenerEventChannel()
      // 	eventChannel.emit(`shareResult`, res)
      // })
      // .catch(err => {
      // 	console.error(err)
      // 	const eventChannel = this.getOpenerEventChannel()
      // 	eventChannel.emit(`shareResult`, err)
      // })
    },
  }
});
