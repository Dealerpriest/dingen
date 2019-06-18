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

Parse.serverURL = 'https://parseapi.back4app.com'; // This is your Server URL
Parse.initialize(
  '2J5Dr4xjbf6qtsKlXNrhUAHJuhUKm4bWDazqWSRg', // This is your Application ID
  '4j0MIcOyl5GMPYqvTVtZ4GuN5COcyozAArSA9N9l', // This is your Javascript key
);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
