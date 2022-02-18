<!--
针对于 /sellerpage这条路径而显示出来
在这个组件中，通过子组件注册的方式，要显示出seller.vue这个组件
 -->
<template>
  <div class="com-page">
      <seller></seller>
  </div>
  <!-- <div>
    sellerpage
  </div> -->
</template>

<script>
//import Seller from '@/components/Seller'
import Seller from '../components/Seller.vue'
export default {
  data () {
    return {}
  },
  methods:{},
  components:{
    seller:Seller
  
  }
}
</script>

<style>

</style>