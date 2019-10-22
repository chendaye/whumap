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
          path: 'upload',
          component: require('@/pages/Upload').default,
          name: 'upload'
        },
        {
          path: 'setting',
          component: require('@/pages/PicGoSetting').default,
          name: 'setting'
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
