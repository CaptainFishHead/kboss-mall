// pages/recommend/videoDetail/index.js
import {queryRecommendDataById, queryRecommendDetail, queryRecommendSwiperDetail, updateLikeNum} from "../../../models/recommendModel";
import {queryProductById} from "../../../models/productModel";
import {hideToast, showToast} from "../../../components/toast/index";
import {TOAST_TYPE} from "../../../const/index";
import {track, TrackEventName} from "../../../utils/sa";
import back from "../../../behaviors/back";
import { getPageShareInfo } from "../../../utils/sharePoster";
import { isLogged } from "@utils/index";

Page({
	data: {
		recommendId: 0, // 种草ID
		nextRecommendId: 0, // 下一条种草ID
		recommendVideoList: [], // 种草视频列表
		isShow: false, // 是否展示全部内容
		// 当前播放的种草
		currentVideo: {},
		currentPage: 0,
		isPlay: false,
		updateState: false, //防止视频播放过程中导致的拖拽失效
		sliderValue: 0,
		duration: 0,
		isBuffer: false, // 当前视频是否在缓冲
		loading: true,
		isExist: true, // 当前页面是否存在 true: 存在 false: 不存在
	},
	_starttime: 0, // 预览开始时间
	_playTime: 0, // 同一个视频播放的时间，循环播放累加
	_currentTime: 0, // 当前视频播放的时间
	_videoPlayer: null,
	_videoList: [],
	behaviors: [back],
	async onLoad(options) {
		const {id} = options;
		if (!id) this.restart()
		this.setData({recommendId: id})
		// 进入页面请求两条数据 预加载下一条视频 用于swiper滚动
		showToast({type: TOAST_TYPE.LOADING});
		const {result} = await this.getDetailInfo({
			recommendId: id,
			// _index: 0
		});
		this.pushVideo(result)
		this.setData({currentVideo: result})
    result.state && this.init({currentId: result.unionId});
		if(!parseInt(this.options.noRecommend)) this.queryNextVideo({ nextRecommendId: id }); // noRecommend：0 则支持滚动 、1 则不支持滚动
	},
	onHide() {
		this.setPoint()
	},
	onUnload() {
		this.setPoint()
		this._videoPlayer = null
	},
	// 修复当前数据nextId
	fixVideoNextId({fixId, targetId}) {
		const {recommendVideoList} = this.data
		const video = recommendVideoList.find(item => fixId === item.recommendId)
		video.nextId = targetId
		this.setData({recommendVideoList})
	},
	// 检查是不是最后一条
	checkIsLastVideo(targetId) {
		const {recommendVideoList} = this.data
		return [...recommendVideoList].find(item => item.recommendId === targetId) ?? [...(this._videoList || [])].find(item => item.recommendId === targetId)
	},
	// 获取下一条数据
	async queryNextVideo({nextRecommendId}) {
		this.setData({nextRecommendId})
		const {result} = await this.getDetailInfo({
			nextRecommendId,
			type: 2
		})
		result.nextId = nextRecommendId
		this.fixVideoNextId({fixId: nextRecommendId, targetId: result.recommendId})
		// const nextVideo = this.checkIsLastVideo(nextRecommendId)
		// result._index = nextVideo._index + 1
		this.pushVideo(result)
		// const video = this.checkIsLastVideo(result.recommendId)
		// if (!video) {
		// 	this.fixVideoNextId({fixId: nextRecommendId, targetId: result.recommendId})
		// 	result._index = nextVideo._index + 1
		// 	this.pushVideo(result)
		// } else {
		// 	this.unshiftVideo(video)
		// }
	},
	// 获取视频的收藏、点赞数据
	getNumData() {
		this.selectComponent('#footerHandle').updateNum(1)
		// updateLikeNum({
		// 	subjectId: this.data.recommendId,
		// 	subjectType: 5
		// }).then(({result}) => {
		// 	this.setNumData(result)
		// })
	},
	// 设置视频的收藏、点赞、分享数据
	setNumData(numData) {
		const { recommendVideoList, currentVideo, currentPage } = this.data
		numData.loginData = isLogged()
		Object.assign(currentVideo, numData)
		recommendVideoList[currentPage] = currentVideo
		this.setData({currentVideo: currentVideo})
		this.setData({recommendVideoList})
	},
	// 查询种草详情
	async getDetailInfo(params) {
		try {
			const {result} = await (params.recommendId ? queryRecommendDetail : queryRecommendSwiperDetail)(params)
			// 标签字符串转化为列表
			if (result.tag) result.tagList = result.tag.split(',');
			// result._index = params._index
			this._starttime = Date.now();
			result.unionId = `${this.data.recommendVideoList.length}_${result.recommendId}`.replace('.', '')
			result.loginData = isLogged() // 标识是否登陆情况下获取的数据，如果是非登录数据，登录后需要更新数据
			return {result}
		} finally {
			hideToast();
			this.setData({loading: false})
		}
	},
	// 查询商品详情s
	getGoodsInfo(id) {
		return new Promise((resolve) => {
			queryProductById({id})
				.then(({result}) => {
					resolve({goodsInfo: result});
				})
				.catch(() => {
					resolve({});
				})
		})
	},
	// 添加构造器
	init({currentId}) {
		if (this._videoPlayer) {
			this.videoEnd()
		}
		wx.nextTick(()=>{
			this._videoPlayer = wx.createVideoContext(`video_${currentId}`, this);
			/* 切换视频重置埋点数据 start */
			this._currentTime = 0
			this._playTime = 0
			/* 切换视频重置埋点数据 end */
			this.videoPlay();
			this.loginAuth()
		})
	},
	pushVideo(video) {
		const {recommendVideoList} = this.data
		recommendVideoList.push(video)
		this.setData({recommendVideoList})
	},
	// 监听swiper滚动 滚动结束后触发
	onchange(e) {
		const {currentItemId, current} = e.detail;
		const {recommendVideoList} = this.data;
		// 离开当前视频是记录埋点
		this.setPoint();
		// 切换视频的时候 先暂停正在播放的视频
    this.videoEnd();
		// 设置当前可视的种草ID
		const _video = recommendVideoList.find(item => currentItemId === item.unionId)
		if (_video) {
			this.setData({currentVideo: _video});
			this.init({currentId: currentItemId});
			const len = recommendVideoList.length - 1
			if (len <= current + 1 && !parseInt(this.options.noRecommend)) { // 滑到末尾要获取新数据
				this.queryNextVideo({
					nextRecommendId: recommendVideoList[len].recommendId
				});
			} else { // 滑动的已有老数据
				if (isLogged() && !_video.loginData) {
					// 如果是登录状态且视频数据还是登录前获取的，那么要更新当前视频数据
					this.getNumData()
				}
			}
		}
		// 保存swiper滚动索引
		this.setData({currentPage: current})
	},
	_timers: {},
	loadedmetadata(e) {
		const {video: recommendItem, index} = e.target.dataset;
		if (this._timers[index]) {
			clearTimeout(this._timers[index])
		}
		this._timers[index] = setTimeout(async () => {
			const {width, height} = e.detail;
			const {recommendVideoList} = this.data;
			if (recommendItem) {
				recommendItem.ishorizontal = width > height ? 1 : 0;
				const coefficient = (width / height)
        recommendItem.video_height = `${750 / coefficient}rpx`
        
				if (recommendItem.goods && recommendItem.goods.spuId) return null
				if (recommendItem.spuId) { // 获取商品信息
					const {goodsInfo} = await this.getGoodsInfo(recommendItem.spuId)
					recommendItem.goods = {...goodsInfo} || {};
				}
				// if (!recommendItem.shareNum) {
				// 	// TODO shareNum 初始化逻辑更新
				// 	const {result} = await queryRecommendDataById({recommendId: recommendItem.recommendId})
				// 	recommendItem.shareNum = result.shareNum
				// }
        recommendVideoList.splice(index, 1, recommendItem)
				this.setData({recommendVideoList})
			}
		}, 30)

	},
	videoSwitch() {
		const {isPlay} = this.data;
		if (isPlay) {
			this.videoPause()
		} else {
			this.videoPlay()
		}
	},
	// 视频播放
	videoPlay() {
		if (!this._videoPlayer) return null
		this._videoPlayer.play()
		this.setData({updateState: true, isPlay: true});
	},
	loginTimer: null,
	loginAuth() {
		const { activeAuthorizeTime } = this.data.currentVideo
		if (activeAuthorizeTime > 0) {
			if (this.loginTimer) {
				clearTimeout(this.loginTimer)
				this.loginTimer = null
			}
			this.loginTimer = setTimeout(() => {
				if (!isLogged()) {
					this._videoPlayer.pause();
					const { openLoginModal } = this.selectComponent(`#authorize`)
					openLoginModal().then(() => {
						this.getNumData()
						this.loginSuccess()
					}).finally(() => {
					  this._videoPlayer.play()
					});
				}
				clearTimeout(this.loginTimer)
				this.loginTimer = null
			}, activeAuthorizeTime * 1000)
		}
	},
	// 播放暂停
	videoPause() {
		try {
			if (!this._videoPlayer) return null
			this._videoPlayer.pause();
			this.setData({updateState: false, isPlay: false});
		} catch (e) {
		}
	},
	// 播放结束
	videoEnd() {
		if (!this._videoPlayer) return null
		this.setData({isPlay: false, updateState: false, sliderValue: 0, duration: 0});
		this._videoPlayer.stop();
	},
	//模拟进度条 更新位置
	sliderChange(e) {
		const {duration} = this.data;
		const {value} = e.detail;
		if (this._videoPlayer && duration) {
			this._videoPlayer.seek(value / 100 * duration) //完成拖动后，计算对应时间并跳转到指定位置
			this.setData({sliderValue: value, updateState: true})
		}
	},
	//模拟进度条 拖拽
	sliderChanging() {
		this.setData({
			updateState: false //拖拽过程中，不允许更新进度条
		})
	},
	//播放进度 自定义控件
	videoUpdate(e) {
		const {currentTime, duration} = e.detail;
		const {video} = e.target.dataset
		const {updateState} = this.data;
		/* start ---------- 记录埋点属性播放时长 _playTime -------- */
		if (currentTime - this._currentTime > 1) {
			// 减去拖拽时长或者上次播放的时长（currentTime - this._currentTime）
			this._playTime = this._playTime - (currentTime - this._currentTime)
		}
		this._currentTime = currentTime
		/* ---------- 记录埋点属性 _playTime -------- end */
		if (updateState) { //判断拖拽完成后才触发更新，避免拖拽失效
			const sliderValue = currentTime / duration * 100;
			this.setData({duration, sliderValue});
			video.isBuffer = false
		}
	},
	videoEnded() {
		this._playTime += this._currentTime // 循环累计播放时长
		this._currentTime = 0
	},
	// 视频缓冲时触发
	waiting(e) {
		const {video} = e.target.dataset
		video.isBuffer = true
	},
	// 埋点
	setPoint() {
    const {currentVideo, recommendVideoList} = this.data;
    const currRecommendGoodsInfo = recommendVideoList.find(item => item.recommendId === currentVideo.recommendId);
		const endtime = Date.now();
		const cycle_time = Math.floor((endtime - this._starttime) / 1000)
    let params = {};

		if (currRecommendGoodsInfo.goods) {
			params = {
				commodity_id: currRecommendGoodsInfo.goods.code || '',
				commodity_name: currRecommendGoodsInfo.goods.name || '',
				sku_price: currRecommendGoodsInfo.goods.sellPrice || 0
			}
		}
		this._playTime += this._currentTime
		track(TrackEventName.Boss_SeedingDetail, {
			...params,
			starttime: this._starttime,
			video_duration: this._playTime, // 同一视频累计播放时长
			endtime,
			cycle_time,
			detail_id: currRecommendGoodsInfo.recommendId,
			content_name: currRecommendGoodsInfo.title || '',
      content_label: currRecommendGoodsInfo.tag || '',
      curr_page_info: this.options.curr_page_info || ''
    })
    
	},
	// 更新点赞\收藏\分享数量
	updateNum(e) {
		this.setNumData(e.detail)
		const eventChannel = this.getOpenerEventChannel()
		if (Object.prototype.toString.call(eventChannel.emit).includes('Function')) {
			eventChannel.emit('updateColumns')
		}
	},
	handBack() {
		const pages = getCurrentPages();
		if (pages.length <= 1) {
			wx.reLaunch({
				url: `/pages/index/index`
			})
		} else {
			wx.navigateBack();
		}
	},
	//分享给朋友
	onShareAppMessage(res) {
    const {currentVideo} = this.data;
    const pages = getCurrentPages();
    const currentPage = pages[pages.length-1];
		const promise = new Promise(async (resolve) => {
			const {v2_code} = await getPageShareInfo({
				pageUrl: '/'+currentPage.route,
				pageOptions: {...currentPage.options, position: 'recb', targetId: currentVideo.recommendId, id: currentVideo.recommendId}
			});
			resolve({
				title: currentVideo.title || '',
				imageUrl: currentVideo.coverImgUrl,
				path: `/pages/index/index?v2_code=${v2_code}`
			})
		})
		return {
			title: currentVideo.title || '',
			imageUrl: currentVideo.coverImgUrl,
			promise
		}
  },
	loginSuccess(e) {
		// 登录后更新数据
		if (this.data.currentVideo.spuId) {
			this.selectComponent(`#small_price`).updateIsLogged()
		}
	},
})
