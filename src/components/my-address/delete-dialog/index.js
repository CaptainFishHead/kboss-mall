// pages/address/delete-dialog/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        visible: {
            type: Boolean,
            value: true
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onCloseDelDialog(){
            this.setData({visible: false})
        },
        onDelAddress(){
            this.triggerEvent("confirmDel")
        }
    }
})
