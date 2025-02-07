Component({
  externalClasses: ["ext-class"],
  data: {
  },
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },
  properties: {
    addressInfo:{
      type: Object,
      value: {}
    },
  },
  methods: {
    toAddress(){
      this.triggerEvent('chooseAddress')
    }
  }
})