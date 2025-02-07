
Component({
  data: {

  },
  properties: {
    couponItem: {
      type: Object,
      value: {}
    },
    index:{
      type: String,
      value: ''
    }
  },
  options: {
    styleIsolation: 'apply-shared',
  },
  methods: {
    onTap(){
      const { couponItem, index } = this.data
      this.triggerEvent('tapCurItem', { couponItem,index})
    }
  }
});
