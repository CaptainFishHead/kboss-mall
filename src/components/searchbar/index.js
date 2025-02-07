import { queryWordHotList, queryResultList } from "../../models/searchModel";
import { TOAST_TYPE } from "../../const/index";
import { hideToast, showToast } from "../../components/toast/index";
import { interceptionPrivacyProtocol } from "@utils/index";

const app = getApp()

Component({
  data: {
    placeholderList: [],
    placeholder: '',
    curIndex: 0, //轮播搜索词索引
    isFocus: false,
    isFromInput: false,
    isFromBtn: false,
    val:'',
    isval:true
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    isObser: {
      type: Boolean,
      value: false,
    },
    showResultPage: {
      type: Boolean,
      value: false,
    },
    inputVal: {
      type: String,
      value: '',
      observer: function (newVal, oldVal, changePath) {
        // console.log(this.data.isObser, 'this.data.isObser')
        if(this.data.isObser){
          this.setData({
            isval: false
          });
          this.triggerEvent('obserFun', {obser:false})
        }
        wx.nextTick(()=>{
          this.setData({
            val: newVal,
            isval:true
          });
        })
        
      }
    },
    showBtn: {
      type: Boolean,
      value: false,
    },
    isBlack: {
      type: Boolean,
      value: false,
    },
    isLink: {
      type: Boolean,
      value: false,
    },
    noBtn: {
      type: Boolean,
      value: false,
    },
    plain: {
      type: Boolean,
      value: false,
    },
    hotPosition: {
      type: String,
      value: 1,
      observer: function (newVal, oldVal, changePath) {
        let params = { hotPosition: newVal }
        this.getWordHotList(params) //获取轮播热词列表
      }
    }
    // pageSource: {
    //   type: String,
    //   value: '其他'
    // }
  },
  options: { virtualHost: true, styleIsolation: "shared" },
  ready() {
    let params = { hotPosition: this.data.hotPosition }
    this.getWordHotList(params) //获取轮播热词列表
  },
  methods: {
    async toSearchPage(e) {
      await interceptionPrivacyProtocol()
      const { frombtn } = e.currentTarget.dataset
      const { placeholderList, curIndex, pageSource } = this.data
      let pages = getCurrentPages() //获取加载的页面
      let currentPage = pages[pages.length - 1] //获取当前页面的对象 修改数量可以获取之前跳转页面的地址
      let url = '/' + currentPage.route //当前页面url
      let tolink = ''
      if (url == '/pages/index/index' || url == '/pages/column/index') {
        tolink = '2'
      } else if (url == '/pages/mall/index') {
        tolink = '1'
      }
      // return
      if (frombtn) {
        //保存搜索历史
        const keyWord = (placeholderList[curIndex] || {}).wordName
        if (!keyWord) {
          return showToast({
            title: '搜索词不能为空',
            type: TOAST_TYPE.WARNING
          })
        }
        const historyList = wx.getStorageSync('historyList') || []
        historyList.unshift(keyWord)
        let arr = Array.from(new Set(historyList))
        if (arr.length > 15) {
          arr.pop()
        }
        wx.setStorageSync('historyList', arr || [])
        this.getResultList({ keyword: keyWord })
      } else {
        wx.navigateTo({
          url: `/pages/search/index?curIndex=${curIndex}&tolink=${tolink}`,
        })
      }
    },
    // 点击文本框时 获取当前轮播词
    fromInput(curIndex, isFromBtn, isfocus) {
      // isfocus ? false : 
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
          const { showResultPage, isFromInput, isFromBtn } = this.data
          if (isFromBtn) { //来源-点击按钮 直接执行搜索
            this.onConfirm()
          } else {
            // 没有搜索结果时才自动聚焦
            if(!showResultPage){
              if (isFromInput) { //来源-点击文本框
                setTimeout(() => {
                  this.onFocus()
                }, 1000)
              }
            }
            
          }
        })
        .catch((err) => {
        })
    },

    // 获取列表
    getResultList(params) {
      showToast({ type: TOAST_TYPE.LOADING })
      queryResultList(params)
        .then(({ result }) => {
          hideToast().then(() => {
            const { isJumped, hotWord: link } = result

            if (isJumped === 1) {
              this.triggerEvent('open-page', { link })
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
        placeholder: (placeholderList[curIndex] || {}).wordName,
      });
    },
    onBlur(e) {
      const { value } = e.detail
      if (value == '') {
        this.setData({
          isFocus: false,
          placeholder: '',
        });
      }
    },
    onEdit(e) {
      const { value } = e.detail
      this.setData({ val: value })
      this.triggerEvent("edit", { value }) //返回父级参数
    },
    onClear() {
      this.setData({
        isFocus: true,
        val: '',
        isObser:true
      });
      this.triggerEvent("edit", { value: '' }) //返回父级参数
    },
    // 点击搜索按钮
    onConfirm() {
      const { placeholderList, curIndex, val } = this.data
      let value = '';
      if (val === '') {
        value = (placeholderList[curIndex] || {}).wordName
      } else {
        value = val || ''
      }
      // this.setData({ val: value })
      this.triggerEvent("search", { value: value }) //返回父级参数
    }
  },
});
