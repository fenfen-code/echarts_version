 <!--商家销量统计的横向柱状图-->
<template>
  <div class="com-container">
      <div class="com-chart" ref="seller_ref"> 
          
      </div>
  </div>
  <!-- <div>你好</div> -->
</template>

<script >
import {mapState} from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
//let echarts = require('echarts')
export default {
 data () {
    return {
        chartInstance:null,
        allData:null,//服务器返回的数据
        currentPage:1,//当前页
        totalPage:0,//
        timeId:null//定时器的标志
    }
  },
  created () {
      //组件创建完成进行回调函数的注册
      this.$socket.registerCallBack('sellerData',this.getData)
    },
    computed :{
      ...mapState(['theme'])
  },
  mounted(){
      this.initCharts()
      //this.getData()
      this.$socket.send({
            action: 'getData',
            socketType: 'sellerData',
            chartName: 'seller',
            value: ""
        })
      window.addEventListener('resize',this.screenAdapter)
      this.screenAdapter//主动进行第一次适配
  },
  destroyed(){
      clearInterval(this.timeId)
      this.$socket.unregisterCallBack("sellerData")
  },
  methods:{
      //初始化echartsInstance对象
      initCharts () {
         this.chartInstance= this.$echarts.init(this.$refs.seller_ref,this.theme)
         //对图表初始化的配置的控制
         const initOption ={
             title:{
                  text :'|商家销售统计',
                  textStyle:{
                      fontSize:66
                  },
                  left:20,
                  top:20

              },
              grid:{
                  top:'20%',
                  left:'3%',
                  right:'6%',
                  bottom:'3%',
                  containLabel:true//距离是包含坐标轴上的文字
              },
              
              xAxis:{
                  type:'value'
              },
              yAxis:{
                  type:'category',
                  
              },
              tooltip:{
                  trigger:'axis',
                  axisPointer:{
                      type:'line',
                      z:0,
                      lineStyle:{
                          width:66,
                          color:'#2D3443'
                      }
                  }
              },
              series:[
                  {
                      type:'bar',
                      barWidth:66,
                      label:{
                          show:true,
                          position:'right',
                          textStyle:{
                              color:'white'
                          }
                      },
                      itemStyle:{
                          barBorderRadius:[0,33,33,0],
                          //指明颜色渐变的方向以及不同百分比之下的颜色值
                          color:new this.$echarts.graphic.LinearGradient(0,0,1,0,[
                              {
                                  offset:0,
                                  color:'#5052EE'
                              },
                              {
                                  offset:1,
                                  color:'#AB6EE5'
                              }
                          ])
                      }
                  }
              ]
         }
         this.chartInstance.setOption(initOption)
         //对图表对象进行鼠标事件的监听
         this.chartInstance.on('mouseover',()=>{
             clearInterval(this.timeId)
         })
         this.chartInstance.on('mouseout',()=>{
             this.startInterval()
         })
      },
      //获取服务器的数据
      getData (ret) {
          //http://127.0.0.1:8888/api/seller  前面已经被基准URL配置过了
          // { data: ret }的意思是将返回的数据进行解构，也就是返回的数据都放到ret里面
          //const {data:ret}=await this.$http.get('seller')
          //console.log(ret)
          this.allData=ret
          this.allData.sort((a,b) =>{
              return a.value-b.value  //从小到大的排序
          })
          //每五个元素显示一页
          this.totalPage =this.allData.length%5===0 ? this.allData.length/5 : this.allData.length/5+1
          this.updateChart()
          //启动定时器
          this.startInterval()
      },
      //更新图表
      updateChart () {
          const start =(this.currentPage -1)*5
          const end =this.currentPage *5
          const showData =this.allData.slice(start,end)
          const sellerNames=showData.map((item) =>{
              //console.log(item.name)
              return item.name
          })
          const sellerValues=showData.map((item) =>{
              return item.value
          })
          const option={
              title:{
                  text :'|商家销售统计',
                  textStyle:{
                      fontSize:25
                  },
                  left:20,
                  top:10

              },
              grid:{
                  top:'20%',
                  left:'3%',
                  right:'6%',
                  bottom:'3%',
                  containLabel:true//距离是包含坐标轴上的文字
              },
              xAxis:{
                  type:'value'
              },
              yAxis:{
                  type:'category',
                  data:sellerNames
              },
              tooltip:{
                  trigger:'axis',
                  axisPointer:{
                      type:'line',
                      z:0,
                      lineStyle:{
                          width:25,
                          color:'#2D3443'
                      }
                  }
              },
              series:[
                  {
                      type:'bar',
                      data:sellerValues,
                      barWidth:25,
                      label:{
                          show:true,
                          position:'right',
                          textStyle:{
                              color:'white'
                          }
                      },
                      itemStyle:{
                          barBorderRadius:[0,33,33,0],
                          //指明颜色渐变的方向以及不同百分比之下的颜色值
                          color:new this.$echarts.graphic.LinearGradient(0,0,1,0,[
                              {
                                  offset:0,
                                  color:'#5052EE'
                              },
                              {
                                  offset:1,
                                  color:'#AB6EE5'
                              }
                          ])
                      }
                  }
              ]
          }
          this.chartInstance.setOption(option)
      },
      startInterval(){
          if(this.timeId){
              clearInterval(this.timeId)
          }
          this.timeId=setInterval(()=>{
              this.currentPage++
              if(this.currentPage>this.totalPage){
                  this.currentPage=1
              }
              this.updateChart()
          },3000)
      },
      //屏幕适配
      screenAdapter () {
          const titleFontSize=this.$refs.seller_ref.offsetWidth/100*3.6
          const adapterOption ={
              title:{
                  textStyle:titleFontSize
              },
              tooltip:{
                  axisPointer:{
                      lineStyle:{
                          width:titleFontSize
                      }
                  }
              },
              series:{
                  barWidth:titleFontSize,
                  itemStyle:{
                      barBorderRadius:[0,titleFontSize/2,titleFontSize/2,0]
                  }
              }
          }
          this.chartInstance.setOption(adapterOption)
        //   手动调用resize
          this.chartInstance.resize()
      }
  },
  
  watch :{
      theme(){
          this.chartInstance.dispose()
          this.initCharts()
          this.screenAdapter()
          this.updateChart()
      }
  }
}
</script>

<style>

</style>