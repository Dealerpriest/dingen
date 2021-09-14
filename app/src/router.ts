import Vue from 'vue';
import Router from 'vue-router';
import './register-hooks'

import Browser from './views/Browser.vue';
import Search from './views/Search.vue';
import Tags from './views/Tags.vue';



Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: "/browser"
    },
    {
      path: '/browser',
      name: 'browser',
      component: Browser,
    },
    {
      path: '/tags',
      name: 'tags',
      component: Tags,
    },
    {
      path: '/browser/:id',
      name: 'browser-id',
      component: Browser,
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
    }
  ],
});
