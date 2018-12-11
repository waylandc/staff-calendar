import Vue from 'vue';
import Vuex from 'vuex';
import router from '@/router';
import { User } from '../models/User';
import * as api from '../utils/api';
import * as mutant from './mutation-types';
import * as action from './action-types';

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
    [mutant.SET_LOGGED_IN_USER](state, payload) {
      state.loggedInUser = payload;
    },
    [mutant.SET_ERROR](state, payload) {
      state.error = payload;
    },
    [mutant.SET_LOADING](state, payload) {
      state.loading = payload;
    },
  },
  actions: {
    // saveUser payload {user: u, userId: id}
    [action.SAVE_USER]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      api.saveUser(payload)
        .then(() => {
          commit(mutant.SET_LOADING, false);
        })
        .catch((error) => {
          console.log('store error, ', error);
          commit(mutant.SET_ERROR, error);
          commit(mutant.SET_LOADING, false);
        });
    },
    // USER_SIGNUP payload {email: e, password: p, firstName: fn, lastName: ln}
    [action.USER_SIGNUP]({ commit }, p) {
      commit(mutant.SET_LOADING, true);
      const u = new User(p.email, false, false, 0, 0, 0, 0, null, p.firstName, p.lastName);
      api.createUser(u, p.password)
        .then(() => {
          // commit(mutant.SET_LOGGED_IN_USER, { email: user.email });
        // })
        // .then(() => {
          commit(mutant.SET_LOADING, true);
          api.autoLogin(u.email);
        })
        .then((user) => {
          commit(mutant.SET_LOGGED_IN_USER, user);

          commit(mutant.SET_LOADING, false);
          router.push('/home');
        })
        .catch((err) => {
          commit(mutant.SET_ERROR, err.message);
          commit(mutant.SET_LOADING, false);
        });
    },

    [action.GET_USERS]({ commit }) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        api.getUsers()
          .then((users) => {
            resolve(users);
          })
          .catch(error => reject(error));
      });
    },

    [action.USER_LOGIN]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);

      api.login(payload.email, payload.password)
        .then((user) => {
          commit(mutant.SET_LOGGED_IN_USER, user);
          commit(mutant.SET_LOADING, false);
          router.push('/home');
        })
        .catch((error) => {
          console.log('error signin, ', error);
          commit(mutant.SET_ERROR, error.message);
          commit(mutant.SET_LOADING, false);
        });
    },

    [action.AUTO_LOGIN]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      // important to wrap this in a Promise or else the UI tries to render
      // before we load the user into store
      return new Promise((resolve, reject) => {
        api.autoLogin(payload.email)
        .then((user) => {
          commit(mutant.SET_LOGGED_IN_USER, user);
          commit(mutant.SET_LOADING, false);
          resolve(user);
        })
        .catch((error) => {
          commit(mutant.SET_ERROR, error);
          reject(error);
          commit(mutant.SET_LOADING, false);
        });
      });
    },

    [action.USER_LOGOUT]({ commit }) {
      api.logout();
      commit(mutant.SET_LOGGED_IN_USER, null);
      router.push('/');
    },

    [action.CHANGE_PASSWORD]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      api.changePassword(payload.newPassword)
        .then(() => {
          commit(mutant.SET_ERROR, 'testing errors');
          commit(mutant.SET_LOADING, false);
          router.push('/home');
        })
        .catch((error) => {
          commit(mutant.SET_LOADING, false);
          commit(mutant.SET_ERROR, error.message);
        });
    },

    [action.ADD_EVENT]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      // payload should be CalendarEvent.toJSON()
      api.createEvent(payload)
        .then((doc) => {
          console.log('ADD_EVENT, ', doc);
          commit(mutant.SET_LOADING, false);
          router.push('/leaveRequests');
        })
        .catch((error) => {
          console.log('ADD_EVENT, ', error);
          commit(mutant.SET_ERROR, error);
          commit(mutant.SET_LOADING, false);
        });
    },

    [action.GET_EVENTS]({ commit }, status) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        api.getEvents(status)
        .then((events) => {
          commit(mutant.SET_LOADING, false);
          resolve(events);
        })
        .catch((error) => {
          commit(mutant.SET_LOADING, false);
          reject(error);
        });
      });
    },

    [action.GET_SOME_EVENTS]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        api.getSomeEvents(payload)
          .then((events) => {
            commit(mutant.SET_LOADING, false);
            // returns an array of CalendarEvents
            resolve(events);
          })
          .catch((error) => {
            commit(mutant.SET_LOADING, false);
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
