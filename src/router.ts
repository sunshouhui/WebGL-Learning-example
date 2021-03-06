import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import webGL_point from './views/webGL_point.vue'
import webGL_multPoint from './views/webGL_multPoint.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/webGL_point',
      name: 'webGL_point',
      component: webGL_point
    },
    {
      path: '/webGL_multPoint',
      name: 'webGL_multPoint',
      component: webGL_multPoint
    }
  ]
})
