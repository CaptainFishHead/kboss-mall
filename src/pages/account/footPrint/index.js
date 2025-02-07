import {queryFootPrintByPage} from "../../../models/footPrintModel";
import '../../../utils/dateFormat';
import {hideToast, showToast} from "../../../components/toast/index";
import {TOAST_TYPE} from "../../../const/index";
import back from "../../../behaviors/back";

Page({
  
  data: {
    footPrintData: [], // 足迹未归类的源数据
    footPrintList: [], // 足迹归类后的数据
    currentPage: 1, // 当前页数
    total: 0, // 数据总共多少条
    
  },
  behaviors: [back],
  onLoad(options) {
    const {currentPage} = this.data;
    this.getFootPrint({page: currentPage});
  },
  /** 分页获取足迹列表*/
  getFootPrint(data) {
    showToast({type: TOAST_TYPE.LOADING})
    queryFootPrintByPage({
      // subjectType: 1,
      rows: 24,
      ...data
    })
    .then(({result}) => {
      const {footPrintData} = this.data;
      const composeList = footPrintData.concat(result.list || [])
      const list = this.FormatFootPrintList(composeList);
      this.setData({
        total: result.totalCount,
        footPrintData: composeList,
        footPrintList: list || [],
        currentPage: data.page
      });
    }).finally(() => {
      hideToast()
    })
  },
  /** 根据创建时间归类数组*/
  FormatFootPrintList(data) {
    if (!data.length) return;
    let res = [];
    let obj = {};
    data.forEach(val => {
      const date = new Date(val.createdTime.replaceAll('-', '/'));
      const createDate = date.dateFormat('yy-MM-DD');
      const showTimeStr = date.dateFormat('MM月DD日');
      const today = new Date().dateFormat('yy-MM-DD');
      if (val.productInfoVo) val.productInfoVo.subjectType = val.subjectType;
      if (obj.createdTime === createDate) {
        obj.productList.push(val.productInfoVo);
      } else {
        obj = {
          createdTime: createDate,
          showCreatedTime: createDate === today ? '今天' : showTimeStr,
          productList: [val.productInfoVo]
        };
        res.push(obj);
      }
    });
    return res;
  },
  onReachBottom: function () {
    const {footPrintData, total, currentPage} = this.data;
    if (footPrintData.length < total) {
      this.getFootPrint({
        page: currentPage + 1
      });
    }
  },
  toProductDetail(e){
    const {spuid, subjectype} = e.currentTarget.dataset
    if(subjectype === 4) {
      wx.navigateTo({url: `/pages/product/suit/index?spuId=${spuid}`})
    } else{
      wx.navigateTo({url: `/pages/product/index?spuId=${spuid}&skuId=none`})
    }
  }
})