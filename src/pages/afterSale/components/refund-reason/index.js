Component({
  properties: {
    orderPoint:{
      type:Number,
      value:0
    },
    totalRefundFormat:{
      type:String,
      value:'0'
    },
    amoutRefundFormat:{
      type:String,
      value: 0
    },
    beanRefundFormat:{
      type:String,
      value: 0
    },
    PostagePriceFormat: {
      type: String,
      value: 0
    }
    
  },
  data: {
    returnReasonVisible: false,
    reasonList: [
      {
        text: '7天无理由（不喜欢、不满意、不想要）',
        select: false,
      },
      {
        text: '商品买错了（颜色、尺寸、数量等错误）',
        select: false,
      },
      {
        text: '重复下单/误下单',
        select: false,
      },
      {
        text: '商品质量问题',
        select: false
      },
      {
        text: '商家缺货',
        select: false
      },
      {
        text: '延迟发货/订单不能按预计时间送达',
        select: false
      },
      {
        text: '效果不好/包装不好',
        select: false
      },
      {
        text: '商家发错货',
        select: false
      },
      {
        text: '生产日期、批号等与卖家承诺不符',
        select: false
      },
      {
        text: '图片、产地、保质期等与商品描述不符',
        select: false
      },
      {
        text: '商品破损、变质',
        select: false
      },
      {
        text: '疫情/天气等各种原因导致无法发货',
        select: false
      },
      {
        text: '其他原因',
        select: false
      }
    ],
    reasonText: '', // 选择的退款原因
    reasonResult: '' // 最终确认的退款原因
  },
  options:{
    share:"app",
    styleIsolation: 'apply-shared'
  },
  methods: {
    reasonShow() {
      const reason = this.data.reasonList.find(item => item.select);
      if(reason && reason.select) reason.select = false;
      this.setData({returnReasonVisible: true, reasonList: this.data.reasonList})
    },
    //选择原因
    selectHandler(e) {
      let {reasonList} = this.data
      const {index} = e.currentTarget.dataset
      let reasonText = ''
      const updateList = reasonList.map((val, key) => {
        if(index === key) {
          val.select = !val.select
          reasonText = val.text;
        } else {
          val.select = false
        }
        return val;
      })
      this.setData({reasonText, reasonList: updateList})
    },
    confirmReason() {
      const {reasonText, reasonList} = this.data
      this.setData({returnReasonVisible: false, reasonResult: reasonText })
      this.triggerEvent('checkedreason', {
        reasonText,
        otherReasonChecked: reasonList[reasonList.length - 1].select
      })
    },
  }
});
