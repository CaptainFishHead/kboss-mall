// pages/recommend/special/index.js
import {queryTopicDetail, queryRecommendList, queryRecommendDetail, updateLikeNum, delLikeCollection, addLikeCollection, statisticsOperate} from "../../../models/recommendModel";
import {hideToast, showToast} from "../../../components/toast/index";
import {TOAST_TYPE} from "../../../const/index";
import {openPage} from "../../../utils/index";
import { track, TrackEventName } from "../../../utils/sa";
import back from "../../../behaviors/back";
Page({
  data: {
    topicId: 0,
    topicInfo: {}, // 专题信息
    topicData: {
      list: [], // 专题列表
      currPage: 1, //当前页数
      totalPage: 1, //总页数
    }
  },
  _starttime: 0,
  behaviors:[back],

  onLoad(options){
    if(options.topicId){
      this.setData({topicId: options.topicId});
      // 获取专题详情
      this.getTopicDetail();
      // 记录预览开始时间
      this._starttime = Date.now();
    }
  },
  onHide(){
    this.setPoint();
  },
  onUnload(){
    this.setPoint();
  },

  // 获取专题详情信息
  getTopicDetail() {
    const {topicId} = this.data;
    showToast({type: TOAST_TYPE.LOADING});
    queryTopicDetail({
      recommendTopicId: topicId
    }).then(({result}) => {
      this.setData({topicInfo: result});
      if(result.state){
        // 获取专题列表
        this.getTopicList();
      }
    }).finally(() => {
      hideToast();
    })
  },

  // 获取专题列表
  getTopicList(page){
    const {topicId, topicInfo} = this.data;
    queryRecommendList({
      topicId,
      ...page
    }).then(({result}) => {
      const {topicData: {list}} = this.data;
      // 组合跳转链接
      result.list.forEach(item => {
        const {type, recommendId} = item;
        if(type !== 3) {
          let href = '';
          if(type === 1){
            href = `/pages/recommend/graphicDetail/index?id=${recommendId}&page_id=${topicInfo.recommendTopicId}&page_name=${topicInfo.topicName}`;
          } else if(type === 2) {
            href = `/pages/recommend/videoDetail/index?id=${recommendId}&page_id=${topicInfo.recommendTopicId}&page_name=${topicInfo.topicName}`;
          }
          item.link = { jumpType: type, href }
        }
      })
      // 分页合并数据
      if(result.currPage !== 1) {
        result.list = list.concat(result.list);
      }
      this.setData({topicData: result || {}});
    })
  },

  // 滚动到底部 加载更多
  scrolltolower () {
    const {totalPage, currPage} = this.data.topicData;
    if(currPage < totalPage){
      this.getTopicList({
        page: currPage+1
      })
    }
  },

  // 获取种草详情信息 直播需要
  getRecommendDetail(id) {
    showToast({type: TOAST_TYPE.LOADING});
    queryRecommendDetail({
      recommendId: id
    }).then(({result}) => {
      const {state,livingId} = result;
      if(state){
        let link = {
          // href: `plugin://wxcc3540ea25b97878/index?sceneId=${sceneId}&detailId=${id}&businessId=${businessId}`,
          href: `/pages/live/player/index?roomId=${livingId}`,
          jumpType: 8
        };
        openPage.call(this, {link});
      } else {
        wx.navigateTo({
          url: '/pages/recommend/empty/index',
        })
      }
    }).catch(({code}) => {
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

  // 设置埋点
  setPoint(){
    const { topicInfo } = this.data;
    const endtime = Date.now();
    const cycle_time = Math.floor((endtime - this._starttime) / 1000)
    let trackOptions = {
      cate_1: '',
      list_type: 'special',
      special_id: topicInfo.recommendTopicId || '',
      detail_id: topicInfo.recommendTopicId || '',
      special_name: topicInfo.topicName || '',
      starttime: this._starttime,
      endtime,
      cycle_time
    };
    track(TrackEventName.Boss_SeedingList, trackOptions)
  },

  // 跳转详情
  goDetail(e){
    const {info} = e.detail || {};
    if(info.type !== 3){ // 图文
      return openPage.call(this, {link: info.link}, () => this.upadteRecommendDetail(info.recommendId))
    }
    return this.getRecommendDetail(info.recommendId) // 直播
  },

  // 更新点赞数量
  upadteRecommendDetail(id) {
    updateLikeNum({
      subjectId: id,
      subjectType: 5
    }).then(({result}) => {
      const {topicData} = this.data;
      const filterData = topicData.list.find(item => item.recommendId === id);
      if(filterData) {
        const {isLike, likeCount} = result;
          filterData.likeCount = likeCount;
          filterData.isLike = isLike;
          this.setData({topicData});
      }
    })
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
      this.upadteRecommendDetail(item.recommendId);
      // 增加点赞埋点
      this.setLikePoint(item);
    }).catch(async(err) => {
      if(err.code === 401) { // 未登录 弹出登录弹窗
        const { openLoginModal } = this.selectComponent(`#authorize`)
        await openLoginModal();
        this.getTopicList();
      } else {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      }
    })
  },

  // 点赞埋点
  setLikePoint(data){
    track(TrackEventName.Boss_SeedingInteract, {
      curr_page_info: {
        page_source: '种草专题页'
      },
      action_type: data.isLike ? 'remove' : 'add',
      action_name: '点赞',
      content_label: data.tag || '',
      detail_id: data.recommendId,
      content_name: data.title || '',
      action_code: 2
    })
  },

  handBack(){
    const pages = getCurrentPages();
			if (pages.length <= 1) {
        wx.reLaunch({
          url: `/pages/index/index`
        })
      } else {
        wx.navigateBack();
      }
  },

 
})
