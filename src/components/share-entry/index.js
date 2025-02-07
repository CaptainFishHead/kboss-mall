import { wxFuncToPromise } from "../../utils/wxUtils";
import { showToast, hideToast } from "../../components/toast/index";
import { TOAST_TYPE, API_VERSION, PAGE_SOURCES } from "../../const/index";
import { getPageShareInfo } from "../../utils/sharePoster";
import env from "../../config/env";
import { interceptionPrivacyProtocol } from "@utils/index";
import {track, TrackEventName} from "@utils/sa";

Component({
  properties: {
    // 下单标识，例：种草分享须传入recommendId  目前只在种草模块应用
    targetId: {
      type: String,
      value: ''
    },
    // 区分下单模块 例：种草分享需传入recb 目前只在种草模块应用
    position: {
      type: String,
      value: ''
    },
    /*  ====== 埋点使用 start ====== */
    pageId: {
      type: String,
      value: ''
    },
    pageName: {
      type: String,
      value: ''
    }
    /*  ====== 埋点使用 end ====== */
  },
  options: {
    multipleSlots: true,
  },
  data: {
    visible: false,
    isOpen: false,
    pageUrl: '',
    pageOptions: ''
  },
  pageLifetimes: {
    show() {
      // 隐藏上一次离开页面（hide）还没有隐藏的提示
      hideToast()
      // setTimeout(hideToast, 100)
    }
  },
  methods: {
    async openDialog() {
      await interceptionPrivacyProtocol()
      this.setData({
        isOpen: true,
        visible: true
      })
    },
    hideDialog() {
      this.setData({
        visible: false
      })
      setTimeout(()=>{
        this.setData({
          isOpen: false
        })
      },300)
    },
    // 显示半弹窗
    shareBtn() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const {route, options} = currentPage;
      this.setData({ pageUrl: `/${route}`, pageOptions: options});
      this.openDialog()
    },
    // 复制链接
    async setClipboard() {
      const {pageUrl, pageOptions, position, targetId} = this.data;
      if(position) {// 下单标识，例：种草分享须传入recommendId  目前只在种草模块应用
        pageOptions.position= position;
      }
      if(targetId) { // 区分下单模块 例：种草分享需传入recb 目前只在种草模块应用
        pageOptions.targetId= targetId;
        pageOptions.id= targetId; // 注：种草视频轮播 id需要重置为当前展示的种草ID 图文重置不影响
      }
      const { v2_code: shareId, wxQrCode: shareCode, urlLink } = await getPageShareInfo({ pageUrl, pageOptions });
      const url = `pages/index/index?v2_code=${shareId}`;
      const pathLink = `我发现一家好店推荐给你！${urlLink}`;
      wxFuncToPromise(`setClipboardData`, {
        data: pathLink
      })
        .then(() => {
          this.hideDialog()
          wx.hideToast();
          showToast({
            type: TOAST_TYPE.SUCCESS,
            title: '复制成功，快去粘贴吧',
            desc: ''
          });
          this.sharePoint('复制链接分享')
          this.triggerEvent('copyUrl')
        })
    },
    // 跳往生成海报
    onCreatePoster() {
      const {pageUrl, pageOptions} = this.data;
      this.triggerEvent('createPoster', {pageUrl, pageOptions})
      this.hideDialog()
      this.sharePoint('分享海报')
    },
    // 分享好友
    onShareFriend() {
      const {pageUrl, pageOptions} = this.data;
      this.triggerEvent('shareFriend', {pageUrl, pageOptions})
      this.hideDialog()
      this.sharePoint('好友分享')
    },
    // 跳往生成分享码
    onShareCode() {
      const {pageUrl, pageOptions} = this.data;
      this.triggerEvent('createShareCode', {pageUrl, pageOptions})
      this.hideDialog()
      this.sharePoint('分享码分享')
    },
    // 分享埋点
    sharePoint(type){
      const {pageId, pageName} = this.data;
      const pages = getCurrentPages()
      if(pages.length) {
        const currentPage = pages.at(-1) || {};
        if(currentPage.route) {
          track(TrackEventName.Boss_SharePublic, {
            share_type: type,
            curr_page_info: {
              page_source: PAGE_SOURCES[currentPage.route].title,
              page_id: pageId,
              page_name: pageName
            }
          });
        }
      }
      
    }
  },
  
});
