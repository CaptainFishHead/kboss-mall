import TIM from 'tim-wx-sdk';


export enum LOG_LEVEL {
	INFO,
	RELEASE,
	WARING,
	ERROR,
	NULL
}

export enum TIM_EVENT_TYPES {
	SDK_READY = "sdkStateReady",
	SDK_NOT_READY = "sdkStateNotReady",
	SDK_DESTROY = "sdkDestroy",
	MESSAGE_RECEIVED = "onMessageReceived",
	MESSAGE_MODIFIED = "onMessageModified",
	MESSAGE_REVOKED = "onMessageRevoked",
	MESSAGE_READ_BY_PEER = "onMessageReadByPeer",
	MESSAGE_READ_RECEIPT_RECEIVED = "onMessageReadReceiptReceived",
	CONVERSATION_LIST_UPDATED = "onConversationListUpdated",
	TOTAL_UNREAD_MESSAGE_COUNT_UPDATED = "onTotalUnreadMessageCountUpdated",
	CONVERSATION_GROUP_LIST_UPDATED = "onConversationGroupListUpdated",
	CONVERSATION_IN_GROUP_UPDATED = "onConversationInGroupUpdated",
	GROUP_LIST_UPDATED = "onGroupListUpdated",
	GROUP_SYSTEM_NOTICE_RECEIVED = "receiveGroupSystemNotice",
	GROUP_ATTRIBUTES_UPDATED = "groupAttributesUpdated",
	TOPIC_CREATED = "onTopicCreated",
	TOPIC_DELETED = "onTopicDeleted",
	TOPIC_UPDATED = "onTopicUpdated",
	PROFILE_UPDATED = "onProfileUpdated",
	USER_STATUS_UPDATED = "onUserStatusUpdated",
	BLACKLIST_UPDATED = "blacklistUpdated",
	FRIEND_LIST_UPDATED = "onFriendListUpdated",
	FRIEND_GROUP_LIST_UPDATED = "onFriendGroupListUpdated",
	FRIEND_APPLICATION_LIST_UPDATED = "onFriendApplicationListUpdated",
	KICKED_OUT = "kickedOut",
	ERROR = "error",
	NET_STATE_CHANGE = "netStateChange",
	SDK_RELOAD = "sdkReload"
}

export enum TIM_TYPES {
	MSG_TEXT = "TIMTextElem",
	MSG_IMAGE = "TIMImageElem",
	MSG_SOUND = "TIMSoundElem",
	MSG_AUDIO = "TIMSoundElem",
	MSG_FILE = "TIMFileElem",
	MSG_FACE = "TIMFaceElem",
	MSG_VIDEO = "TIMVideoFileElem",
	MSG_GEO = "TIMLocationElem",
	MSG_LOCATION = "TIMLocationElem",
	MSG_GRP_TIP = "TIMGroupTipElem",
	MSG_GRP_SYS_NOTICE = "TIMGroupSystemNoticeElem",
	MSG_CUSTOM = "TIMCustomElem",
	MSG_MERGER = "TIMRelayElem",
	MSG_PRIORITY_HIGH = "High",
	MSG_PRIORITY_NORMAL = "Normal",
	MSG_PRIORITY_LOW = "Low",
	MSG_PRIORITY_LOWEST = "Lowest",
	CONV_C2C = "C2C",
	CONV_GROUP = "GROUP",
	CONV_TOPIC = "TOPIC",
	CONV_SYSTEM = "@TIM#SYSTEM",
	CONV_AT_ME = 1,
	CONV_AT_ALL = 2,
	CONV_AT_ALL_AT_ME = 3,
	CONV_MARK_TYPE_STAR = 1,
	CONV_MARK_TYPE_UNREAD = 2,
	CONV_MARK_TYPE_FOLD = 4,
	CONV_MARK_TYPE_HIDE = 8,
	GRP_PRIVATE = "Private",
	GRP_WORK = "Private",
	GRP_PUBLIC = "Public",
	GRP_CHATROOM = "ChatRoom",
	GRP_MEETING = "ChatRoom",
	GRP_AVCHATROOM = "AVChatRoom",
	GRP_COMMUNITY = "Community",
	GRP_MBR_ROLE_OWNER = "Owner",
	GRP_MBR_ROLE_ADMIN = "Admin",
	GRP_MBR_ROLE_MEMBER = "Member",
	GRP_MBR_ROLE_CUSTOM = "Custom",
	GRP_TIP_MBR_JOIN = 1,
	GRP_TIP_MBR_QUIT = 2,
	GRP_TIP_MBR_KICKED_OUT = 3,
	GRP_TIP_MBR_SET_ADMIN = 4,
	GRP_TIP_MBR_CANCELED_ADMIN = 5,
	GRP_TIP_GRP_PROFILE_UPDATED = 6,
	GRP_TIP_MBR_PROFILE_UPDATED = 7,
	GRP_TIP_BAN_AVCHATROOM_MEMBER = 10,
	GRP_TIP_UNBAN_AVCHATROOM_MEMBER = 11,
	MSG_REMIND_ACPT_AND_NOTE = "AcceptAndNotify",
	MSG_REMIND_ACPT_NOT_NOTE = "AcceptNotNotify",
	MSG_REMIND_DISCARD = "Discard",
	GENDER_UNKNOWN = "Gender_Type_Unknown",
	GENDER_FEMALE = "Gender_Type_Female",
	GENDER_MALE = "Gender_Type_Male",
	KICKED_OUT_MULT_ACCOUNT = "multipleAccount",
	KICKED_OUT_MULT_DEVICE = "multipleDevice",
	KICKED_OUT_USERSIG_EXPIRED = "userSigExpired",
	KICKED_OUT_REST_API = "REST_API_Kick",
	ALLOW_TYPE_ALLOW_ANY = "AllowType_Type_AllowAny",
	ALLOW_TYPE_NEED_CONFIRM = "AllowType_Type_NeedConfirm",
	ALLOW_TYPE_DENY_ANY = "AllowType_Type_DenyAny",
	FORBID_TYPE_NONE = "AdminForbid_Type_None",
	FORBID_TYPE_SEND_OUT = "AdminForbid_Type_SendOut",
	JOIN_OPTIONS_FREE_ACCESS = "FreeAccess",
	JOIN_OPTIONS_NEED_PERMISSION = "NeedPermission",
	JOIN_OPTIONS_DISABLE_APPLY = "DisableApply",
	JOIN_STATUS_SUCCESS = "JoinedSuccess",
	JOIN_STATUS_ALREADY_IN_GROUP = "AlreadyInGroup",
	JOIN_STATUS_WAIT_APPROVAL = "WaitAdminApproval",
	GRP_PROFILE_OWNER_ID = "ownerID",
	GRP_PROFILE_CREATE_TIME = "createTime",
	GRP_PROFILE_LAST_INFO_TIME = "lastInfoTime",
	GRP_PROFILE_MEMBER_NUM = "memberNum",
	GRP_PROFILE_MAX_MEMBER_NUM = "maxMemberNum",
	GRP_PROFILE_JOIN_OPTION = "joinOption",
	GRP_PROFILE_INTRODUCTION = "introduction",
	GRP_PROFILE_NOTIFICATION = "notification",
	GRP_PROFILE_MUTE_ALL_MBRS = "muteAllMembers",
	SNS_ADD_TYPE_SINGLE = "Add_Type_Single",
	SNS_ADD_TYPE_BOTH = "Add_Type_Both",
	SNS_DELETE_TYPE_SINGLE = "Delete_Type_Single",
	SNS_DELETE_TYPE_BOTH = "Delete_Type_Both",
	SNS_APPLICATION_TYPE_BOTH = "Pendency_Type_Both",
	SNS_APPLICATION_SENT_TO_ME = "Pendency_Type_ComeIn",
	SNS_APPLICATION_SENT_BY_ME = "Pendency_Type_SendOut",
	SNS_APPLICATION_AGREE = "Response_Action_Agree",
	SNS_APPLICATION_AGREE_AND_ADD = "Response_Action_AgreeAndAdd",
	SNS_CHECK_TYPE_BOTH = "CheckResult_Type_Both",
	SNS_CHECK_TYPE_SINGLE = "CheckResult_Type_Single",
	SNS_TYPE_NO_RELATION = "CheckResult_Type_NoRelation",
	SNS_TYPE_A_WITH_B = "CheckResult_Type_AWithB",
	SNS_TYPE_B_WITH_A = "CheckResult_Type_BWithA",
	SNS_TYPE_BOTH_WAY = "CheckResult_Type_BothWay",
	NET_STATE_CONNECTED = "connected",
	NET_STATE_CONNECTING = "connecting",
	NET_STATE_DISCONNECTED = "disconnected",
	MSG_AT_ALL = "__kImSDK_MesssageAtALL__",
	READ_ALL_C2C_MSG = "readAllC2CMessage",
	READ_ALL_GROUP_MSG = "readAllGroupMessage",
	READ_ALL_MSG = "readAllMessage",
	USER_STATUS_UNKNOWN = 0,
	USER_STATUS_ONLINE = 1,
	USER_STATUS_OFFLINE = 2,
	USER_STATUS_UNLOGINED = 3
}

// 群信息
export interface IGroupProfile {
	ownerID: string // 群主id
}
// 会话信息
export interface IConversation {
	groupProfile: IGroupProfile, // 群信息
	conversationID: string // 会话id
}

// 群提示类型枚举  来自TIM.TYPES
export enum GROUP_TIP_TYPE {
  MEMBER_JOIN = 1, // 加群
  MEMBER_QUIT, // 退群
  MEMBER_KICKED_OUT, // 有群成员被踢出群
  MEMBER_SET_ADMIN, // 被设置为管理员
  MEMBER_CANCELED_ADMIN, // 被取消管理员
  GROUP_INFO_MODIFIED, // 修改群资料，转让群组为该类型，msgBody.msgGroupNewInfo.ownerAccount表示新群主的ID
  MEMBER_INFO_MODIFIED, // 修改群成员信息
};

// 系统提示提示消息类型详见 message.payload.operationType [https://web.sdk.qcloud.com/im/doc/zh-cn/Message.html#.GroupSystemNoticePayload]
// 群系统提示消息类型枚举
export enum GROUP_SYSTEM_TIP_TYPE {
  USER_JOIN = 1,
  AGREE_JOIN,
	// ...
}

// 创建自定义消息示例 https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html#createCustomMessage
/* 
自定义消息内容
payload: {
	data: JSON.stringify({
		type: MSG_CUSTOM_TYPE.GOODS_SPEAK, // 用于标识自定义消息类型
		extInfo: {
			type: '',
			number: '',
			detailId: ''
			... 其他扩展消息内容 
		}
	}),
	description: '',
	extension: ''
}
 */
// 自定义消息类型枚举
export enum MSG_CUSTOM_TYPE {
  "OPEN_CHAT" = "OPEN_CHAT", // 开启聊天【自定义消息】
  "CLOSE_CHAT" = "CLOSE_CHAT", // 关闭聊天【自定义消息】
  "LIKE" = "LIKE", // 点赞【自定义消息】
  "OPEN_LIKE" = "OPEN_LIKE", // 开启点赞【自定义消息】
  "CLOSE_LIKE" = "CLOSE_LIKE", // 关闭点赞【自定义消息】
  "VIEW_GOODS" = "VIEW_GOODS", // 浏览商品【自定义消息】
  "BUY_GOODS" = "BUY_GOODS", // 购买商品 【自定义消息】
  "BUYING_GOODS" = "BUYING_GOODS", // 正在购买商品【自定义消息】
  "ADDCART_GOODS" = "ADDCART_GOODS", // 添加购物车【自定义消息】
  "START_EXPLAIN" = "START_EXPLAIN", // 讲解商品【自定义消息】
  "FINISH_EXPLAIN" = "FINISH_EXPLAIN",  //结束讲解【自定义消息】
  "SHARE" = "SHARE", // 分享 【自定义消息】
  "ATTENTION" = "ATTENTION", // 关注 【自定义消息】
  "LIVE_START" = "LIVE_START", // 直播开始【自定义消息】
  "LIVE_PAUSE" = "LIVE_PAUSE", // 直播暂停【自定义消息】
  "LIVE_CANCEL" = "LIVE_CANCEL", // 直播取消【自定义消息】
  "LIVE_FINISH" = "LIVE_FINISH", // 直播结束【自定义消息】
  "LIVE_RESUME" = "LIVE_RESUME", // 直播恢复【自定义消息】
  // "ROOM_STATUS_CHANGE" = "ROOM_STATUS_CHANGE", // 房间状态变化 未开播/直播中/直播暂停/直播结束 等 【自定义消息】
}

export interface ITextPayload {
	text: string
}

export interface ICustomPayload {
	data: MSG_CUSTOM_TYPE,
	description: string,
	extension: string
}

export interface IGroupTipPayload {
	groupJoinType: number,
	operatorID: string,
	operationType: number,
	userIDList: string[]
	memberList: object[],
	[key: string]: any
}

export interface IGroupSystemNoticePayload {
	groupJoinType: number,
	operatorID: string,
	operationType: number,
	userIDList: string[],
	memberList: object[],
	[key: string]: any
}

export interface IMessage<T={}> {
	ID: string,
	type: string,
	payload: T,
	conversationID: string,
	conversationType: string,
	to: string,
	from: string,
	flow: string,
	time: number,
	status: string,
	nick: string,
	avatar: string,
	atUserList: string[],
	isOwner?: boolean, // 自定义属性，是否群主/主播消息
	cloudCustomData: string
}

interface ISendMessageOptions {
	onlineUserOnly?: boolean,
	offlinePushInfo?: { disablePush?: boolean, title?: string, description?: string, extension?: string, ignoreIOSBadge?: boolean, androidOPPOChannelID?: string },
	messageControlInfo?: { excludedFromUnreadCount?: boolean, excludedFromLastMessage?: boolean }
}

interface ITextMessageParams {
	to: string,
	receiverList?: [],
	conversationType: TIM_TYPES.CONV_C2C | TIM_TYPES.CONV_GROUP,
	priority: string,
	payload: { type: string }
}

interface ITimModel {
	setLogLevel(level: LOG_LEVEL): void

	login<T = any>(param: { userID: string, userSig: string }): Promise<T>

	logout<T>(): Promise<T>

	destroy<T>(): Promise<T>

	createGroup<T>(): Promise<T>

	createTextMessage(param: ITextMessageParams): IMessage<ITextPayload>

	sendMessage<T>(message: IMessage<T>, options?: ISendMessageOptions): Promise<T>

	reSendMessage<T>(message: IMessage<T>, options?: ISendMessageOptions): Promise<T>

	on(type: TIM_EVENT_TYPES, listener: <T>(event: { name: string, data: T }) => any): void

	off(type: TIM_EVENT_TYPES, listener: <T>(event: { name: string, data: T }) => any): void
}

interface ITim {
	tim: ITimModel

	create(param: { SDKAppID: number, oversea: boolean }): void
}

class Tim implements ITim {
	private _tim = null

	public get tim() {
		return this._tim
	}

	protected set tim(param: any) {
		this._tim = param
	}

	public create(param: { SDKAppID: number; oversea: boolean }) {
		const tim = TIM.create(param) as ITimModel
		this.tim(tim)
	}
}

const timInstance = new Tim()

export default timInstance
