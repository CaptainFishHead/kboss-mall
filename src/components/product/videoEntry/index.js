

Component({
  options: {
		multipleSlots: true,
		styleIsolation: 'apply-shared'
	},
  data: {
  },
  properties: {
    product: {
      type: Object,
      value: {}
    },
  },
  methods: {
    hanldeClick() {
      this.triggerEvent('handleClick', {})
    }
  }
});
