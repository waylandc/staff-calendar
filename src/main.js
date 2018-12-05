// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import firebase from 'firebase';
import Vuetify from 'vuetify';
import FullCalendar from 'vue-full-calendar';
/* eslint-disable  */
import 'fullcalendar/dist/fullcalendar.min.css';
import 'material-design-icons/iconfont/material-icons.css';
import 'vuetify/dist/vuetify.css';
import App from './App';
import router from './router';
import store from './store';
import './config/firebaseInit';
import '../node_modules/nprogress/nprogress.css';

Vue.use(FullCalendar);
Vue.config.productionTip = false;

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

const unsubscribe = firebase.auth()
  .onAuthStateChanged(() => {
    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App),
    });
    unsubscribe();
  });

