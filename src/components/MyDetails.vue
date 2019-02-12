<template>
  <v-container grid-list-md text-xs-center>
    <h1>My Details</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
      <v-alert v-if="saved" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
        {{ successMessage }}
      </v-alert>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded">
        <v-layout row wrap>
          <v-flex xs6>
            <v-text-field v-model='user.firstName' label='First  Name' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.lastName' label='Last Name' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.dobstring' label='Birthday' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.email' label='Email' disabled box>
            </v-text-field>
          </v-flex>
          <br/>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysAnnualLeave' label='Annual Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysAnnualLeave - this.approvedAnn' label='Remaining' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver' label='Carry Over' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver - this.approvedCo' label='Remaining' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field value="1" label='Birthday Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='1 - this.approvedBirth' label='Remaining' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedComp' label='Approved Comp Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedSick' label='Approved Sick' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedNoPay' label='Approved No Pay' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-switch
              :label="`Administrator: ${user.isAdmin.toString()}`"
              v-model="user.isAdmin"
              disabled
            ></v-switch>
          </v-flex>
          <v-flex xs6>
            <v-switch
              :label="`Approver: ${user.isApprover.toString()}`"
              v-model="user.isApprover"
              disabled
            ></v-switch>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
  // This screen should probably be READ ONLY. Allows user to display their entitled

  import db from '../config/firebaseInit';
  import moment from 'moment-business-days';
  import Constants from '../models/common.js';
  import { createUserModel } from '../models/User';
	import * as mutant from '../store/mutation-types';
	import * as action from '../store/action-types';

  export default {
    data() {
      return {
        user: null,
        userId: '',
        alert: false,
        loaded: false,
        saved: false,
        successMessage: '',
        approvedAnn: 0,
        approvedCo: 0,
        approvedComp: 0,
        approvedSick: 0,
        approvedBirth: 0,
        approvedNoPay: 0,
      }
    },
    created() {
      this.loaded = false;
      this.userId = this.$store.state.loggedInUser.docId;
      const docRef = db.collection('users').doc(this.userId);
      console.log('logged in user ',this.$store.state.loggedInUser);
      docRef.get().then((doc) => {
        if (doc.exists) {
          //console.log(doc.data());
          this.user = createUserModel(doc.data());
          //console.log(this.user);
          this.user.docId = this.userId;
          this.user.dobstring = moment(this.user.dob, "MMDD").format("ddd MMM D YYYY")
          this.loaded = true;
        } else {
          this.$store.commit(mutant.SET_ERROR, 'Error, user does not exist');
          console.log('error loading user, ', this.userId);
        }
      }).catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error.message);
        console.log('Error getting document: ', error);
      });

      this.getApprovedHolidays(this.$store.state.loggedInUser);
    },
    methods: {
      dismissClicked() {
        this.successMessage = '';
        this.saved = false;
      },
      getApprovedHolidays(target) {
        //console.log('in getApprovedHolidays()', target);
        this.$store.dispatch(action.GET_EVENTS,
        {
          start: moment().startOf('year'), end: moment().endOf("year"),
          status: Constants.APPROVED,
          user: target.email
        })
        .then((events) => {
          //this.pendingRequests = events;
          console.log('the email: ',target.email,'list out the requests', events);
          events.forEach((entry)=> {
            var s = entry.startDate; //this entry's start date
            var e = entry.endDate;
            if (entry.leaveType == 'ANN') {
              this.approvedAnn += e.diff(s, 'days') + 1;
              //console.log('target.approvedAnn, ', target.approvedAnn);
            } else if (entry.leaveType == 'CO') {
              this.approvedCo += e.diff(s, 'days') + 1;
            } else if (entry.leaveType == 'COMP') {
              this.approvedComp += e.diff(s, 'days') + 1;
            } else if (entry.leaveType == 'SICK') {
              this.approvedSick += e.diff(s, 'days') + 1;
            } else if (entry.leaveType == 'BL') {
              this.approvedBirth += e.diff(s, 'days') + 1;
            } else if (entry.leaveType == 'NP') {
              this.approvedNoPay += e.diff(s, 'days') + 1;
            }

          })
        })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error);
          console.log('error, ', error)
        });
      },
    },
    computed: {
      error() {
        return this.$store.state.error;
      },
      loading() {
        return this.$store.state.loading;
      },
      isAdmin() {
        return this.$store.getters.isAdmin;
      },

    },
    watch: {
      error(value) {
        if (value) {
          this.alert = true;
        }
      },
      alert(value) {
        if (!value) {
          this.$store.commit(mutant.SET_ERROR, null);
        }
      },
    },
  }
</script>
