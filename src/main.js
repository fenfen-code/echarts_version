import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.less'
//import * as echarts from "echarts"
import axios from 'axios'
//引入字体文件
import './assets/font/iconfont.css'
import SocketService from './utils/socket_service.js'

//对服务端进行websocket的连接 启动就调用连接服务器
SocketService.Instance.connect()
//其他的组件  this.$socket
Vue.prototype.$socket =SocketService.Instance
//请求基准路径的配置
axios.defaults.baseURL='http://127.0.0.1:8888/api/'
//将axios挂载到Vue对象中 this.http
Vue.prototype.$http =axios
//将全局的echarts对象挂在到vue原型对象上
//在别的组件中 this.$echarts
Vue.prototype.$echarts =window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
