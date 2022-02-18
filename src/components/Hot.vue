<template>
  <div class="com-container">
      <!-- 热卖组件 -->
      <div class="com-chart" ref="hot_ref"> 
          
      </div>
      <span class="iconfont arr-left " @click="toLeft" :style="comStyle">&#xe6ef;</span>
      <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
      <span class="cat-name" :style="comStyle">{{catName}}</span>
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
            currentIndex:0,//当前所展示出的一级分类数据
            titleFontSize:0
        }
    },
    computed:{
        catName(){
            if(!this.allData){
                return ''
            }else{
                return this.allData[this.currentIndex].name
            }
        },
        comStyle(){
            return {
                fontSize:this.titleFontSize+'px',
                color:getThemeValue(this.theme).titleColor
            }
        },
        ...mapState(['theme'])
    },
    created () {
      //组件创建完成进行回调函数的注册
      this.$socket.registerCallBack('hotData',this.getData)
    },
    mounted(){
      this.initChart()
    //   this.getData()
      this.$socket.send({
            action: 'getData',
            socketType: 'hotData',
            chartName: 'hotproduct',
            value: ""
        })
      window.addEventListener('resize',this.screenAdapter)
      this.screenAdapter()//主动进行第一次适配
    },
    destroyed () {
     window. removeEventListener('resize',this.screenAdapter)
    //  clearInterval(this.timerId)
    this.$socket.unregisterCallBack("hotData")
    },
    methods:{
      async initChart(){
        this.chartInstance= this.$echarts.init(this.$refs.hot_ref,this.theme)
        //地图数据并不在koa2中，不能使用this.$http
        // const ret = await axios.get('http://localhost:8080/static/map/china.json')
        // //console.log(ret)
        // this.$echarts.registerMap('china',ret.data)
        const initOption = {
            title:{
                text:'|热销商品的占比'
            },
            legend:{
                top:'15%',
                icon:'circle',

            },
            tooltip:{
                show:true,
                formatter:arg=>{
                    const thirdCategory =arg.data.children
                    //计算所占的百分比
                    let total =0
                    thirdCategory.forEach(item =>{
                        total+=item.value
                    })
                    let retStr =''
                    thirdCategory.forEach(item =>{
                        retStr+=`
                        ${item.name}:${parseInt(item.value/total*100)+'%'}
                        <br/>
                        `
                    })
                    return retStr
                }
            },
            series:[
                {
                    type:'pie',
                    label:{
                        show:false
                    },
                    emphasis:{
                        //高亮状态下的显示效果 也就是鼠标移动到那个饼图的区域上
                        label:{
                            show:true
                        },
                        labelLine:{
                            show:false
                        }
                    }
                }
            ]
        }
        this.chartInstance.setOption(initOption)
        },
    
        getData(ret ) {
            //获得销售数据
            //const {data:ret}=await this.$http.get('hotproduct')
            console.log(ret)
            this.allData=ret
        //   this.allData.sort((a,b)=>{
        //       return a.value-b.value  //从小到大的排序
        //   })
            this.updateChart()
        //       this.startInterval()
        },
        updateChart(){
            const legendData =this.allData[this.currentIndex].children.map(item =>{
                return {
                    name:item.name
                    
                }
            })
            //处理图表所需的数据
            //一级分类下的数据
            const seriesData =this.allData[this.currentIndex].children.map(item =>{
                return {
                    name:item.name,
                    value:item.value,
                    children:item.children
                }
            })
            const dataOption = {
                legend:{
                    data:legendData
                },
                series:[
                    {
                        data:seriesData
                    }
                ]
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter () {
            this.titleFontSize =this.$refs.hot_ref.offsetWidth /100 *3.6
            const titleFontSize=this.titleFontSize
            const adapterOption = {
                title:{
                  textStyle:{
                      fontSize:titleFontSize
                  }
              },
              legend:{
                  itemWidth:titleFontSize,
                  itemHeight:titleFontSize,
                  itemGap:titleFontSize/2,
                  textStyle:{
                      fontSize:titleFontSize/2,
                  }
              },
              series:[
                  {
                      radius:titleFontSize*4.5,
                      center:['50%','60%']
                  }
              ]
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        toLeft(){
            this.currentIndex--
            if (this.currentIndex<0){
                this.currentIndex=this.allData.length-1
            }
            if(this.currentIndex>this.allData.length-1){
                this.currentIndex=0
            }
            this.updateChart()
        },
        toRight(){
            this.currentIndex++
            if (this.currentIndex<0){
                this.currentIndex=this.allData.length-1
            }
            if(this.currentIndex>this.allData.length-1){
                this.currentIndex=0
            }
            this.updateChart()
        }
    },
    // cpmputed :{
    //   ...mapState(['theme'])
    // },
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
.arr-left{
    position: absolute;
    left: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
}
.arr-right{
    position: absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
}
.cat-name{
    position: absolute;
    left:80%;
    bottom: 20px;
    color: white;
}
</style>