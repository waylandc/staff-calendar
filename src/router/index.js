import Vue from 'vue';
import Router from 'vue-router';
import firebase from 'firebase';
import NProgress from 'nprogress';

const routerOptions = [
  { path: '*', component: 'NotFound' },
  { path: '/', component: 'Landing' },
  { path: '/signin', component: 'Signin' },
  { path: '/register', component: 'Registration' },
  { path: '/changePassword', component: 'ChangePassword', meta: { requiresAuth: true } },
  { path: '/home', component: 'Home', meta: { requiresAuth: true } },
  { path: '/users', component: 'Users', meta: { requiresAuth: true } },
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

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = firebase.auth().currentUser;
  if (requiresAuth && !isAuthenticated) {
    next('/signin');
  } else {
    next();
  }
});

router.beforeResolve((to, from, next) => {
  if (to.name) {
    NProgress.start();
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
