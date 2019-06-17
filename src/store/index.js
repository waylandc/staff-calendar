import Vue from 'vue';
import Vuex from 'vuex';
import router from '@/router';
// import moment from 'moment-business-days';
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
 *    an action. commits are sync which might freeze the UI
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
    selectedUser: null, // email of user that's been selected from Users table
    holidays: null, // cache holidays
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
    [mutant.SET_SELECTED_USER](state, payload) {
      state.selectedUser = payload;
    },
  },
  actions: {
    // saveUser payload {user: User.js, userId: id, comment: string, changedBy: email}
    [action.SAVE_USER]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        api.saveUser(payload)
          .then(() => {
            commit(mutant.SET_LOADING, false);
            resolve();
          })
          .catch((error) => {
            console.log('store error, ', error);
            commit(mutant.SET_ERROR, error);
            commit(mutant.SET_LOADING, false);
            reject(error);
          });
      });
    },

    // USER_SIGNUP payload {email: e, password: p, firstName: fn, lastName: ln}
    [action.USER_SIGNUP]({ commit }, p) {
      commit(mutant.SET_LOADING, true);
      // docId param is null because it's the document ref ID in
      // Firestore which hasn't been created yet.
      // TODO - check if api.createUser returns a user object that contains the id
      // I think it's populated in the subsequent call to getUser
      const u = new User(p.email, false, false, 0, 0, 0, 0, 0, 0,
        null, p.firstName, p.lastName, p.dob, []);
      api.createUser(u, p.password)
        .then(() => {
          commit(mutant.SET_LOADING, true);
          return api.getUser(u.email);
        })
        .then((user) => {
          commit(mutant.SET_LOGGED_IN_USER, user);
          commit(mutant.SET_LOADING, false);
          console.log('created user, forwarding to home, ', user);
          router.push({ path: '/home' });
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
          router.push({ path: '/home' });
        })
        .catch((error) => {
          console.log('error signin, ', error);
          commit(mutant.SET_ERROR, error.message);
          commit(mutant.SET_LOADING, false);
        });
    },

    [action.SHOW_USER_DETAILS]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      commit(mutant.SET_SELECTED_USER, payload.email);
      router.push({ path: `/users/${payload.id}` });
    },

    // GET_USER payload { email: string }
    [action.GET_USER]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      // important to wrap this in a Promise or else the UI tries to render
      // before we load the user into store
      return new Promise((resolve, reject) => {
        api.getUser(payload.email)
        .then((user) => {
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
      return new Promise((resolve, reject) => {
        api.changePassword(payload.newPassword)
        .then(() => {
          commit(mutant.SET_LOADING, false);
          resolve();
        })
        .catch((error) => {
          commit(mutant.SET_LOADING, false);
          commit(mutant.SET_ERROR, error.message);
          reject(error);
        });
      });
    },

    [action.ADD_EVENT]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      // payload should be CalendarEvent.toJSON()
      console.log('ADD_EVENT, ', payload);
      api.createEvent(payload)
        .then((doc) => {
          console.log('ADD_EVENT, ', doc);
          commit(mutant.SET_LOADING, false);
        })
        .catch((error) => {
          console.log('ADD_EVENT, ', error);
          commit(mutant.SET_ERROR, error);
          commit(mutant.SET_LOADING, false);
        });
    },

    [action.EDIT_EVENT]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      // payload should be CalendarEvent.toJSON()
      console.log('EDIT_EVENT, 1', payload);
      api.editEvent(payload)
        .then((doc) => {
          console.log('EDIT_EVENT, ', doc);
          commit(mutant.SET_LOADING, false);
        })
        .catch((error) => {
          console.log('EDIT_EVENT, ', error);
          commit(mutant.SET_ERROR, error);
          commit(mutant.SET_LOADING, false);
        });
    },

    [action.GET_EVENTS]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        api.getEvents(payload)
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

    // GET_HOLIDAYS payload {startDate: moment, endDate: moment }
    [action.GET_HOLIDAYS]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);

      return new Promise((resolve, reject) => {
        api.getHolidays(payload.startDate, payload.endDate)
        .then((holidays) => {
          resolve(holidays);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
      });
    },

    [action.ADD_HOLIDAY]({ commit }, payload) {
      // payload should be { title: string, startDate: moment, endDate: moment, country: string }
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        console.log('ADD_HOLIDAY, ', payload);
        api.createHoliday(payload)
          .then((doc) => {
            console.log('ADD_HOLIDAY, ', doc);
            commit(mutant.SET_LOADING, false);
            resolve(doc);
          })
          .catch((error) => {
            console.log('ADD_HOLIDAY, ', error);
            commit(mutant.SET_ERROR, error);
            commit(mutant.SET_LOADING, false);
            reject(error);
          });
      });
    },

    [action.DELETE_HOLIDAY]({ commit }, payload) {
      // payload should be { docID }
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        console.log('DELETE_HOLIDAY, ', payload);
        api.deleteHoliday(payload)
          .then((doc) => {
            console.log('DELETE_HOLIDAY, ', doc);
            commit(mutant.SET_LOADING, false);
            resolve(doc);
          })
          .catch((error) => {
            console.log('DELETE_HOLIDAY, ', error);
            commit(mutant.SET_ERROR, error);
            commit(mutant.SET_LOADING, false);
            reject(error);
          });
      });
    },

    [action.RESET_PASSWORD]({ commit }, payload) {
      // payload is {email: string}
      commit(mutant.SET_LOADING, true);
      console.log(action.RESET_PASSWORD);
      api.resetPassword(payload.email)
        .then(() => {
          commit(mutant.SET_LOADING, false);
        })
        .catch((error) => {
          commit(mutant.SET_ERROR, error);
          commit(mutant.SET_LOADING, false);
        });
    },

    [action.GET_APPROVERS]({ commit }) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        api.getApprovers()
        .then((approvers) => {
          commit(mutant.SET_LOADING, false);
          resolve(approvers);
        })
        .catch((error) => {
          commit(mutant.SET_LOADING, false);
          reject(error);
        });
      });
    },

    [action.DELETE_REQUEST]({ commit }, payload) {
      // payload should be { docID }
      console.log('now in index.js');
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        console.log('DELETE_REQUEST, ', payload);
        api.deleteRequest(payload)
          .then((doc) => {
            console.log('DELETE_REQUEST, ', doc);
            commit(mutant.SET_LOADING, false);
            resolve(doc);
          })
          .catch((error) => {
            console.log('DELETE_REQUEST, ', error);
            commit(mutant.SET_ERROR, error);
            commit(mutant.SET_LOADING, false);
            reject(error);
          });
      });
    },

    [action.UPLOAD_SL]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        console.log('UPLOAD_SL, ', payload);
        api.uploadSl(payload)
          .then((doc) => {
            console.log('UPLOAD_SL, ', doc);
            commit(mutant.SET_LOADING, false);
            resolve(doc);
          })
          .catch((error) => {
            console.log('UPLOAD_SL, ', error);
            commit(mutant.SET_ERROR, error);
            commit(mutant.SET_LOADING, false);
            reject(error);
          });
      });
    },

    [action.DELETE_SL]({ commit }, payload) {
      commit(mutant.SET_LOADING, true);
      return new Promise((resolve, reject) => {
        console.log('DELETE_SL, ', payload);
        api.deleteSl(payload)
          .then((doc) => {
            console.log('DELETE_SL, ', doc);
            commit(mutant.SET_LOADING, false);
            resolve(doc);
          })
          .catch((error) => {
            console.log('DELETE_SL, ', error);
            commit(mutant.SET_ERROR, error);
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
