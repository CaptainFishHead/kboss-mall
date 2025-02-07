// custom-tab-bar/index.js
import { getEnterOptions, interceptionPrivacyProtocol } from "../../utils/index";
import { CARRIER_PAGES, SOURCE, PAGE_SOURCES } from "../../const/index";
import { track, TrackEventName } from "@utils/sa";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isBlack: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selected: null,
    list: [
      // {
      // 	pagePath: "pages/demo/index",
      // 	text: 'demo',
      // 	iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/home.png",
      // 	selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/home_selected.png"
      // },
      {
        pagePath: "pages/index/index",
        text: '首页',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/home.v2.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_homeselected.v2.png"
      },
      {
        pagePath: "pages/column/index",
        text: '内容',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_column.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_columnselected.v2.png"
      },
      {
        pagePath: "pages/chatai/index",
        text: '',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_ai.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_ai.png?v=1.0.1"
      },
      {
        pagePath: "pages/mall/index",
        text: '商城',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_mall.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_mallselected.v2.png"
      },
      {
        pagePath: "pages/mine/index",
        text: '我的',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/mine.v2.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_myselected.v2.png"
      }
    ],
    listBlack: [
      {
        pagePath: "pages/index/index",
        text: '首页',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/home.v2.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_homeselected.v2.png"
      },
      {
        pagePath: "pages/column/index",
        text: '内容',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_column.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_columnselected.v2.png"
      },
      {
        pagePath: "pages/chatai/index",
        text: '',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_ai.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_ai.png?v=1.0.1"
      },
      {
        pagePath: "pages/mall/index",
        text: '商城',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_mall.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_mallselected.v2.png"
      },
      {
        pagePath: "pages/mine/index",
        text: '我的',
        iconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/mine.v2.png?v=1.0.1",
        selectedIconPath: "https://static.tojoyshop.com/images/wxapp-boss/tab-bar/icon_tab_myselected.v2.png"
      }
    ],
    aiBotPath: "pages/chatai/index"
  },
  pageLifetimes: {
    show() {
      this.currentTab()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    currentTab() {
      const pages = getCurrentPages()
      const url = pages[pages.length - 1].route
      const selected = Math.max(this.data.list.findIndex(({ pagePath }) => url === pagePath), 0)
      this.setData({ selected })
    },
    switchTab(e) {
      let { item } = e.detail
      if (item.pagePath == 'pages/chatai/index') {
        // 小康AI点击埋点
        track(TrackEventName.Boss_KBossAI, {
          curr_page_info: {
            page_source: '底部导航栏'
          }
        });
      } else {
        // 底部导航栏点击 埋点
        const pages = getCurrentPages();
        const prevPage = pages.at(-1) || {};
        track(TrackEventName.Boss_TabBar_Click, { tab_name: item.text, curr_page_info: {
          page_source: prevPage.route ? PAGE_SOURCES[prevPage.route].title : ''
        }});
      }
      interceptionPrivacyProtocol()
        .then(() => {
          const { item: { pagePath: url }, /*index*/ } = e.detail
          let aiPath = this.data.aiBotPath
          if (url === aiPath) {
            wx.navigateTo({
              url: `/${aiPath}?from=tab`,
            }).catch(err => {
              console.log(err)
            })
            return
          }
          wx.switchTab({ url: `/${url}` })
        })
        .catch(() => {
          this.currentTab()
        })
    }
  }
})
