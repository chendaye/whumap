import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
// import BaiduMap from 'vue-baidu-map'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import router from './router'
import store from './store'
import db from '../datastore/index'
import { webFrame } from 'electron'
import './assets/fonts/iconfont.css'
import VueLazyLoad from 'vue-lazyload'

// Vue.use(BaiduMap, {
//   // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
//   ak: 'BA1QYKMlHWj5a647CwZ2qdb60MgQOmot'
// })

Vue.use(ElementUI)
Vue.use(VueLazyLoad)

webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(0, 0)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.prototype.$db = db

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
