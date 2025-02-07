import {favoriteProductStatus} from "../../../models/productModel";
import {cartAdd, findCarCount} from "@models/newCartModel";
import {queryDefaultAddress} from "../../../models/addressModel";
import {queryUserIdentity} from "../../../models/commissionModel";
import {createFootPrint} from "../../../models/footPrintModel";
import {getMemberLevel} from "../../../models/userModel";
import {
  AUTHENTICATION_MODE,
  SOURCE,
  TOAST_TYPE,
  FAVORITE_TYPE,
  SUBJECT_TYPE,
  STORAGE_USER_FOR_KEY, RECEIVE_COUPON_STATUS_TIPS_MAPS,
  RECEIVER_ADDRESS,
  PRODUCT_DETAIL_PAGES
} from "../../../const/index";
import {wxFuncToPromise} from "../../../utils/wxUtils";
import {hideToast, showToast} from "../../../components/toast/index";
import {track, TrackEventName} from "../../../utils/sa";
import back from "../../../behaviors/back";
import { formatDate, getQuery, objToUrlStr, isDynamicPage, isLogged } from "../../../utils/index";
import {autoReceiveCoupon, manualReceiveCoupon} from "../../../models/voucherModel";
import {getPageShareInfo, toPosterPage } from "../../../utils/sharePoster";

const app = getApp()

export default Behavior({
  data: {
    sessionFrom: '', // 保存联系客服所需数据
    showEmpty: false,
    errMsg: '',
    product: {},
    productImages: [],
    skuList: [],
    sku: {},
    isReal: true,
    isFavorite: 0,
    address: '',
    //分佣
    commission: {
      rate: 0, //分佣比例
      isShared: false, //是否展示推广信息
      priceIncome: 0, //收入
      shareId: '', //分佣id
    },
    //埋点参数（基础数据）
    pointParamsBase: {
      spu_id: undefined, //商品 id
      sku_id: undefined, //商品sku id
      product_type: undefined, //商品类型 (单品、组合品、随心配)
      commodity_id: undefined, //商品编号
      commodity_name: undefined, //商品标题
      commodity_type: undefined, //商品类型 (真实、虚拟)
      commodity_Typ: undefined, //商品类型-线上、线下
      first_commodity: undefined, //商品一级分类
      second_commodity: undefined, //商品二级分类
      store_id: undefined, //店铺ID
      store_name: undefined, //店铺名称
      sku_price: undefined, //商品价格
      commodity_detail_souce: undefined, //模块来源
      page_source: undefined, //页面来源
    },
    //埋点参数（加购、结算）
    pointParamsSubmit: {
      commodity_specification: undefined,	//商品规格
      commodity_quantity: undefined	//商品数量
    },
  },
  behaviors: [back],
  pageLifetimes: {
    hide() {
      if (this.data.product.id) {
        this.pageHide()
      }
    },
  },
  lifetimes: {
    detached() {
      this.pageHide()
    }
  },
  methods: {

    // 初始化用户相关数据
    async initData() {
      this.getSessionFrom() // 在线客服获取用户信息
      this.getCartNum() // 获取购物车数量
      this.getDefaultAddress() // 获取默认地址
      await this.getUserIdentity() // 获取用户身份 (选择规格后 获取对应分佣信息)
      this.createCode() // 生成分享码 (选择规格后 生成对应分享码)
    },
    // 初始化登录后请求数据
    initLoggedData() {
      this.addFootPrint() // 创建足迹
      this.getFavoriteStatus() // 获取收藏状态
      const {sku, product,isSuit} = this.data
      if (isLogged()) {
        this.getLevel() //获取会员等级
        if (sku.id) {
          this.selectComponent("#product").getProduct({skuId: sku.id, isRefresh: false}).then(() => {
            this.setData({ isLogged: true })
          }) //获取商品详情
        }
        if (product.isShelf===1 && !isSuit){
          setTimeout(() => {
            this.selectComponent("#dialogCouponComp").getDialogCouponList({spuId: product.id,skuId: sku.id, isInit: true}) //显示领取优惠券弹窗
          }, 500)
        }
      }else{
        this.setData({ isLogged: false })
      }
      if (product.isDeleted===1 && isSuit){
        setTimeout(() => {
          this.setData({deleteGoodsDialogVis:true})
        }, 500)
      }
    },
    //授权 登录成功后（authorize组件 - bind:success授权成功后只执行一次）
    onLogged() {
      this.initData() // 初始化用户相关数据
      this.initLoggedData() // 初始化登录后请求数据
    },
    //获取详情后 初始化信息
    afterReadyInit() {
      try {
        this.onLogged()
      } catch (e) {
        console.error('^_^初始化某个信息失败^_^', e)
      }
    },
    // 在线客服获取用户信息
    getSessionFrom() {
      const sessionFrom = app.getContactInfo({title: '我的'})
      this.setData({sessionFrom})
    },

    /**
     * _______________Logged用户信息相关接口请求_______________start_______________
     */
    //生成分享标识
    async createCode() {
      const {product, sku} = this.data
      if (!product.id) return Promise.resolve({})
      const {v2_code} = await getPageShareInfo({
        pageOptions: {
          goodName: product.name,
          skuId: sku.id,
          spuId: product.id,
        },
        pageUrl: '/pages/product/index'
      })

      const {commission} = this.data
      this.setData({
        commission: {
          ...commission,
          shareId: v2_code
        }
      }, () => {
        console.log(commission, 'createCode')
      })
      // wx.nextTick(() => {
      //   this.setData({
      //     commission: {
      //       ...commission,
      //       shareId: result.shareId
      //     }
      //   })
      // })
    },
    // 获取用户身份
    async getUserIdentity() {
      const {sku, commission} = this.data
      if (!sku.id) return Promise.resolve({})
      const {result} = await queryUserIdentity({skuId: sku.id})
      const {
        isEmployee, //是否为员工 (0否、1是)
        isDistribution, //是否为分佣商品 (0否、1是)
        commissionRate //分佣比例
      } = result
      const priceIncome = Math.floor(sku.sellPrice * commissionRate) / 100

      const newCommission = {
        ...commission,
        isShared: !!isEmployee && !!isDistribution,
        rate: commissionRate,
        priceIncome
      }
      this.setData({commission: newCommission}, () => {
        console.log(this.data.commission, 'getUserIdentity')
      })

      // console.log('getUserIdentity-分佣信息:', newCommission)
    },
    //创建足迹
    async addFootPrint() {
      const {product, isSuit} = this.data
      const {id} = product || {}
      if (isLogged()) {
        if (!id) return Promise.resolve({})
        const params = {
          subjectId: id,
          subjectType: isSuit ? SUBJECT_TYPE.SUIT : SUBJECT_TYPE.PRODUCT
        }
        try {
          await createFootPrint(params)
        } catch (e) {

        }
      }
    },
    //获取商品收藏状态
    async getFavoriteStatus() {
      const {product, isSuit} = this.data
      const {id} = product || {}
      if (isLogged()) {
        if (!id) return Promise.resolve({})
        const params = {
          subjectId: id,
          favoriteType: FAVORITE_TYPE.LIKE, //收藏
          subjectType: isSuit ? SUBJECT_TYPE.SUIT : SUBJECT_TYPE.PRODUCT
        }
        const {result} = await favoriteProductStatus(params)
        this.setData({isFavorite: result})
      }
    },
    // 获取收货地址
    getDefaultAddress() {
      //最近使用地址 (最近使用的地址 优先级高于 默认地址)
      const latelyAddress = wx.getStorageSync(RECEIVER_ADDRESS) || {}
      if (Object.keys(latelyAddress).length) {
        this.addressStr(latelyAddress)
        return
      }
      //默认地址
      queryDefaultAddress({}, {authenticationMode: AUTHENTICATION_MODE.break}).then(({result}) => {
        wx.setStorageSync(RECEIVER_ADDRESS, result || {})
        this.addressStr(result || {})
      })
    },
    addressStr(latelyAddress) {
      if (Object.keys(latelyAddress).length) {
        this.setData({address: `${latelyAddress.provinceName||''} ${latelyAddress.cityName||''} ${latelyAddress.areaName||''} ${latelyAddress.detailAddress||''}`})
      } else {
        this.setData({address: ''})
      }
    },
    //获取购物车商品数量
    getCartNum() {
      findCarCount({}).then(({result}) => this.setData({cartNum: result.count}))
    },
    //获取会员等级
    getLevel() {
      getMemberLevel({})
      .then(({result}) => {
        this.setData({levelName: result.levelName||''})
      })
    },
    /**
     * _______________Logged用户信息相关接口请求_______________end_______________
     */


    /**
     * _______________商品详情相关操作_______________start_______________
     */

    //暂无商品信息
    empty() {
      const backHome = setTimeout(() => wx.navigateBack(), 3000)
      this.setData({backHome})
    },
    //网络错误
    error(e) {
      this.setData(e.detail)
    },
    //立即购买 跳转页面
    buyNow(params) {
      const {sku, product} = this.data;
      //领券购买
      if (sku.couponGoodsDetailDto && sku.couponGoodsDetailDto.isReceiveCoupon === 1) {
        autoReceiveCoupon({spuId: product.id, skuId: sku.id})
        .then(({result}) => {
          //receiveStatus  领取状态(4: 领取成功 8: 匹配最佳优惠券 9:优惠券信息变更 请重试)
          switch (result.receiveStatus) {
            case 4:
              showToast({
                title: !result.moneyLimit ? `已为您领取并使用${result.couponAmount}元立减券` : `已为您领取并使用单价满${result.moneyLimit}减${result.couponAmount}优惠券`,
                type: TOAST_TYPE.SUCCESS
              })
              setTimeout(() => {
                this.toOrderConfirm(params)
              }, 2000)
              break;
            case 8:
              showToast({
                title: `已为您匹配最佳优惠券`,
                type: TOAST_TYPE.SUCCESS
              })
              setTimeout(() => {
                this.toOrderConfirm(params)
              }, 2000)
              break;
            case 9:
              showToast({
                title: `优惠券信息发生变更，重新为您匹配最佳优惠`,
                type: TOAST_TYPE.SUCCESS
              })
              //重新刷新详情页面 接口
              const paramsId = {
                skuId: sku.id ? sku.id : undefined,
                spuId: product.id
              }
              setTimeout(() => {
                this.selectComponent("#product").getProduct(paramsId) //获取商品详情
                //显示领取优惠券弹窗
                this.selectComponent("#dialogCouponComp").getDialogCouponList({spuId: product.id,skuId:sku.id, isInit: true})
              }, 2000)
              break;
          }

        })
        .catch((err) => {
          // 异常：优惠券信息发生变更，重新为您匹配最佳优惠 重新请求
          showToast({
            title: err.msg || '添加失败',
            type: TOAST_TYPE.WARNING
          })
        })
      } else {
        this.toOrderConfirm(params)
      }
    },
    //下单去往订单页面
    toOrderConfirm(params) {
      wxFuncToPromise(`navigateTo`, {url: `/pages/order/confirm/index`})
      .then(({eventChannel}) => {
        console.log(params,'下单前订单参数')
        eventChannel.emit(`products`, params)
      })
      .catch((err) => {
        showToast({
          title: err.msg || '',
          type: TOAST_TYPE.WARNING
        })
      })
    },
    //加入购物车 请求接口
    addToShoppingCart(cartList,extra) {
      showToast({type: TOAST_TYPE.LOADING})
      cartAdd({cartList,extra})
      .then((res) => {
        this.getCartNum()
        showToast({
          title: '添加成功',
          type: TOAST_TYPE.SUCCESS
        })
      })
      .catch((err) => {
        showToast({
          title: err.msg || '添加失败',
          type: TOAST_TYPE.WARNING
        })
      })
    },
    async loginAfterFavorite() {
      await this.onFavorite()
      this.onLogged()
    },
    //已登录 收藏
    onFavorite() {
      const {product, isFavorite, isSuit} = this.data
      return this.selectComponent("#favoriteBtn")
      .favoriteBtn({
        product: product,
        productId: product.id,
        isFavorite: isFavorite,
        showAnimation: true,
        subjectType: isSuit ? SUBJECT_TYPE.SUIT : SUBJECT_TYPE.PRODUCT
      })
    },
    //收藏成功
    favoriteSuccess(e) {
      const {isFavorite} = e.detail
      this.setData({isFavorite})
      const eventChannel = this.getOpenerEventChannel()
      if (Object.prototype.toString.call(eventChannel.emit).includes('Function')) {
        eventChannel.emit('updateColumns', 'isFavorite')
      }
    },
    //去购物车
    toCartList() {
      wx.navigateTo({url: '/pages/cart/index'})
    },
    //去选择地址
    addressSelect() {
      wx.navigateTo({url: '/pages/address/index'})
    },
    //显示详情弹层
    showProduct(e) {
      const {isSuit,product} = this.data
      let params = {}
      if (e.detail.id) {
        params = {id:e.detail.id}
      } else {
        const {id, skuid: skuId} = e.currentTarget.dataset
        params = {id, skuId}
      }
      this.selectComponent("#detailComponents").showContainer({...params,isWarpGoods:isSuit || product.spuKind === 1})
      this.selectComponent("#product").onVideoPause()
    },
    //显示替换列表弹层
    showReplaceList(e) {
      const {spu, index} = e.currentTarget.dataset
      const {product} = this.data
      const params = {
        goodsPackageId: product.id,
        goodsPackageConfId: spu.goodsPackageConfId,
        productId: spu.subProductId
      }
      this.selectComponent("#replaceComponents").getReplaceList({...params}, spu, index)
    },
    //查看康豆返利明细
    showBeansRules(e) {
      const {awardnum, rewardtype, levelname} = e.currentTarget.dataset
      this.selectComponent("#beansComponents").showRules({awardnum, rewardtype, levelname})
    },
    //显示优惠券列表半屏弹层
    showCouponList() {
      const {product,sku} = this.data
      this.selectComponent("#listCouponComp").getCouponList({spuId:product.id,skuId:sku.id})
    },
    //领取半屏列表的优惠券
    receiveListCoupon(e) {
      const {index, voucher} = e.detail
      manualReceiveCoupon({couponId: voucher.couponId})
      .then(({result}) => {
        switch (result.receiveStatus) {
          case 2://已抢光(库存不足)
            showToast({
              title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
              type: TOAST_TYPE.ERROR
            })
            this.selectComponent("#listCouponComp").updateListCouponStatus({index, receiveStatus: 2})
            break;
          case 4: //领取成功
            showToast({
              title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
              type: TOAST_TYPE.SUCCESS
            })
            //判断是否领取完 更新当前优惠券状态
            if (result.receiveCount >= result.receiveLimit) {
              this.selectComponent("#listCouponComp").updateListCouponStatus({index, receiveStatus: 1})
            }
            break;
          case 6://超出领取次数
            let tips = RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus]
            tips = `${tips}${result.receiveLimit}张`
            showToast({
              title: tips,
              type: TOAST_TYPE.WARNING
            })
            //判断是否领取完 更新当前优惠券状态
            if (result.receiveCount >= result.receiveLimit) {
              this.selectComponent("#listCouponComp").updateListCouponStatus({index, receiveStatus: 1})
            }
            break;
          default: // 5:黑名单用户不符合领取条件 7:用户不符合客群(不是新用户)
            showToast({
              title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
              type: TOAST_TYPE.WARNING
            })
            break;
        }
      })
      .catch((err) => {
        showToast({
          title: err.msg || '列表获取失败',
          type: TOAST_TYPE.WARNING
        })
      })
    },
    //领取弹窗的优惠券
    receiveDialogCoupon(e) {
      const {index, couponItem} = e.detail
      const {product, sku} = this.data
      //调用领取接口
      manualReceiveCoupon({couponId: couponItem.couponId}).then(({result}) => {
        hideToast().then(() => {
          switch (result.receiveStatus) {
            case 2://已抢光(库存不足)
            case 3://已结束
              showToast({
                title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
                type: TOAST_TYPE.ERROR
              })
              this.selectComponent("#dialogCouponComp").getDialogCouponList({
                spuId: product.id,skuId:sku.id,
                isInit: false
              })
              break;
            case 4://领取成功
              showToast({
                title: RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus],
                type: TOAST_TYPE.SUCCESS
              })
              //判断是否领取完 更新当前优惠券状态
              if (result.receiveCount >= result.receiveLimit) {
                this.selectComponent("#dialogCouponComp").updateCouponStatus({index, isReceived: true})
              }
              break;
            case 6://超出领取次数
              let tips = RECEIVE_COUPON_STATUS_TIPS_MAPS[result.receiveStatus]
              tips = `${tips}${result.receiveLimit}张`
              showToast({
                title: tips,
                type: TOAST_TYPE.WARNING
              })
              break;
            default:
              break;
          }
        })
      }).catch((err) => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })
    },
    /**
     * _______________商品详情相关操作_______________end_______________
     */


    /**
     * _______________其他操作_______________start_______________
     */
  async  shareHandler() {
      const {product, productImages, sku, commission, isSuit} = this.data
      //分享埋点（选择类型后）
      track(TrackEventName.Boss_Share_Detail, {
        spu_id: product.id,
        sku_id: sku.id,
        product_type: isSuit ? '随心配' : product.spuKind === 1 ? '组合品' : '单品',
        commodity_id: product.code,
        commodity_name: product.name,
        share_type: '好友'
      })
      // const pageOptions = {source: SOURCE.BH_MALL};
      // if(product.id){
      //   Object.assign(pageOptions, {spuId: product.id})
      // }  else if(product.id && commission.shareId){
      //   Object.assign(pageOptions, {mid: commission.shareId})
      // }
      const promise = new Promise(async (resolve) => {
        const {v2_code} = await getPageShareInfo({
          pageUrl: isSuit ? `/pages/product/suit/index` : `/pages/product/index`,
          pageOptions:{
            source: SOURCE.BH_MALL,spuId:product.id,skuId:sku.id
          }
        });
        resolve({
          title: product.name,
          path: `/pages/index/index?v2_code=${v2_code}`,
          imageUrl: productImages[0].source
        })
      })
      return {
        ...app.globalData.shareInfo,
        promise
      }
    },
    // 获取分享信息
    async getShareInfo({pageUrl, pageOptions}){
      const {product} = this.data || {};
      const { v2_code: shareId, wxQrCode: shareCode } = await getPageShareInfo({ pageUrl, pageOptions });
      const {imageUrl, name, imgUrl} = product || {};
        return {
          imgUrl: imageUrl || imgUrl,
          title: name,
          shareId,
          shareCode
        }
    },
    // 生成海报
  async createPoster (e) {
    const {imgUrl, title, shareId, shareCode} = await this.getShareInfo(e.detail);
    const posterParams = [{
      width: 596,
      height: 1060,
      background: '#fff',
      elements: [
        {
          type: 'IMG',
          content: `https://static.tojoyshop.com/images/wxapp-boss/poster-logo.png`,
          width: 234.5,
          height: 84,
          align: 'center', // 对齐方式
          zIndex: 0,
          x: 181,
          y: 39
        },
        {
          type: 'IMG',
          content: imgUrl,
          width: 520,
          height: 520,
          borderRadius: 4,
          align: 'center', // 对齐方式
          zIndex: 0,
          x: 38,
          y: 157
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: title,
          width: 520,
          height: 42,
          align: 'center', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 30,
          maxLine: 2, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 38,
          y: 717
        },
        {
          type: 'LINE', // 线条
          width: 522, // 线条宽度
          height: 1, // 线条高度
          align: 'center', // 对齐方式
          color: '#F1F1F1', // 线条颜色
          zIndex: 0,
          x: 38,
          y: 820
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '长按识别二维码',
          width: 200,
          height: 38,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 25,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 38,
          y: 889
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: '查看商品详情',
          width: 200,
          height: 38,
          align: 'left', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 25,
          maxLine: 1, // 最大行数 超出自动显示省略号
          zIndex: 0,
          x: 38,
          y: 927
        },
        {
          type: 'IMG',
          content: shareCode,
          width: 166,
          height: 166,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 385,
          y: 844
        }
      ]
    }];
    toPosterPage({
      type: 1,
      shareId,
      shareCode,
      shareParams: posterParams,
      title,
      imgUrl
    });
  },
  // 生成分享码
  async createShareCode(e){
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
          content: '长按二维码 查看商品详情',
          width: 536,
          height: 26,
          align: 'center', // 对齐方式
          fontFamily: '',
          fontWeight: 400,
          color: '#333333',
          fontSize: 25,
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
          borderRadius: 4,
          align: 'left', // 对齐方式
          zIndex: 0,
          x: 57,
          y: 775
        },
        {
          type: 'TEXT', // TODO 文字换行和省略号
          content: title,
          width: 360,
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
      shareCode,
      shareParams: shareCodeParams,
      title,
      imgUrl
    });
  },
    //分享朋友
    onShareAppMessage(res) {
      return this.shareHandler()
    },
    //分享朋友圈
  //  async onShareTimeline() {
  //     const {title, path, imageUrl} = await this.shareHandler()
  //     const query = objToUrlStr(getQuery(path))
  //     return {title, imageUrl, query}
  //   },
    // 立即推广
    async toSharePage() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const {route, options} = currentPage;
      const {imgUrl, title, shareId, shareCode} = await this.getShareInfo({ pageUrl: `/${route}`, pageOptions: options});
      const {product, productImages, sku, commission, isSuit} = this.data
      const posterParams = [{
        width: 596,
        height: 1060,
        background: '#fff',
        elements: [
          {
            type: 'IMG',
            content: `https://static.tojoyshop.com/images/wxapp-boss/poster-logo.png`,
            width: 234.5,
            height: 84,
            align: 'center', // 对齐方式
            zIndex: 0,
            x: 181,
            y: 39
          },
          {
            type: 'IMG',
            content: imgUrl,
            width: 520,
            height: 520,
            borderRadius: 4,
            align: 'center', // 对齐方式
            zIndex: 0,
            x: 38,
            y: 157
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: title,
            width: 520,
            height: 42,
            align: 'center', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333333',
            fontSize: 30,
            maxLine: 2, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 38,
            y: 717
          },
          {
            type: 'LINE', // 线条
            width: 522, // 线条宽度
            height: 1, // 线条高度
            align: 'center', // 对齐方式
            color: '#F1F1F1', // 线条颜色
            zIndex: 0,
            x: 38,
            y: 820
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: '长按识别二维码',
            width: 200,
            height: 38,
            align: 'left', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333333',
            fontSize: 25,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 38,
            y: 889
          },
          {
            type: 'TEXT', // TODO 文字换行和省略号
            content: '即刻选购',
            width: 200,
            height: 38,
            align: 'left', // 对齐方式
            fontFamily: '',
            fontWeight: 400,
            color: '#333333',
            fontSize: 25,
            maxLine: 1, // 最大行数 超出自动显示省略号
            zIndex: 0,
            x: 38,
            y: 927
          },
          {
            type: 'IMG',
            content: shareCode,
            width: 166,
            height: 166,
            align: 'left', // 对齐方式
            zIndex: 0,
            x: 385,
            y: 844
          }
        ]
      }];
      // 分享好友参数
      let shareParams = {}
      const sharePath = isSuit ? 'MATCH_AS_YOU_LIKE' : 'SINGLE_PRODUCT'
      if (commission.shareId) {
        shareParams = {
          title,
          path: `/${PRODUCT_DETAIL_PAGES[sharePath]}?mid=${commission.shareId}&s=${SOURCE.BH_MALL}`,
          imgUrl
        }
      } else if (product.pid) {
        shareParams = {
          title,
          path: `/${PRODUCT_DETAIL_PAGES[sharePath]}?pid=${product.pid}&s=${SOURCE.BH_MALL}`,
          imgUrl
        }
      } else {
        shareParams = app.globalData.shareInfo;
      }
      toPosterPage({
        type: 1,
        shareId,
        shareCode,
        shareParams: posterParams,
        pid: product.id,
        ...shareParams
      });
      track(TrackEventName.Boss_Share_Detail, {
        spu_id: product.id,
        sku_id: sku.id,
        product_type: isSuit ? '随心配' : product.spuKind === 1 ? '组合品' : '单品',
        commodity_id: product.code,
        commodity_name: product.name,
        share_type: '二维码'
      })
    },

    //返回顶部
    goTop() {
      if (wx.pageScrollTo) {
        wx.pageScrollTo({scrollTop: 0})
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    },
    // //监听页面隐藏
    // onHide() {
    //   if (this.data.product.id) {
    //     this.pageHide()
    //   }
    // },
    // //监听页面卸载
    // onUnload(e) {
    //   console.log('onUnload', e)
    //   this.pageHide()
    // },
    pageHide() {
      const {pointParamsBase, pointParamsDetail, product, sku} = this.data
      const {starttime} = pointParamsDetail
      const { position, curr_page_info } = this.options
      //清除定时器
      clearTimeout(this.data.backHome)
      if (!starttime) return null
      const endtime = Date.now()
      const cycle_time = Math.floor((endtime - starttime) / 1000)
      //埋点
      const prePage = isDynamicPage();
      let trackOptions = {
        ...pointParamsBase,
        ...pointParamsDetail,
        starttime,
        endtime,
        cycle_time,
        curr_page_info
      };
      if(prePage) {
        trackOptions = Object.assign({}, trackOptions, prePage);
      }
      if (position === 'live') {
        track('Sdk_CommodityDetail', {
          endtime, starttime, cycle_time,
          commodity_name: product.name, spu_id: product.id, sku_id: sku.id
        })
      }
      const {hotel_id,hotel_name,activity_id,activity_name,deviceId} = this.options
      console.log(11, { ...trackOptions,...JSON.parse(JSON.stringify({hotel_id,hotel_name,activity_id,activity_name,deviceId})) })
      track(TrackEventName.Boss_CommodityDetail, { ...trackOptions,...JSON.parse(JSON.stringify({hotel_id,hotel_name,activity_id,activity_name,deviceId})) })

      this.setData({
        pointParamsDetail: {...pointParamsDetail, starttime: 0}
      })
    },
    // 客服埋点
    onService() {
      track(TrackEventName.Boss_CustomerService, {customer_service_type: '售前客服'});
    },
    backHandler() {
      this.setData({showEmpty: false})
      this.restart()
    },
    //商品下架/库存不足-返回
    tapNavBack(e) {
      wx.navigateBack()
    },
    //查看门店
    viewStores(){
      wx.navigateTo({ url: `/pages/services/suitOutlets/index?spuId=${this.data.product.id}`})
    }
  }
})