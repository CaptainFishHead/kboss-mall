// pages/collection/index.js
import {queryCollectionColumnList, queryCollectionList} from "../../../models/collectModel";
import {updateLikeNum, addLikeCollection, delLikeCollection, statisticsOperate,} from "../../../models/recommendModel";
import {hideToast, showToast} from "../../../components/toast/index";
import {TOAST_TYPE} from "../../../const/index";
import { stringify } from "qs";
import { openPage } from "../../../utils/index";
import { track, TrackEventName } from "../../../utils/sa";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    columnList: [],// 收藏栏目列表
    columnId: '', // 当前选中的栏目ID
    columnName: '', // 当前选中的栏目名字
    templateType: '', // 当前选中的栏目模板类型
    collectionData: {
      list: [], // 收藏列表
      currPage: 1, //当前页数
      totalPage: 1, //总页数
    },
    topHei: 0, // 搜索区和页面导航的高度
    offsetTop: 0, // tabbar居顶部的偏移量
    isFixed: false, // 是否固定导航
    loading: true, // 是否正在加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 记录预览开始时间
    this._starttime = Date.now();
    showToast({type: TOAST_TYPE.LOADING});
    this.getBarHeight()
    // this.getColumnDetail()
  },
  onShow() {
    this.getColumnDetail()
  },
  onHide(){
    // 埋点
    const endtime = Date.now();
    const cycle_time = Math.floor((endtime - this._starttime) / 1000)
    track(TrackEventName.Boss_CollectList, {
      starttime: this._starttime,
      endtime,
      cycle_time
    })
  },

  // 获取导航栏高度
  getBarHeight(){
    const {statusBarHeight, platform} = wx.getSystemInfoSync();
    const barHei = platform=== 'android' ? 48 : 40;
    this.setData({topHei: statusBarHeight + barHei});
  },
  // 获取收藏分类
  getColumnDetail() {
    queryCollectionColumnList({}).then(({result}) => {
      this.setData({columnList: result});
      this.setData({columnId: result&&result[0] ? result[0].columnId : ''});
      this.setData({columnName: result&&result[0] ? result[0].columnName : ''});
      this.setData({templateType: result&&result[0] ? result[0].templateType : ''});
      this.getCollectionList({page: 1});
    })
  },
  // 监听收藏分类 获取收藏列表
  changeClassify(e){
    // 点击的时候报告上一个分类的埋点 start
    // if (this.data.columnId) this.updatePoint();
    this.setData({starttime: Date.now()})
    // 点击的时候报告上一个分类的埋点 end
    const {columnId, columnName, templateType} = e.detail;
    this.setData({columnId, columnName, templateType});
    wx.pageScrollTo({scrollTop: this.data.offsetTop, duration: 0})
    // 获取当前分类下的收藏列表
    this.getCollectionList({page: 1});
  },
  // 获取收藏列表
  getCollectionList(page){
    this.setData({loading: true})
    const { columnId } = this.data;
    queryCollectionList({
      ...page,
      columnId: columnId,
      subjectType: 5,
      favoriteType: 1
    }).then(({result}) => {
      const {collectionData: {list}} = this.data;
      // 分页合并数据
      if(result.currPage !== 1) {
        result.list = list.concat(result.list);
      }
      this.setData({collectionData: result || {}});
    }).finally(() => {
      hideToast();
      this.setData({loading: false})
    })
  },

  // 滚动到底部 加载更多
  onReachBottom () {
    const {totalPage, currPage} = this.data.collectionData;
    if(currPage < totalPage){
      this.getCollectionList({
        page: currPage+1
      })
    }
  },
  // 点赞
  onPraise(e){
    const {item} = e.currentTarget.dataset || {};
    // 添加取消点赞
    (item.isLike ? delLikeCollection : addLikeCollection)({
      subjectId: item.recommendId,
      subjectType: 5,
      favoriteType: 2,
      // isDeleted: !item.isLike ? 1 : 0,
    }).then(async() => {
      showToast({
        title: !item.isLike ? '点赞成功' : '取消点赞',
        type: ''
      })
      // 点赞统计
      await statisticsOperate({
        recommendId: item.recommendId,
        favoriteType: 2,
        cancelState: item.isLike
      });
      // 更新当前内容点赞数量
      this.updateLike(item.recommendId);
      // 增加点赞埋点
      this.setPoint(item);
    }).catch(async(err) => {
      if(err.code === 401) {
        //检测是否登录（未登录就出登录半弹层）
        const { openLoginModal } = this.selectComponent(`#authorize`)
        await openLoginModal();
        this.getCollectionList({page: 1});
      } else {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      }
    })
  },
  // 更新点赞
  updateLike(recommendId){
    // const {item:recommendItem} = e.currentTarget.dataset;
    updateLikeNum({
      subjectId: recommendId,
      subjectType: 5
      }).then(({result}) => {
        const {collectionData} = this.data;
        const filterData = collectionData.list.find(item => item.recommendId === recommendId);
        if(filterData) {
          const {isLike, likeCount} = result;
          filterData.likeCount = likeCount;
          filterData.isLike = isLike;
          this.setData({collectionData})
          
        }
      })
  },
  // 设置点赞埋点
  setPoint(data) {
    const {isLike, tag, recommendId, title} = data;
    track(TrackEventName.Boss_SeedingInteract, {
      curr_page_info: {
        page_source: '我的收藏'
      },
      action_type: isLike ? 'remove' : 'add',
      action_name: '点赞',
      content_label: tag || '',
      detail_id: recommendId,
      content_name: title || '',
      action_code: 2
    })
  },
  // 设置导航固定
  onPageScroll({scrollTop}){
    if(scrollTop >= this.data.offsetTop) {
      !this.data.isFixed && this.setData({isFixed: true});
    } else {
      this.data.isFixed && this.setData({isFixed: false});
    }
  },

  // 跳转详情
  goDetail(e){
    const {info} = e.detail || {};
    const {recommendId, type} = info || {};
    if (type !== 3 ) { // 图文
      const pages = getCurrentPages()
      const {source, mid, ssid} = pages.at(-1).options;
      const params = {};
      const app = getApp()
      Object.assign(params,app.globalData.customer_channel?app.globalData.customer_channel:{
        source: source || SOURCE.BH_MALL,
        position: 'recb',
        targetId: recommendId,
        ssid: ssid || mid || ''
      },{ id: recommendId, page_id: this.data.columnId, page_name: this.data.columnName })
      const link = {
        jumpType: type,
        href: type === 1 ? `/pages/recommend/graphicDetail/index?${stringify(params)}` :  `/pages/recommend/videoDetail/index?${stringify(params)}`
      }
      openPage.call(this, {link}, () => this.updateLike(recommendId)); // 跨页面通讯 解决内容详情点赞后 同步列表中的点赞数量
    } else { // 直播
      this.goLiveDetail(recommendId)
    }
  },

  // 跳转直播详情
  goLiveDetail(recommendId){
    showToast({type: TOAST_TYPE.LOADING});
    queryRecommendDetail({
      recommendId
    }).then(({result}) => {
      if(result.state) {
        const {livingId} = result;
        let params = {
            // href: `plugin://wxcc3540ea25b97878/index?sceneId=${sceneId}&detailId=${recommendId}&businessId=${businessId}`,
            href: `/pages/live/player/index?roomId=${livingId}`,
            jumpType: 8
          }
        openPage.call(this, {link: params});
      } else {
        wx.navigateTo({
          url: '/pages/recommend/empty/index',
        })
      }
    })
    .catch(({code}) => {
      if(code === 4004) {
        wx.navigateTo({
          url: '/pages/recommend/empty/index',
        })
      }
    })
    .finally(() => {
      hideToast();
    })
  },
})