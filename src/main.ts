import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@mdi/font/css/materialdesignicons.css'
import './registerServiceWorker';
import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify, {
  iconfont: 'mdi'
})

import Parse from 'parse';

Parse.serverURL = 'http://192.168.1.14:1337/parse'; // This is your Server URL
Parse.initialize(
  'dingelingen', // This is your Application ID
);


Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
