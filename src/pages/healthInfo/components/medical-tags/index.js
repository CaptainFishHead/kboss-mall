// component/healthInfo/medical-tags/index.ts
Component({
  
  properties: {
    title: {
      type: String,
      value: ''
    },
    visible: {
      type: Boolean,
      value: false
    },
    data: {
      type: Array,
      value: []
    }
  },
  data: {
  
  },
  methods: {
    closePortrait() {
      this.triggerEvent('close')
    },
    // img- share - info
    touchMove() {
      return;
    },
  }
})