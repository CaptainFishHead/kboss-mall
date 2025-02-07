import { hideToast, showToast } from "../components/toast/index";
import {
  CARRIER_PARAMS_MAP,
  PRODUCT_LIKE_SUBJECT, SOURCE,
  START_UP,
  themes,
  TOAST_TYPE,
  USER_SOURCE_KEY,
  USER_SOURCE_TYPE_KEY,
} from "../const/index";
import { favoriteAction } from "@models/productModel";
import { styleFix, wxFuncToPromise } from "@utils/wxUtils";
import { track, TrackEventName } from "@utils/sa";
import { isPlugin, queryPageConfigByPageId, queryThemeByPageId } from "@models/carrierModel";
import {
  getEnterOptions,
  hexToRgba,
  openPage, urlAppendQuery,
  isLogged, interceptionPrivacyProtocol,
} from "../utils/index";
import loginPage from "./loginPage";
import { queryExclusiveCodeByQrId } from "@models/wxQRCodeModel";
import back from "./back";
import pageIsScrolling from "./pageIsScrolling";

const app = getApp()
const { windowHeight } = wx.getSystemInfoSync()
// const innerAudioContext = wx.createInnerAudioContext();
export default Behavior({
  data: {
    columns: [],
    theme: {},
    showEmpty: false,
    msg: '',
    pageId: undefined,
    scrollTop: 0,
    startY: 0,
    // opacity: 1,
    bgRgb: '0,0,0',
    //埋点参数（浏览页面）
    pointParamsDetail: {
      special_id: undefined, //pageId
      special_name: undefined, //专题页名称
      start_time: undefined, //访问时间
      end_time: undefined, //退出时间
      cycle_time: undefined, //时间周期
    },
    serviceVisible: false,//侧边客服
    // _hold_up: 0
    // source: undefined,

  },
  behaviors: [loginPage, back, pageIsScrolling],
  pageLifetimes:{
    hide() {
      this.pageHide()
    },
  },
  lifetimes:{
    detached() {
      this.pageHide()
      this.observerRemoveListener()
    }
  },
  methods: {
    // onUnload() {
    //   this.pageHide()
    //   this.observerRemoveListener()
    // },
    fullScreenChange(e) {
      const { fullScreen } = e.detail
      // const {id} = e.target
      wx.createSelectorQuery()
        .select('#carrier')
        .fields({ node: true, scrollOffset: true })
        .exec(([{ node: scrollView, scrollTop }]) => {
          if (!fullScreen) {
            this._scrollTop = this._fix_scroll_top
            scrollView.scrollTo({
              top: this._fix_scroll_top,
              duration: 0,
            })
          } else {
            this._fix_scroll_top = Math.floor(scrollTop) === Math.floor(this._scrollTop) ? this._scrollTop : scrollTop
            console.log(scrollTop, 'fullScreen', fullScreen)
          }
        })
    },
    playVideo(e) {
      const { id, dataset } = e.target
      const { progress } = dataset
      // if (!this._playerId) {
      // 	this._playerId = id
      // }
      // 暂停正在播放的音频 健康早知道
      this.setData({
        isstopAudio: true
      })
      if (progress && this._playerId !== id) {
        if (this._videos[this._playerId] && this._playerId) {
          // 暂停正在播放的视频
          this._videos[this._playerId].pause()
        }
        this._playerId = id
      }
    },
    pauseVideo(e) {
      const { id } = e.target
      if (id === this._playerId) {
        this._playerId = null
      }
    },
    observerListener() {
      this._videos = {}
      this._observer = wx.createIntersectionObserver(this, {
        thresholds: [0, 1],
        initialRatio:-1,
        observeAll: true
      })
      wx.nextTick(() => {
        this._observer
          // .relativeTo('.carrier', { bottom: 0, top: 0 })
          .relativeToViewport({ bottom: 0, top: 0 })
          .observe('.video', (res) => {
            const { auto_play, progress } = res.dataset
            // 创建播放器
            if (!this._videos[res.id]) {
              this._videos[res.id] = wx.createVideoContext(res.id)
            }
            const player = this._videos[res.id]
            
            
            if (res.intersectionRatio >= 1 && (auto_play || !progress)) {
              if (progress && !this._playerId) {
                this._playerId = res.id
              } else if (progress) {
                return null
              }
              player.play()
              this.setData({
                isstopAudio: true
              })
            } else if (res.intersectionRatio === 0) {
              if (player) {
                player.pause()
              }
              if (this._playerId === res.id) {
                this._playerId = null
              }
            }
          })
      })
    },
    observerRemoveListener() {
      if (this._observer) {
        this._observer.disconnect()
        this._observer = null
      }
      if (this._videos) this._videos = null
      if (this._playerId) this._playerId = null
    },
    //监听页面隐藏
    // onHide() {
    //   this.pageHide()
    // },
    pageHide() {
      let { title, pageId, path, pointParamsDetail } = this.data
      if(path == 'pages/index/index'){
        title = '首页'
        pageId = '99999'
      }
      if (!pageId && !title) return
      //埋点
      track(TrackEventName.Boss_Special_Detail, {
        ...pointParamsDetail,
        special_id: pageId,
        detail_id: pageId,
        special_name: title,
        end_time: new Date(),
        cycle_time: Math.floor((Date.now() - pointParamsDetail.start_time.getTime()) / 1000)
      })
    },
    // 获取页面配置内容
    queryColumnCellByPageId({ pageId, activeId,pageType }, extra = {}) {
      showToast({ type: TOAST_TYPE.LOADING })
      queryPageConfigByPageId({ pageId, activeId,pageType }, extra)
        .then(async ({ result }) => {
          this.setData({
            columns: styleFix(result, { reboot: extra.source })
          })
          hideToast()
          if (result && result.length) {
            this.setData({ pageId: result[0].pageId })
            this.observerListener()
          } else {
            this.restart()
          }
        })
        .catch(err => {
          hideToast()
          this.setData({ showEmpty: true, msg: err.msg })
          console.error(err, 'queryColumnCellByPageId 执行失败')
        })
      this.setData({ pageId })
    },
    reloadHandler() {
      this.setData({ showEmpty: false })
      const options = {}
      if (this.data.pageId) options.pageId = options
      this.pageInit(options)
    },
    // 获取主题和更新
    async queryThemeByPageId(pageId, extra, path) {
      const { result } = await queryThemeByPageId(pageId, extra)
      if(path){
        result.path = path
      }
      this.setData({ ...result })
      wxFuncToPromise('setNavigationBarColor', {
        ...themes.get(result.theme.tabBar)
      })
        .catch(e => {
          console.log('setNavigationBarColor error', e, {
            ...themes.get(result.theme.tabBar)
          })
        })
      wxFuncToPromise(`setBackgroundColor`, {
        backgroundColor: result.theme.backgroundColor
      })
        .catch(e => {
          console.log('setBackgroundColor error', e, result.theme.backgroundColor)
        })
      this.setData({
        bgRgb: hexToRgba(result.theme.backgroundColor)
      })
    },
    // 页面跳转
    async navigateTo(e) {
      const { element_id, link, module_id, commodity_index, reboot } = e.currentTarget.dataset
      const { productCode: module_name, title: commodity_name,href, applets } = link
      if (Number(this.data.theme.isForceLogin) === 1 && (href||applets)) {
        await this.login()
      }
      track(TrackEventName.Boss_Module, {
        element_id, module_name, module_id, commodity_name, commodity_index
      })
      if (!(href||applets)) return void 0
      const { source, ssid, targetId } = this._options || {}
      const { title, pageId } = this.data

      link.href = urlAppendQuery(link.href, { page_id: pageId, page_name: title })
      if (source && ssid) {
        link.href = urlAppendQuery(link.href, { ssid, source, targetId })
      }

      openPage.call(this, { link, reboot }, shineUpon => this.updateColumns({
        shineUpon,
        columnIndex: module_id,
        cellIndex: commodity_index
      }))
    },
    // 更新栏目数据
    updateColumns({ columnIndex, cellIndex, shineUpon }) {
      const columns = [...this.data.columns]
      const { link } = columns[columnIndex].cells[cellIndex]
      link[shineUpon] = link[shineUpon] === 1 ? 0 : 1
      this.setData({ columns })
    },
    async likeAction(params, { columnIndex, cellIndex, shineUpon }) {
      try {
        await favoriteAction({
          ...params,
          favoriteType: 1,
          subjectType: PRODUCT_LIKE_SUBJECT[params.subjectType]
        })
        this.updateColumns({ columnIndex, cellIndex, shineUpon, action: params.action })
        showToast({
          title: params.action ? '取消成功' : '已关注该商品，您可以在',
          desc: params.action ? undefined : '我的-关注的商品中查看',
          type: TOAST_TYPE.SUCCESS,
          duration: 1000
        })
        track(TrackEventName.Boss_Favourite, {
          module_id: columnIndex,	//模块id
          module_name: params.productCode,	//模块名称
          commodity_name: params.title,	//商品标题
          curr_page_info: {
            page_source: '动态配置页',	//页面来源
          },
          action_time: new Date(),
          action_type: params.action ? 'remove' : 'add'
        })
      } catch ({ msg }) {
        showToast({
          title: msg,
          type: TOAST_TYPE.ERROR,
          duration: 1000
        })
      }
    },
    // 功能操作
    async functionalAction(e) {
      await this.login()
      const {
        functional: { shineUpon, property } = {},
        link: { productId, title, productCode, jumpType, ...link } = {},
        columnindex: columnIndex, cellindex: cellIndex
      } = e.currentTarget.dataset
      const query = JSON.parse(link.query || '{}')
      switch (property) {
        case 'like':
          const params = {
            subjectId: query.productId || productId,
            title,
            productCode: query.productCode || productCode,
            subjectType: jumpType
          }
          params.action = link[shineUpon]
          this.likeAction(params, { columnIndex, cellIndex, shineUpon })
          break
        default:
          break
      }
    },
    start(e) {
      const [{ clientY }] = e.touches
      this.setData({ startY: clientY })
    },
    end(e) {
      if (!this.data.columns.find(column => column.componentId === START_UP)) {
        return null
      }
      wx.createSelectorQuery()
        .select('#carrier')
        .fields({ node: true, scrollOffset: true,properties: ['scrollY'] })
        .exec((res) => {
          const [{ node: scrollView, scrollTop }] = res
          const [{ clientY }] = e.changedTouches
          const up = 'up'
          const down = 'down'
          const direction = this.data.startY - clientY > 0 ? up : down
          if (scrollTop >= 100 && scrollTop < windowHeight && direction === up) {
            scrollView.scrollTo({
              top: windowHeight,
              duration: 300,
            })
            // this.setData({opacity: 0})
          } else if (scrollTop < windowHeight && scrollTop > 100 && direction === down) {
            scrollView.scrollTo({
              top: 0,
              duration: 300,
            })
            // this.setData({opacity: 1})
          } else if (scrollTop < 100 && direction === up) {
            scrollView.scrollTo({
              top: 0,
              duration: 300,
            })
            // this.setData({opacity: 1})
          }
        })
    },
    scrollHandler(e) {
      const { scrollTop } = e.detail
      // if (Math.abs(scrollTop - this._scrollTop) > windowHeight / 2) {
      // 	return undefined
      // }
      this._scrollTop = scrollTop
    },
    async pageInit(options) {
      // source, skipScene,roomLiveId （应用标识，运营位标识，具体条目标识）

      // const {pageId, scene, preview, source, position, targetId} = options
      // // 参数合并
      // const query = Object.assign({}, {
      // 	pageId, targetId, source, position, preview
      // }, getQuery(scene))
      const query = await getEnterOptions(options, { ...CARRIER_PARAMS_MAP })
      this._options = query
      if (query.id && (query.__start_page__.includes('pages/index/index') || query.__start_page__.includes('pages/carrier/index'))) {
        const { result } = await queryExclusiveCodeByQrId({ qrId: query.id })
        query.pageId = result.pageId
        query.targetId = result.hotelCode
      }
      const { appKey, appSecret, source, targetId, reboot, pageId, preview, activeId } = query
      if (appKey && appSecret && isPlugin(source)) {
        app.globalData.cloud = { appKey, appSecret, targetId }
      } else {
        app.globalData.cloud = null
      }
      // if (query.reboot) {
      // 	// reload
      // 	app.globalData.reboot = query.reboot
      // }
      const registerType = USER_SOURCE_TYPE_KEY[query.source]
      if (query.targetId && registerType) {
        wx.setStorageSync(USER_SOURCE_KEY, {
          thirdId: query.targetId, registerType
        })
      }

      this.queryThemeByPageId(pageId, {
        source: reboot || source
      })

      setTimeout(() => {
        this.queryColumnCellByPageId({ pageId, activeId }, {
          preview: preview,
          source: reboot || source
        })
      })
    },
    /*客服*/
    showService() {
      const { isShowService } = this.data
      this.setData({ serviceVisible: isLogged() })
    },
    async showServices(val) {
      await interceptionPrivacyProtocol()
      this.setData({ serviceVisible: val.detail })
    },
    async login() {
      //检测是否登录（未登录就出登录半弹层）
      const { openLoginModal } = this.selectComponent(`#authorize`)
      await openLoginModal()
    },
  }
})