import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
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
