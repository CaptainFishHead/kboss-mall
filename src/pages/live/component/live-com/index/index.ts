import TLS from '../../../utils/tls';
import { getAdminAccountInfo, getRoomInfo, getRoomProductList, liveRoomData } from '../../../models/live';
import { IS, PageContainer } from "../../../models/types/common";
import { CARD_TYPE, IProduct, IProductParam, ISku } from "../../../models/types/product";
import { queryProductById } from "../../../models/product";
import { getAppInfo, htmlToWxml } from "@utils/index";
import EventBus from "../../../utils/eventBus";
// import {querySceneByBusinessId} from "../../../models/scene";
import {
  ENUM_LIVE_STATE,
  ILiveDataInfo,
  IRoomInfo,
  IRoomProduct,
  IRoomProductParam,
  ISource
} from "../../../models/types/live";
import { SCENE_TYPE, track, TrackEventName } from "@utils/sa";
import { STORAGE_USER_FOR_KEY } from '@const/index';
import ENV from "@config/env";

const LOCAL_LIKE_NUMBER = `LOCAL_LIKE_NUMBER`

interface ILocalLike {
  roomId: string | number,
  likeCount: number
}

// 错误编码几率 10017  10015
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },
  properties: {
    liveRoomId: {
      type: String,
      value: '',
      observer() {
      }
    },
    businessId: {
      type: String,
      value: '',
      observer() {
      }
    },
    timSdk: {
      type: Object,
      value: {},
      observer() {
      }
    },
    isCustomBack: {
      type: Boolean, value: false
    }
  },
  data: {
    roomId: <string>'', // 直播间ID
    roomInfo: <IRoomInfo>{}, // 直播间信息
    // businessId: <string>'', // 业务id
    starttime: 0,
    baseMember: <any>{}, // 私有基础用户信息
    timUserInfo: {}, // tim用户信息
    groupInfo: {}, // tim聊天群组信息
    groupID: <string>'', // tim聊天室id 191001710130 191001710124 191001710152
    pullSrc: <string>'',   // 拉流地址
    loading: true,
    product: <IProduct>{},
    sku: <ISku>{ skuPriceVo: {} },
    pageContainer: <PageContainer>{ visible: false, key: 'sku' },
    CARD_TYPE,
    notification: <string>'', // 公告
    decorateList: [], // 装饰列表
    liveState: <ENUM_LIVE_STATE>ENUM_LIVE_STATE.PENDING, // 直播间状态 0未直播 1 直播中 2 直播结束 3直播取消 4 直播暂停 5 直播间拥挤（前端自定义） 6 直播间加载失败（前端自定义） 7 直播间不存在（前端自定义）
    productList: <IRoomProduct[]>[], //直播间商品列表
    customData: <ILiveDataInfo>{}, // 人气值等数据 简单的直播间数据
    defaultHead: "https://static.tojoyshop.com/images/wxapp-boss/mine/default.png?v=3.0.0",
    defaultLogo: 'https://static.tojoyshop.com/images/wxapp-boss/logo-cir-2.png?v=1.0.0',
    // 用于商品包定位
    activeSpuId: <string>'',
    ENUM_LIVE_STATE,
    isUpdate: false,
    appInfo: {},
    statusBarHeight: 0,
    isJoinRoom: false
  },
  pageLifetimes: {
    show() {
      // 更新直播间信息 第一次不更新之后的每一次onshow更新
      this.data.isUpdate && this.updateRoomInfo();
      this.setData({ isUpdate: true })
      this.clearPageContainer()
			const appInfo = getAppInfo()
      this.setData({ appInfo })
    }
  },
  lifetimes: {
    attached() {
      wx.$bus = new EventBus()
    },
    ready() {
      wx.getSystemInfo().then((res) => {
        this.setData({
          statusBarHeight: res.statusBarHeight
        })
      })
      this.initLive({ id: this.data.liveRoomId, businessId: this.data.businessId })
    }
  },
  methods: {
    async initLive(options: { id: any; businessId: any; }) {
      const baseMember = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {
        nickName: '',
        avatarUrl: ''
      }
      this.setData({ baseMember })

      const params: IRoomProductParam = { roomId: options.id } as IRoomProductParam
      // if (options.businessId) {
      // 	const {result} = await querySceneByBusinessId({businessId: options.businessId})
      // 	if (result.livingId) params.roomId = result.livingId
      // }
      if (params.roomId) {
        await this.initLocalLikeByRoomId(params.roomId)
        this.setData({ ...params, starttime: new Date().getTime() });
        this.getData(params)
      }
      const appInfo = getAppInfo()
      this.setData({ appInfo })
    },
    // 获取本地点赞数据
    async initLocalLikeByRoomId(roomId: string | number): Promise<null | void> {
      if (!roomId) return null
      const { customData } = this.data
      const localLikes = wx.getStorageSync<ILocalLike[]>(LOCAL_LIKE_NUMBER) || []
      const likeInfo = (localLikes.find(like => `${like.roomId}` === `${roomId}`) || { likeCount: 0 })
      this.setData({ customData: { ...customData, likeCount: likeInfo.likeCount } })
    },
    updateLocalLikeByRoomId(likeCount: number) {
      const { roomInfo } = this.data
      const localLikes = wx.getStorageSync<ILocalLike[]>(LOCAL_LIKE_NUMBER) || []
      const localLike = localLikes.find(like => `${like.roomId}` === `${roomInfo.roomId}`)
      if (localLike) {
        localLike.likeCount = likeCount
      } else {
        localLikes.push({ roomId: roomInfo.roomId, likeCount: likeCount })
      }
      wx.setStorageSync(LOCAL_LIKE_NUMBER, localLikes)
    },
    // 重新加载直播间：退出im，清空拉流 重新获取数据初始化im，并拉流
    reloadRoom() {
      this.setData({ loading: true, pullSrc: '' });
      this.exitRoom()
      wx.nextTick(() => {
        this.getData({ roomId: this.data.roomId })
      })
    },
    async getData(params: IRoomProductParam) {
      // 直播间信息
      await this.initRoomInfo(params)
      // 统计数据
      this.getLiveData(params)
    },
    /* 获取直播间信息 */
    async initRoomInfo(params: IRoomProductParam) {
      const { result } = await getRoomInfo(params).catch(() => {
        this.setData({ liveState: ENUM_LIVE_STATE.LOADING_FAIL, loading: false })
      })
      const { pullStreamUrl, liveState, tencentGroupId } = result;
      this.setData({
        loading: false,
        pullSrc: `rtmp://${pullStreamUrl}`,
        liveState,
        groupID: tencentGroupId,
        roomInfo: result,
        decorateList: result.imRoomConfigQueryVo.liveRoomConfigImgList
      });
      this.triggerEvent('init', { ...result })
      // 获取完groupID后 开始初始化TLS 直播预告、直播中、暂停都初始化
      if (liveState === ENUM_LIVE_STATE.PENDING || liveState === ENUM_LIVE_STATE.LIVING || liveState === ENUM_LIVE_STATE.PAUSE) {
        if (!wx.$tls) {
          this.initTLS()
        }
      }
    },
    /* 预告状态进入直播状态 重新获取直播间信息 解决装饰图不展示问题 */
    updateRoomInfo() {
      getRoomInfo({
        roomId: this.data.roomId
      })
        .then(({ result }) => {
          this.setData({
            decorateList: result.imRoomConfigQueryVo.liveRoomConfigImgList,
            roomInfo: result
          });
        })
        .catch((err: Error) => {
          console.log('直播间更新error：', err)
        })
    },
    // 获取直播间 人气 点赞等统计数据
    getLiveData(params: IRoomProductParam) {
      wx.nextTick(() => {
        if (this.data.liveState !== ENUM_LIVE_STATE.CANCEL) {
          liveRoomData(params).then(({ result }) => {
            const { customData } = this.data
            const likeCount = Math.max(customData.likeCount || 0, result.likeCount)
            this.setData({ customData: Object.assign({}, { ...customData }, { ...result, likeCount }) })
          })
        }
      })
    },
    async initTLS() {
      // 获取im用户签名和用户id
      const { mobile } = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
      const { result } = await getAdminAccountInfo({ mobile, source: ISource.BHMAIL })
      wx.$tls = new TLS({
        TIM: this.data.timSdk,
        SDKAppID: ENV.IM_SDK_APPID, // im SDKAPPID
        roomInfo: this.data.roomInfo, // 业务端房间信息
        roomID: this.data.groupID, // im 房间id
        liveId: this.data.roomInfo.roomId, // 业务房间id
        liveTitle: this.data.roomInfo.title, // 业务房间名字
        userSig: result.userSign, // 用户签名
        userName: result.userAccount, // im 用户id
        // 自定义群组信息字段 是否添加 直播间点赞数量（like_num）、推荐商品列表(goods_list)
        // 类似成员和群主是否添加关注和粉丝 等用户自定义字段
        groupCustomFieldFilter: [], // 正在讲解的商品、房间状态
      })
      wx.$tls.on(TLS.EVENT.SDK_READY, this.sdkReady.bind(this))
    },
    sdkReady() {
      const livePlayerContext = wx.createLivePlayerContext('live-player')
      wx.$tls.tim.updateMyProfile({
        nick: this.data.baseMember.nickName || (this.data.baseMember.mobile ? '康店用户' + this.data.baseMember.mobile.substring(7, 11) : '未知用户'),
        avatar: this.data.baseMember.avatarUrl || this.data.defaultHead
      })
      // 加入聊天室
      this.joinRoom()
      // 获取商品列表展示讲解商品
      this.getRoomProductList()
      // 开启评论
      wx.$tls.on(TLS.EVENT.OPEN_CHAT, () => this.setRoomInfo({ isComment: 1 }))
      // 关闭评论
      wx.$tls.on(TLS.EVENT.CLOSE_CHAT, () => this.setRoomInfo({ isComment: 0 }))
      // 开启点赞
      wx.$tls.on(TLS.EVENT.OPEN_LIKE, () => this.setRoomInfo({ isLike: 1 }))
      // 关闭点赞
      wx.$tls.on(TLS.EVENT.CLOSE_LIKE, () => this.setRoomInfo({ isLike: 0 }))
      // 开启购物袋
      wx.$tls.on(TLS.EVENT.OPEN_SHOP, () => this.setRoomInfo({ isSelf: 1 }))
      // 关闭购物袋
      wx.$tls.on(TLS.EVENT.CLOSE_SHOP, () => this.setRoomInfo({ isSelf: 0 }))
      // 开启分享
      wx.$tls.on(TLS.EVENT.OPEN_SHARE, () => {
        this.setRoomInfo({ isShare: 1 });
        // this.setShareMenu(true)
      })
      // 关闭分享
      wx.$tls.on(TLS.EVENT.CLOSE_SHARE, () => {
        this.setRoomInfo({ isShare: 0 });
        // this.setShareMenu(false)
      })
      // 开始直播
      wx.$tls.on(TLS.EVENT.LIVE_START, () => {
        this.setData({ liveState: ENUM_LIVE_STATE.LIVING });
        this.updateRoomInfo();
        this.triggerEvent('liveStateChange', { liveState: ENUM_LIVE_STATE.LIVING })
      })
      // 暂停直播
      wx.$tls.on(TLS.EVENT.LIVE_PAUSE, () => {
        console.log('~~~~暂停直播')
        try {
          livePlayerContext.pause()
        } catch (e) {
          console.error(`livePlayerContext.exitPictureInPicture`, e)
        }
        this.setData({ roomInfo: { ...this.data.roomInfo, livePausedTime: '' } })
        this.setData({ loading: false, liveState: ENUM_LIVE_STATE.PAUSE })
        // this.setData({liveState: 4, roomInfo: { ...this.data.roomInfo, livePausedTime: String(new Date().valueOf()) }})
        this.updateRoomInfo()
        this.triggerEvent('liveStateChange', { liveState: ENUM_LIVE_STATE.PAUSE })
      })
      // 取消直播
      wx.$tls.on(TLS.EVENT.LIVE_FINISH, () => {
        // 直播预告的解散事件为 直播取消
        if (this.data.liveState === ENUM_LIVE_STATE.PENDING) {
          this.clearPageContainer()
          wx.$tls.destroy();
          wx.$tls = undefined
          console.log('~~~~~直播取消了')
          this.setData({ liveState: ENUM_LIVE_STATE.CANCEL })
          this.triggerEvent('liveStateChange', { liveState: ENUM_LIVE_STATE.CANCEL })
        }
      })
      // 直播结束 不是从0 和 3过来的解散事件都是直播结束（直播中和直播暂停的解散事件）
      wx.$tls.on(TLS.EVENT.LIVE_FINISH, () => {
        if (this.data.liveState !== ENUM_LIVE_STATE.PENDING && this.data.liveState !== ENUM_LIVE_STATE.CANCEL) {
          this.getLiveData({ roomId: this.data.roomId })
          this.clearPageContainer()
          wx.$tls.destroy();
          wx.$tls = undefined
          this.setData({ liveState: ENUM_LIVE_STATE.FINISH })
          this.triggerEvent('liveStateChange', { liveState: ENUM_LIVE_STATE.FINISH })
        }
      })
      // 恢复直播
      wx.$tls.on(TLS.EVENT.LIVE_RESUME, () => {
        try {
          livePlayerContext.resume()
        } catch (e) {
          console.error(`livePlayerContext.exitPictureInPicture`, e)
        }
        this.setData({ liveState: ENUM_LIVE_STATE.LIVING })
        this.triggerEvent('liveStateChange', { liveState: ENUM_LIVE_STATE.LIVING })
      })
      // 监听人气值等消息
      wx.$tls.on(TLS.EVENT.ROOM_CUSTOM_DATA_CHANGE, (data: { value: any; }) => {
        wx.nextTick(() => {
          const { customData } = this.data
          const { likeCount } = data.value
          this.setData({
            customData: {
              // ...data.value, likeCount: Math.max(likeCount || 0, customData.likeCount)
              ...Object.assign({}, { ...customData }, {
                ...data.value,
                likeCount: Math.max(likeCount || 0, customData.likeCount)
              })
            }
          });
        })
      })
      // 监听公告
      wx.$tls.on(TLS.EVENT.NOTIFACATION, ({ notification }: { notification: string }) => {
        this.setData({ notification });
      })
      // // 获取直播间 人气 点赞等统计数据  暂时注释 用getLiveData获取这些数据了
      // if (groupInfo.groupCustomField && groupInfo.groupCustomField.length) {
      // 	const customData = groupInfo.groupCustomField.filter((item: { key: TLS_EVENT; }) => item.key === TLS.EVENT.ROOM_CUSTOM_DATA_CHANGE);
      // 	try {
      // 		customData.length && this.setData({customData: JSON.parse(customData[0].value)});
      // 	} catch (error) {}
      // }
      wx.$tls.on(TLS.EVENT.LIKE, (e: { data: { extInfo: { number: number; }; }; }) => {
        const { customData } = this.data
        const likeCount = customData.likeCount + e.data.extInfo.number
        this.updateLocalLikeByRoomId(likeCount)

        this.setData({
          customData: {
            ...customData,
            likeCount
          }
        })
      })
      //获取主播信息
      // const { ownerInfo } = groupInfo;
      // const { userID, nick, avatar } = ownerInfo
    },
    joinRoom() {
      wx.$tls.joinRoom().then(({ userInfo, groupInfo }: any) => {
        // 发布一个sdk初始化完毕的事件，相关的TLS事件才可以订阅 类似发布群消息等
        wx.$bus.emit(TLS.EVENT.SDK_READY)
        console.log('groupInfo~~~~~~', groupInfo)
        this.setData({ timUserInfo: userInfo, groupInfo, notification: groupInfo.notification, isJoinRoom: true })
      }).catch((err: Error) => {
        if (String(err) === 'Error: invalid group id') {
          this.setData({ liveState: ENUM_LIVE_STATE.NOT_EXIST })
        } else {
          this.setData({ liveState: ENUM_LIVE_STATE.LOADING_FAIL })
        }
      })
    },
    setRoomInfo(obj: object) {
      Object.assign(this.data.roomInfo.imRoomConfigQueryVo, obj)
      this.setData({ roomInfo: this.data.roomInfo })
    },
    exitRoom() {
      // 清除拉流地址
      this.setData({ pullSrc: '' })
      if (wx.$tls) {
        // 退出群聊
        wx.$tls.exitRoom()
        // 登出即时通信 IM，通常在切换帐号的时候调用，清除登录态以及内存中的所有数据。
        // wx.$tls.tim.logout()
        // 销毁 SDK 实例。SDK 会先 logout，然后断开 WebSocket 长连接，并释放资源。
        wx.$tls.destroy();
        wx.$tls = undefined
      }
      const { roomInfo, starttime } = this.data;
      const endtime = new Date().getTime();
      track(TrackEventName.Sdk_Live_Detail, {
        detail_id: roomInfo.roomId,
        live_name: roomInfo.title,
        starttime,
        endtime,
        cycle_time: Math.floor((endtime - starttime) / 1000),
        sceneType: SCENE_TYPE.LIVE
      })
    },
    async loadProduct(param: IProductParam) {
      const { result } = await queryProductById(param)
      result.spuContent = htmlToWxml(result.spuContent)
      this.setData({
        product: result,
        sku: param.skuId ? result.skuVoList.find(
          (item) => (item.skuId === param.skuId)
        ) : result.skuVoList.find(
          item => item.stockNums >= (item.sinceMin || 0)
        ) || { ...result.skuVoList[0] }
      })
    },
    goCart() {
      this.triggerEvent('goCart')
    },
    goOrder() {
      this.triggerEvent('goOrder')
    },
    onContact() {
      this.triggerEvent('contact')
    },
    nextAction(e: { detail: PageContainer }) {
      if (e.detail.key === 'pack') { // 购物袋
        this.getRoomProductList()
        this.openPageContainer(e.detail)
      } else if (e.detail.key === 'poster') { // 分享
        const { roomInfo, baseMember } = this.data
        this.triggerEvent('share', { title: roomInfo.title, coverUrl: roomInfo.coverUrl, baseMember })
      } else if (e.detail.key === 'sku') {
        const { payload = {} } = e.detail
        const { appId } = getAppInfo()
        this.triggerEvent('goBuy', {
          spuId: payload.spuId || payload.skuId,
          skuId: payload.skuId,
          position: 'live',
          targetId: appId
        })
      } else {
        this.openPageContainer(e.detail)
      }
    },
    tapAction(e: { currentTarget: { dataset: PageContainer }; }) {
      this.nextAction({ detail: e.currentTarget.dataset })
    },
    openPageContainer(e: PageContainer) {
      const pageContainer: PageContainer = e
      pageContainer.visible = true
      this.setData({
        pageContainer,
        activeSpuId: (this.data.productList.find(product => product.isExplain === IS.YES) || {}).spuId
      })
    },
    closePageContainer() {
      this.setData({
        pageContainer: { ...this.data.pageContainer, visible: false }
      })
    },
    clearPageContainer() {
      this.setData({
        pageContainer: { visible: false, key: '' }
      })
    },
    onJoinSmallRoom() {
      console.log('LIVE-进入小窗')
    },
    onExitSmallRoom() {
      // this.setData({ pullSrc: '', loading: true })
      // setTimeout(() => {
      //   const { roomInfo } = this.data;
      //   this.setData({ pullSrc: `rtmp://${roomInfo.pullStreamUrl}`, loading: false })
      // }, 0)
    },
    // 监听拉流状态
    onStatechange(e: { detail: { code: any; }; }) {
      const { code } = e.detail;
      const { liveState } = this.data
      switch (code) {
        case 2001 || 2002 || 2008 || 2007 || 2103 || 3005:
          // this.setData({loading: true});
          break;
        case 2004 || 2003 || 2105:
          this.setData({ loading: false });
          break;
        // case 2030:
        //   console.log('音频设备发生改变，即当前的输入输出设备发生改变，比如耳机被拔出');
        //   break;
        case -2301:
          if (liveState === ENUM_LIVE_STATE.LIVING) {
            // this.reloadRoom()
            this.setData({ liveState: ENUM_LIVE_STATE.BLOCK, loading: false })
          }
          break
        case -2302:
          if (this.data.liveState === 1) {
            this.setData({ liveState: ENUM_LIVE_STATE.BLOCK, loading: false })
          }
          break;
        case 3002 || 3001 || 3003:
          this.setData({ liveState: ENUM_LIVE_STATE.LOADING_FAIL, loading: false })
          break;
        // case 6000 || 2033: // 拉流被挂起，在播放页的下一个页面关闭小窗触发
        // 	console.log('捕捉拉流被挂起～～～～')
        // 	this.setData({loading: true, pullSrc: ''});
        // 	break
      }
    },
    async getRoomProductList() {
      const { result } = await getRoomProductList({ roomId: this.data.roomId })
      let productList: IRoomProduct[] = result.filter(item => item.isHidden === 0)
      this.setData({ productList })
    },
    catchBack() {
      this.triggerEvent(`on-back`)
    }
  }
})
