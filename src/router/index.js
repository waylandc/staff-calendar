import Vue from 'vue';
import Router from 'vue-router';
import firebase from 'firebase';
import NProgress from 'nprogress';
import store from '../store';

const routerOptions = [
  { path: '*', component: 'NotFound' },
  { path: '/404', component: 'NotFound' },
  { path: '/', component: 'Landing' },
  { path: '/signin', component: 'Signin' },
  { path: '/register', component: 'Registration' },
  { path: '/changePassword', component: 'ChangePassword', meta: { requiresAuth: true } },
  { path: '/home', component: 'Home', meta: { requiresAuth: true } },
  { path: '/users', component: 'Users', meta: { requiresAdmin: true } },
  {
    path: '/users/:id',
    component: 'UserDetails',
    meta: { requiresAuth: true },
  },
  { path: '/leaveRequests', component: 'PendingLeaveRequests', meta: { requiresAuth: true } },
  { path: '/createRequest', component: 'CreateEvent', meta: { requiresAuth: true } },
  {
    path: '/leaveRequests/:id',
    component: 'RequestDetail',
    meta: { requiresAuth: true },
  },
  {
    path: '/leaveRequests/edit/:id',
    component: 'EditRequest',
    meta: { requiresAuth: true },
  },

];

// This performs a lazy load of our routes, to avoid loading
// until they are actually used
const routes = routerOptions.map(route => ({
  ...route,
  component: () => import(`@/components/${route.component}.vue`),
}));

Vue.use(Router);

const router = new Router({
  mode: 'history', // this gets rid of # in url
  routes,
});


/**
 * guard routes that require user to be authenticated
 */
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // protect our admin pages
  if (requiresAdmin) {
    // ensure user is authenticated first
    firebase.auth().onAuthStateChanged((firebaseUser) => {
      // apologies, this is messy due to having 2 user objects
      if (firebaseUser != null && store.state.loggedInUser == null) {
        store.dispatch('autoSignIn', firebaseUser).then(() => {
          if (store.state.loggedInUser.isAdmin) {
            next();
          } else {
            next('/404');
          }
        }, () => {
          next('/signin');
        });
      } else if (firebaseUser == null) {
        next('/signin');
      } else if (store.state.loggedInUser.isAdmin) {
        // s/b fb not null, loggedInUserr not null
        next();
      } else {
        next('/404');
      }
    });
  }

  if (requiresAuth && store.state.loggedInUser == null) {
    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser != null) {
        store.dispatch('autoSignIn', firebaseUser).then(() => {
          next();
        }, () => {
          next('/signin');
        });
      } else {
        next('/signin');
      }
    });
  } else {
    next();
  }
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


export default router;
