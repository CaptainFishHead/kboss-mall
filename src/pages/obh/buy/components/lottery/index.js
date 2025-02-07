/**
 * ease:
 * 'linear'  动画从头到尾的速度是相同的
 * 'ease'  动画以低速开始，然后加快，在结束前变慢
 * 'ease-in'  动画以低速开始
 * 'ease-in-out'  动画以低速开始和结束
 * 'ease-out'  动画以低速结束
 * 'step-start'  动画第一帧就跳至结束状态直到结束
 * 'step-end'  动画一直保持开始状态，最后一帧跳到结束状态
 */

import * as API_Obh from '../../../models/obh'


let config = {
  size: {
    width: '626rpx',
    height: '626rpx'
  }, // 转盘宽高
  bgColors: [], // 转盘间隔背景色 支持多种颜色交替
  fontSize: 16, // 文字大小
  fontColor: '#139550', // 文字颜色
  titleMarginTop: 16, // 最外文字边距
  titleLength: 6, // 最外文字个数
  iconWidth: 44, // 图标宽度
  iconHeight: 44, // 图标高度
  iconAndTextPadding: 8, // 最内文字与图标的边距
  duration: 3000, // 转盘转动动画时长
  rate: .45, // 由时长s / 圈数得到
  border: 'border: 0rpx solid #0000;', // 转盘边框
  ease: 'ease-out' // 转盘动画
};

let preAngle = 0; // 上一次选择角度
let preAngle360 = 0; // 上一次选择角度和360度之间的差
let retryCount = 10; // 报错重试次数
let retryTimer; // 重试setTimeout
let drawTimer; // 绘制setTimeout
Component({
  properties: {
    // 是否可用
    enable: {
      type: Boolean,
      value: true
    },
    openId: {
      type: String,
      value: ''
    },
    // 数据
    data: {
      type: Array,
      value: []
    },
    //  中奖id
    prizeId: {
      type: String,
      value: ''
    },
    // 配置项 传入后和默认的配置进行合并
    config: {
      type: Object,
      value: {}
    },
    // 抽奖次数
    count: {
      type: Number,
      default: 5
    },
    typeStr: {
      type: String,
      default: ''
    },
    mainConfig: {
      type: Object,
      default: {},

      observer(val) {
        config.bgColors = [val.prizeSlotAreaColor1, val.prizeSlotAreaColor2]
        config.fontColor = val.prizeNameColor
      }
    }
  },
  data: {
    lotteryCount: 5,
    turnCanvasInfo: {width: 0, height: 0},
    size: config.size,
    datas: [],
    disable: false,
    canvasImgUrl: '',
    border: config.border,
    infos: [],
    isAnim: false,
  },
  observers: {
    'data': async function (data) {
      if (!data || !data.length) {
        return;
      }
      await this.initData(data);
    },
    'enable': function (enable) {
      this.setData({
        disable: !enable
      });
    },
    'prizeId': function (id) {
      if (!id) {
        this.setData({
          disable: false
        });
        return;
      }
      try {
        const infos = this.data.infos;
        const info = infos.find((item) => item.id === id);
        this.startAnimation(info.angle);
      } catch (e) {
        this.setData({
          disable: false
        });
      }
    },
    'count': function (lotteryCount) {

      console.log('lotteryCount', lotteryCount)


      this.setData({
        lotteryCount
      });
    }
  },
  lifetimes: {
    detached() {
      this.clearTimeout();
    }
  },
  pageLifetimes: {
    hide() {
      this.clearTimeout();
    }
  },
  methods: {
    async getCanvasContainerInfo(id) {
      return new Promise((resolve) => {
        const query = wx.createSelectorQuery().in(this);
        query.select(id).boundingClientRect(function (res) {
          const {width, height} = res;
          resolve({width, height});
        }).exec();
      });
    },
    async init() {
      try {
        const info = await this.getCanvasContainerInfo('#turn');
        if (info.width && info.height) {
          this.setData({
            turnCanvasInfo: info
          });
          this.drawTurn();
        } else {
          wx.showToast({
            icon: 'nont',
            title: '获取转盘宽高失败'
          })
        }
      } catch (e) {
        if (retryCount <= 0) {
          return;
        }
        retryCount--;
        if (retryTimer) {
          clearTimeout(retryTimer);
        }
        retryTimer = setTimeout(async () => {
          await this.init();
        }, 100);
      }
    },
    drawTurn() {
      const turnCanvasInfo = this.data.turnCanvasInfo;
      const datas = this.properties.datas;
      const ctx = wx.createCanvasContext('turn', this);
      // 计算没个扇区弧度
      const radian = Number((2 * Math.PI / datas.length).toFixed(2));
      // 绘制扇区并记录每个扇区信息
      const infos = this.drawSector(radian, datas, ctx, turnCanvasInfo);
      // 记录旋转角度
      this.recordTheRotationAngle(infos);
      // 绘制扇区文本及图片
      this.drawTextAndImage(datas, ctx, turnCanvasInfo, radian);

      ctx.draw(false, () => {
        this.saveToTempPath(turnCanvasInfo);
      });
    },

    saveToTempPath(turnCanvasInfo) {
      if (drawTimer) {
        clearTimeout(drawTimer);
      }
      drawTimer = setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'turn',
          quality: 1,
          x: 0,
          y: 0,
          width: turnCanvasInfo.width,
          height: turnCanvasInfo.height,
          success: (res) => {
            this.setData({
              canvasImgUrl: res.tempFilePath
            }, () => {
              this.triggerEvent('Loaded', {canvasImgUrl: this.data.canvasImgUrl})
            });
          },
          fail: (error) => {
            console.log(error);
          }
        }, this);
      }, 500);
    },

    // 绘制转盘色块
    drawSector(radian, datas, ctx, turnCanvasInfo) {
      const halfRadian = Number((radian / 2).toFixed(2));
      let startRadian = -Math.PI / 2 - halfRadian;

      const angle = 360 / datas.length;
      const halfAngle = angle / 2;
      let startAngle = -90 - halfAngle;
      const infos = [];
      // 绘制扇形
      for (let i = 0; i < datas.length; i++) {
        // 保存当前状态
        ctx.save();
        // 开始一条新路径
        ctx.beginPath();
        ctx.moveTo(turnCanvasInfo.width / 2, turnCanvasInfo.height / 2);
        ctx.arc(turnCanvasInfo.width / 2, turnCanvasInfo.height / 2, turnCanvasInfo.width / 2, startRadian, startRadian + radian);
        if (datas[i].bgColor) {
          ctx.setFillStyle(datas[i].bgColor);
        } else {
          ctx.setFillStyle(config.bgColors[i % config.bgColors.length]);
        }
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        infos.push({
          id: datas[i].id,
          angle: (startAngle + startAngle + angle) / 2
        });
        startRadian += radian;
        startAngle += angle;
      }
      return infos;
    },
    drawTextAndImage(datas, ctx, turnCanvasInfo, radian) {
      let startRadian = 0;
      // 绘制扇形文字和logo
      for (let i = 0; i < datas.length; i++) {
        // 保存当前状态
        ctx.save();
        // 开始一条新路径
        ctx.beginPath();
        ctx.translate(turnCanvasInfo.width / 2, turnCanvasInfo.height / 2);
        ctx.rotate(startRadian);
        ctx.translate(-turnCanvasInfo.width / 2, -turnCanvasInfo.height / 2);
        if (datas[i].fontSize) {
          ctx.setFontSize(datas[i].fontSize);
        } else {
          ctx.setFontSize(config.fontSize);
        }
        ctx.setTextAlign('center');
        if (datas[i].fontColor) {
          ctx.setFillStyle(datas[i].fontColor);
        } else {
          ctx.setFillStyle(config.fontColor);
        }
        ctx.setTextBaseline('top');
        if (datas[i].prizeName) {
          ctx.fillText(datas[i].prizeName, turnCanvasInfo.width / 2, config.titleMarginTop);
        }
        if (datas[i].prizeIcon) {
          ctx.drawImage(datas[i].prizeIcon,
            turnCanvasInfo.width / 2 - config.iconWidth / 2,
            config.titleMarginTop + config.fontSize + 2 + config.iconAndTextPadding,
            config.iconWidth, config.iconHeight);
        }
        ctx.closePath();
        ctx.restore();
        startRadian += radian;
      }
    },
    recordTheRotationAngle(infos) {
      for (let i = infos.length - 1; i >= 0; i--) {
        infos[i].angle -= infos[0].angle;
        infos[i].angle = 360 - infos[i].angle;
      }
      // 记录id及滚动的角度
      this.setData({
        infos: infos
      });
    },

    luckDrawHandle1() {
      let { openId } = this.data
      // 保存康老板用户信息
      this.luckDrawHandle()
    },
    luckDrawHandle() {
      if (this.data.disable || !this.data.canvasImgUrl) {
        return;
      }
      this.setData({
        disable: true
      });
      this.triggerEvent('LuckDraw');
    },

    queryLotteryTimes() {
      this.triggerEvent('queryLotteryTimes')
    },


    startAnimation(angle) {
      if (this.data.lotteryCount == 0) {
        this.setData({
          disable: false
        });
        this.triggerEvent('NotEnough', '抽奖次数不足！');
        return;
      }
      this.triggerEvent('showAnimCircle', {showAnimCircle: true})
      // 抽奖次数减一
      this.setData({
        lotteryCount: this.data.lotteryCount - 1,
        isAnim: true
      });
      const currentAngle = preAngle;
      preAngle += Math.floor((config.duration / 1000) / config.rate) * 360 + angle + preAngle360;
      this.animate('#canvas-img', [
        {rotate: currentAngle, ease: 'linear'},
        {rotate: preAngle, ease: config.ease},
      ], config.duration, () => {
        this.setData({
          disable: false,
          isAnim: false
        });
        preAngle360 = 360 - angle;
        this.triggerEvent('LuckDrawFinish');
      });
    },

    async downloadImg(imgs) {
      let result;
      try {
        const downloadHandles = [];
        let objRes = {}
        for (const url of imgs) {
          let res
          if (url && url.length > 0) {
            if (objRes[url] && objRes[url].length > 0) {
              res = objRes[url]
            } else {
              res = await new Promise((resolve, reject) => {
                wx.downloadFile({
                  url,
                  success: (res) => {
                    if (res.statusCode === 200) {
                      resolve(res.tempFilePath);
                    } else {
                      reject();
                    }
                  },
                  fail: () => {
                    reject()
                  }
                })
              })
            }
            objRes[url] = res
          } else {
            res = ''
          }
          downloadHandles.push(res)
        }
        result = downloadHandles
      } catch (e) {
        console.log(e);
        result = [];
      }
      return result;
    },

    clearTimeout() {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (drawTimer) {
        clearTimeout(drawTimer);
      }
    },
    isAbsoluteUrl(url) {
      return /(^[a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    },
    async initData(data) {
      let title;
      let subTitle;
      let imgUrls = [];
      if (this.properties.config) {
        config = Object.assign(config, this.properties.config);
      }

      for (const d of data) {

        if (d.noPrizeIcon && !d.prizeIcon) {
          d.prizeIcon = d.noPrizeIcon
        }
        if (!d.prizeName) {
          d.prizeName = '谢谢参与'
        }

        title = d.prizeName
        
        imgUrls.push(d.prizeIcon);
        d.prizeIcon = '';
        
        if (title && title.length > 6) {
          d.prizeName = `${title.slice(0, 6)}..`
        }
      }

      imgUrls = await this.downloadImg(imgUrls);
      for (let i = 0; i < imgUrls.length; i++) {
        data[i].prizeIcon = imgUrls[i];
      }
      this.setData({
        datas: data
      });
      await this.init();
    }
  },
});
