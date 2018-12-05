import firebase from 'firebase';

import db from '../config/firebaseInit';
import { User } from '../models/User';

export function saveUser(data) {
  console.log('api.saveUser...', data);
  return new Promise((resolve, reject) => {
    const dr = db.collection('users');
    dr.doc(data.userId).update(data.user.toJSON())
    .then(() => {
      console.log('OK saved user, ', data.user.toJSON());
      resolve(data.user);
    })
    .catch((error) => {
      console.log('error saving user, ', data.user.toJSON());
      reject(error);
    });
  });
}

/**
 * Create a firebase user as well as our internal User
 * We could separate the 2 functions but I see no need at the moment
 *
 * @param {*} newUser User.js
 * @return error
 */
export function createUser(newUser, passwd) {
  console.log('api.createUser...');
  return new Promise((resolve, reject) => {
    firebase.auth().createUserWithEmailAndPassword(newUser.email, passwd)
      .then((firebaseUser) => {
        // TODO need to get doc.id to put in User object
        console.log('document id is... ', firebaseUser.id);
        const u = new User(firebaseUser.user.email, false, false,
          newUser.daysAnnualLeave, newUser.daysCarryOver, newUser.daysCompLeave,
          newUser.daysBooked, null);
        // TODO if this add() fails, I think we need to delete the user from firebase
        db.collection('users').add(u.toJSON())
          .then(() => resolve(u))
          .catch(error => reject(error));
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
  console.log('api.autoLogin...');
  return new Promise((resolve, reject) => {
    db.collection('users').where('email', '==', email).get()
    .then(
      (snaps) => {
        snaps.forEach((user) => {
          const u = new User(
            user.data().email, user.data().isAdmin,
            user.data().isApprover, user.data().daysAnnualLeave,
            user.data().daysCompLeave, user.data().daysCarryOver,
            user.data().daysBooked, user.id);
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
  console.log('api.login...');
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
                user.data().email, user.data().isAdmin,
                user.data().isApprover, user.data().daysAnnualLeave,
                user.data().daysCompLeave, user.data().daysCarryOver,
                user.data().daysBooked, user.id);
              console.log(u);
              resolve(u);
            });
          },
        )
        .catch(error => reject(error));
      });
  });
}

// changePassword wraps Firebase.Auth's change password API which is
// strange b/c they don't ask to verify current password.
export function changePassword(newPass) {
  console.log('api.changePassword...');
  return new Promise((resolve, reject) => {
    const fbUser = firebase.auth().currentUser;
    if (fbUser === null) {
      reject('You are currently not logged in.');
    }

    fbUser.updatePassword(newPass)
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

export function logout() {
  console.log('api.logout...');
  firebase.auth().signOut();
}
