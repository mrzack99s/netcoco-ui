import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/topology-fullscreen',
    name: 'TopologyFullscreen',
    component: () => import('@/views/topology-fullscreen.vue')
  },
  {
    path: '/',
    name: 'DefaultLayout',
    component: () => import('@/layouts/default.vue'),
    redirect: "/dashboard",
    children:[
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import('@/views/dashboard.vue'),
      },
      {
        path: "/devices",
        name: "Devices",
        component: () => import('@/views/devices.vue'),
      },
      {
        path: "/topology",
        name: "Topology",
        component: () => import('@/views/topology.vue'),
      },
      {
        path: "/device-setting/:id",
        name: "Devic Setting",
        component: () => import('@/views/device-setting.vue'),
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: `/${process.env.VUE_APP_VERSION}/ui`,
  routes
})

export default router
