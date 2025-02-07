// components/empty/index.js
Component({
    externalClasses: ["ext-class", "ext-empty-text", "ext-gobtn"],
    options: {
        multipleSlots: true 
    },
    /**
     * 组件的属性列表
     */
    properties: {
        imgUrl: {
            type: String,
            value: ''
        },
        empotyDesc: {
            type: String,
            value: ''
        },
        buttonTxt: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onButton(){
            this.triggerEvent('buttonTap')
        }
    }
})
