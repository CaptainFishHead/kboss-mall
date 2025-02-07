Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared',
    virtualHost: true
  },
  properties: {
    item: {
      type: Object,
      value: {}
    },
    refundType: {
      type: Object,
      value: 0
    }
  },
  data: {},
  methods: {}
})
