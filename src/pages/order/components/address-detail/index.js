Component({
  externalClasses: ["ext-class"],
  data: {
  },
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },
  properties: {
    orderInfo:{
      type: Object,
      value: {}
    },
  },
  methods: {}
})