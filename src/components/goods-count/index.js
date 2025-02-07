Component({
  properties: {
    productNum: {
      type: Number,
      value: 0
    },
    skuId: {
      type: String,
      value: ''
    },
    minNum: {
      type: Number,
      value: 1
    },
    maxNum: {
      type: Number,
      value: 999
    },
    stockNums: {
      type: Number,
      value: 0
    },
    disabledInput: {
      type: Boolean,
      value: false
    }
  },
  observers: {
    'productNum': function (productNum) {
      const _maxNum = (this.data.stockNums > 0 && this.data.maxNum > this.data.stockNums) ? this.data.stockNums : this.data.maxNum
      this.setData({
        _maxNum
      })
    }
  },
  data: {
    _maxNum: 0
  },
  methods: {
    //加减产品数量
    changeNum: function ({currentTarget}) {
      //type 1减 2加
      const {type} = currentTarget.dataset
      let _productNum = this.data.productNum;
      const _maxNum = (this.data.stockNums > 0 && this.data.maxNum > this.data.stockNums) ? this.data.stockNums : this.data.maxNum
      if (String(type) === '1') { //减号操作
        _productNum--
        if (_productNum < this.data.minNum) return;
        if (_productNum > _maxNum) {
          _productNum = _maxNum
        }
      }
      if (String(type) === '2') { //加号操作
        _productNum++
        if (_productNum > _maxNum) return;
        if (_productNum < this.data.minNum) {
          _productNum = this.data.minNum
        }
      }
      this.triggerEvent('changenum', {productNum: Number(_productNum), skuId: this.data.skuId})
    },
    catchIput: function () {
    },
    //失去焦点 触发数量改变
    onBlurProdNum: function ({detail}) {
      this.valProdNum(detail.value)
    },
    valProdNum: function (productNum) {
      const _maxNum = (this.data.stockNums > 0 && this.data.maxNum > this.data.stockNums) ? this.data.stockNums : this.data.maxNum
      if (isNaN(productNum) || Number(productNum) === 0) {
        productNum = this.data.minNum;
      } else if (Number(productNum) < this.data.minNum) {
        productNum = this.data.minNum;
      } else if (Number(productNum) > _maxNum) {
        productNum = _maxNum;
      }
      this.triggerEvent('changenum', {productNum: Number(productNum), skuId: this.data.skuId})
    }
  }
})
