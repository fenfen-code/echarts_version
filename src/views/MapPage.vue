<template>
  <div class="com-page">
      <single-map></single-map>
  </div>
</template>

<script>
//import Map from '@/components/Map'
import Map from '../components/Map.vue'

export default {
    data (){
        return {}
    },
    methods:{},
    components:{
        'single-map': Map
        
    }
    
}
</script>

<style lang='less' scoped>

</style>