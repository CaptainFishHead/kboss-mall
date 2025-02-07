import {hideToast, showToast} from "../components/toast/index";
import { ORDER_SOURCE_PAGE, STORAGE_USER_FOR_KEY, TOAST_TYPE} from "../const/index";
import {editCar, queryActiveGoodsList, queryCartList, validCart} from "@models/newCartModel";
import {queryProductById} from "../models/productModel";
import {track, TrackEventName} from "../utils/sa";
import {wxFuncToPromise} from "../utils/wxUtils";
import env from "../config/env";

export default Behavior({
  data: {
    goodsList: [],
    invalidList: [],
    totalPrice: 0,
    totalNumGoods: 0, //商品种类数量
    allChecked: false,//全选状态
    skuIdList: [],
    goodsInfo: {
      omsSkuList: [],
      setSkuId: '', //切换商品ID
      spuId: '', //购物车商品主键
      cartId: '', //购物车主键id
      prodNum: 1, // 编辑商品规格 数量
    },
    sortSkuList: [], //购买商品顺序 skuid
    query: {}, // 页面来源系列字段
  },
  methods: {
    /** 去产品首页*/
    goProductHandle() {
      wx.switchTab({
        url: '/pages/index/index'
      })
    },
    /** 查询购物车list*/
    getCartList() {
      showToast({type: TOAST_TYPE.LOADING})
      this.setData({
        totalNumGoods: 0,
        totalPrice: 0,
        allChecked: false,
        skuIdList: []
      })
      let selectedCount = 0
      let goodsTypeCount = 0 //商品种类数量
      let totalNumGoods = 0 //商品总数
      queryCartList({})
      .then(async ({result}) => {
        const goodsList = result.groups || [];
        const sortSkuList = this.data.sortSkuList.map(item => item.skuId)
        goodsList.forEach(item => {
          item.skuList.forEach(prod => {
            goodsTypeCount += 1
            if (prod.skuNum < prod.sinceMin) {
              prod.skuNum = prod.sinceMin
            } else if (prod.skuNum > prod.sinceMax) {
              prod.skuNum = prod.sinceMax
            }
            if (sortSkuList.includes(prod.skuId)) {
              prod.checked = true;
            }
            selectedCount += prod.checked ? 1 : 0
            totalNumGoods += prod.checked ? prod.skuNum : 0
          })
        })
        await this.setData({
          totalNumGoods,
          allChecked: selectedCount === goodsTypeCount && (selectedCount !== 0 && goodsTypeCount !== 0),
          goodsList,
          invalidList: result.invalids,
        })
        this.handleActiveList()
      })
      .catch((err) => {
        hideToast()
        if (err.msg) {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        }
      })
    },
    //全选操作
    allCheckeChange({detail}) {
      this.setData({
        allChecked: !detail.allChecked
      })
      let sortSkuList = []
      let totalNumGoods = 0 //商品总数
      const goodsList = [...this.data.goodsList]
      goodsList.forEach(item => {
        item.skuList.forEach(prod => {
          prod.checked = this.data.allChecked;
          totalNumGoods += this.data.allChecked ? prod.skuNum : 0;
          prod.checked ? sortSkuList.push(prod) : void 0;
        })
      })
      this.setData({
        goodsList,
        totalNumGoods,
        sortSkuList
      })
      setTimeout(() => {
        this.handleActiveList()
      }, 0)
    },
    //单选操作 监听全选/未全选
    onSelectGoods(params) {
      const {checked, skuid} = params.detail
      const goodsList = this.data.goodsList
      let sortSkuList = [...this.data.sortSkuList];
      let selectedCount = 0
      let totalNumGoods = 0 //商品总数
      let goodsTypeCount = 0 //商品种类数量
      for (let i = 0; i < goodsList.length; i++) {
        goodsList[i].skuList.forEach(item => {
          goodsTypeCount += 1
          if (skuid === item.skuId) {
            item.checked = !checked
            if (item.checked) {
              sortSkuList.push(item)
            } else {
              const index = this.data.sortSkuList.findIndex(skuItem => skuItem.skuId === item.skuId)
              if (index !== -1) {
                sortSkuList.splice(index, 1)
              }
            }
          }
          selectedCount += item.checked ? 1 : 0
          totalNumGoods += item.checked ? item.skuNum : 0
        })
      }
      this.setData({
        goodsList,
        allChecked: selectedCount === goodsTypeCount,
        totalNumGoods,
        sortSkuList
      })
      setTimeout(() => {
        this.handleActiveList()
      }, 0)
    },
    //商品数量变化
    changeNum({detail}) {
      showToast({type: TOAST_TYPE.LOADING})
      const _this = this;
      const {skuNum, skuId} = detail
      let totalNumGoods = 0 //商品总数
      let product = {}
      const goodsList = [...this.data.goodsList]
      const sortSkuList = [...this.data.sortSkuList]
      goodsList.forEach(item => {
        item.skuList.forEach(goods => {
          if (skuId === goods.skuId) {
            goods.skuNum = skuNum;
            goods.skuIdList = goods.spuKind === 1 ? goods.subSkuList.map(item => item.skuId) : undefined;
            product = goods
          }
          totalNumGoods += goods.checked ? goods.skuNum : 0;
        })
      })
      sortSkuList.forEach(sku => {
        if (skuId === sku.skuId) {
          sku.skuNum = skuNum;
        }
      })
      this.setData({goodsList, totalNumGoods, sortSkuList})
      //编辑购物
      const editCarParams = {
        cartId: product.cartId,
        // skuId:product.skuId,
        skuNum: product.skuNum,
      }
      editCar(editCarParams).then(async () => {
        await this.handleActiveList()
      }).catch(err => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
        setTimeout(() => {
          _this.getCartList();
        }, 1000)
      })
    },
    //查询商品详情 获取商品规格集合
    showSkuInfo({detail}) {
      const {skuid, spuid, skunum, cartid} = detail
      let _this = this;
      queryProductById({skuId: skuid})
      .then(({result}) => {
        _this.setData({
          goodsInfo: {
            omsSkuList: result.skuList.map(sku => ({...sku, id: sku.skuId, imgurl: sku.imageList[0].source})),
            setSkuId: skuid,
            spuId: spuid,
            prodNum: skunum,
            cartId: cartid,
          }
        })
        this.selectComponent("#skuComponents").setSku({
          submitType: '2',
          fromBtn: true,
          fromCart: true,
          isReal: true
        })
      })
    },
    /** 编辑商品规格*/
    editGoods({detail}) {
      const _this = this;
      const sortSkuList = [...this.data.sortSkuList];
      const product = {
        skuId: detail.sku.id,
        skuNum: detail.prodNum,
        cartId: detail.cartId,
      }
      //编辑购物
      const editCarParams = {
        cartId: product.cartId,
        skuId: product.skuId,
        // skuNum:product.skuNum,
      }
      editCar(editCarParams).then(() => {
        //切换规格 新旧skuID 对比变化
        if (detail.sku.id !== this.data.goodsInfo.setSkuId) {
          const index = sortSkuList.findIndex(skuItem => skuItem.skuId === this.data.goodsInfo.setSkuId)
          if (index !== -1) {
            sortSkuList.splice(index, 1)
          }
        }
        this.setData({sortSkuList});
        this.getCartList();
      }).catch(err => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
        setTimeout(() => {
          _this.getCartList();
        }, 1000)
      })
    },
    /** 删除商品*/
    onDelGoods({detail}) {
      const sortSkuList = [...this.data.sortSkuList];
      const index = this.data.sortSkuList.findIndex(skuItem => skuItem.skuId === detail.delSkuId)
      if (index !== -1) {
        sortSkuList.splice(index, 1)
      }
      this.setData({sortSkuList});
      this.getCartList();
    },
    /** 综合计算活动价格 */
    handleActiveList() {
      const {mobile} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
      if (this.data.sortSkuList.length) {
        queryActiveGoodsList({
          skuIdList: this.data.sortSkuList.map(item => item.skuId),
          userMobile: mobile
        }).then(({result}) => {
          if (result.length) {
            const sortSkuList = [...this.data.sortSkuList]
            const actMap = {} //以活动ID 为key 分类同一活动商品
            sortSkuList.forEach(item => {
              result.forEach(actitem => {
                if (item.skuId === actitem.promotionSkuId && item.checked) {
                  const actKeys = Object.keys(actitem).concat(['promoAllSkuCanBuyNum', 'isPromotion', 'isBeyondPromLimit',
                    'promTips', 'skuPromotionNum', 'skuOriginalNum', 'promSkuPrice']);
                  item = {...item, ...actitem, actKeys};
                  actMap[actitem.promotionId] = [...actMap[actitem.promotionId] || [], item];
                }
              })
            })
            const skuMap = {}
            for (let key in actMap) {
              actMap[key].forEach((item, index, arr) => {
                /**
                 * promotionSkuLimit 活动单品限享数量
                 * promotionSkuUsedSum 用户活动单品已购数量
                 *
                 * promotionLimit 活动限享数量
                 * promotionIsLimit 活动限享数量开关-1:限制;0:不限制
                 * promotionUsedSum 用户活动总计已购数量
                 * */
                const skuCanBuyNum = item.promotionSkuLimit - item.promotionSkuUsedSum; //用户活动单品限享数量-用户活动单品已购数量 =  用户单品可够数量
                if (item.promotionIsLimit === 1) { //用户活动商品限量
                  if (index === 0) {
                    item.promoAllSkuCanBuyNum = item.promotionLimit - item.promotionUsedSum; //用户活动商品限量 - 用户活动已购买数量 = 用户活动可够数量
                  } else {
                    //用户购物车数量 > 用户活动可够数量
                    if (arr[index - 1].skuNum > arr[index - 1].promoAllSkuCanBuyNum) {
                      item.promoAllSkuCanBuyNum = arr[index - 1].promoAllSkuCanBuyNum - arr[index - 1].skuPromotionNum
                    } else {//用户购物车数量 <= 用户活动可够数量
                      let _skuPromotionNum
                      if (arr[index - 1].skuNum > arr[index - 1].skuPromotionNum) {
                        _skuPromotionNum = arr[index - 1].skuPromotionNum
                      } else {
                        _skuPromotionNum = arr[index - 1].skuNum
                      }
                      item.promoAllSkuCanBuyNum = arr[index - 1].promoAllSkuCanBuyNum - _skuPromotionNum
                    }
                  }
                } else { //用户活动商品不限量
                  item.promoAllSkuCanBuyNum = null;
                }
                /**
                 * promoAllSkuCanBuyNum  活动全部商品可享购数量
                 * skuCanBuyNum  单品可享购买次数
                 * promotionSkuInventory  单品活动库存
                 * */
                //判断不享受活动价 true:享受 false:不享受
                item.isPromotion = !(skuCanBuyNum === 0 || (item.promoAllSkuCanBuyNum === 0 && item.promotionIsLimit === 1) || item.promotionSkuInventory === 0);
                //购物车单品数量是否超出活动价限购数量，多余的享受原价
                let minLimitNum
                if (item.promoAllSkuCanBuyNum === null) { //用户活动可享购商品不限量
                  minLimitNum = Math.min(skuCanBuyNum, item.promotionSkuInventory) //单品sku可购/单品库存-比大小
                } else {
                  minLimitNum = Math.min(item.promoAllSkuCanBuyNum, skuCanBuyNum, item.promotionSkuInventory)
                }
                item.isBeyondPromLimit = item.isPromotion ? item.skuNum > minLimitNum : false; //false:只展示活动价,true:即展示活动价 也展示原价
                //他们三比大小 根据最小值判断 显示对应的提示文案
                if (item.isBeyondPromLimit && item.isPromotion) {
                  //全等
                  if ((item.promoAllSkuCanBuyNum !== null && item.promoAllSkuCanBuyNum === skuCanBuyNum && skuCanBuyNum === item.promotionSkuInventory) || (skuCanBuyNum === item.promotionSkuInventory)) {
                    item.promTips = "促销商品超出可享优惠数量，超出部分原价购买"
                  }
                  //部分相等||全不等
                  else {
                    if ((item.promoAllSkuCanBuyNum !== null && minLimitNum === item.promoAllSkuCanBuyNum) || minLimitNum === item.promotionSkuInventory) {
                      item.promTips = "促销商品超出可享优惠数量，超出部分原价购买"
                    } else if (minLimitNum === skuCanBuyNum) {
                      item.promTips = `促销价限享${item.promotionSkuLimit}件，超出部分原价购买`
                    }
                  }
                }
                item.skuPromotionNum = minLimitNum;//享受活动价数量
                item.skuOriginalNum = item.skuNum - minLimitNum < 0 ? 0 : item.skuNum - minLimitNum;//享受原价数量
                //"活动价格类型-promotionPriceType-1:促销价;2:打折
                item.promSkuPrice = item.promotionPriceType === 1 ? item.promotionSkuPrice : Number(((item.sellPrice * item.promotionSkuDiscount / 10 * 100) / 100).toFixed(2));
                skuMap[item.skuId] = item
              })
            }
            const goodsList = this.data.goodsList;
            let _goodsList = goodsList.map(item => {
              let skuList = item.skuList.map(skuItem => {
                if (skuItem.checked) {
                  if (skuMap[skuItem.skuId]) {
                    return {...skuMap[skuItem.skuId]};
                  } else {
                    return skuItem
                  }
                } else {
                  if (skuItem.actKeys) {
                    skuItem.actKeys.forEach(key => {
                      if (key in skuItem) {
                        delete skuItem[key]
                      }
                    })
                  }
                  return skuItem
                }
              })
              return {...item, skuList}
            })
            this.setData({goodsList: _goodsList})
          }
          this.calcHandle()
        }).catch((err) => {
          showToast({
            title: err.msg || '暂无信息',
            type: TOAST_TYPE.WARNING
          })
        })
      } else {
        this.calcHandle()
      }
      hideToast()
    },
    // 商品计算价格
    calcHandle() {
      let skuIdList = []
      let totalPrice = 0
      const goodsList = this.data.goodsList
      goodsList.forEach(item => {
        item.skuList.forEach(goods => {
          if (goods && goods.checked) {
            skuIdList.push(goods.skuId)
            /*
             isPromotion 判断不享受活动价 true:享受 false:不享受
             isBeyondPromLimit  false:只展示活动价,true:即展示活动价 也展示原价
             skuPromotionNum 活动价数量
             skuOriginalNum 原价数量
             skuNum 购物车数量
             sellPrice 单品原价
             */
            if (goods.isPromotion) {
              if (goods.isBeyondPromLimit) {
                const skuPromotionPrice = (goods.promSkuPrice * 100 * goods.skuPromotionNum);
                const skuOriginalPrice = (goods.sellPrice * 100 * goods.skuOriginalNum);
                totalPrice = (totalPrice * 100 + skuPromotionPrice + skuOriginalPrice) / 100;
              } else {
                totalPrice = (totalPrice * 100 + goods.promSkuPrice * goods.skuNum * 100) / 100;
              }
            } else {
              totalPrice = (totalPrice * 100 + goods.sellPrice * goods.skuNum * 100) / 100;
            }
          }
        })
      })
      totalPrice = Number(totalPrice).toFixed(2)
      this.setData({
        totalPrice,
        skuIdList
      })
    },
    /*跳转确认订单页面*/
    async productSettlement() {
      let {skuIdList, query, sortSkuList} = this.data
      if (this.data.totalNumGoods === 0) {
        showToast({
          title: '请选择要下单的商品!',
          type: TOAST_TYPE.WARNING
        })
        return
      }
      try {
        // 部分商品已失效，将结算其他商品
        const {result: {skuList, invalids}} = await validCart({skuIdList})
        if (skuList.length === 0) {
          showToast({
            title: '勾选商品已失效，请重新选择!',
            type: TOAST_TYPE.WARNING,
            duration: 1500
          })
          setTimeout(() => {
            this.getCartList();
          }, 1500)
          return
        }
        if (invalids.length === 0) {
          this.submitOrder(sortSkuList, query)
          return
        }
        if (skuList.length !== 0 && invalids.length !== 0) {
          const _sortSkuList = sortSkuList.filter(item => {
            return skuList.includes(item.skuId)
          })
          showToast({
            title: '部分商品已失效，将结算其他商品!',
            type: TOAST_TYPE.WARNING,
            duration: 1500
          })
          setTimeout(() => {
            this.submitOrder(_sortSkuList, query)
          }, 1500)
        }
      } catch (err) {
        console.log(err)
      }
    },
    submitOrder(sortSkuList, query) {
      // 购物车结算埋点
      let commodity = {
        commodity_id_str: [], // 商品编号
        commodity_name_str: [], //商品标题
        commodity_specification_str: [], //商品规格
        commodity_quantity_str: [], //商品数量
        sku_price_str: [], //商品价格
        commodity_detail_souce: query.targetId || '康老板' //模块来源
      }
      let skuList = []
      const skuIdList = sortSkuList.map(item => item.skuId)
      this.data.goodsList.forEach(item => {
        item.skuList.forEach(goods => {
          if (goods && goods.checked && skuIdList.includes(goods.skuId)) {
            skuList.push({skuId: goods.skuId, skuNum: goods.skuNum})
            commodity.commodity_id_str.push(goods.skuId);
            commodity.commodity_name_str.push(goods.spuName);
            commodity.commodity_specification_str.push(goods.skuDesc);
            commodity.commodity_quantity_str.push(String(goods.skuNum));
            commodity.sku_price_str.push(String(goods.sellPrice));
          }
        })
      })
      track(TrackEventName.Boss_Clearing, {...commodity})
      wxFuncToPromise(`navigateTo`, {
        url: `/pages/order/confirm/index`,
      }).then(({eventChannel}) => {
        eventChannel.emit(`products`, {
          skuList,
          sortSkuList: skuIdList,
          type: ORDER_SOURCE_PAGE.CART
        })
        this.setData({sortSkuList: []})
      })
    },
    showComSubInfo({detail}) {
      const {skuId} = detail
      this.selectComponent("#detailComponents").showContainer({skuId, isWarpGoods: true})
    },
    async updateCartList() {
      await this.setData({sortSkuList: []}, () => {
        this.getCartList()
      })
      await this.selectComponent("#goodsListComponents").onRestore()
    }
  }
})