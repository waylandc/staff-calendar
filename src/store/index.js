import Vue from 'vue';
import Vuex from 'vuex';
import router from '@/router';
import { User } from '../models/User';
import { createUser, login, autoLogin, logout, changePassword, saveUser } from '../utils/api';

Vue.use(Vuex);

/**
 * Notes about vuex
 * -mutations are simply setter methods.
 *    - i.e. store.commit('mutationName')
 *      i.e. store.commit('mutationName, params)
 * -comitting mutations are the ONLY way to change state within the store
 * -mutations are synchronous. This is important to note as you cannot perform
 * an async operation within it
 * -if we require an async operation, use actions
 *    -one practice is to create an action that does an async axios update,
 * then invokes the mutation afterwards
 * -$dispatch triggers actions
 *    -use dispatch from within routes/components
 * -commit triggers mutation
 *    -NEVER commit from route/component. commit should only be done from within
 * an action. commits are sync whic
 *     might freeze the UI
 * -getters are computed properties for our store. results are cached and only
 * recomputed when it's dependencies change
 * -getters always receive state as their first param
 *    i.e. store.getters.getMethodName
 */
const store = new Vuex.Store({
  state: {
    loggedInUser: null, // instance of User.js
    error: null,
    loading: false,
  },
  mutations: {
    setLoggedInUser(state, payload) {
      state.loggedInUser = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
  },
  actions: {
    // saveUser payload {user: u, userId: id}
    saveUser({ commit }, payload) {
      commit('setLoading', true);
      saveUser(payload)
        .then((user) => {
          commit('setLoggedInUser', user);
          commit('setLoading', false);
        })
        .catch((error) => {
          console.log('store error, ', error);
          commit('setError', error);
          commit('setLoading', false);
        });
    },
    userSignUp({ commit }, p) {
      commit('setLoading', true);
      const u = new User(p.email, false, false, 0, 0, 0, 0);
      createUser(u, p.password)
        .then((user) => {
          commit('setLoggedInUser', { email: user.email });
          commit('setLoading', false);
          router.push('/home');
        })
        .catch((err) => {
          commit('setError', err.message);
          commit('setLoading', false);
        });
    },

    userSignIn({ commit }, payload) {
      commit('setLoading', true);

      login(payload.email, payload.password)
        .then((user) => {
          commit('setLoggedInUser', user);
          commit('setLoading', false);
          router.push('/home');
        })
        .catch((error) => {
          console.log('error signin, ', error);
          commit('setError', error);
        });
    },

    changePassword({ commit }, payload) {
      commit('setLoading', true);
      changePassword(payload.newPassword)
        .then(() => {
          commit('setLoading', false);
          router.push('/home');
        })
        .catch((error) => {
          commit('setLoading', false);
          commit('setError', error.message);
        });
    },

    autoSignIn({ commit }, payload) {
      commit('setLoading', true);
      // important to wrap this in a Promise or else the UI tries to render
      // before we load the user into store
      return new Promise((resolve, reject) => {
        autoLogin(payload.email)
        .then((user) => {
          commit('setLoggedInUser', user);
          commit('setLoading', false);
          resolve(user);
        })
        .catch((error) => {
          console.log('error autosignin, ', error);
          commit('setError', error);
          reject(error);
          commit('setLoading', false);
        });
      });
    },

    userSignOut({ commit }) {
      logout();
      commit('setLoggedInUser', null);
      router.push('/');
    },
  },
  getters: {
    isAuthenticated(state) {
      return state.loggedInUser !== null && state.loggedInUser !== undefined;
    },
    isApprover(state) {
      return state.loggedInUser !== null && state.loggedInUser !== undefined
        && state.loggedInUser.isApprover;
    },
    isAdmin(state) {
      return state.loggedInUser !== null && state.loggedInUser !== undefined
        && state.loggedInUser.isAdmin;
    },
  },
});

export default store;
