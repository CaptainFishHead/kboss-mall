// pages/obh/promotion/components/poster/index.ts
import {getPoster} from "@models/commonModels";
import { wxFuncToPromise, wxReqAuthorize } from "@utils/wxUtils";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    posterData: {
      type: Object,
      value: {},

      observer(val) {

        getPoster({datas: val.posterParams}).then(({result}) => {
          this.init(result[0], val.canvasImgUrl, val.draft)
        }).catch(err  => {
          wx.showToast({
            title: '海报生成失败，请稍候再试。',
            icon: 'none'
          })
          wx.hideLoading()
        })

      }
    },

    exposureStatus: {
      type: Number,
      value: 1
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    posterUrl: '',
    coefficient: 1,
    dpr: 1,

  },

  /**
   * 组件的方法列表
   */
  methods: {

    init(imgUrl, canvasImgUrl, draft) {
      wx.createSelectorQuery().in(this).select('#poster').fields({node: true, size: true}).exec(async (res) => {
        this.drawCanvas(res, imgUrl, canvasImgUrl, draft)
      })
    },

    drawCanvas(res, imgUrl, canvasImgUrl, draft) {
      
      // wx.showLoading({
      //   title: '海报生成中……',
      // })
      const [{node: canvas, width, height}] = res
      const dpr = wx.getSystemInfoSync().pixelRatio
      const ctx = canvas.getContext('2d')

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      this.setData({
        dpr,
        coefficient: width / 477
      })
      wx.nextTick(() => {

        this.drawStage(canvas, ctx, width, height, imgUrl).then(() => {
          return this.drawLottery(canvas, ctx, canvasImgUrl)
        }).then(() =>{
          return this.drawDraft(canvas, ctx, draft)
        }).then(() => {
          return this.canvasToImage(res)
        }).then(({tempFilePath}) => {
          this.setData({
            posterUrl: tempFilePath
          }, () => {
            this.triggerEvent('showPoster')
          })
        }).catch(({msg}) => {
          wx.showToast({icon: 'error', title: msg || '加载错误'})
        }).finally(() => {
          wx.hideLoading()
          // this.shareToFriend()
        })

      })
    },

		// canvas 转图片
		canvasToImage([{node: canvas, width, height}]) {
			const [destWidth, destHeight] = [this.data.dpr * width, this.data.dpr * height]
			return wx.canvasToTempFilePath({
				x: 0, y: 0, width, height, destWidth, destHeight, canvasId: 'poster', canvas
			})
    },
    
    // 绘制按钮
    drawDraft(canvas, ctx, draft) {
      return new Promise((reslove) =>  {
        const img = canvas.createImage()
        img.onload = () => {
          ctx.save()
          ctx.drawImage(img, this.getSize(164), this.getSize(330 - 6), this.getSize(147), this.getSize(147))
          ctx.restore()
          reslove()
        }
        img.src = draft || 'https://static.tojoyshop.com/images/obh/lottery/ic-lottery-draft.png'
      })
    },

    touchMove1() {
      return
    },
  
    // 绘制大转盘
    drawLottery(canvas, ctx, lottery) {
      return new Promise((reslove) =>  {
        const img = canvas.createImage()
        img.onload = () => {
          ctx.save()
          ctx.drawImage(img, this.getSize(72), this.getSize(242), this.getSize(332), this.getSize(332))
          ctx.restore()
          reslove()
        }
        img.src = lottery
      })

    },
    
    // 绘制二维码
    drawStage(canvas, ctx, width, height, imgUrl) {
      return new Promise((reslove) =>  {
        const img = canvas.createImage()
        img.onload = () => {
          ctx.save()
          ctx.drawImage(img, 0, 0, width, height)
          ctx.restore()
          reslove()
        }
        img.src = imgUrl
      })
    },


		// 保存图片到相册
		saveImageToPhotos() {



			return wxFuncToPromise(`saveImageToPhotosAlbum`, {
				filePath: this.data.posterUrl
			}).catch(res => {
					if (res.errMsg === "saveImageToPhotosAlbum:fail auth deny" || res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
						// 请求授权
						this.doAuth()
					}
				})
				.then(() => {
					wx.showToast({icon: 'none', title: '保存成功'})
          this.triggerEvent('closeShare')
				})
    },
    

		doAuth() {
			wxReqAuthorize({scope: 'scope.writePhotosAlbum'})
				.then(() => {
					wx.showToast({icon: 'none', title: '获取权限成功，再次点击保存海报到相册'})
          this.triggerEvent('closeShare')
				})
				.catch(() => {
					wx.showToast({icon: 'none', title: '获取权限失败'})
          this.triggerEvent('closeShare')
				})
		},

		getSize(size) {
			return size * this.data.coefficient
    },

  }
})
