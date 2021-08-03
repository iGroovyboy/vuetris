"use strict";

const { createApp } = require('vue');
import App from "./App.vue";

const myMixin = {

  methods: {
    log(data) {
      console.log(data)
    }
  }
}

const app = createApp(App)

//app.mixin(myMixin)

app.mount("#app");

