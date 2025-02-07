// 弹出的购买、加购物车等提示消息
import { productBuyInfo } from '../../../models/live'
import { EVENT as TLS_EVENT } from '../../../utils/tls'

const ELEMAP = {
  goods: { id: 1, type: 'text', handle: 'goodsClick', text: '善维美天然活力谷粉', style: 'padding: 0 8rpx;color: #FACD17;' },
  avtar: { id: 2,  type: 'img', handle: 'goodsClick', url: 'https://static.tojoyshop.com/images/wxapp-boss/live/wechat.png', style: 'width: 44rpx; height: 44rpx;padding-right: 12rpx;border-radius: 50%;' },
  arrow: { id: 3,  type: 'img', handle: 'goodsClick', url: 'https://static.tojoyshop.com/images/wxapp-boss/live/live-tips-arrow1.png', style: 'width: 24rpx; height: 24rpx;padding-right: 16rpx;' },
  cart: { id: 4,  type: 'img', handle: 'goodsClick',  url: 'https://static.tojoyshop.com/images/wxapp-boss/live/live-tips-cart.png', style: 'width: 30rpx; height: 30rpx;padding: 0 6rpx 0 2rpx;' },
  view: { id: 5,  type: 'text', handle: 'empty', text: '正在浏览商品', style: 'padding: 0' },
  buying: { id: 6,  type: 'text', handle: 'empty', text: '正在去买', style: 'padding: 0' },
  carting: { id: 7,  type: 'text', handle: 'empty', text: '正在添加购物车', style: 'padding-right: 4rpx' },
  share: { id: 8,  type: 'text', handle: 'empty', slot:'然文', text: '分享了直播间', style: 'padding: 0 9rpx 0 0rpx' },
  attention: { id: 9,  type: 'text', handle: 'empty', slot:'叶小', text: '关注了直播间', style: 'padding: 0 9rpx 0 0rpx' },
  shareBtn: { id: 10,  type: 'btn', handle: 'shareRoom', text: '我也分享', style: 'margin: 0 4rpx;', subClass: 'blue' },
  attentionBtn: { id: 11,  type: 'btn', handle: 'attentionRoom', text: '我也关注', style: 'margin: 0 4rpx;', subClass: 'yellow' },
  nick: { id: 12,  type: 'text', handle: 'empty', text: '', style: 'padding: 0' },
}
Component({
    properties: {},
    data: {
      liveTime: '',
      list: <any[]>[],
      hotTip: <any>null,
      wrapClass: '',
      eventList: <any[]>[],
      timer: <any>null,
      clickHandle: 'empty',
      hotClickHandle: 'empty',
      tipData: <any>{},
      hotTipData: <any>{},
      tips: ['viewGoods', 'buyingGoods', 'addCartGoods', 'share', 'attention']
    },
    lifetimes: {
      ready() {
        if (wx.$tls) {
          this.onTipsEvent()
        } else {
          wx.$bus.on(TLS_EVENT.SDK_READY,() => {
            this.onTipsEvent()
          })
        }
      }
    },
    methods: {
      onTipsEvent() {
        // 浏览商品
        wx.$tls.on(TLS_EVENT.VIEW_GOODS, (e:any) => this.emitEvent(e, this.viewGoods.bind(this)))
        // 正在购买商品
        wx.$tls.on(TLS_EVENT.BUYING_GOODS, (e:any) => this.emitEvent(e, this.buyingGoods.bind(this)))
        // 购买了商品
        wx.$tls.on(TLS_EVENT.BUY_GOODS, (e:any) => {
          // 获取下单数据
          productBuyInfo({roomId: wx.$tls.liveId, spuId: e.data.extInfo.info.spuId}).then(res => {
            this.emitEvent({
              ...e,
              productNum: res.result.productNum,
              productUvPerson: res.result.productUvPerson
            }, this.buyGoods.bind(this))
          })
        })
        // 正在添加购物车
        wx.$tls.on(TLS_EVENT.ADDCART_GOODS, (e:any) => this.emitEvent(e, this.addCartGoods.bind(this)))
        // 分享
        wx.$tls.on(TLS_EVENT.SHARE, (e:any) => this.emitEvent(e, this.share.bind(this)))
        // 关注
        wx.$tls.on(TLS_EVENT.ATTENTION, (e:any) => this.emitEvent(e, this.attention.bind(this)))
      },
      openListEmit() {
        // 每隔3秒调用队列第一个事件，并移除
        const timer = setInterval(() => {
          if (this.data.eventList.length === 0) { // 队列事件全部调用完成 清除定时器 重置数据
            clearInterval(this.data.timer)
            this.setData({ timer: null })
            this.setData({ list: [] }) // 重置常规提示
            this.setData({ hotTip: null }) // 重置热卖提示
          } else {
            let event = this.data.eventList.shift()
            this.setData({wrapClass: ''}) // 清空样式
            event.handle(event.params)
          }
        }, 3000)
        this.setData({ timer })
      },
      emitEvent(e:any, event: Function) {
        this.data.eventList.push({ handle: event, params: e })
        if (this.data.timer) return
        // 开启队列调用
        this.openListEmit()
      },
      btnHandler(e: any) {
        this.triggerEvent('btntap', e)
      },
      viewGoods({ nick, data}: any) {
        // data.extInfo.info => { name, skuId, spuId }
        ELEMAP.goods.text = data.extInfo.info.name
        ELEMAP.nick.text = nick
        this.setData({ hotTip: null })
        this.setData({clickHandle: 'goodsClick', tipData: data.extInfo.info})
        this.setData({list: [ELEMAP.nick, ELEMAP.view, ELEMAP.goods, ELEMAP.arrow]})
      },
      buyingGoods({ nick, data}: any) {
        ELEMAP.goods.text = data.extInfo.info.name
        ELEMAP.nick.text = nick
        this.setData({ hotTip: null })
        this.setData({clickHandle: 'goodsClick', tipData: data.extInfo.info})
        this.setData({list: [ ELEMAP.nick, ELEMAP.cart, ELEMAP.buying, ELEMAP.goods, ELEMAP.arrow]})
      },
      addCartGoods({ nick, data}: any) {
        ELEMAP.nick.text = nick
        this.setData({ hotTip: null })
        this.setData({clickHandle:  'goodsClick', tipData: data.extInfo.info})
        this.setData({list: [ELEMAP.nick, ELEMAP.carting, ELEMAP.cart, ELEMAP.arrow]})
      },
      buyGoods({ data, productNum, productUvPerson }: any) {
        this.setData({list: []})
        this.setData({hotClickHandle: 'hotGoodsClick', hotTipData: data.extInfo.info})
        this.setData({hotTip: { name: data.extInfo.info.name, productNum, productUvPerson }})
      },
      share({ nick }: any) {
        this.setData({ hotTip: null })
        this.setData({clickHandle:  'shareRoom'})
        this.setData({list: [{...ELEMAP.share, slot: nick}, ELEMAP.shareBtn]})
      },
      attention({ nick }: any) {
        this.setData({ hotTip: null })
        this.setData({wrapClass: 'blue'})
        this.setData({clickHandle:  'attentionRoom'})
        this.setData({list: [{...ELEMAP.attention, slot: nick}, ELEMAP.attentionBtn]})
      },
      hotGoodsClick() {
        const { skuId, spuId } = this.data.hotTipData
        this.triggerEvent('open-container', { key:'sku', next:true, payload: { skuId, spuId }})
      },
      goodsClick() {
        const { skuId, spuId } = this.data.tipData
        this.triggerEvent('open-container', { key:'sku', next:true, payload: { skuId, spuId }})
      },
      shareRoom() {
        this.triggerEvent('open-container', { key:'poster', next:true })
      },
      attentionRoom() {
        wx.$tls.attention()
      },
      empty() {}
    }
  })
