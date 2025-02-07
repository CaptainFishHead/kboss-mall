export const getPeopleNumOption = (data, xAxisData) => ({
  grid: {
    top: 50,
    bottom: 60,
    left: '14%',
    right: '8%'
  },
  tooltip: {
    backgroundColor: 'rgba(187, 117, 255, 1)',
    borderColor: 'rgba(187, 117, 255, 1)',
    formatter(params) {
      return params.value
    },
    textStyle: {
      color: '#000'
    },
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data: xAxisData || ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00'],
    axisLine: {
      lineStyle: {
        color: 'rgba(229,232,239,0.12)',
        type: 'dashed'
      }
    },
    axisPointer: {
      show: true,
      lineStyle: {
        color: 'rgba(134, 97, 224, 1)',
        type: 'solid',
      }
    },
    axisLabel: {
      color: 'rgba(229,232,239,0.2)',
      fontSize: 12
    },
    axisTick: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    splitLine: {
      show: true,
      lineStyle: {
        color: ['rgba(255,255,255,0.12)'],
        type: 'dashed'
      }
    },
    axisLabel: {
      color: 'rgba(229,232,239,0.2)',
      fontSize: 12,
      formatter(value) {
        if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'k'
        } else {
          return value
        }
      }
    },
  },
  series: [
    {
      data: data || [0, 0, 0, 0, 0, 0, 0],
      type: 'line',
      smooth: false, // 曲线平滑
      showSymbol: false, // 只有一条数据一直显示远点否则 只在hover显示圆点
      symbolSize: 9, // 圆点大小
      itemStyle: {
        borderWidth: 0
      },
      emphasis: {
        itemStyle: { // 圆点亮状态
          color: '#fff',
          borderWidth: 0
        },
      },
      lineStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(178, 93, 193, 1)' // 0% 处的颜色
          }, {
            offset: 1, color: 'rgba(116, 98, 236, 1)' // 100% 处的颜色
          }],
        }
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(80, 85, 255, 0.50)' // 0% 处的颜色 rgba(82,200,67,0.16)
          }, {
            offset: 1, color: 'rgba(130, 96, 225, 0)' // 100% 处的颜色 rgba(255,255,255,0)
          }],
        }
      },
    }
  ]
})
export let getActiveOption = (data, xAxisData) => ({
  grid: {
    top: 50,
    bottom: 60,
    left: '14%',
    right: '8%'
  },
  tooltip: {
    backgroundColor: 'rgba(255, 205, 50, 1)',
    borderColor: 'rgba(255, 205, 50, 1)',
    formatter(params) {
      return params.value + '%'
    },
    textStyle: {
      color: '#000'
    },
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data: xAxisData || ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00'],
    axisLine: {
      lineStyle: {
        color: 'rgba(229,232,239,0.12)',
        type: 'dashed'
      }
    },
    axisPointer: {
      show: true,
      lineStyle: {
        color: 'rgba(233, 176, 92, 1)',
        type: 'solid',
      }
    },
    axisLabel: {
      color: 'rgba(229,232,239,0.2)',
      fontSize: 12
    },
    axisTick: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    splitLine: {
      show: true,
      lineStyle: {
        color: ['rgba(255,255,255,0.12)'],
        type: 'dashed'
      }
    },
    axisLabel: {
      color: 'rgba(229,232,239,0.2)',
      fontSize: 12,
      formatter(value) {
        return value + '%'
      }
    },
  },
  series: [
    {
      data: data || [0, 0, 0, 0, 0, 0, 0],
      type: 'line',
      smooth: true, // 曲线平滑
      showSymbol: false, // 只有一条数据一直显示远点否则 只在hover显示圆点
      symbolSize: 9, // 圆点大小
      itemStyle: {
        borderWidth: 0
      },
      emphasis: {
        itemStyle: { // 圆点亮状态
          color: '#fff',
          borderWidth: 0
        },
      },
      lineStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(194, 96, 96, 1)' // 0% 处的颜色
          }, {
            offset: 1, color: 'rgba(251, 213, 90, 1)' // 100% 处的颜色
          }],
        }
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(194, 96, 96, 0.1)' // 0% 处的颜色 rgba(82,200,67,0.16)
          }, {
            offset: 1, color: 'rgba(250, 210, 90, 0.1)' // 100% 处的颜色 rgba(255,255,255,0)
          }],
        }
      },
    }
  ]
})