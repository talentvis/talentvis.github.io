import React, { useEffect, useMemo, useRef, useState } from "react"
import ReactEcharts from 'echarts-for-react'
import * as echarts from 'echarts'
import * as d3 from "d3"
import style from "./index.module.less"
import { Select } from 'antd';

let charData = null, yearList = [], mapChart = null, target_ISOList = [], source_ISOList = [], dataList = [], wordJSON = null;

const planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
const getMapPromise = d3.csv('src/assets/json/small_flow_data.csv')
const getMapJsonPromise = d3.json("src/assets/json/worldmap.json")
const loadDataResult = await Promise.all([getMapPromise, getMapJsonPromise])
let renderText = [] //记录已经渲染的文字，防止重复渲染

charData = loadDataResult[0].map(item => {
  if (!yearList.includes(item.year)) {
    yearList.push(item.year)
  }
  if (!dataList.includes(item.data)) {
    dataList.push(item.data)
  }
  if (!source_ISOList.includes(item.source_ISO)) {
    source_ISOList.push(item.source_ISO)
  }
  if (!target_ISOList.includes(item.target_ISO)) {
    target_ISOList.push(item.target_ISO)
  }
  


  return {
    ...item,
    start: JSON.parse(item.start),
    end: JSON.parse(item.end),

  }
})
wordJSON = loadDataResult[1]

yearList.unshift("All")
target_ISOList.unshift("All")
source_ISOList.unshift("All")
dataList.unshift("All")




let renderTime = 0
const Char = React.memo((prop) => {
  let echartRef = useRef(null), echartInstance = null
  let [echartOption, setEchartOption] = useState({})
  useEffect(() => {
    if (echartRef) {
      echartInstance = echartRef.getEchartsInstance();
      echarts.registerMap("wordMap", wordJSON)

      setEchartOption({
        xAxis: { show: false },
        yAxis: { show: false },
        grid: {
          left: 0,
          right: 0,
          top: 0,

        },
        geo: {
          map: 'wordMap',
          show: true,
          roam: false,

          itemStyle: {


            normal: {
              areaColor: 'white',
              borderWidth: 0.2,
            },
            emphasis: {
              show: false
            }
          },
          regions: [{ // 选中的区域
            name: 'China',
            selected: false,
            itemStyle: { // 高亮时候的样式
              emphasis: {
                show: false
              },

            },
            label: { // 高亮的时候不显示标签
              emphasis: {
                show: true
              }
            }
          }],
          label: {  //显示文字
            show: false,
          },


        },
        series: [
          {
            type: 'lines',
            zlevel: 2,
            coordinateSystem: 'geo',
            label: {
              show: true,
              fontWeight: 600,
              fontSize: 10,
              color: "black",
              formatter: function (param) {
                if (param.value[2] && !renderText.includes(param.value[2].target_ISO)) {
                  renderText.push(param.value[2].target_ISO)
                  return param.value[2].target_ISO;
                } else {
                  return ''
                }

              },
            },

            effect: {
              show: true,
              period: 6,
              trailLength: 0,
              symbol: planePath,
              symbolSize: 5
            },
            lineStyle: {

              normal: {
                color: {
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: '#f483c1 ' // 0% 处的颜色
                  }, {
                    offset: 1, color: '#00a8e8' // 100% 处的颜色
                  }],
                  global: false // 缺省为 false
                },
                width: 2,
                opacity: 0.6,
                curveness: 0.3
              }
            },
            data: prop.lineData 
          },
          {
            type: 'custom',
            coordinateSystem: 'geo',
            renderItem(params, api) {

              // 获取当前数据项的起点和终点坐标  
              const startPoint = api.coord(prop.lineData[params.dataIndex][0]);
              const endPoint = api.coord(prop.lineData[params.dataIndex][1]);


              // 定义一个自定义的路径数组，可以根据需求修改路径坐标点  
              const path = [
                [startPoint[0], startPoint[1]],
                [endPoint[0], startPoint[1]],
                [endPoint[0], endPoint[1]]
              ];

              // 返回一个自定义路径的图形对象  
              return {
                type: 'path',
                shape: {
                  path: path
                },
                style: {
                  stroke: '#ff0000',
                  width: 2
                }
              };
            },
            data: prop.lineData
          }
        ]
      })

    }
  }, [echartRef, prop])

  return (
    <div className={style['echart-box']}>
      <ReactEcharts
        ref={(e) => { echartRef = e }}
        option={echartOption}
        notMerge={true}
        lazyUpdate={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
})



export default function Home(prop) {
  let [selectedMap, setSelect] = useState({
    year: 'All',
    target_ISO: 'HKG',
    source_ISO: 'All',
    data: 'fintech_talent'
  })
  const [lineData, setLineData] = useState([])
  let filters = [
    { targetFiled: 'year', list: yearList },
    { targetFiled: 'data', list: dataList },
    { targetFiled: 'source_ISO', list: source_ISOList },
    { targetFiled: 'target_ISO', list: target_ISOList },
  ]
  const fitlerLineData = () => {
    let lineData = []
    renderText = []
    charData.map(item => {
      if ((item.year == selectedMap.year || selectedMap.year == 'All') && (item.target_ISO == selectedMap.target_ISO || selectedMap.target_ISO == 'All') && (item.data == selectedMap.data || selectedMap.data == 'All') && (item.source_ISO == selectedMap.source_ISO || selectedMap.source_ISO == 'All')) {
        lineData.push([
          item.start,
          item.end,
          item
        ])
      }
    })
    setLineData(lineData)
  }

  const selectChange = (value, key) => {

    setSelect(JSON.parse(JSON.stringify({ ...selectedMap, [key]: value })))
  
    fitlerLineData()
  }

  useEffect(() => {
    fitlerLineData()
  }, [selectedMap])


  return (
    <div className={style['home']}>
      <div className={style['home-header']}>

      </div>
      <div className={style['home-filters']}>
        {
          filters.map((filter,fi) => {
            return (
              <div className={style['filter-item']} key={filter.targetFiled}>
                <p>{filter["targetFiled"]}</p>
                <Select defaultValue={selectedMap[filter.targetFiled]} key={fi}  onChange={(value) => { selectChange(value, filter.targetFiled) }} options={filter.list.map((o, i) => {
                  return {
                    label: o,
                    key: o,
                    value: o
                  }
                })} />
              </div>
            )
          })
        }
      </div>
      <div className={style['home-map']}>
        <Char lineData={lineData} />
      </div>
    </div>
  )
}