import firebase from 'firebase';
import moment from 'moment-business-days';

import db from '../config/firebaseInit';
import { User } from '../models/User';
import { CalendarEvent } from '../models/CalendarEvent';
import Constants from '../models/common';

/**
 * saveUser saves changes to a User and also creates a comment record for the save
 * Requirement for a comment should be enforced by UI (no checking done here)
 * @param { {user: User.js, userId: id, comment: string, changedBy: email} } data
 */
export function saveUser(data) {
  console.log('api.saveUser...', data.user.toJSON());
  return new Promise((resolve, reject) => {
    const dr = db.collection('users');

    dr.doc(data.user.docId).update(data.user.toJSON())
    .then(() => {
      console.log('OK saved user, ', data.user.toJSON());
    })
    .then(() => {
      // now save the comment
      const newComment = {
        email: data.user.email,
        changedBy: data.changedBy,
        comment: data.comment,
        date: new Date(),
      };
      console.log('about to save, ', newComment);
      db.collection('userComments').add(newComment);
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
        console.log('firebase user', firebaseUser);
        // TODO if this add() fails, we need to delete the user from firebase
        db.collection('users').add(newUser.toJSON())
          .then((u) => {
            // TODO need to get doc.id to put in User object
            // we put in id but when does it get saved?? we could just
            // not set and use getUser instead
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
  const users = [];
  return new Promise((resolve, reject) => {
    db
      .collection('users')
      .orderBy('email')
      .get()
      .then((querySnapshot) => {
        let u;
        querySnapshot.forEach((doc) => {
          // console.log('raw data here', doc.data());
          u = new User(
            doc.data().email,
            doc.data().isAdmin,
            doc.data().isApprover,
            doc.data().daysAnnualLeave,
            doc.data().daysBooked,
            doc.data().daysCarryOver,
            doc.data().daysCompLeave,
            doc.data().daysSick,
            doc.data().daysBirthdayLeave,
            doc.id,
            doc.data().firstName,
            doc.data().lastName,
            doc.data().dob,
          );
          u.comments = [];
          u.approvedAnn = 0; // build initial value for users.vue
          u.approvedComp = 0;
          u.approvedCarry = 0;
  /*      u.approvedSick = 0;
          u.approvedBirthday = 0;
          u.approvedNoPay = 0;
          u.approvedExam = 0;
          u.approvedMat = 0;
          u.approvedPat = 0;
          u.approvedMar = 0;
          u.approvedJury = 0;
          u.approvedCompa = 0; */
          users.push(u);
        });
      })
      .then(() => {
        users.forEach((u) => {
          db.collection('userComments').where('email', '==', u.email).get()
          .then((commentSnapshots) => {
            commentSnapshots.forEach((c) => {
              u.comments.push(
                {
                  comment: c.data().comment,
                  date: c.data().date,
                  email: c.data().email,
                  changedBy: c.data().changedBy,
                });
            });
          });
        });
        console.log('api.getUsers retrieved, ', users);
        resolve(users);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

/**
 * Returns an array of email addresses of approvers in system
 * @returns [string]
 */
export function getApprovers() {
  console.log('api.getApprovers...');
  const approvers = [];
  return new Promise((resolve, reject) => {
    db.collection('users').where('isApprover', '==', true).get()
    .then((users) => {
      users.forEach((u) => {
        approvers.push(u.data().email);
      });
      resolve(approvers);
    })
    .catch((error) => {
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
            doc.data().firstApprover,
            doc.data().secondApprover,
            doc.data().firstStatus,
            doc.data().secondStatus,
            doc.data().firstComment,
            doc.data().secondComment,
            doc.id,
            doc.data().leaveType,
            );

          // console.log('getEvents filter, user= ', data.email, ' status= ', data.status);
          //  NOTE - firestore queries don't support multiple fields
          //    so we need to filter on the server. YES THIS IS A BLOoODY MESS but we need
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
              switch (data.status) {
                case Constants.APPROVED:
                  // if there is a 2nd approver set, we need to check both statuses
                  if (ce.secondApprover !== '' && ce.secondApprover !== undefined) {
                    if (ce.firstStatus !== ce.secondStatus) {
                      isFiltered = true;
                    } else if (ce.firstStatus !== Constants.APPROVED ||
                      ce.secondStatus !== Constants.APPROVED) {
                      isFiltered = true;
                    }
                  } else {
                    // only 1 approver
                    /* eslint-disable no-lonely-if */
                    if (data.status !== ce.firstStatus) {
                      isFiltered = true;
                    }
                  }
                  break;
                case Constants.PENDING:
                  if (ce.secondApprover !== '' && ce.secondApprover !== undefined) {
                    if (!(ce.firstStatus === Constants.PENDING ||
                      ce.secondStatus === Constants.PENDING)) {
                      isFiltered = true;
                    }
                  } else {
                    if (ce.firstStatus !== Constants.PENDING) {
                      isFiltered = true;
                    }
                  }
                  break;
                case Constants.REJECTED:
                  if (ce.secondApprover !== '' && ce.secondApprover !== undefined) {
                    if (!(ce.firstStatus === Constants.REJECTED ||
                      ce.secondStatus === Constants.REJECTED)) {
                      isFiltered = true;
                    }
                  } else {
                    if (ce.firstStatus !== Constants.REJECTED) {
                      isFiltered = true;
                    }
                  }
                  break;
                default:
              }


              // if there is a 2nd approver set, we need to check both statuses
              // if (ce.secondApprover !== '' && ce.secondApprover !== undefined) {
              //   if (data.status !== ce.firstStatus && data.status !== ce.secondStatus) {
              //     console.log('getEvents [ ', ce.title, ' ] first and second not equal');
              //     isFiltered = true;
              //   }
              // } else {
              //   // no secondApprover specified so just check firstApprover
              //   /* eslint-disable no-lonely-if */
              //   if (data.status !== ce.firstStatus) {
              //     isFiltered = true;
              //   }
              // }
            }
          }

          if (!isFiltered) {
            results.push(ce);
          }
        });
        // console.log('api.getEvents returning ', results);
        resolve(results);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

/**
 * getUser fetches info from both users and userComments tables
 * @param {string} email
 * @returns (User.js) user
 */
export function getUser(email) {
  console.log('getUser...', email);
  return new Promise((resolve, reject) => {
    let u;
    db.collection('users').where('email', '==', email).get()
    .then(
      (snaps) => {
        if (snaps.size === 0) {
          reject(new Error('Firebase login successful but User record missing from system'));
        }

        snaps.forEach((user) => {
          u = new User(
            user.data().email, user.data().isAdmin,
            user.data().isApprover, user.data().daysAnnualLeave,
            user.data().daysBooked, user.data().daysCarryOver, user.data().daysCompLeave,
            user.data().daysSick, user.data().daysBirthdayLeave, user.id, user.data().firstName,
            user.data().lastName, user.data().dob, [],
          );
        });
      },
    )
    .then(() => {
      db.collection('userComments').where('email', '==', email).get()
        .then((commentSnapshots) => {
          commentSnapshots.forEach((c) => {
            u.comments.push({
              comment: c.data().comment,
              date: c.data().date,
              email: c.data().email,
              changedBy: c.data().changedBy });
          });
          // sort our comments as firestore query can't query on email and orderBy different field
          u.comments = u.comments.sort((a, b) => b.date.toDate() - a.date.toDate());
        });
      resolve(u);
    })
    .catch(error => reject(error));
  });
}

export function login(email, password) {
  return new Promise((resolve, reject) => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => firebase.auth().signInWithEmailAndPassword(email, password))
      .then(() => getUser(email))
      .then(user => resolve(user))
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
      .then(docRef => resolve(docRef));
  });
}

export function editEvent(data) {
  console.log('api.editEvent...', data[0]);
  return new Promise((resolve, reject) => {
    db.collection('leaveRequests').doc(data[0]).set(data[1])
      .then(() => resolve())
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

export function uploadSl(data) {
  console.log('api.uploadSl...', data);
  return new Promise((resolve, reject) => {
    const file = data[0];
    const metadata = {
      contentType: file.type,
    };
    const storageRef = firebase.storage().ref();
    storageRef.child(data[1]).put(file, metadata)
    .then((snapshot) => {
      console.log('successfully uploaded the file!');
      resolve(snapshot);
    }).catch((error) => {
      console.log(error);
      reject(error);
    });
  });
}

export function deleteSl(data) {
  console.log('api.deleteSl...', data);
  return new Promise((resolve, reject) => {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    console.log('delete attachment: ', data);
    storageRef.child(data).delete().catch(error =>
      console.log('It doesnt really matter if your attachment is not deleted', error));
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
            startDate: moment(doc.data().startDate.toDate()),
            endDate: moment(doc.data().endDate.toDate()),
            country: doc.data().country,
            docId: doc.id,
          };
          if (u.startDate.isAfter(start) && u.endDate.isBefore(end)) {
            holidays.push(u);
          }
        });
        console.log('getHolidays...');
        console.log(holidays);
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

export function deleteHoliday(docId) {
  console.log('api.deleteHoliday...', docId);
  return new Promise((resolve, reject) => {
    db.collection('holidays').doc(docId).delete()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

export function deleteRequest(docId) {
  console.log('api.deleteRequest...', docId);
  return new Promise((resolve, reject) => {
    db.collection('leaveRequests').doc(docId).delete()
      .then(() => {
        resolve();
      })
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
