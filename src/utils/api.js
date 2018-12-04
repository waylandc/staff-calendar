import firebase from 'firebase';

import db from '../config/firebaseInit';
import { User } from '../models/User';

// TODO return a promise
export function saveUser(data) {
  console.log('saveUser...', data);
  return new Promise((resolve, reject) => {
    db.collection('users').add(
      {
        email: data.email,
        isAdmin: data.isAdmin,
        isApprover: data.isApprover,
        daysAnnualLeave: data.daysAnnualLeave,
        daysCarryOver: data.daysCarryOver,
        daysCompLeave: data.daysCompLeave,
        daysBooked: data.daysBooked,
      },
    ).then(() => resolve())
    .catch(error => reject(error));
  });
}

/**
 * Create a firebase user as well as our internal User
 * We could separate the 2 functions but I see no need at the moment
 *
 * @param {*} newUser User.js
 * @return error
 */
export function createUser(newUser) {
  console.log('createUser...');
  return new Promise((resolve, reject) => {
    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then((firebaseUser) => {
        db.collection('users').add(
          {
            email: firebaseUser.user.email,
            admin: false,
            approver: false,
            daysAnnualLeave: newUser.daysAnnualLeave,
            daysCarryOver: newUser.daysCarryOver,
            daysCompLeave: newUser.daysCompLeave,
            daysBooked: newUser.daysBooked,
          },
        );
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      },
    );
  });
}

/**
 * autoLogin checks for an existing firebase session and then performs
 * the app specific login
 * NOTE - it's important to wrap this in a Promise or else this function
 * executes asynchronously and isn't ready by time the UI renders
 * @param {string} email
 */
export function autoLogin(email) {
  return new Promise((resolve, reject) => {
    db.collection('users').where('email', '==', email).get()
    .then(
      (snaps) => {
        snaps.forEach((user) => {
          const u = new User(
            user.data().email, user.data().password, user.data().isAdmin,
            user.data().isApprover, user.data().daysAnnualLeave,
            user.data().daysCompLeave, user.data().daysCarryOver,
            user.data().daysBooked);
          // console.log(u);
          resolve(u);
        });
      },
    )
    .catch(error => reject(error));
  });
}

/**
 * Login a user with their Firebase credentials and then retrieve
 * user profile from our own users table.
 * @param {string} email
 * @param {string} password
 * @return User
 */
export function login(email, password) {
  console.log('login...');
  return new Promise((resolve, reject) => {
    // change Auth state persistence
    // https://firebase.google.com/docs/auth/web/auth-state-persistence
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => firebase.auth().signInWithEmailAndPassword(email, password))
      .then(() => {
        db.collection('users').where('email', '==', email).get()
        .then(
          (snaps) => {
            snaps.forEach((user) => {
              const u = new User(
                user.data().email, user.data().password, user.data().isAdmin,
                user.data().isApprover, user.data().daysAnnualLeave,
                user.data().daysCompLeave, user.data().daysCarryOver,
                user.data().daysBooked);
              console.log(u);
              resolve(u);
            });
          },
        )
        .catch(error => reject(error));
      });
  });
}

export function logout() {
  firebase.auth().signOut();
}
