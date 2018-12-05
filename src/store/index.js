import Vue from 'vue';
import Vuex from 'vuex';
import router from '@/router';
import { User } from '../models/User';
import { createUser, login, autoLogin, logout, changePassword, saveUser, createEvent, getUsers, getEvents } from '../utils/api';
import { SET_LOGGED_IN_USER, SET_ERROR, SET_LOADING } from './mutation-types';
import { AUTO_LOGIN, USER_LOGIN, USER_SIGNUP, CHANGE_PASSWORD, SAVE_USER, USER_LOGOUT, ADD_EVENT, GET_USERS, GET_EVENTS } from './action-types';

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
    [SET_LOGGED_IN_USER](state, payload) {
      state.loggedInUser = payload;
    },
    [SET_ERROR](state, payload) {
      state.error = payload;
    },
    [SET_LOADING](state, payload) {
      state.loading = payload;
    },
  },
  actions: {
    // saveUser payload {user: u, userId: id}
    [SAVE_USER]({ commit }, payload) {
      commit('SET_LOADING', true);
      saveUser(payload)
        .then(() => {
          commit('SET_LOADING', false);
        })
        .catch((error) => {
          console.log('store error, ', error);
          commit('SET_ERROR', error);
          commit('SET_LOADING', false);
        });
    },
    [USER_SIGNUP]({ commit }, p) {
      commit('SET_LOADING', true);
      const u = new User(p.email, false, false, 0, 0, 0, 0);
      createUser(u, p.password)
        .then((user) => {
          commit('SET_LOGGED_IN_USER', { email: user.email });
          commit('SET_LOADING', false);
          router.push('/home');
        })
        .catch((err) => {
          commit('SET_ERROR', err.message);
          commit('SET_LOADING', false);
        });
    },

    [GET_USERS]({ commit }) {
      commit('SET_LOADING', true);
      return new Promise((resolve, reject) => {
        getUsers()
          .then((users) => {
            resolve(users);
          })
          .catch(error => reject(error));
      });
    },

    [USER_LOGIN]({ commit }, payload) {
      commit('SET_LOADING', true);

      login(payload.email, payload.password)
        .then((user) => {
          commit('SET_LOGGED_IN_USER', user);
          commit('SET_LOADING', false);
          router.push('/home');
        })
        .catch((error) => {
          console.log('error signin, ', error);
          commit('SET_ERROR', error.message);
          commit('SET_LOADING', false);
        });
    },

    [CHANGE_PASSWORD]({ commit }, payload) {
      commit('SET_LOADING', true);
      changePassword(payload.newPassword)
        .then(() => {
          commit('SET_LOADING', false);
          router.push('/home');
        })
        .catch((error) => {
          commit('SET_LOADING', false);
          commit('SET_ERROR', error.message);
        });
    },

    [AUTO_LOGIN]({ commit }, payload) {
      commit('SET_LOADING', true);
      // important to wrap this in a Promise or else the UI tries to render
      // before we load the user into store
      return new Promise((resolve, reject) => {
        autoLogin(payload.email)
        .then((user) => {
          commit('SET_LOGGED_IN_USER', user);
          commit('SET_LOADING', false);
          resolve(user);
        })
        .catch((error) => {
          commit('SET_ERROR', error);
          reject(error);
          commit('SET_LOADING', false);
        });
      });
    },

    [USER_LOGOUT]({ commit }) {
      logout();
      commit('SET_LOGGED_IN_USER', null);
      router.push('/');
    },

    [ADD_EVENT]({ commit }, payload) {
      commit('SET_LOADING', true);
      createEvent(payload)
        .then(() => {
          commit('SET_LOADING', false);
          router.push('/leaveRequests');
        })
        .catch((error) => {
          commit('SET_ERROR', error);
          commit('SET_LOADING', false);
        });
    },

    [GET_EVENTS]({ commit }, status) {
      commit('SET_LOADING', true);
      return new Promise((resolve, reject) => {
        getEvents(status)
        .then((events) => {
          commit('SET_LOADING', false);
          resolve(events);
        })
        .catch((error) => {
          commit('SET_LOADING', false);
          reject(error);
        });
      });
    },
  },
  getters: {
    isAuthenticated(state) {
      return state.loggedInUser != null;
    },
    isApprover(state) {
      return state.loggedInUser != null && state.loggedInUser.isApprover;
    },
    isAdmin(state) {
      return state.loggedInUser != null && state.loggedInUser.isAdmin;
    },
  },
});

export default store;
