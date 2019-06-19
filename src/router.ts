import Vue from 'vue';
import Router from 'vue-router';
import Component from 'vue-class-component'
import './register-hooks'

import Home from './views/Home.vue';
import Thing from './views/Thing.vue';
import Create from './views/Create.vue';
import Browser from './views/Browser.vue';
import Search from './views/Search.vue';



Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/thing',
      name: 'thing',
      component: Thing,
    },
    {
      path: '/create',
      name: 'create',
      component: Create,
    },
    {
      path: '/browser',
      name: 'browser',
      component: Browser,
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
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});
