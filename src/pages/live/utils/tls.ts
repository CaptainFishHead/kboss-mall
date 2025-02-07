
import EventBus from './eventBus'
// import { IMessage } from './tim'
import { TOAST_TYPE } from "@const/index";
import { showToast } from "@components/toast/index";
// import TIM from 'tim-wx-sdk';
import { IRoomInfo } from '../models/types/live';

/**
 * TIM—LIVE-SELLS (TLS)
 * TIM二次封装
 * 封装直播带货场景下的TIM
 */

// 热度、点赞数量、讲解商品、直播间状态存储？

// 直播事件类型
export enum EVENT {
  "OPEN_CHAT" = "OPEN_CHAT", // 开启聊天【自定义消息】
  "CLOSE_CHAT" = "CLOSE_CHAT", // 关闭聊天【自定义消息】
  "OPEN_SHOP" = "OPEN_SHOP", // 开启购物袋【自定义消息】
  "OPEN_BANNED" = "OPEN_BANNED", // 禁言某一个用户【自定义消息】
  "CLOSE_BANNED" = "CLOSE_BANNED", // 关闭禁言某一个用户【自定义消息】
  "CLOSE_SHOP" = "CLOSE_SHOP", // 关闭购物袋【自定义消息】
  "OPEN_SHARE" = "OPEN_SHARE", // 开启分享【自定义消息】
  "CLOSE_SHARE" = "CLOSE_SHARE", // 关闭分享【自定义消息】
  "LIKE" = "LIKE", // 点赞【自定义消息】 /
  "OPEN_LIKE" = "OPEN_LIKE", // 开启点赞【自定义消息】
  "CLOSE_LIKE" = "CLOSE_LIKE", // 关闭点赞【自定义消息】
  "VIEW_GOODS" = "VIEW_GOODS", // 浏览商品【自定义消息】 /
  "BUY_GOODS" = "BUY_GOODS", // 购买商品 【自定义消息】 /
  "BUYING_GOODS" = "BUYING_GOODS", // 正在购买商品【自定义消息】 /
  "ADDCART_GOODS" = "ADDCART_GOODS", // 添加购物车【自定义消息】 /
  "START_EXPLAIN" = "START_EXPLAIN", // 讲解商品【自定义消息】
  "FINISH_EXPLAIN" = "FINISH_EXPLAIN",  //结束讲解【自定义消息】
  "CLOSE_TOP" = "CLOSE_TOP",  //讲解置顶【自定义消息】
  "OPEN_TOP" = "OPEN_TOP",  //取消讲解置顶【自定义消息】
  "SHARE" = "SHARE", // 分享 【自定义消息】 /
  "ATTENTION" = "ATTENTION", // 关注 【自定义消息】 /
  "LIVE_START" = "LIVE_START", // 直播开始【自定义消息】
  "LIVE_PAUSE" = "LIVE_PAUSE", // 直播暂停【自定义消息】
  "LIVE_CANCEL" = "LIVE_CANCEL", // 直播取消【自定义消息】
  "LIVE_FINISH" = "LIVE_FINISH", // 直播结束【系统提示消息】
  "LIVE_RESUME" = "LIVE_RESUME", // 直播恢复【自定义消息】
  "ROOM_CUSTOM_DATA_CHANGE" = "room_data", // 直播间自定义群资料变化 【自定义群资料修改】
  // "ROOM_STATUS_CHANGE" = "ROOM_STATUS_CHANGE", // 房间状态变化 未开播/直播中/直播暂停/直播结束 等 【自定义消息】

  "SDK_READY" = "SDK_READY", // sdk初始化完毕
  "SDK_NOT_READY" = "SDK_NOT_READY", // SDK 进入 not ready 状态通知事件
  "JOIN_GROUP" = "JOIN_GROUP", // 加入房间
  "EXIT_GROUP" = "EXIT_GROUP", // 退出房间
  "NOTIFACATION" = "NOTIFACATION", // 公告修改 修改房间信息 【资料变更】
  "INTRODUCTION" = "INTRODUCTION", // 修改群名和介绍事件【资料变更】
  "PROFILE_UPDATE" = "PROFILE_UPDATE",// 自己或好友的资料变更事件
  "SHUTUP" = "SHUTUP", // 禁言 【群成员资料变更】
  "RELEASE_SHUTUP" = "RELEASE_SHUTUP", // 解除禁言 【群成员资料变更】
  "MESSAGE" = "MESSAGE", // 消息
  "TEXT_MESSAGE" = "TEXT_MESSAGE", // 文本消息
  "ERROR" = "ERROR", // 消息错误
  "KICKED" = "KICKED", // 被踢出房间
  // "GROUP_DISSOLVE" = "GROUP_DISSOLVE", // 群组被解散
  "NETWORK_CHANGE" = "NETWORK_CHANGE", // 网络变化
  "SYSTEM_NORMAL_MESSAGE" = "SYSTEM_NORMAL_MESSAGE", // 系统消息
}

interface INITCONFIGINTERFACE {
  TIM: object,
  SDKAppID: number,
  userSig: string,
  liveId?: string,
  liveTitle?: string,
  roomID?: string,
  userName: string,
  roomInfo: IRoomInfo,
  groupCustomFieldFilter: string[]
}

// interface JOINROOMSETTING {
//   getOwnerInfo: boolean,
//   roomID: string
// }
//
// // 根据key获取数组中某一项的value
// const _getVarsByKey = (arr: Array<any>, key: string) => {
//   let res
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i].key === key) {
//       res = arr[i].value;
//       break;
//     }
//   }
//   return res
// }

export default class TLS {

  static EVENT = EVENT

  constructor(initConfig: INITCONFIGINTERFACE) {
    this.initComponentMemberValue(initConfig)
    this.initIMSDK(initConfig)
  }
  tim: any = null //tim的实例对象
  userName: string = ''
  userSig: string = ''
  SDKAppID: number = 0
  roomID: string = ''
  groupCustomFieldFilter:string[] = []
  userInfo: any = {}
  groupInfo: any = {}
  roomInfo: IRoomInfo = <IRoomInfo>{}
  isSdkReady: boolean = false
  TIM: any
  eventBus = new EventBus()
  // 初始化sdk
  private initIMSDK(initConfig: INITCONFIGINTERFACE) {
    return new Promise((resolve, reject) => {
      // this.TIM = TIM
      this.groupCustomFieldFilter = initConfig.groupCustomFieldFilter
      this.tim = this.TIM.create({
        SDKAppID: initConfig.SDKAppID,
        scene: 'tls'
      })
      // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
      // this.tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
      this.tim.setLogLevel(1); // release级别，SDK 输出关键信息，生产环境时建议使用
      // 微信小程序环境，注册 COS SDK
      //tim.registerPlugin({'cos-wx-sdk': COS}); // 微信小程序环境请取消本行注释，并注释掉 tim.registerPlugin({'cos-js-sdk': COS});
      // 监听事件，如：
      // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
      // event.name - TIM.EVENT.SDK_READY 登陆成功才会驱动 SDK 触发 SDK_READY 事件
      this.tim.on(this.TIM.EVENT.SDK_READY, this.sdkReady.bind(this));
      // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
      // event.name - TIM.EVENT.MESSAGE_RECEIVED
      // event.data - 存储 Message 对象的数组 - [Message]
      this.tim.on(this.TIM.EVENT.MESSAGE_RECEIVED, this.messageReceived.bind(this));
      // 收到自己或好友的资料变更通知
      // event.name - TIM.EVENT.PROFILE_UPDATED
      // event.data - 存储 Profile 对象的数组 - [Profile]
      this.tim.on(this.TIM.EVENT.PROFILE_UPDATED, this.profileUpdate.bind(this));
      // 收到 SDK 发生错误通知，可以获取错误码和错误信息
      // event.name - TIM.EVENT.ERROR
      // event.data.code - 错误码
      // event.data.message - 错误信息
      this.tim.on(this.TIM.EVENT.ERROR, this.error.bind(this));
      // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
      // event.name - TIM.EVENT.SDK_NOT_READY
      this.tim.on(this.TIM.EVENT.SDK_NOT_READY, this.sdkNotReady.bind(this));
      // 收到被踢下线通知
      // event.name - TIM.EVENT.KICKED_OUT
      // event.data.type - 被踢下线的原因，例如 :
      //   - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
      //   - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
      //   - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢（v2.4.0起支持）。
      this.tim.on(this.TIM.EVENT.KICKED_OUT, this.kicked.bind(this));
      // 网络状态发生改变（v2.5.0 起支持）。
      // event.name - TIM.EVENT.NET_STATE_CHANGE
      // event.data.state 当前网络状态，枚举值及说明如下：
      //   - TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
      //   - TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
      //   - TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
      this.tim.on(this.TIM.EVENT.NET_STATE_CHANGE, this.networkChange.bind(this));

      this.tim.login({
        userID: this.userName,
        userSig: this.userSig
      }).then((loginRes:any) => {
        if (loginRes) {
          console.log('【im消息 】当前用户登陆成功~~~~~~~', loginRes)
          if (loginRes.data.repeatLogin) { // 登陆成功回自动触发sdkReady事件，如果重复登录需要手动触发sdkReady
            this.sdkReady()
          }
          resolve(loginRes)
        } else {
          reject('im登录失败')
        }
      }).catch((err: any) => {
        reject(err)
      })
    })
  }
  // 销毁sdk
  public async destroy() {
    this.tim.destroy()
    this.eventBus.events = {}
  }
  public async getMessageList(roomId: string = '') {
    return await this.tim.getMessageList({conversationID: `GROUP${ roomId || this.roomID}`})
  }
  //判断是否是admin主播
  public isAdminOwner(from: string) {
    // ownerID/anchorUserId im房间群主id（开播端主播id）
    // return from === this.groupInfo.ownerID || from.includes(this.roomInfo.anchorUserId) || from.includes('Open_Admin')
    return from.includes('Open_Admin') // 渠道端主播id
  }
  //判断是否是主播账号 包含admin主播 主播端im主播
  public isOwner(from: string) {
    // ownerID/anchorUserId im房间群主id（开播端主播id）
    return from === this.groupInfo.ownerID || from.includes(this.roomInfo.anchorImAccount) || from.includes('Open_Admin')
  }
  /**
   * 接收消息
   * @param { Object event }
   * @param { String event.type } 消息类型，如TIMGroupTipElem表示群提示消息
   * @param { Object event.payload } 消息内容，基于不同的type，对应的payload返回数据有所不同，有部分如群消息还需要根据operationType来区分处理，具体参考文档Message相关信息
   * @return { void }
   *
   */
  private async messageReceived(event:any) {
    const data = event.data
    for (let i in data) {
      // console.log('第一时间接收的消息payload～～～～', data[i].payload)
      const item = data[i];
      const payload = item.payload;
      const operationType = payload.operationType;

      // 群提示消息，广播
      if (item.type === "TIMGroupTipElem") {
        // 成员加群
        if (operationType === 1) {
          const res = {
            nick: item.nick,
            avatar: item.avatar,
            userID: payload.operatorID,
            isOwner: this.isOwner(payload.operatorID),
            ID: item.ID
          }
          this.eventBus.emit(EVENT.JOIN_GROUP, res)
        }
        // 成员退群
        if (operationType === 2) {
          const res = {
            nick: item.nick,
            avatar: item.avatar,
            userID: payload.operatorID
          }
          this.eventBus.emit(EVENT.EXIT_GROUP, res)
        }
        //修改了群资料
        if (operationType === 6) {
          //修改了群资料自定义字段
          if (payload.newGroupProfile.groupCustomField && payload.newGroupProfile.groupCustomField.length) {
            const key = payload.newGroupProfile.groupCustomField[0].key
            let value
            try {
              value = JSON.parse(payload.newGroupProfile.groupCustomField[0].value)
            } catch (error) {
              value = payload.newGroupProfile.groupCustomField[0].value
            }
            this.eventBus.emit(key, {
              nick: item.nick,
              avatar: item.avatar,
              userID: item.from,
              value: value
            })
          }
          //修改了群公告 TODO: 是否存在此逻辑，有notification字段？
          if (payload.newGroupProfile.notification || payload.newGroupProfile.notification === '') {
            this.eventBus.emit(EVENT.NOTIFACATION, {
              notification: payload.newGroupProfile.notification
            })
          }
          // 修改群名和介绍
          if (payload.newGroupProfile && payload.newGroupProfile.name) {
            this.eventBus.emit(EVENT.INTRODUCTION, {
              name: payload.newGroupProfile.name,
              introduction: payload.newGroupProfile.introduction
            })
          }
        }
      } else if (data[i].type === 'TIMTextElem') {
        //普通消息
        const res = {
          nick: data[i].nick,
          avtar: data[i].avatar,
          message: data[i].payload.text,
          userID: data[i].from,
          atUser: null, // 用户信息对象
          isOwner: this.isOwner(data[i].from), // this.isAdminOwner(data[i].from),
          ID: data[i].ID,
          isPrivate: false // 是否私密消息 回复atUser时使用
        }
        if (data[i].atUserList[0]) {
          const userInfo = await this.getUserInfoByID(data[i].atUserList[0])
          userInfo.nick = userInfo.nick || data[i].atUserList[0]
          userInfo.userId = data[i].atUserList[0]
          res.atUser = userInfo
        }
        try {
          res.isPrivate = JSON.parse(data[i].cloudCustomData).isPrivate
        } catch (error) {}
        this.eventBus.emit(EVENT.TEXT_MESSAGE, res)
        this.eventBus.emit(EVENT.MESSAGE, data[i]) // 同时发布一个通用消息
      } else if (data[i].type === "TIMCustomElem") {
        let customData = JSON.parse(data[i].payload.data)
        const ret = {
          nick: data[i].nick,
          avatar: data[i].avatar,
          userID: data[i].from,
          data: customData,
          // description: data[i].payload.description,
          // extension: data[i].payload.extension,
        }
        this.eventBus.emit(customData.type, ret); // 发布自定义消息
        this.eventBus.emit(EVENT.MESSAGE, data[i]); // 同时发布一个通用消息 可能没必要
      } else if (data[i].type === 'TIMGroupSystemNoticeElem') {
        if (operationType === 5) { // 群组被解散
          this.eventBus.emit(EVENT.LIVE_FINISH, data[i])
        } else {
          try {
            const { type, msg } = JSON.parse(payload.userDefinedField)
            this.eventBus.emit(type, { msg })
          } catch (err) {
            this.eventBus.emit(EVENT.MESSAGE, data[i])
          }
        }
      } else {
        this.eventBus.emit(EVENT.MESSAGE, data[i])
      }
    }
  }
  // 发送文本消息
  public sendMessage(msg: string, option={}, isDistributionSelf: boolean = true) {
    return new Promise((resolve, reject) => {
      let message = this.tim.createTextMessage({
        to: this.roomID,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
        // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
        // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
        ...option, // 其他消息配置项
        payload: {
          text: msg,
          a: 2
        }
      });
      this.tim.sendMessage(message).then((senRes: any) => {
        if (senRes.code === 0) {
          let ret = {
            nick: this.userInfo.nick,
            avatar: this.userInfo.avatar,
            userID: this.userInfo.userID,
            message: msg,
            ID: message.ID,
            isOwner: this.isOwner(this.userInfo.userID),
          }
          // 是否分发自己发送的消息给自己（自己消息上屏）
          if (isDistributionSelf) {
            this.eventBus.emit(EVENT.TEXT_MESSAGE, ret);
            this.eventBus.emit(EVENT.MESSAGE, ret);
          }
          resolve(ret)
        } else {
          // console.log('~~~~~~~~发送消息报错', senRes)
          reject(senRes)
        }
      }).catch((err:any) => {
        errHandle(err, reject, true)
      })
    })
  }
  // 发送自定义消息
  public sendCustomMsgAndEmitEvent(type: string, extInfo: object, config?: { isLocal?: boolean, priority?: string  }) {
    const data =  JSON.stringify({ type, extInfo })
    const message = this.tim.createCustomMessage({
      to: this.roomID,
      conversationType: this.TIM.TYPES.CONV_GROUP,
      priority: config?.priority || this.TIM.TYPES.MSG_PRIORITY_HIGH,
      payload: {
        data: data
      }
    })
    const res = {
      nick: this.userInfo.nick,
      avatar: this.userInfo.avatar,
      data: { type, extInfo },
      userID: this.userInfo.userID,
    }
    return new Promise((resolve, reject) => {
      if (!config?.isLocal) {
        // console.log('发送了自定义消息', message)
        this.tim.sendMessage(message).then(() => {
          resolve(res)
          this.eventBus.emit(type, res) // 通知当前应用
        }).catch((err:any) => {
          // console.log('~~~~~~~~发送自定义消息报错', err)
          errHandle(err, reject)
        })
      } else {
        resolve(res)
        this.eventBus.emit(type, res) // 通知当前应用
      }
    })
  }
  // 点赞 { number: 1, type: 表情类型 }
  public async like(data: any = {}) {
    data.number = 1
    return this.sendCustomMsgAndEmitEvent(EVENT.LIKE, data, { priority: this.TIM.TYPES.MSG_PRIORITY_LOWEST})
  }
  public async explain(data: any = {}, isLocal: boolean = true) {
    return this.sendCustomMsgAndEmitEvent(EVENT.START_EXPLAIN, data, { isLocal })
  }
  // 购买商品 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
  public async buy(data: any = {}) {
    return this.sendCustomMsgAndEmitEvent(EVENT.BUY_GOODS, { detailId: data.spuId, info: data })
    // return new Promise<void>((resolve, reject) => {
    //   setTimeout(async ()=>{
    //     try {
    //       await this.sendCustomMsgAndEmitEvent(EVENT.BUY_GOODS, { detailId: data.spuId, info: data })
    //       resolve()
    //     } catch (e) {
    //       reject(e)
    //     }
    //   },30000)
    // } )
  }
  // 正在购买商品 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
  public async buying(data: any = {}) {
    return this.sendCustomMsgAndEmitEvent(EVENT.BUYING_GOODS, { detailId: data.spuId, info: data })
  }
  // 正在浏览商品 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
  public async viewGoods(data: any = {}) {
    return this.sendCustomMsgAndEmitEvent(EVENT.VIEW_GOODS, { detailId: data.spuId, info: data })
  }
  // 正在添加购物车 {  name: '传商品名称' , spuId: '传商品spuid' , skuId: '传商品skuid'}
  public async addCartGoods(data: any = {}) {
    return this.sendCustomMsgAndEmitEvent(EVENT.ADDCART_GOODS, { detailId: data.spuId, info: data })
  }
  // 分享
  public async share(data: any = {}) {
    return this.sendCustomMsgAndEmitEvent(EVENT.SHARE, data)
  }
  // // 关注
  // public attention(data: any = {}) {
  //   return this.sendCustomMsgAndEmitEvent(EVENT.ATTENTION, data)
  // }
  // // 取消关注
  // public cancelAttention(data: any) {
  //   return this.sendCustomMsgAndEmitEvent(EVENT.CANCELATTENTION, data)
  // }
  // 退出房间
  public async exitRoom() {
    // 如果是群主，不能退出，群成员可以
    return new Promise(async (resolve, reject) => {
      if (this.isAdminOwner(this.userInfo.userID)) {
        resolve({})
        return
      }
      const res = await this.tim.quitGroup(this.roomID)
      if (res.code === 0) {
        resolve(res.data)
      } else {
        reject(res)
      }
    })
  }
  // 加入房间
  public async joinRoom(setting = { getOwnerInfo: true, roomID: '' }) {
    if (setting.roomID) {
      this.roomID = setting.roomID
    } else {
      if (!this.roomID) {
        throw new Error('roomID为必填')
      }
    }
    const joinRes = await this.tim.joinGroup({ groupID: setting.roomID ? setting.roomID : this.roomID, type: this.TIM.TYPES.GRP_AVCHATROOM });
    if (joinRes.code === 0 && joinRes.data.status === "JoinedSuccess") {
      if (setting.getOwnerInfo) {
        const ownerID = joinRes.data.group.ownerID
        const ownerInfo = await this.getUserInfoByID(ownerID)
        joinRes.data.group.ownerInfo = ownerInfo
      }
      const userInfo = await this.getMyProfile()
      this.groupInfo = joinRes.data.group
      return {
        groupInfo: joinRes.data.group,
        userInfo: userInfo
      }
    } else if (joinRes.code === 0 && joinRes.data.status === 'AlreadyInGroup') {
      this.groupInfo = joinRes.data.group
      const userInfo = await this.getMyProfile()
      return {
        groupInfo: joinRes.data.group,
        userInfo: userInfo
      }
    }
    return null
  }
  // 获取房间信息
  public getRoomInfo() {
    return this.getGroupProfile()
  }
  // 获取用户信息
  public async getUserInfo() {
    return this.getMyProfile()
  }
  // 事件订阅
  public on(eventName: string, callback: () => void) {
    this.eventBus.on(eventName, callback)
  }
  // 初始化参数
  private initComponentMemberValue(initConfig: INITCONFIGINTERFACE) {
    for (let key in initConfig) {
      // @ts-ignore
      this[key] = initConfig[key]
    }
  }
  // sdk准备完毕
  private sdkReady() {
    this.eventBus.emit(EVENT.SDK_READY)
    this.getMyProfile()
    this.getGroupProfile()
  }
  // 收到自己或好友的资料变更通知
  private profileUpdate(event: any) {
    this.eventBus.emit(EVENT.PROFILE_UPDATE, event)
  }
  private error(event: any) {
    this.eventBus.emit(EVENT.ERROR, event)
  }
  // 收到被踢下线通知
  private kicked(event: any) {
    console.log('【im消息 】当前设备被踢下线！！！', event)
    // console.log(event.data.type);
    // TIM.TYPES.KICKED_OUT_MULT_ACCOUNT(Web端，同一帐号，多页面登录被踢)
    // TIM.TYPES.KICKED_OUT_MULT_DEVICE(同一帐号，多端登录被踢) 【此时若调用login会进入 被踢和登录死循环】 ！！！！
    // TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED(签名过期。使用前需要将SDK版本升级至v2.4.0或以上)
    // TIM.TYPES.KICKED_OUT_REST_API(REST API kick 接口踢出。使用前需要将SDK版本升级至v2.20.0或以上)
    this.eventBus.emit(EVENT.KICKED, event)
  }
  // 网络状态发生改变
  private networkChange(event: any) {
    console.log('【im消息 】当前网络发生变化！！！', event)
    // event.data.state 当前网络状态，枚举值及说明如下：
    // TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
    // TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
    // TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
    this.eventBus.emit(EVENT.NETWORK_CHANGE, event)
  }
  // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
  private sdkNotReady(event: any) {
    console.log('【im消息 】sdk进入NotReady状态，需重新调用login接口 驱动SDK进入ready状态！！！', event)
    this.eventBus.emit(EVENT.SDK_NOT_READY, event)
  }
  // 获取群成员资料
  // 获取用户信息
  private async getMyProfile() {
    const res = await this.tim.getMyProfile()
    if (res.code === 0) {
      this.userInfo = res.data
      return res.data
    }
    return null
  }
  // 获取群组信息
  private async getGroupProfile() {
    if (!this.roomID) {
      return null
    }
    const res = await this.tim.getGroupProfile({
      groupID: this.roomID,
      groupCustomFieldFilter: this.groupCustomFieldFilter
    })
    if (res.code === 0) {
      const ownerId = res.data.group.ownerID
      const ownerInfo = await this.getUserInfoByID(ownerId)
      res.data.group.ownerInfo = ownerInfo
      this.groupInfo = res.data.group
      return res.data.group
    }
    return null
  }
  // 获取群成员列表
  public async getGroupMemberList() {
    if (!this.roomID) {
      return null
    }
    return this.tim.getGroupMemberList({
      groupID: this.roomID,
      count: 100,
      offset: 0
    })
  }
  // 通过ID获取用户信息
  private async getUserInfoByID(id: string) {
    const res = await this.tim.getUserProfile({
      userIDList: [id],
    })
    if (res.code === 0) {
      return res.data[0]
    }
    return null
  }
}

function errHandle (err: Error, reject: Function, isText: Boolean = false) {
  let strErr = String(err)
  switch (strErr) {
    case 'Error: you have been forbidden to speak':
      // wx.showToast({title: '您已被禁言!', icon: 'error'})
      // 仅文本消息提示已经禁言
      isText && showToast({ type: TOAST_TYPE.ERROR, title: '提示', desc: '您已被禁言!' })
      // reject({ error: err, status: 1})
      break;
    case 'Error: 用户多实例登录被踢出导致 sdk not ready | sendMessage | 接口调用时机不合理，请等待 SDK 处于 ready 状态后再调用（监听 TIM.EVENT.SDK_READY 事件）':
      showToast({ type: TOAST_TYPE.ERROR, title: '提示', desc: '当前用户被踢出，您已经在另一个设备登录!' })
      // wx.showToast({title: '用户被踢出', icon: 'error'})
      // reject({ error: err, status: 2})
      break;
    default:
      showToast({ type: TOAST_TYPE.ERROR, title: '提示', desc: strErr })
      // wx.showToast({title: strErr, icon: 'error'})
      // reject({ error: err, status: 0})
      break;
  }
}