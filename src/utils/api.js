import firebase from 'firebase';
import moment from 'moment-business-days';

import db from '../config/firebaseInit';
import { User } from '../models/User';
import { CalendarEvent } from '../models/CalendarEvent';
import Constants from '../models/common';

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
 * @param {User} newUser User.js
 * @param {string} passwd
 * @return error
 */
export function createUser(newUser, passwd) {
  console.log('api.createUser...', newUser.email);
  return new Promise((resolve, reject) => {
    firebase.auth().createUserWithEmailAndPassword(newUser.email, passwd)
      .then((firebaseUser) => {
        console.log(firebaseUser);
        // TODO if this add() fails, we need to delete the user from firebase
        db.collection('users').add(newUser.toJSON())
          .then((u) => {
            // TODO need to get doc.id to put in User object
            // we put in id but when does it get saved??
            newUser.docId = u.id;
            resolve(newUser);
          })
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
 * getUsers retrieves the entire users table in firebase
 *
 * @return {[User]} users
 */
export function getUsers() {
  console.log('api.getUsers...');
  return new Promise((resolve, reject) => {
    db
      .collection('users')
      .orderBy('email')
      .get()
      .then((querySnapshot) => {
        const users = [];
        let u;
        querySnapshot.forEach((doc) => {
          u = new User(
            doc.data().email,
            doc.data().isAdmin,
            doc.data().isApprover,
            doc.data().daysAnnualLeave,
            doc.data().daysCarryOver,
            doc.data().daysCompLeave,
            doc.data().daysBooked,
            doc.data().daysSick,
            doc.id,
          );
          users.push(u);
        });
        resolve(users);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

function validateDateParams(d) {
  // both start/end were not passed in
  if ((d.start === '' && d.end === '') || (d.start === undefined && d.end === undefined)) {
    return true;
  }

  if (d.start !== '' || d.start !== undefined) {
    if (d.end === '' || d.end === undefined) {
      // start passed in but no end
      return false;
    }
  }

  if (d.end !== '' || d.end !== undefined) {
    if (d.start === '' || d.start === undefined) {
      // end passed in but no start
      return false;
    }
  }

  return true;
}
/**
 * getSomeEvents returns CalendarEvents based on filter criteria
 * Can filter on:
 *  -start date
 *  -end date
 *  -user
 *  -status
 * @param {{ start:moment, end: moment, user: email, status:Constants }} data
 */
export function getEvents(data) {
  console.log('api.getEvents...', data);

  return new Promise((resolve, reject) => {
    // validate filter params. i.e. if they pass in a start/end date, they must pass in both
    if (!validateDateParams(data)) {
      const errorDateMsg = 'Error, you must provide both start/end dates for this query';
      // console.log('warning, ', errorDateMsg);
      // console.log(data);
      reject(errorDateMsg);
    }

    db.collection('leaveRequests')
      .where('startDate', '>', data.start.toDate())
      .get()
      .then((querySnapshot) => {
        const results = [];
        querySnapshot.forEach((doc) => {
          const ce = new CalendarEvent(
            doc.data().title,
            moment(doc.data().startDate.toDate()),
            moment(doc.data().endDate.toDate()),
            doc.data().halfDay,
            doc.data().requestor,
            doc.data().approver,
            doc.data().status,
            doc.id);

          console.log('getEvents filter, user= ', data.email, ' status= ', data.status);
          //  NOTE - firestore queries don't support multiple fields
          //    so we need to filter on the server. YES THIS IS A BLOODY MESS but we need
          //    to provide query capability.
          let isFiltered = false; // set to true if we fail filter criteria
          // if user param is present, test that this event requestor matches filter
          if ((data.user !== '' && data.user !== undefined) && data.user !== ce.requestor) {
            isFiltered = true;
          }

          // console.log('done user check, ', isFiltered);
          // check end date filters
          if (!isFiltered) {
            // is end date of db event AFTER the end date parameter?
            if ((data.end !== '' && data.end !== undefined) && ce.endDate.isAfter(data.end)) {
              isFiltered = true;
            }
          }

          // filter on status. this field is always present so don't need to check undefined.
          if (data.status !== Constants.ALL) {
            if (!isFiltered) {
              if (data.status !== ce.status) {
                isFiltered = true;
              }
              console.log(ce.title, ' status is, ', ce.status, ', want ', data.status, '. filtered ', data.status === ce.status);
            }
            // console.log('done ', data.status, ' status check, ', isFiltered);
          }

          if (!isFiltered) {
            results.push(ce);
          }
        });
        console.log('api.getSomeEvents returning ', results.length);
        resolve(results);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
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
	            user.data().daysCompLeave, user.data().daysCarryOver, user.data().daysBooked,
              user.data().daysSick, user.id, user.data().firstName, user.data().lastName);
            console.log('auto logged in, ', u);
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
                  user.data().daysCompLeave, user.data().daysCarryOver, user.data().daysBooked,
                  user.data().daysSick, user.id, user.data().firstName, user.data().lastName);
                console.log('logged in, ', u);
                resolve(u);
              });
            },
          )
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
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

/**
 * Create an event in our calendar using the CalendarEvent class
 * @param {CalendarEvent.toJSON} data
 */
export function createEvent(data) {
  console.log('api.createEvent...', data);
  return new Promise((resolve, reject) => {
    db.collection('leaveRequests').add(data)
      .then(docRef => resolve(docRef))
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

/**
 * Return a list of all the holidays
 * @param {moment} start
 * @param {moment} end
 * @return {[ {title, startDate: Timestamp, endDate: Timestamp, country, docId }]}
 */
export function getHolidays(start, end) {
  console.log('api.getHolidays between ', start.toString(), ' and ', end.toString());
  return new Promise((resolve, reject) => {
    db
      .collection('holidays')
      .orderBy('startDate')
      .get()
      .then((querySnapshot) => {
        const holidays = [];
        let u;
        querySnapshot.forEach((doc) => {
          u = {
            title: doc.data().title,
            startDate: doc.data().startDate,
            endDate: doc.data().endDate,
            country: doc.data().country,
            docId: doc.id,
          };
          holidays.push(u);
        });
        // console.log(holidays);
        resolve(holidays);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

/**
 * Add a holiday to our holiday table
 * TODO - this and createEvent are very similar, could generalize the method to accept a
 * table parameter but then we wouldn't be able to do any data validation.
 * @param {{ title, startDate, endDate, country }} data
 */
export function createHoliday(data) {
  console.log('api.createHoliday...', data);
  return new Promise((resolve, reject) => {
    db.collection('holidays').add(data)
      .then(docRef => resolve(docRef))
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

export function resetPassword(email) {
  console.log('api.resetPassword...');
  const auth = firebase.auth();
  return new Promise((resolve, reject) => {
    auth.sendPasswordResetEmail(email)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      console.log('error resetting password for, ', email);
      console.log(error);
      reject(error);
    });
  });
}
