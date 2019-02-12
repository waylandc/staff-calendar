<template>
  <v-container grid-list-md text-xs-center>
    <h1>User Profile</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
      <v-alert v-if="wasSuccessful" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
        {{ successMessage }}
      </v-alert>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded" >
        <v-layout row wrap>
          <v-flex xs6>
            <v-text-field v-model='user.firstName' label='First Name' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.lastName' label='Last Name' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.email' label='Email' autocomplete="email" disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysAnnualLeave' label='Annual Leave' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysAnnualLeave - this.approvedAnn' label='Remaining' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver' label='Carry Over' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver - this.approvedCo' label='Remaining' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field value='1' label='Birthday Leave' disabled box>
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
            ></v-switch>
          </v-flex>
          <v-flex xs6>
            <v-switch
              :label="`Approver: ${user.isApprover.toString()}`"
              v-model="user.isApprover"
            ></v-switch>
          </v-flex>
          <v-flex xs12 v-if="this.isAdmin">
            <v-text-field v-model = 'comment' label = '*Please describe your changes'></v-text-field>
          </v-flex>
          <v-flex xs6 v-if="this.isAdmin">
            <v-btn color="primary" @click.stop="save">Save</v-btn>
          </v-flex>
          <v-flex xs6 v-if="this.isAdmin">
            <v-btn color="reject" @click.stop="resetPassword">Reset Password</v-btn>
          </v-flex>
          <v-flex xs12>
            <br/><h3>Change Comments</h3>
            <v-list two line>
              <template v-for = '(c, idx) in user.comments'>
                <v-list-tile :key = 'idx'>
                <v-list-tile-content>
                  <v-list-tile-title v-html='c.comment'></v-list-tile-title>
                  <v-list-tile-sub-title v-html = "c.date.toDate().toDateString() + ' - ' + c.changedBy"></v-list-tile-sub-title>
                </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
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
        documentRef: null,
        loaded: false,
        successMessage: '',
        comment: '',
        approvedAnn: 0,
        approvedCo: 0,
        approvedComp: 0,
        approvedSick: 0,
        approvedBirth: 0,
        approvedNoPay: 0,
      }
    },
    created() {
      this.userId = this.$route.params.id;
      console.log('UserDetails, ', this.$store.state.selectedUser);
      if (this.$store.state.selectedUser !== null && this.$store.state.selectedUser !== '') {
        this.fetchUser();
        this.getApprovedHolidays(this.$store.state.selectedUser);
      } else {
        console.log('no selectedUser');
        this.$store.commit(mutant.SET_ERROR, 'Cannot load, no selectedUser found');
        this.$router.push('/404');
      }
    },
    methods: {
      fetchUser() {
        this.loaded = false;
        this.$store.dispatch(action.GET_USER, { email: this.$store.state.selectedUser })
          .then((user) => {
            console.log('UserDetails loaded, ', user);
            this.user = user;
            this.loaded = true;
          })
          .catch((error) => {
            console.log(error);
            this.$store.commit(mutant.SET_ERROR, error);
          })
      },
      save() {
        this.$store.dispatch(action.SAVE_USER, {
          user: this.user,
          comment: this.comment,
          changedBy: this.$store.state.loggedInUser.email })
          .then(() => {
            this.successMessage = 'Successfully saved';
            this.comment = '';
            this.fetchUser();
          })
          .catch((error) => {
            console.log(error);
            //TODO is this SET_ERROR necessary? we already did it in store action
            //TODO on 2nd thought, we should probably do it here or why bother creating a promise that returns the error?
            //this.$store.commit(mutant.SET_ERROR, error);
          })
      },
      dismissClicked() {
        this.successMessage = '';
        this.$router.push({ path: '/users' });
      },
      resetPassword() {
        this.$store.dispatch(action.RESET_PASSWORD, { email: this.user.email });
        this.successMessage = 'Reset Password email sent to ', this.user.email;
      },

      getApprovedHolidays(target) {
        console.log('in getApprovedHolidays()', target);
        this.$store.dispatch(action.GET_EVENTS,
        {
          start: moment().startOf('year'), end: moment().endOf("year"),
          status: Constants.APPROVED,
          user: target
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
      wasSuccessful() {
        return this.successMessage !== '';
      }
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
