import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@mdi/font/css/materialdesignicons.css'
import './registerServiceWorker';
import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css';
import './register-hooks';

Vue.use(Vuetify, {
  iconfont: 'mdi'
})

import Parse from 'parse';

Parse.serverURL = "https://storage.tiigbg.se:4444/parse";
Parse.initialize('dingelingen');

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
