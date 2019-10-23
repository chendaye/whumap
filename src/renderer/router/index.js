import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'tray-page',
      component: require('@/pages/TrayPage').default
    },
    {
      path: '/rename-page',
      name: 'rename-page',
      component: require('@/pages/RenamePage').default
    },
    {
      path: '/mini-page',
      name: 'mini-page',
      component: require('@/pages/MiniPage').default
    },
    {
      path: '/setting',
      name: 'setting-page',
      component: require('@/layouts/SettingPage').default,
      children: [
        {
          path: 'area',
          component: require('@/pages/Area').default,
          name: 'area'
        },
        {
          path: 'map',
          component: require('@/pages/Map').default,
          name: 'map'
        },
        {
          path: 'upload',
          component: require('@/pages/Upload').default,
          name: 'upload'
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
