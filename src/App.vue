<template>
  <div id="app">
  <TTetris />
  
  </div>
</template>

<script>
import TTetris from './components/TTetris.vue'

export default {
  name: 'App',
  components: {
    TTetris,
  },
  methods : {
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
</style>
