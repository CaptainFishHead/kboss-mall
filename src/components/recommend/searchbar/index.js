import { queryWordHotList, queryResultList } from "../../../models/searchModel";
import { TOAST_TYPE } from "../../../const/index";
import { hideToast, showToast } from "../../../components/toast/index";
import { track, TrackEventName } from "../../../utils/sa";

const app = getApp()

Component({
  data: {
    placeholderList: [],
    placeholder: '',
    curIndex: 0, //轮播搜索词索引
    isFocus: false,
    isFromInput: false,
    isFromBtn: false,
  },
  properties: {
		extClass: {
			type: String,
			value: ''
		},
    inputVal: {
      type: String,
      value: '',
    },
  },
  ready() {
    const params = { hotPosition: 3 }
    this.getWordHotList(params) //获取轮播热词列表
  },
  methods: {
    toSearchPage() {
      const {curIndex } = this.data
      wx.navigateTo({
        url: `/pages/recommend/search/index?curIndex=${curIndex}`,
      })
    },
    // 点击文本框时 获取当前轮播词
    fromInput(curIndex, isFromBtn) {
      if (curIndex) {
        this.setData({
          isFromInput: true,
          isFromBtn: !!Number(isFromBtn),
          curIndex
        })
      }
    },
    swiperChange(e) {
      let { current, source } = e.detail
      if (source === 'autoplay' || source === 'touch') {
        this.setData({ curIndex: current })
      }
    },
    swiperTransition(e) {
      const { dy } = e.detail // dy的值：0-30
      if (dy < 20) {
        this.setData({ opacity: (30 - dy) / 100 })
      } else if (dy > 25) {
        this.setData({ opacity: (60 + dy) / 100 })
      } else {
        this.setData({ opacity: (30 + dy) / 100 })
      }
    },

    // 获取轮播热词列表
    getWordHotList(params) {
      queryWordHotList(params)
        .then(({ result }) => {
          this.setData({ placeholderList: result.hotWordList })

          const { isFromInput, isFromBtn } = this.data
          if (isFromBtn) { //来源-点击按钮 直接执行搜索
            this.onConfirm()
          } else {
            if (isFromInput) { //来源-点击文本框 onFocus
              setTimeout(() => {
                this.onFocus()
              }, 1000)
            }
          }
        })
        .catch((err) => { })
    },

    // 获取列表
    getResultList(params) {
      showToast({ type: TOAST_TYPE.LOADING })
      queryResultList(params)
        .then(({ result }) => {
          hideToast().then(() => {
            const { isJumped, hotWord: link } = result

            if (isJumped === 1) {
              this.triggerEvent('open-page',{link})
            } else {
              //不跳转
              const { curIndex } = this.data
              wx.navigateTo({
                url: `/pages/search/index?curIndex=${curIndex}&isFromBtn=1`,
              })
            }
          })
        })
        .catch((err) => {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
    },

    onFocus() {
      const { placeholderList, curIndex } = this.data
      this.setData({
        isFocus: true,
        placeholder: (placeholderList[curIndex]||{}).wordName,
      });
    },

    // 点击搜索按钮
    onConfirm() {
      
      const { placeholderList, curIndex, inputVal } = this.data
      let value = '';
      if (inputVal === '') {
        value = (placeholderList[curIndex]||{}).wordName
      } else {
        value = inputVal
      }
      this.setData({ inputVal: value })
      this.triggerEvent("search", { value }) //返回父级参数
      // 埋点
      track(TrackEventName.Boss_SearchColumClick, {
        key_word: value || '',
        search_found: '',
        hist_word: '',
        hot_word: '',
        channelpage_name: '种草频道页'
      })
    }
  },
});
