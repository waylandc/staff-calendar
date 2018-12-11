// note that the packages we refer to are called firebase
// but the database we use is in fact, firestore

import firebase from 'firebase';
import 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

const firebaseApp = firebase.initializeApp(firebaseConfig);
const settings = { timestampsInSnapshots: true };
firebase.firestore().settings(settings);
export default firebaseApp.firestore();
