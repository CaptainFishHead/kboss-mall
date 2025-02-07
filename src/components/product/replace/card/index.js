
Component({
  properties: {
    spu: {
      type: Object,
      value: {}
    },
    showCheckbox: {
      type: Boolean,
      value: false
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  methods: {
    // checkbox 单选
    changeCheckbox(e) {
      const { pid } = e.currentTarget.dataset
      this.triggerEvent('success', { pid })
    },
  }
});
