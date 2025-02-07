import { querySpuInfoRecommendList } from "@models/productModel";
import { hideToast, showToast } from "../../components/toast/index";
import { TOAST_TYPE } from "../../const/index";
import back from "../../behaviors/back";
import { track, TrackEventName } from "../../utils/sa";
import { SOURCE } from "../../const/index";
import { stringify } from "qs";
import { openPage } from "../../utils/index";
import {
  queryColumnInfo,
  queryAdList,
  queryRecommendList,
  updateLikeNum,
  addLikeCollection,
  delLikeCollection,
  statisticsOperate,
  queryRecommendDetail,
  queryRecommendId,
} from "../../models/recommendModel";

Page({
  data: {
    spuId: "", // 地址栏携带参数 用于查询某个spu下的内容列表
    columnId: "", // 地址栏携带参数 用于查询某个栏目下的内容列表
    columnInfo: {}, // 栏目详情
    adList: [], // 种草广告位列表

    categoryId: "", // 当前选中的分类ID
    categoryName: "", // 当前选中的分类名字
    recommentData: {
      // 用于保存种草列表的原始数据
      list: [], // 种草列表
      currPage: 1, //当前页数
      totalPage: 1, //总页数
    },
    topHei: 0, // 搜索区和页面导航的高度
    offsetTop: 0, // tabbar居顶部的偏移量
    isFixed: false, // 是否固定导航
    starttime: null, // 浏览起始时间 记录埋点浏览时间使用
    isRecommend: false, // 是否是种草
    loading: false,
  },
  behaviors: [back],
  onLoad(options) {
    // 记录预览开始时间
    this.setData({ starttime: Date.now() });
    // 查询Spu下的内容列表
    if (options.spuId) {
      this.setData({ spuId: options.spuId });
      this.getRecommentList({ page: 1 });
    }
    // 查询某个栏目下的内容列表
    if (options.columnId) {
      this.setData({ columnId: options.columnId });
      this.getBarHeight(); // 获取导航栏的高度
      this.getColumnDetail(); // 获取栏目详情
    }
  },

  // 获取导航栏高度
  getBarHeight() {
    const { statusBarHeight, platform } = wx.getSystemInfoSync();
    const barHei = platform === "android" ? 48 : 40;
    this.setData({ topHei: statusBarHeight + barHei });
  },

  // 获取栏目详情
  getColumnDetail() {
    showToast({ type: TOAST_TYPE.LOADING });
    const { columnId } = this.data;
    queryColumnInfo({ columnId })
      .then(async ({ result }) => {
        if (result.state) {
          const recommend = await queryRecommendId(); // 查询种草ID
          if (result.columnId === recommend.result) {
            this.setData({ isRecommend: true });
            this.getAdList(); // 获取广告列表
          }

          this.setData({ columnInfo: result });
          if (result.categorys && result.categorys.length === 1) {
            // 因为分类列表限制2个以上显示 所以需要在此处获取下内容列表
            const { recommendCategoryId, categoryName } = result.categorys[0] || {};
            this.setData({ categoryId: recommendCategoryId, categoryName: categoryName });
            this.getRecommentList({ page: 1 });
          }
        }
      })
      .catch(err => {
        showToast({
          title: err.msg || "暂无信息",
          type: TOAST_TYPE.WARNING,
        });
      })
      .finally(() => {
        if(!this.data.columnInfo.categorys || !this.data.columnInfo.categorys.length){
          this.setData({ loading: true });
        }
        hideToast();
      });
  },

  // 获取广告列表
  getAdList() {
    showToast({ type: TOAST_TYPE.LOADING });
    queryAdList()
      .then(({ result }) => {
        if (result.length) {
          result.forEach(item => {
            item.link = {
              href: item.href,
              jumpType: item.jumpType,
            };
          });
          this.setData({ adList: result });
          if (result && result.length) {
            wx.nextTick(() => {
              wx.createSelectorQuery()
                .select("#tabbar")
                .boundingClientRect()
                .selectViewport()
                .scrollOffset()
                .exec(rect => {
                  if (rect.length) {
                    this.setData({ offsetTop: rect[0].top - this.data.topHei });
                  }
                });
            });
          }
        } else {
          this.setData({ isFixed: true });
        }
      })
      .catch(err => {
        showToast({
          title: err.msg || "暂无信息",
          type: TOAST_TYPE.WARNING,
        });
      })
      .finally(() => {
        hideToast();
      });
  },

  // 监听种草分类 获取种草列表
  changeClassify(e) {
    // 点击的时候报告上一个分类的埋点 start
    if (this.data.categoryId) this.updatePoint();
    this.setData({ starttime: Date.now() });
    // 点击的时候报告上一个分类的埋点 end
    const { categoryId, categoryName } = e.detail;
    this.setData({ categoryId, categoryName });
    wx.pageScrollTo({ scrollTop: this.data.offsetTop, duration: 0 });
    // 获取当前分类下的种草列表
    this.getRecommentList({ page: 1 });
  },

  // 查询种草列表
  getRecommentList(page) {
    const { categoryId, spuId } = this.data;
    (spuId ? querySpuInfoRecommendList({ spuId, ...page }) : queryRecommendList({ categoryId, ...page }))
      .then(({ result }) => {
        const {
          recommentData: { list },
        } = this.data;
        if (result.currPage !== 1) {
          result.list = list.concat(result.list);
        }
        this.setData({ recommentData: result || {} });
      })
      .catch(err => {
        showToast({
          title: err.msg || "暂无信息",
          type: TOAST_TYPE.WARNING,
        });
      })
      .finally(() => {
        if(!this.data.recommentData.list || !this.data.recommentData.list.length){
          this.setData({ loading: true })
        }
      });
  },

  // 滚动到底部 加载更多
  onReachBottom() {
    const { totalPage, currPage } = this.data.recommentData;
    if (currPage < totalPage) {
      this.getRecommentList({
        page: currPage + 1,
      });
    }
  },

  // 设置导航固定
  onPageScroll({ scrollTop }) {
    if (scrollTop >= this.data.offsetTop) {
      !this.data.isFixed && this.setData({ isFixed: true });
    } else {
      this.data.isFixed && this.setData({ isFixed: false });
    }
  },

  // 跳转详情
  goDetail(e) {
    const { info } = e.detail || {};
    const { recommendId, type } = info || {};
    if (type !== 3) {
      // 图文
      const pages = getCurrentPages();
      const { source, mid, ssid } = pages.at(-1).options;
      const params = {};
      const app = getApp();
      Object.assign(
        params,
        app.globalData.customer_channel
          ? app.globalData.customer_channel
          : {
              source: source || SOURCE.BH_MALL,
              position: "recb",
              targetId: recommendId,
              ssid: ssid || mid || "",
            },
        { id: recommendId, page_id: this.data.categoryId, page_name: this.data.categoryName }
      );
      const link = {
        jumpType: type,
        href:
          type === 1
            ? `/pages/recommend/graphicDetail/index?${stringify(params)}`
            : `/pages/recommend/videoDetail/index?${stringify(params)}`,
      };
      openPage.call(this, { link }, () => this.updateLike(recommendId)); // 跨页面通讯 解决内容详情点赞后 同步列表中的点赞数量
    } else {
      // 直播
      this.goLiveDetail(recommendId);
    }
  },

  // 跳转直播详情
  goLiveDetail(recommendId) {
    showToast({ type: TOAST_TYPE.LOADING });
    queryRecommendDetail({
      recommendId,
    })
      .then(({ result }) => {
        if (result.state) {
          const { livingId } = result;
          let params = {
            // href: `plugin://wxcc3540ea25b97878/index?sceneId=${sceneId}&detailId=${recommendId}&businessId=${businessId}`,
            href: `/pages/live/player/index?roomId=${livingId}`,
            jumpType: 8,
          };
          openPage.call(this, { link: params });
        } else {
          wx.navigateTo({
            url: "/pages/recommend/empty/index",
          });
        }
      })
      .catch(({ code }) => {
        if (code === 4004) {
          wx.navigateTo({
            url: "/pages/recommend/empty/index",
          });
        }
      })
      .finally(() => {
        hideToast();
      });
  },

  // 点赞
  onPraise(e) {
    const { item } = e.currentTarget.dataset || {};
    // 添加取消点赞
    (item.isLike ? delLikeCollection : addLikeCollection)({
      subjectId: item.recommendId,
      subjectType: 5,
      favoriteType: 2,
      // isDeleted: !item.isLike ? 1 : 0,
    })
      .then(async () => {
        showToast({
          title: !item.isLike ? "点赞成功" : "取消点赞",
          type: "",
        });
        // 点赞统计
        await statisticsOperate({
          recommendId: item.recommendId,
          favoriteType: 2,
          cancelState: item.isLike,
        });
        // 更新当前内容点赞数量
        this.updateLike(item.recommendId);
        // 增加点赞埋点
        this.setLikePoint(item);
      })
      .catch(async err => {
        if (err.code === 401) {
          //检测是否登录（未登录就出登录半弹层）
          const { openLoginModal } = this.selectComponent(`#authorize`);
          await openLoginModal();
          this.getRecommentList({ page: 1 });
        } else {
          showToast({
            title: err.msg || "暂无信息",
            type: TOAST_TYPE.WARNING,
          });
        }
      });
  },

  // 更新点赞数量
  updateLike(id) {
    updateLikeNum({
      subjectId: id,
      subjectType: 5,
    }).then(({ result }) => {
      const { recommentData } = this.data;
      const filterData = recommentData.list.find(item => item.recommendId === id);
      if (filterData) {
        const { isLike, likeCount } = result;
        filterData.likeCount = likeCount;
        filterData.isLike = isLike;
        this.setData({ recommentData });
      }
    });
  },

  // 浏览列表页埋点
  updatePoint() {
    const { starttime, columnInfo } = this.data;
    const endtime = Date.now();
    const cycle_time = Math.floor((endtime - starttime) / 1000);
    const { categoryName } = this.data;
    let trackOptions = {
      special_name: columnInfo.columnName,
      cate_1: categoryName,
      list_type: "list",
      starttime,
      endtime,
      cycle_time,
    };
    track(TrackEventName.Boss_SeedingList, trackOptions);
  },

  // 点赞埋点
  setLikePoint(data) {
    track(TrackEventName.Boss_SeedingInteract, {
      curr_page_info: {
        page_source: "种草列表页",
      },
      action_type: data.isLike ? "remove" : "add",
      action_name: "点赞",
      content_label: data.tag || "",
      detail_id: data.recommendId,
      content_name: data.title || "",
      action_code: 2,
    });
  },

  handBack() {
    const pages = getCurrentPages();
    if (pages.length <= 1) {
      wx.reLaunch({
        url: `/pages/index/index`,
      });
    } else {
      wx.navigateBack();
    }
  },

  onHide() {
    this.updatePoint();
  },

  onUnload() {
    this.updatePoint();
  },
});
