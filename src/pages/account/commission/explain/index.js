// pages/commission/explain/index.js
Component({
    options: {
        multipleSlots: true 
    },
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: '标题'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        visible: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        showExplain(){
            this.setData({visible: true});
        },
        hideExplain(){
            this.setData({visible: false});
        }
    }
})
