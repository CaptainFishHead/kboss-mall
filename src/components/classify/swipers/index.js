import {openPage} from "../../../utils/index";

Component({
    data: {
        curIndex: 0
    },
    properties: {
        topGoodsList: {
            type: Array,
            value: [],
        },
    },
    ready() {

    },
    options: {
        styleIsolation: 'apply-shared'
    },
    methods: {
        //商品详情
        toGoodsInfo(e) {
            const {link} = e.currentTarget.dataset
            openPage.call(this, {link})
        },
        // 轮播图切换
        swiperChange(e) {
            this.setData({curIndex: e.detail.current})
        }
    },
});
