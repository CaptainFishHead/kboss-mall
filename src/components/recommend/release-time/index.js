// components/recommend/release-time/index.ts
import '../../../utils/dateFormat';
Component({
  externalClasses: ["ext-class"],
  /**
   * 组件的属性列表
   */
  properties: {
    time: {
      type: String,
      value: '',
      observer(val){
        if(val) this.formatTime(val.replaceAll('-', '/'));
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    timeStr: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 格式化时间
    formatTime(time){
      const releaseTime = new Date(time);
      const currentTime = new Date();
      const diff = currentTime - releaseTime;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      let timeStr = '';
      if( days === 0 ){
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours > 0) {
          timeStr = `${hours} 小时前`;
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          timeStr = minutes > 0 ? `${minutes} 分钟前` : '刚刚';
        }
      } else if( days >= 1 && days <= 5) {
        timeStr = `${days} 天前`;
      } else if(days > 5 && releaseTime.getFullYear() === currentTime.getFullYear()) {
        timeStr = releaseTime.dateFormat('MM-dd HH:mm')
      } else {
        timeStr = releaseTime.dateFormat('YYYY-MM-dd')
      }
      this.setData({timeStr})

    }
  }
})