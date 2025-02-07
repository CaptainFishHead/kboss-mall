Component({
  properties: {
    visibleBalance:{
      type: Boolean,
      value:false
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {
    buttonsConfim: [{
      text: '好的',
      type: '1'
    }],
  },
  methods: {
    tapClose(){
      this.triggerEvent('tapclosedialog')
    }
  }
})
