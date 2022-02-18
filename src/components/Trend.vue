<template>
  <div class="com-container">
  <div class="title" :style="comStyle">
      <span>{{showTitle}}</span>
      <!-- :style 的动态绑定 -->
      <span class="iconfont title-icon" :style="comStyle" @click="showChoice=!showChoice">&#xe6eb;</span>
      <div class="select_con" v-show="showChoice">
          <!-- v-show管的是它本身及里面的 -->
        <div class="select_item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
            {{item.text}}
        </div>
        <!-- <div class="select_item">
            我是选择标题2
        </div>
        <div class="select_item">
            我是选择标题3
        </div> -->
      </div>
  </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data() {
      return {
          chartInstance:null,
          allData:null,//从服务器中获取的所有数据
          showChoice:false,//是否选择可选项
          choiceType:"map",//显示的数据类型
          titleFontSize:0,//指明标题的文字字体大小

      }
  },
  created () {
      //组件创建完成进行回调函数的注册
      this.$socket.registerCallBack('trendData',this.getData)
  },
  mounted () {
    this.initChart()
    //this.getData()
    //发送数据给服务器，问服务器索要数据
    // this.$socket.ws.onopen = () => {
    this.$socket.send({
        action: 'getData',
        socketType: 'trendData',
        chartName: 'trend',
        value: ""
    })
	// }
    //this.updateChart()
    window.addEventListener('resize',this.screenAdapter)
    this.screenAdapter()//第一次调用，主动触发
  },
  destroyed () {
     window. removeEventListener('resize',this.screenAdapter)
     //组件销毁时对回调函数的取消
     this.$socket.unregisterCallBack("trendData")
  },
  computed:{
    selectTypes(){
        if(!this.allData){
            return []
        }else{
            return this.allData.type.filter(item =>{
                return item.key !== this.choiceType
            })
        }
    },
    showTitle(){
        let _this = this
        if(!this.allData){
            return ''
        }else{
            // console.log(this.allData);
            // console.log(this.choiceType);
            console.log(this.allData.map);
            return this.allData[_this.choiceType].title
        }
    },
    // 设置给标题的样式
    comStyle() {
        return {
            fontSize:this.titleFontSize +'px',
            color: getThemeValue(this.theme).titleColor
        }
    },
    ...mapState(['theme'])
  },
  methods:{
      initChart(){
        this.chartInstance= this.$echarts.init(this.$refs.trend_ref,this.theme)
        const initOption = {
            grid:{
                left:'3%',
                top:'35%',
                right:'4%',
                bottom:'1%',
                containLable:true
            },
            tooltip:{
                trigger:'axis'
            },
            legend:{
                left:20,
                top:'15%'
            },
            xAxis:{
                type:'category',
                boundaryGap:false
            },
            yAxis:{
                type:'value'
            }
        }
        this.chartInstance.setOption(initOption)
      },
      //ret就是通过websocket回调返回得到的图表数据
      getData (ret){
        //   await this.$http.get()
        //   对allData进行赋值
        //const ret=await this.$http.get('trend')
        //const {data:ret} = await this.$http.get('trend')
        // console.log(ret)
        this.allData = ret
        console.log(this.allData)
        this.updateChart()
      },
      updateChart () {
          // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
          //处理数据的方法
          const timeArr =this.allData.common.month//横轴
          const valueArr =this.allData[this.choiceType].data //纵轴 series
          //item 代表valueArr里的每一项 map方法代表遍历
          const seriesArr = valueArr.map((item,index) => {
              return {
                  name:item.name,
                  type:'line',
                  data:item.data,
                  stack:this.choiceType,
                  areaStyle:{
                      color:new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                          {
                              offset:0,
                              color:colorArr1[index]
                          },
                          {
                              offset:1,
                              color:colorArr2[index]
                          }
                      ])
                  }
              }
          })
          //图例的数据
          const legendArr = valueArr.map(item => {
              return item.name
          })
          const dataOption = {
              xAxis:{
                  data:timeArr
              },
              legend:{
                  data:legendArr
              },
              series:seriesArr
          }
          this.chartInstance.setOption(dataOption)
      },
      screenAdapter() {
          this.titleFontSize =this.$refs.trend_ref.offsetWidth /100 *3.6
          const adapterOption = {
              legend:{
                itemWidth : this.titleFontSize,
                itemHeight :this.titleFontSize,
                itemGap:this.titleFontSize,
                textStyle:{
                    fontSize:this.titleFontSize/2
                }
              }
              
          }
          this.chartInstance.setOption(adapterOption)
          this.chartInstance.resize()
      },
      handleSelect (currentType){
          this.choiceType=currentType
          this.updateChart()
          this.showChoice=false
      }
  },
//   cpmputed :{
//       ...mapState(['theme'])
//   },
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
.title {
    position: absolute;
    left:20px;
    top:20px;
    z-index: 10;
    color: white;
    .title-icon{
        margin-left: 10px;
        cursor: pointer;
    }
    .select_con{
        background-color: #222733;
    }
}
</style>