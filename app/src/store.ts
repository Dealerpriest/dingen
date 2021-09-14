import Vue from 'vue';
import Vuex from 'vuex';
import DBModule from './vuex-modules/database'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    db: DBModule
  }
});
