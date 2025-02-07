
Component({
  options: {
		styleIsolation: 'apply-shared'
	},
  properties: {
    allChecked: {
      type: Boolean,
      value: false
    },
    totalNumGoods:{
      type:Number,
      value: 0
    },
    totalPrice:{
      type:[Number,String],
      value: 0
    },
  },
  data: {

  },
  methods: {
    allCheckeChange(){
      this.triggerEvent('allcheckechange', {allChecked:this.data.allChecked})
    },
    productSettlement(){
      this.triggerEvent('submitorder')
    }
  }
})
