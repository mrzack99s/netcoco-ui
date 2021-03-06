import Vue from 'vue'
import App from './app.vue'
import router from './router'
import SuiVue from 'semantic-ui-vue';
import 'semantic-ui-css/semantic.min.css';
import VueMeta from 'vue-meta';
import Toasted from 'vue-toasted';
import apiFunction from './global/api-function';
import capitalize from './global/capitalize'
import consts from './global/consts'

Vue.config.productionTip = false
Vue.use(SuiVue)
Vue.use(VueMeta);
Vue.use(Toasted,{
  position: "top-right",
  duration: 3000,
  type: "info"
})
Vue.use(apiFunction,{
  baseURL: `${process.env.VUE_APP_ROOT_API}`
})
Vue.use(capitalize)
Vue.use(consts)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
