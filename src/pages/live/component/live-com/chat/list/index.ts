import { IRoomInfo } from '../../../../models/types/live'
import { EVENT as TLS_EVENT } from '../../../../utils/tls'
// import { IGroupSystemNoticePayload, IGroupTipPayload, IMessage, ITextPayload, GROUP_TIP_TYPE } from '../../../../utils/tim';

interface IImuserInfo {
  userID: string,
  nick: string,
}

Component({
  externalClasses: ['class'],
  properties: {
    roomInfo: {
      type: Object,
      value: <IRoomInfo>{}
    }
  },
  options:{virtualHost:true},
  data: {
    messageList: <any[]>[],
    chatList: <any[]>[],
    joinList: <any[]>[],
    nextReqMessageID: '', // 在第一次获取列表时返回 用于获取下页数据
    isCompleted: false, // 是否已拉取完所有数据
    userInfo: <IImuserInfo>{},
    timer: <any>null
  },
  observers: {
    'chatList, joinList': function(chatList, joinList) {
      this.setData({
        messageList: chatList.concat(joinList)
      })
    }
  },
  lifetimes: {
    created() {},
    ready() {
      if(wx.$tls) {
        this.onMessageEvent()
      } else {
        wx.$bus.on(TLS_EVENT.SDK_READY,() => {
          this.onMessageEvent()
        })
      }
    },
    detached() {}
  },
  methods: {
    onMessageEvent() {
      this.setData({userInfo: wx.$tls.userInfo})
      // 加群事件
      wx.$tls.on(TLS_EVENT.JOIN_GROUP, this.onJoinRoom.bind(this))
      // 文本消息
      wx.$tls.on(TLS_EVENT.TEXT_MESSAGE, this.onTextMessage.bind(this))
    },
    scroll() {},
    // 有人加入直播间
    onJoinRoom(data: any) {
      // if (data.isOwner) return
      clearTimeout(this.data.timer)
      this.setData({
        joinList: [{ID: data.ID, from: data.nick || data.userID, type: 'join', isOwner: data.isOwner}]
      })
      let timer = setTimeout(() => {
        this.setData({ joinList: []})
      }, 3000)
      this.setData({timer})
    },
    // 有新的文本消息
    onTextMessage(data: any) {
      this.data.chatList.push({
        ID: data.ID,
        from: data.nick || data.userID,
        message: data.message,
        isPrivate: data.isPrivate,
        atUser: data.atUser,
        isAtSelf: data.atUser && (data.atUser.userID === this.data.userInfo.userID),
        isOwner: data.isOwner,
        type: 'text'
      })
      this.setData({
        chatList: this.data.chatList,
        joinList: []
      })
    },
  }
})
