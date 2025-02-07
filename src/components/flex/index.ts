interface IFlexProps extends WechatMiniprogram.Component.PropertyOption {
  direction: {
    type: StringConstructor,
    value: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  },
  wrap: {
    type: StringConstructor,
    value: 'wrap' | 'nowrap'
  },
  alignItems: {
    type: StringConstructor,
    value: 'auto' | 'normal' | 'center' | 'start' | 'end' | 'self-start' | 'self-end' | 'flex-start' | 'flex-end' | 'baseline' | 'first baseline' | 'last baseline' | 'stretch' | 'safe center' | 'unsafe center' | 'inherit' | 'initial' | 'unset'
  },
  justifyContent: {
    type: StringConstructor,
    value: 'stretch' | 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  },
  alignContent: {
    type: StringConstructor,
    value: 'stretch' | 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  },
}


Component({
  properties: {
    direction: {
      type: String, value: 'row'
    },
    wrap: {
      type: String, value: 'wrap'
    },
    alignItems: {
      type: String, value: 'start'
    },
    justifyContent: {
      type: String, value: "stretch"
    },
    alignContent: {
      type: String, value: "stretch"
    },
    style: { type: String },
    // 作用在自元素,用法和padding、margin一样
    space: { type: String, observer: 'updateItemMargin' },
    refId: { type: String }
  },
  options: {
    virtualHost: true
  },
  externalClasses: ['class'], // 可以将 class 设为 externalClasses
  data: {
    margin: <string>'0 0',
    fix: <string>'0 0'
  },
  methods: {
    updateItemMargin(value?: string) {
      if (typeof value === "string") {
        const _margin = value.split(' ')
        const [top = 0, right = top, bottom = top, left = right] = _margin
        this.setData({ margin: [top, right, bottom, left].join(' '), fix: `0 -${right} 0 -${left}` })
      }
    }
  }
});
