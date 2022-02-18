<template>
  <div class="com-container">
      <!-- 销量组件 -->
      <div class="com-chart" ref="rank_ref"> 
          
      </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
    data () {
        return {
            chartInstance:null,
            allData:null,//服务器返回的数据
            startValue:0,//区域缩放的起点与终点
            endValue:9,
            timerId:null ,//定时器标识
        }
    },
    created () {
      //组件创建完成进行回调函数的注册
      this.$socket.registerCallBack('rankData',this.getData)
    },
    computed :{
      ...mapState(['theme'])
  },
    mounted(){
      this.initChart()
      //this.getData()
      this.$socket.send({
            action: 'getData',
            socketType: 'rankData',
            chartName: 'rank',
            value: ""
        })
      window.addEventListener('resize',this.screenAdapter)
      this.screenAdapter()//主动进行第一次适配
    },
    destroyed () {
     window. removeEventListener('resize',this.screenAdapter)
     clearInterval(this.timerId)
     this.$socket.unregisterCallBack("rankData")
    },
     methods:{
      initChart(){
        this.chartInstance= this.$echarts.init(this.$refs.rank_ref,this.theme)
        //地图数据并不在koa2中，不能使用this.$http
        // const ret = await axios.get('http://localhost:8080/static/map/china.json')
        // //console.log(ret)
        // this.$echarts.registerMap('china',ret.data)
        const initOption = {
            title:{
                text:'| 地区销售排行',
                left:20,
                top:20
            },
            grid:{
                  top:'40%',
                  left:'5%',
                  right:'5%',
                  bottom:'5%',
                  containLabel:true//距离是包含坐标轴上的文字
            },
            tooltip:{
                  show:true
            },
            xAxis:{
                type:'category',
            },
            yAxis:{
                type:'value',
            },
            series:[
                {
                    type:'bar'
                }
            ]
            
        }
        this.chartInstance.setOption(initOption)
        this.chartInstance.on('mouseover',() =>{
            clearInterval(this.timerId)
        })
        this.chartInstance.on('mouseout',() =>{
            this.startInterval()
        })
      },
     
    getData(ret) {
          //获得销售数据
          //const {data:ret}=await this.$http.get('rank')
          console.log(ret)
          this.allData=ret
          this.allData.sort((a,b)=>{
              return a.value-b.value  //从小到大的排序
          })
          this.updateChart()
          this.startInterval()
      },
      updateChart(){
          //颜色的数组
          const colorArr =[
              ['#0BA82C','#4FF778'],
              ['#2172BF','#23E5E5'],
              ['#5052EE','#AB6EE5']
          ]
          //所有省份的数组
          const provinceArr =this.allData.map(item =>{
              return item.name
          })
          const valueArr =this.allData.map(item =>{
              return item.value
          })
          const dataOption={
              xAxis:{
                  
                  data:provinceArr
              },
              dataZoom:{
                  show:false,
                  startValue:this.startValue,
                  endValue:this.endValue,
              },
              series :[{
                  data:valueArr,
                  itemStyle:{
                      color:arg=>{
                          let targetColorArr =null
                        //   console.log(arg)
                        //   return 'red'
                        if(arg.value>300){
                            targetColorArr =colorArr[0]
                        }else if(arg.value>200){
                            targetColorArr =colorArr[1]
                        }else{
                            targetColorArr =colorArr[2]
                            
                        }
                        return new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                              {
                                  offset:0,
                                  color:targetColorArr[0]
                              },
                              {
                                  offset:1,
                                  color:targetColorArr[1]
                              }
                          ])
                      }
                  }
              }]
          }
          this.chartInstance.setOption(dataOption)
      },
      screenAdapter () {
          const titleFontSize =this.$refs.rank_ref.offsetWidth /100 *3.6
          const adapterOption ={
              title:{
                  textStyle:{
                      fontSize:titleFontSize
                  }
              },
              series:[{
                  barWidth:titleFontSize,
                  itemStyle:{
                      barBorderRadius:[titleFontSize/2,titleFontSize/2,0,0]
                  }
              }]
              
          }
          this.chartInstance.setOption(adapterOption)
          this.chartInstance.resize()
      },
      startInterval (){
          if(this.timerId){
              clearInterval(this.timerId)
          }
          this.timerId=setInterval(() => {
              this.startValue++
              this.endValue++
              if(this.endValue>this.allData.length-1){
                  this.startValue=0
                  this.endValue=9
              }
              this.updateChart()
          }, 2000);
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

<style lang="less" scoped>

</style>