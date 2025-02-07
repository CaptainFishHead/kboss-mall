import {
  addLikeCollection,
  delLikeCollection,
  updateLikeNum,
  queryRecommendDataById,
  statisticsOperate
} from "../../../models/recommendModel"
import {track, TrackEventName} from "../../../utils/sa";
import {showToast} from "../../../components/toast/index";
import {getPageShareInfo, toPosterPage} from "../../../utils/sharePoster";
import {isLogged} from "@utils/index";
const theme = {
  white: {
    position: 'fixed',
    background: '#fff',
    color: '#000',
    stars: {
      normol: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/stars.png',
      active: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/stars-active.png'
    },
    fabulous: {
      normol: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/fabulous.png',
      active: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/fabulous-active.png'
    },
    share: {
      normol: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/share-icon.png',
      active: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/share-icon.png'
    },
  },
  black: {
    position: 'static',
    background: '#000',
    color: '#fff',
    stars: {
      normol: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/starts-white.png',
      active: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/stars-active.png'
    },
    fabulous: {
      normol: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/fabulous-white.png',
      active: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/fabulous-active.png'
    },
    share: {
      normol: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/share-white.png',
      active: 'https://static.tojoyshop.com/images/wxapp-boss/recommend/share-white.png'
    },
  }
}

Component({
  properties: {
    theme: {
      type: String,
      value: 'white'
    },
    info: {
      type: Object,
      value: {},
      observer(val, old) {
        if (val.recommendId !== old.recommendId) {
          this.setData({
            recommendId: val.recommendId,
            isFavorite: val.isFavorite,
            favoriteNum: val.favoriteBaseNum + val.favoriteFactNum,
            isLike: val.isLike,
            likeNum: val.likeBaseNum + val.likeFactNum,
            shareNum: val.shareNum ? val.shareNum : val.shareBaseNum + val.shareFactNum
          })
        }
      }
    }
  },
  options: {virtualHost: true},
  pageLifetimes: {
    show() {
      this.updateNum(0)
    },
  },
  lifetimes: {
    attached () {
      this.setData({themeInfo: theme[this.data.theme]})
    },
  },
  data: {
    themeInfo: null,
    recommendId: 0,
    isFavorite: 0, // 是否收藏 0:否 1:是
    isLike: 0, // 是否点赞 0:否 1: 是
    favoriteNum: 0, // 收藏数量
    likeNum: 0, // 点赞数量
    shareNum: 0, // 分享数量
  },
  
  methods: {
    // 收藏与取消
    handleFavorite() {
      this.commonHandle({
        isHandle: 'isFavorite',
        handleType: 1,
        handleName: '收藏'
      })
    },
    // 点赞与取消
    handleLike() {
      this.commonHandle({
        isHandle: 'isLike',
        handleType: 2,
        handleName: '点赞'
      })
    },
    // 分享
    handleShare() {
      this.setPoint('add', '分享', 3)
      this.statistics({
        favoriteType: 4,
        cancelState: false
      }).then(() => {
        // 更新分享数量
        this.updateNum(3)
      })
    },
    // 点赞收藏通用处理逻辑
    commonHandle(params){
      const { openLoginModal } = this.selectComponent(`#authorize`)
      openLoginModal().then(result => {
        if (result.type === 'success') {
          this.triggerEvent("loginSuccess"); // 登录成功
          this.updateNum(params.handleType) // 登录成功更新点赞收藏数据
        } else {
          this.triggerEvent("logged"); // 已经是登录状态
          const handleInfo = this.data[params.isHandle] ? {
            isDeleted: 0,
            cancelState: true,
            key: 'remove'
          } : {
            isDeleted: 1,
            cancelState: false,
            key: 'add'
          }
          this.setPoint(handleInfo.key, params.handleName, params.handleType);
          this.handleApi({ favoriteType: params.handleType, handleName: params.handleName, isDeleted: handleInfo.isDeleted });
          this.statistics({ favoriteType: params.handleType, cancelState: handleInfo.cancelState })
        }
      }).catch(err => {
        // 登录失败
      })
    },
    // 添加删除 点赞、收藏 favoriteType[收藏还是点赞] isDeleted[添加还是删除]
    handleApi(params) {
      const {recommendId} = this.data;
      const {favoriteType, isDeleted, handleName} = params;
      const api = isDeleted === 0 ? delLikeCollection: addLikeCollection;
      delete params.handleName;
      api({
        subjectId: recommendId,
        subjectType: 5,
        ...params
      }).then(() => {
        showToast({
          title: `${isDeleted === 0 ? '取消' + handleName : handleName + '成功'}`,
          type: ''
        })
        // 更新点赞、收藏数量
        this.updateNum(favoriteType);
      })
    },
    // 查询分享数量
    queryShareNum() {
      return queryRecommendDataById({recommendId: this.data.recommendId}).then(({result}) => {
        this.setData({ shareNum: result.shareNum })
        return result
      })
    },
    // 查询点赞收藏数据
    queryDetailNum(handleType) {
      return updateLikeNum({
        subjectId: this.data.recommendId,
        subjectType: 5
      }).then(({result}) => {
        this.setData({
          isFavorite: result.isFavorite,
          favoriteNum: result.favoriteCount,
          isLike: result.isLike,
          likeNum: result.likeCount
        })
        return result
      })
    },
    // 通知外部数据更新
    async updateNum(handleType){
      // handleType 0 全部更新 1、2 更新点赞收藏、3 更新分享
      let shareNum = {}, detailNum = {}
      if(handleType === 0 || handleType === 3) {
        shareNum = await this.queryShareNum()
      }
      if (handleType === 0 || handleType === 1 || handleType === 2) {
        detailNum = await this.queryDetailNum()
      }
      this.triggerEvent('update', {...Object.assign({}, shareNum, detailNum), handleType});
    },
    // 统计点赞、收藏、分享
    statistics(params) {
      const {recommendId} = this.data;
      return statisticsOperate({
        recommendId,
        ...params
      });
    },
    // 计算海报尺寸 图文比例： 0.58  视频比例： 1.085
    posterSize({width, height}) {
      if (width && height) { // 图文
        return {width: width * 0.58, height: height * 0.58};
      } else {
        return {width: 434, height: 327};
      }
    },
    // 获取分享信息
    async getShareInfo({pageUrl, pageOptions}) {
      const {imgList, title, remark, coverImgUrl, sliderSize, recommendId} = this.data.info || {};
      const {width, height} = this.posterSize(sliderSize || {});
      const params = {...pageOptions, position: 'recb', targetId: recommendId, id: recommendId}; // 注： 视频详情有上滑轮博功能 需要重新赋值id为当前种草ID
      const { v2_code: shareId, wxQrCode: shareCode } = await getPageShareInfo({ pageUrl, pageOptions: params });
      return {
        width,
        height,
        imgUrl: coverImgUrl || imgList[0],
        title,
        remark,
        shareId,
        shareCode
      }
    },
    // 生成海报
    async createPoster(e) {
      const {width, height, imgUrl, title, remark, shareId, shareCode} = await this.getShareInfo(e.detail);
      const posterParams = [{
        width: 596,
        height: 500 + height,
        background: '#fff',
        elements: [
          {
            type: 'IMG',
            content: imgUrl,
            width: 596,
            height: 622 + height,
            gaussBlur: true, // 开启高斯模糊
            gaussRadius: 50,
            align: 'center', // 对齐方式
            zIndex: 0,
            x: 0,
            y: 0
          },
          {
            type: 'RECT', // 矩形
            width: 596, // 矩形宽度
            height: 622 + height, // 矩形高度
            align: 'center', // 对齐方式
            color: 'rgba(255, 255, 255, .5)', // 矩形颜色
            borderRadius: 0,
            zIndex: 1,
            x: 0,
            y: 0
          },
          {
            type: 'RECT', // 矩形
            width: 478, // 矩形宽度
            height: 182 + height, // 矩形高度
            align: 'center', // 对齐方式
            color: 'rgba(255, 255, 255, 1)', // 矩形颜色
            borderRadius: 8,
            zIndex: 2,
            x: 59,
            y: 64
          },
          {
            type: 'IMG',
            content: imgUrl,
            width: width,
            height: height,
            borderRadius: 6,
            align: 'center', // 对齐方式
            zIndex: 2,
            x: 81,
            y: 84
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: title || '',
            width: 434,
            height: 42,
            align: 'left', // 对齐方式
            fontFamily: '',
            fontWeight: 500,
            color: '#333333',
            fontSize: 30,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 2,
            x: 80,
            y: 99 + height
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: remark || '',
            width: 434,
            height: 60,
            align: 'left', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333333',
            fontSize: 24,
            maxLine: 2, // 最大行数 超出自动显示省略号
            zIndex: 2,
            x: 81,
            y: 154 + height
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: '长按识别二维码',
            width: 225,
            height: 38,
            align: 'left', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333',
            fontSize: 25,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 2,
            x: 68,
            y: 332 + height
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: '开启健康生活新方式',
            width: 225,
            height: 38,
            align: 'left', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333',
            fontSize: 25,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 2,
            x: 68,
            y: 370 + height
          },
          {
            type: 'RECT', // 矩形
            width: 148, // 矩形宽度
            height: 148, // 矩形高度
            align: 'left', // 对齐方式
            color: 'rgba(255, 255, 255, 1)', // 矩形颜色
            borderRadius: 74,
            zIndex: 2,
            x: 371,
            y: 291 + height
          },
          {
            type: 'IMG',
            content: shareCode,
            width: 130,
            height: 130,
            align: 'left', // 对齐方式
            zIndex: 2,
            x: 380,
            y: 300 + height
          }
        ]
      }];
      toPosterPage({
        type: 1,
        shareId,
        shareParams: posterParams,
        title,
        imgUrl
      });
    },
    // 生成分享码
    async createShareCode(e) {
      const {imgUrl, title, shareId, shareCode} = await this.getShareInfo(e.detail);
      const shareCodeParams = [{
        width: 596,
        height: 940,
        background: {
          rotate: 90, // 渐变角度，取0到90度 从上到下渐变取90度， 从左到右渐变取0度  对角为45度
          colors: [[0, '#FFF5E8'], [0.6, '#FFFFFF']] // 建变过程控制，0 到 1，可设置多个 0.2 0.5 等等
        },
        elements: [
          {
            type: 'RECT', // 矩形
            width: 536, // 矩形宽度
            height: 490, // 矩形高度
            align: 'center', // 对齐方式
            color: 'rgba(255, 255, 255, 1)', // 矩形颜色
            borderRadius: 8,
            zIndex: 0,
            x: 30,
            y: 40
          },
          {
            type: 'IMG',
            content: shareCode,
            width: 400,
            height: 400,
            align: 'left', // 对齐方式
            zIndex: 1,
            x: 98,
            y: 80
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: '长按二维码 开启健康生活新方式',
            width: 536,
            height: 26,
            align: 'center', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333333',
            fontSize: 28,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 30,
            y: 555
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: '分享自 康老板小程序',
            width: 536,
            height: 24,
            align: 'center', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#666666',
            fontSize: 24,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 30,
            y: 602
          },
          {
            type: 'LINE', // 线条
            width: 490, // 线条宽度
            height: 1, // 线条高度
            align: 'center', // 对齐方式
            color: '#F1F1F1', // 线条颜色
            zIndex: 0,
            x: 53,
            y: 712
          },
          {
            type: 'IMG',
            content: imgUrl,
            width: 87,
            height: 87,
            mode: 'aspectFill',
            borderRadius: 4,
            align: 'left', // 对齐方式
            zIndex: 0,
            x: 57,
            y: 775
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: title || '',
            width: 300,
            height: 28,
            align: 'left', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333333',
            fontSize: 28,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 164,
            y: 803
          }
        ]
      }];
      toPosterPage({
        type: 2,
        shareId,
        shareParams: shareCodeParams,
        title,
        imgUrl
      });
    },
    // 埋点
    setPoint(type, desc, code) {
      const {info} = this.data;
      track(TrackEventName.Boss_SeedingInteract, {
        action_type: type,
        action_name: desc,
        content_label: info.tag || '',
        detail_id: info.recommendId,
        content_name: info.title,
        action_code: code
      })
    }
  }
})