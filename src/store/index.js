import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase';
import router from '@/router';
import db from '../config/firebaseInit';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    appTitle: 'OAX Staff Calendar',
    user: null,
    error: null,
    loading: false,
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
  },
  actions: {
    userSignUp({ commit }, payload) {
      commit('setLoading', true);
      firebase.auth().createUserWithEmailAndPassword(
        payload.email, payload.password).then(
          (firebaseUser) => {
            // create a default userRole
            db.collection('userRoles').add(
              {
                email: firebaseUser.user.email,
                admin: false,
                approver: false,
              },
            );
            commit('setUser', { email: firebaseUser.user.email });
            commit('setLoading', false);
            router.push('/home');
          }).catch((error) => {
            commit('setError', error.message);
            commit('setLoading', false);
          });
    },

    userSignIn({ commit }, payload) {
      commit('setLoading', true);
      firebase.auth().signInWithEmailAndPassword(
        payload.email, payload.password).then(
          (firebaseUser) => {
            // fetch userRole for this user
            db.collection('userRoles').where('email', '==', firebaseUser.user.email).get()
            .then(
              (snaps) => {
                snaps.forEach((user) => {
                  commit('setUser', {
                    email: firebaseUser.user.email,
                    approver: user.data().approver,
                    admin: user.data().admin,
                  });
                  commit('setLoading', false);
                  commit('setError', null);
                  router.push('/home');
                });
              },
            )
            .catch((error) => {
              commit('setError', error); // `Error retrieving user role for ${payload.email}`);
              commit('setLoading', false);
            });
          },
        );
    },

    changePassword({ commit }, payload) {
      const user = firebase.auth().currentUser;
      if (user === null) {
        commit('setError', 'You are not currently logged in');
        return;
      }

      if (payload.newPassword !== payload.confirmPassword) {
        commit('setError', 'New passwords don\'t match');
      } else {
        commit('setLoading', true);
        user.updatePassword(payload.newPassword).then(() => {
          commit('setLoading', false);
          router.push('/home');
        }).catch((error) => {
          commit('setError', error.message);
        });
      }
    },
    autoSignIn({ commit }, payload) {
      commit('setUser', { email: payload.email });
    },
    userSignOut({ commit }) {
      firebase.auth().signOut();
      commit('setUser', null);
      router.push('/');
    },
  },
  getters: {
    isAuthenticated(state) {
      return state.user !== null && state.user !== undefined;
    },
  },
});

export default store;
