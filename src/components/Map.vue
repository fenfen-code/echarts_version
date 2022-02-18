<template>
  <div class="com-container" @dblclick="revertMap">
      <!-- 地图组件 -->
      <div class="com-chart" ref="map_ref"> 
          
      </div>
  </div>
</template>

<script>
import axios from 'axios'
import { getThemeValue } from '@/utils/theme_utils'
import {mapState} from 'vuex'
import {getProvinceMapInfo} from '@/utils/map_utils'
export default {
    data () {
        return {
            chartInstance:null,
            allData:null,//服务器返回的数据
            mapData:{},//地图缓存对象
        }
    },
    created () {
      //组件创建完成进行回调函数的注册
      this.$socket.registerCallBack('mapData',this.getData)
    },
    computed :{
      ...mapState(['theme'])
    },
    mounted(){
      this.initChart()
      //this.getData()
      this.$socket.send({
            action: 'getData',
            socketType: 'mapData',
            chartName: 'map',
            value: ""
        })
      window.addEventListener('resize',this.screenAdapter)
      this.screenAdapter()//主动进行第一次适配
    },
    destroyed () {
        window. removeEventListener('resize',this.screenAdapter)
        this.$socket.unregisterCallBack("mapData")
    },
  methods:{
      async initChart(){
        this.chartInstance= this.$echarts.init(this.$refs.map_ref,this.theme)
        //地图数据并不在koa2中，不能使用this.$http
        const ret = await axios.get('http://localhost:8080/static/map/china.json')
        //console.log(ret)
        this.$echarts.registerMap('china',ret.data)
        const initOption = {
            title:{
                text:'|商家分布',
                left:20,
                top:20,
                // color: getThemeValue(this.theme).titleColor
            },
            geo:{
                type:'map',
                map:'china',
                top:'5%',
                bottom:'5%',
                itemStyle:{
                    areaColor:'#2E72BF',
                    borderColor:'#333'
                }
            },
            legend:{
                left:'5%',
                bottom:'5%',
                orient:'vertical'
            }
        }
        this.chartInstance.setOption(initOption)
        this.chartInstance.on('click',async arg =>{
            const province=getProvinceMapInfo(arg.name)
            //console.log('地图被点击l ')
            console.log(province)
            
            // 判断获得这个省份的地图矢量数据是否在mapData中存在
            if (!this.mapData[province.key]){
                const ret=await axios.get('http://localhost:8080'+province.path)
                this.$echarts.registerMap(province.key,ret.data)
                this.mapData[province.key]=ret.data
            }
            // this.$echarts.registerMap(province.key,ret.data)
            // this.mapData[province.key]=ret.data
            const changeOption ={
                geo:{
                    map:province.key
                }
            }
            this.chartInstance.setOption(changeOption)
        })
      },
      getData(ret) {
          //获得散点数据
          //const {data:ret}=await this.$http.get('map')
          console.log(ret)
          this.allData=ret
          this.updateChart()
      },
      updateChart () {
          const legendArr =this.allData.map(item =>{
              return item.name
          })
          const seriesArr =this.allData.map(item =>{
              //return的这个对象是一个类别下的所有散点数据
            //   如果想在地图中显示散点的数据，需要给图表增加一个配置，coordinateSystem:geo
              return {
                  type:'effectScatter',
                  rippleEffect:{
                      scale:5,
                      brushType:'stroke'//空心效果
                  },
                  name:item.name,
                  data:item.children,
                  coordinateSystem:'geo'
              }
          })
          const dataOption={
              legend:{
                  data:legendArr
              },
              series:seriesArr
          }
          this.chartInstance.setOption(dataOption)
      },
      screenAdapter () {
          this.titleFontSize =this.$refs.map_ref.offsetWidth /100 *3.6
          const adapterOption ={
              textStyle:{
                    fontSize:this.titleFontSize/2
              },
              legend:{
                itemWidth : this.titleFontSize,
                itemHeight :this.titleFontSize,
                itemGap:this.titleFontSize,
                tsetStyle:{
                    fontSize:this.titleFontSize/2
                }
              }
          }
          this.chartInstance.setOption(adapterOption)
          this.chartInstance.resize()
      },
      //双击回到中国地图
      revertMap(){
        const reverOption ={
            geo:{
                map:'china'
            }
        }
        this.chartInstance.setOption(reverOption)
      }
    },
    
    watch :{
      theme(){
          this.chartInstance.dispose()
          this.initChart()
          this.screenAdapter()
          this.updateChart()
      }
  }
}
</script>

<style>

</style>