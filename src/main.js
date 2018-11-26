// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import firebase from 'firebase';
import NProgress from 'nprogress';
// import Vuelidate from 'vuelidate';
import Vuetify from 'vuetify';
import FullCalendar from 'vue-full-calendar';
/* eslint-disable  */
import 'fullcalendar/dist/fullcalendar.min.css';
import 'material-design-icons/iconfont/material-icons.css';
import 'vuetify/dist/vuetify.css';
// import colors from 'vuetify/es5/util/colors';
import App from './App';
import router from './router';
import store from './store';
import './config/firebaseInit';
import '../node_modules/nprogress/nprogress.css';

Vue.use(FullCalendar);
Vue.config.productionTip = false;

// Vue.use(Vuelidate);
Vue.use(Vuetify, {
  theme: {
    // use https://vuetifyjs.com/en/theme-generator to generate scheme
    primary: '#FFD54F', // colors.green.lighten2, // #E53935
    secondary: '#FFAB00', // colors.green.darken1, // #FFCDD2
    accent: '#FF9800', // colors.indigo.base, // #3F51B5
    error: '#E65100',
    warning: '#FFEB3B',
    reject: '#FF7043',
    approve: '#9CCC65',
    info: '#2196F3',
    success: '#4CAF50',
  },
});

/* eslint-disable no-new */
const unsubscribe = firebase.auth()
  .onAuthStateChanged((firebaseUser) => {
    new Vue({
      el: '#app',
      router,
      store,
      created() {
        if (firebaseUser) {
          store.dispatch('autoSignIn', firebaseUser);
        }
      },
      render: h => h(App),
    });
    unsubscribe();
  });

/**
 * beforeResolve and afterResolve used here to display nprogress bar
 * while loading routes
 */
router.beforeResolve((to, from, next) => {
  if (to.name) {
    NProgress.start();
  }
  next();
});

/* eslint-disable no-unused-vars */
router.afterEach((to, from) => {
  NProgress.done();
});
