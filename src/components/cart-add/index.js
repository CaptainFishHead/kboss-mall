import {queryProductById, querySuitById} from "../../models/productModel";
import {cartAdd} from "@models/newCartModel";
import {PRODUCT_TYPE, TOAST_TYPE, SUBJECT_TYPE, CHARGEOFF_TYPE} from "../../const/index";
import {hideToast, showToast} from "../../components/toast/index";
import {track, TrackEventName} from "../../utils/sa";

Component({
  data: {
    //埋点参数（基础数据）
    pointParamsBase: {
      spu_id: undefined, //商品 id
      sku_id: undefined, //商品sku id
      commodity_id: undefined, //商品编号
      commodity_name: undefined, //商品标题
      commodity_type: undefined, //商品属性-真实、虚拟
      commodity_Typ: undefined, //商品类型-线上、线下
      first_commodity: undefined, //商品一级分类
      second_commodity: undefined, //商品二级分类
      store_id: undefined, //店铺ID
      store_name: undefined, //店铺名称
      sku_price: undefined, //商品价格
      commodity_detail_souce: undefined, //模块来源
    },
    //埋点参数（加购、结算）
    pointParamsSubmit: {
      commodity_specification: undefined,	//商品规格
      commodity_quantity: undefined	//商品数量
    },
  },
  properties: {
    // 是否展示加购小球动画
    showAnimation: {
      type: Boolean,
      value: false
    },
  },
  methods: {
    
    initBallPos() {
      this.getRects(".before-position").then(rect => {
        let top = `${rect.top - 10}px`
        let left = `${rect.left + 80}px`
        this.triggerEvent('getPosition', {top, left}) //向父级传值
      });
    },
    //加购动画
    getAnimation() {
      let that = this;
      // 禁止动画多次触发
      if (this.start) {
        return;
      }
      this.start = true
      let top = 'auto'
      let left = 'auto'
      let ballDisplay = true
      
      this.triggerEvent('getPosition', {ballDisplay}) //向父级传值
      
      // 获取小球终点位置
      this.getRects(".after-position").then(rect => {
        top = `${rect.top + 5}px`
        left = `${rect.left + 5}px`
        this.triggerEvent('getPosition', {top, left}) //向父级传值
        
        // 延时跟动画时长一致，飞完隐藏掉，再把小球重置到初始位置。
        setTimeout(() => {
          that.start = false
          top = 'auto'
          left = 'auto'
          ballDisplay = false
          this.triggerEvent('getPosition', {top, left, ballDisplay}) //向父级传值
          
          showToast({
            title: '添加成功',
            type: TOAST_TYPE.SUCCESS,
            duration: 1000
          })
        }, 1000);
      });
    },
    //获取起点和终点的坐标
    getRects(cls) {
      return new Promise((resolve, reject) => {
        wx.createSelectorQuery()
        .select(cls)
        .boundingClientRect(function (rect) {
          // console.log(rect);
          resolve(rect);
        })
        .exec();
      });
    },
    
    //点击加购按钮
    addCartBtn({id}) {
      this.getProduct({id})
    },
    //获取商品详情
    getProduct({id}) {
      showToast({type: TOAST_TYPE.LOADING})
      queryProductById({id})
      .then(async ({result}) => {
        const attribute = result.attribute //是否虚拟商品
        const chargeOffType = (result.virtualData&&result.virtualData.chargeOffType)||'' //虚拟商品-核销方式
        const subSkuDtoList = (result.combinationData && result.combinationData.subSkuList)||[] // 子商品列表
        let skuList = []
        //--- 默认选中的sku
        let _sku = {}
        if (result.spuKind===1){ //组合品 1：组合商品、2：单品
          skuList = [{...result.combinationData,spuKind:result.spuKind,id:result.combinationData.skuId,imgurl:result.imageUrl}]
          _sku = result.combinationData
        }else{
          skuList = result.skuList.map(item=>({...item,id:item.skuId,imgurl:item.imageList[0].source})) // 规格列表
          _sku = skuList.find(item => item.stockNums >= (item.sinceMin || 0)) || skuList[0]
        }
        const sku = {..._sku,id:_sku.skuId}
        this.setData({
          product: result,
          subSkuDtoList,
          skuList,
          sku,
          pointParamsBase: {
            ...this.data.pointParamsBase,
            spu_id: id || result.spuId,
            sku_id: sku.skuId,
            commodity_id: result.code,
            commodity_name: result.name,
            commodity_type: attribute === PRODUCT_TYPE.REAL ? '真实' : '虚拟',
            commodity_Typ: CHARGEOFF_TYPE[chargeOffType]||'',
            first_commodity: result.firstCategoryName,
            second_commodity: result.secondCategoryName,
            store_id: result.sellStoreId,
            store_name: result.sellStoreName,
            sku_price: sku.sellPrice,
          },
          pointParamsSubmit: {
            ...this.data.pointParamsSubmit,
            commodity_specification: sku.ruleVal && sku.natureVal && (sku.ruleVal + ' ' + sku.natureVal),
          }
        })
        hideToast()
        
        this.triggerEvent('getDetail', {product: result, sku}) //获取详情成功 向父级传值
        this.selectComponent("#skuComponents").setSku({submitType: '2', fromBtn: true, isReal: true}) //获取详情后 弹出选规格
        
        if (this.data.showAnimation) {
          this.initBallPos(); //获取小球最开始的位置
        }
      })
      .catch((err) => {
        showToast({
          title: err.msg || '商品信息获取失败',
          type: TOAST_TYPE.WARNING
        })
      })
    },
    //选择完规格 提交确定
    selectTypeSubmit(e) {
      const {sku, num: productNum} = e.detail
      // const {product, subSkuDtoList} = this.data
      this.setData({
        sku,
        pointParamsBase: {
          ...this.data.pointParamsBase,
          sku_id: sku.skuId,
          // commodity_id: sku.code,
          sku_price: sku.sellPrice
        },
        pointParamsSubmit: {
          ...this.data.pointParamsSubmit,
          commodity_specification: sku.ruleVal && sku.natureVal && (sku.ruleVal + ' ' + sku.natureVal),
          commodity_quantity: productNum
        }
      })
      this.triggerEvent('getDetail', {sku}) //选择规格后 向父级传值
      if (sku.stockNums < productNum) {
        showToast({
          title: '抱歉，商品库存不足咯~',
          type: TOAST_TYPE.WARNING,
          duration: 1000
        })
        return
      }
      // 埋点（加购）
      track(TrackEventName.Boss_AddCart, {
        ...this.data.pointParamsBase,
        ...this.data.pointParamsSubmit,
        addtime: Date.now()
      })
      //加购请求接口
      this.addToShoppingCart([{skuId: sku.skuId, skuNum: productNum}])
    },
    //加入购物车 请求接口
    addToShoppingCart(cartList) {
      cartAdd({cartList})
      .then((res) => {
        if (this.data.showAnimation) {
          this.getAnimation() //加购动画
        } else {
          showToast({
            title: '添加成功',
            type: TOAST_TYPE.SUCCESS
          })
        }
        this.triggerEvent('success', {}) //加购成功 向父级传值
      })
      .catch((err) => {
        showToast({
          title: err.msg || '添加失败',
          type: TOAST_TYPE.WARNING,
          duration: 1000
        })
      })
    },
    
  }
});
