import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@mdi/font/css/materialdesignicons.css";
import "./registerServiceWorker";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "./register-hooks";

Vue.use(Vuetify, {
  iconfont: "mdi"
});

import Parse from "parse";

// Parse.serverURL = "https://storage.tiigbg.se:4444/parse";
// Parse.initialize("dingelingen");
Parse.serverURL = `${process.env.VUE_APP_BACKEND_SERVER}:${process.env.VUE_APP_PARSE_PORT}${process.env.VUE_APP_PARSE_URL_PATH}`
if(!process.env.VUE_APP_PARSE_APP_ID){
  console.error('No parse app id provided');
} else {
  Parse.initialize(process.env.VUE_APP_PARSE_APP_ID);
}

console.log(process.env);

Vue.config.productionTip = true;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
