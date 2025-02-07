// pages/commission/index.js
import '../../../utils/dateFormat';
import {queryMonthStatistics, queryCommissionByPage} from "../../../models/commissionModel";
import {STORAGE_USER_FOR_KEY, TOAST_TYPE} from "../../../const/index";
import {hideToast, showToast} from "../../../components/toast/index";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 用户信息
        userInfo: {},
        // 总收益
        profit: 0,
        // 当前选择的时间 显示在页面中使用
        currentDate: '',
        // 本月总收益
        monthlyTotal: '0.00',
        // 分佣列表
        commissionList: [],
        // 分佣列表页数
        page: {}
    },
     /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const user = wx.getStorageSync(STORAGE_USER_FOR_KEY);
        this.setData({userInfo: user, profit: options.profit || '0.00'});
    },

    // 监听日期选择 查询时间对应的数据
    onChangeDate({detail}) {
        const {chooseDate} = detail;
        this.setData({chooseDate, currentDate:new Date(chooseDate).dateFormat('YYYY.M')});
        this.getMonthProfit();
        this.queryPageList({
            page: {
                index: 1
            }
        });
    },
    /**
     * 获取本月预估总收益
     */
    getMonthProfit() {
        const {userInfo, chooseDate} = this.data;
        showToast({type: TOAST_TYPE.LOADING})
        queryMonthStatistics({
            queryDate: new Date(chooseDate).dateFormat('YYYY-MM')
        }).then(({result}) => {
            const monthTotal = (result.monthlyTotal / 100).toFixed(2);
            this.setData({monthlyTotal: monthTotal})
        }).finally(() => {
			hideToast()
		})
    },

    /**
     * 查询分佣列表
     */
    queryPageList(params){
        const {userInfo, chooseDate} = this.data;
        queryCommissionByPage({
            queryDate: new Date(chooseDate).dateFormat('YYYY-MM'),
            ...params
        }).then(({result, page}) => {
            if(result.length){
                result.forEach(item => {
                    item.orderTotalPrice = (item.goodPrice / 100 * item.goodSize).toFixed(2);
                    item.commissionPrice = (item.commissionPrice / 100).toFixed(2);
                    item.orderStateObj = this.getOrderState(item);
                })
            }
            let {commissionList} = this.data;
            if(page.index === 1){
                commissionList = result;
            } else if(page.index <= page.pages) {
                commissionList = [...commissionList, ...result];
            }
            this.setData({
                commissionList,
                page
            })
        })
    },
    /**
     * 订单状态相关展示
     */
    getOrderState(data) {
        const orderStateObj = {
            "20": { //带结算
                time: data.orderPayTime && new Date(data.orderPayTime).dateFormat('YYYY-MM-DD HH:mm:ss'),
                timeDesc: '订单时间',
                commissionDesc: '佣金待结算',
                commissionClass: 'padding',
                unit: ""
            },
            "50": { // 可结算
                time: data.orderPayTime && new Date(data.orderPayTime).dateFormat('YYYY-MM-DD HH:mm:ss'),
                timeDesc: '订单时间',
                commissionDesc: '佣金可结算',
                commissionClass: 'sett',
                unit: "+"
            },
            "80": { // 已撤回
                time: data.orderRefundTime && new Date(data.orderRefundTime).dateFormat('YYYY-MM-DD HH:mm:ss'),
                timeDesc: '退款时间',
                commissionDesc: '佣金已撤回',
                commissionClass: 'withdraw',
                unit: "-"
            }
        };
        return orderStateObj[data.orderState];
    },
    /**
     * 复制订单号
     */
    copyOrderNum({target}) {
        const {num} = target.dataset
        wx.setClipboardData({data: num});
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let {page} = this.data;
        if(page.index >= page.pages) return;
        this.queryPageList({
            page: {
                index: page.index + 1
            }
        });
    },
})