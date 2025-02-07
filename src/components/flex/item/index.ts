interface IFlexItemProps extends WechatMiniprogram.Component.PropertyOption {
	basis: {
		type: StringConstructor,
		value: 'auto' | 'fill' | 'max-content' | 'min-content' | 'fit-content' | 'content' | 'inherit' | 'initial' | 'unset' | string
	},
	self: {
		type: StringConstructor,
		value: 'auto' | 'normal' | 'center' | 'start' | 'end' | 'self-start' | 'self-end' | 'flex-start' | 'flex-end' | 'baseline' | 'first baseline' | 'last baseline' | 'stretch' | 'safe center' | 'unsafe center' | 'inherit' | 'initial' | 'unset'
	},
	order: { type: NumberConstructor, value: number },
	grow: { type: NumberConstructor, value: number },
	shrink: { type: NumberConstructor, value: number },
}

Component({
	properties: {
		order: {type: Number, optionalTypes: [Number, String], value: 0},
		grow: {type: Number, optionalTypes: [Number, String], value: 0},
		shrink: {type: Number, optionalTypes: [Number, String], value: 1},
		basis: {type: String, value: 'auto'},
		self: {type: String, value: 'auto'},
		style: {type: String},
	},
	options: {
		// 定义 style 属性可以拿到 style 属性上设置的值
		virtualHost: true
	},
	externalClasses: ['class'], // 可以将 class 设为 externalClasses
	data: {},
	methods: {}
});
