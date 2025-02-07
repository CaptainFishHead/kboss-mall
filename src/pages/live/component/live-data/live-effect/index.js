import * as echarts from '../../ec-canvas/echarts.js'
import { getPeopleNumOption, getActiveOption } from './options.js'
import { liveRoomDataInfo, liveRoomTableData } from '../../../models/live'
import '@utils/dateFormat'

let peopleNumChart = null
let activeChart = null

function initPeopleNumChart(canvas, width, height, dpr) {
  peopleNumChart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素
  });
  canvas.setChart(peopleNumChart)
  // peopleNumChart.setOption(getPeopleNumOption())
  return peopleNumChart;
}

function initActiveChart(canvas, width, height, dpr) {
  activeChart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素
  });
  canvas.setChart(activeChart)
  // activeChart.setOption(getActiveOption())
  return activeChart;
}

Component({
    properties: {
      roomId: {
        type: String,
        value: ''
      }
    },
    data: {
      dataInfo: {
        viewPerson: 0,
        maxOnline: 0,
        viewCount: 0
      },
      datas:[
        { value: 123, type: '运行指数', date: '10/01' },
        { value: 62, type: '历史均值', date: '10/01' },
        { value: 212, type: '运行指数', date: '10/02' },
        { value: 59, type: '历史均值', date: '10/02' },
        { value: 53, type: '运行指数', date: '10/03' },
        { value: 210, type: '历史均值', date: '10/03' },
        { value: 162, type: '运行指数', date: '10/04' },
        { value: 1, type: '历史均值', date: '10/04' }
      ],
      peopleNumChartEC: {
        onInit: initPeopleNumChart
      },
      activeChartEC: {
        onInit: initActiveChart
      } 
    },
    lifetimes: {
      ready() {
        this.getData()
      }
    },
    methods: {
      getData() {
        liveRoomDataInfo({roomId: this.data.roomId}).then(({result}) => {
          this.setData({dataInfo: result})
        })
        liveRoomTableData({roomId: this.data.roomId}).then(({result}) => {
          // allPerson: number // 总人数	
          // clickCount: number // 点击次数	
          // enterPerson: number // 进入人数	
          // linePerson: number // 在线人数	
          // statisticsDate: string // 统计日期	
          if (peopleNumChart && activeChart) {
            this.setOption(result)
          } else {
            setTimeout(() => {
              this.setOption(result)
            }, 1000)
          }
        })
        
      },
      setOption(result) {
        if (result.length) {
          let peopleData = result.map(item => item.linePerson)
          let activeData = result.map(item => item.allPerson ? Number((item.linePerson / item.allPerson * 100).toFixed(2)) : 0)
          let xAxisData = result.map(item => new Date(item.statisticsDate.replaceAll('-', '/')).dateFormat('HH:mm'))
          peopleNumChart.setOption(getPeopleNumOption(peopleData, xAxisData))
          activeChart.setOption(getActiveOption(activeData, xAxisData))
        } else {
          let data = [0, 0, 0, 0, 0, 0, 0]
          let xAxisData = ['8:00', '8:10', '8:20', '8:30', '8:40', '8:50', '9:00']
          peopleNumChart.setOption(getPeopleNumOption(data, xAxisData))
          activeChart.setOption(getActiveOption(data, xAxisData))
        }
        // 调试用
        // setTimeout(() => {
        //   let data = [23, 10, 44, 56, 11, 90, 50]
        //   let xAxisData = ['1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00']
        //   peopleNumChart.setOption(getPeopleNumOption(data, xAxisData))
        //   activeChart.setOption(getActiveOption(data, xAxisData))
        // }, 1000)
      }
    }
  })
