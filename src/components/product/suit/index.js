import {goodsActivityInfo, queryChooseSuitList} from "../../../models/productModel";
import {hideToast, showToast} from "../../../components/toast/index";
import {TOAST_TYPE} from "../../../const/index";
import {moneyFormat} from '../../../utils/index'

Component({
  properties: {},
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },
  data: {
    visible: false,
    spuList: [],
    submitType: '2', //点击按钮来源 1:立即购买 2:加购
    fromBtn: false, //底部按钮 规格点击（用来区分加购、立即购买，对应的不同按钮显示）
    allChecked: false, //全选状态
    allDisabled: false, //全选是否可点
    dialog: {
      show: false
    }
  },
  methods: {
    
    //获取下单商品列表
    getChooseList(params) {
      showToast({type: TOAST_TYPE.LOADING})
      const {productIdList, submitType, fromBtn} = params
      queryChooseSuitList({productIdList})
      .then(({result}) => {
        const {productList} = result
        this.setData({
          spuList: productList || [],
          fromBtn,
          submitType
        })
        this.showList() //列表弹层
        hideToast()
      })
      .catch((err) => {
        console.error(err, '所选商品已售罄，正在补货中')
        showToast({
          title: err.msg || '所选商品已售罄，正在补货中',
          type: TOAST_TYPE.WARNING
        })
      })
    },
    // 列表弹层
    showList() {
      const {spuList} = this.data
      const indexList = []
      let selectedCount = 0
      let disabledCount = 0
      spuList.forEach((item, index) => {
        const sku = item.skuList.find(sku => sku.stockNums >= (sku.sinceMin || 0))
        if (sku && item.isShelf) {
          item.sku = sku
          item.num = sku.sinceMin
          item.checked = true
        } else {
          item.sku = item.skuList[0]
          item.num = 1
          item.disabled = true
          item.checked = false
          indexList.push(index)
        }
        selectedCount += item.checked ? 1 : 0
        disabledCount += item.disabled ? 1 : 0
      })
      indexList.forEach(e => {
        spuList[e] = spuList.splice(spuList.length, 1, spuList[e])[0]
      })
      const newSpuList = spuList.filter(item => !!item) //去掉undefined项
      
      this.setData({
        spuList: newSpuList,
        visible: true,
        allChecked: (selectedCount + disabledCount) === newSpuList.length
      })
      if (disabledCount === newSpuList.length) {
        this.setData({
          allChecked: false,
          allDisabled: true
        })
      }
      this.calcHandle() //商品计算价格
    },
    //选择规格
    showSku(e) {
      const {skus, kid} = e.currentTarget.dataset
      let promiseArr = []
      skus.forEach(item => {
        const _params = {
          sellPrice: item.sellPrice,
          skuId: item.skuId
        }
        promiseArr.push(goodsActivityInfo(_params))
      })
      Promise.all(promiseArr).then(resList => {
        const skuMaps = {}
        resList.map(({result}) => {
          skuMaps[result.skuId] = result.usableNum
        })
        const skuList = skus.map(item=>{
          return {
            ...item,
            kangBossActivityInfo:{
              usableNum: skuMaps[item.skuId]
            }
          }
        })
        this.setData({
          skuList,
          skuId: kid
        })
        this.selectComponent("#skuComponents").setSku({submitType: '2', fromBtn: true, fromCart: true, isReal: true}) //选择规格弹窗
      })
    },
    //选择完规格 后续操作
    selectTypeSubmit(e) {
      const {sku} = e.detail
      const {spuList} = this.data
      spuList.forEach(item => {
        item.skuList.forEach(e => {
          if (sku.id === e.id) {
            item.sku = e
            item.sellPrice = e.sellPrice
            if (item.num < sku.sinceMin) {
              item.num = sku.sinceMin
            } else if (item.num > sku.sinceMax) {
              item.num = sku.sinceMax
            }
          }
        })
      })
      this.setData({spuList})
      this.calcHandle() //商品计算价格
    },
    // 数量加减
    changeNum(e) {
      const {skuId, productNum} = e.detail
      const {spuList} = this.data
      spuList.forEach(item => {
        item.skuList.forEach(e => {
          if (skuId === e.id) {
            item.num = productNum
          }
        })
      })
      this.setData({spuList})
      this.calcHandle() //商品计算价格
    },
    // checkbox 单选
    changeCheckbox(e) {
      const {pid} = e.currentTarget.dataset
      const {spuList} = this.data
      let selectedCount = 0
      let disabledCount = 0
      spuList.forEach(item => {
        if (pid === item.id) {
          item.checked = !item.checked
        }
        selectedCount += item.checked ? 1 : 0
        disabledCount += item.disabled ? 1 : 0
      })
      this.setData({
        spuList,
        allChecked: (selectedCount + disabledCount) === spuList.length
      })
      this.calcHandle() //商品计算价格
    },
    // checkbox 全选
    changeCheckboxAll() {
      const {spuList} = this.data
      spuList.forEach(item => {
        if (!item.disabled){
          item.checked = !this.data.allChecked
        }
      })
      this.setData({
        spuList,
        allChecked: !this.data.allChecked
      })
      this.calcHandle() //商品计算价格
    },
    // 商品计算价格
    calcHandle() {
      let selectSkus = []
      let totalPrice = 0
      const {spuList} = this.data
      spuList.forEach(item => {
        if (item.checked) {
          item.sku.num = item.num
          selectSkus.push(item.sku)
          totalPrice += (item.sku.sellPrice * 100 * item.num) / 100
        }
      })
      this.setData({
        totalPrice: moneyFormat(Number(totalPrice).toFixed(2)),
        selectSkus
      })
    },
    submit(e) {
      const {submit: submitType} = e.currentTarget.dataset
      const {selectSkus, totalPrice} = this.data
      if (selectSkus.length === 0) return showToast({title: '请选择商品', type: TOAST_TYPE.WARNING})
      let showDialog = false
      selectSkus.map(e => {
        if (e.stockNums < e.num) {
          showDialog = true
          this.setData({
            dialog: {
              show: true,
              type: 'noStock',
              buttons: [{
                text: '我知道了',
                extClass: 'only-one-btn'
              }]
            }
          })
        }
      })
      if (!showDialog) {
        this.triggerEvent('success', {
          submitType,
          selectSkus,
          totalPriceSubmit: totalPrice
        })
        this.setData({visible: false})
      }
    },
    tapDialogButton(e) {
      const text = e.detail.item.text
      if (text.includes('去意已决') || text.includes('我知道了')) {
        this.setData({visible: false})
      }
      this.setData({
        dialog: {show: false}
      })
    },
    closeHalfDialog() {
      if (this.data.allDisabled) {
        this.setData({visible: false})
      } else {
        this.setData({
          dialog: {
            show: true,
            type: 'back',
            buttons: [{
              text: '去意已决'
            }, {
              text: '我再想想'
            }]
          }
        })
      }
    },
    //显示详情弹层
    showProduct(e) {
      const {id} = e.currentTarget.dataset
      this.triggerEvent('showDetails', {id})
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
