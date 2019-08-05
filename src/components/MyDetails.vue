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
            <v-text-field v-model.number='user.daysAnnualLeave - this.approvedAnn' label='Remaining Annual Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver' label='Carry Over' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver - this.approvedCo' label='Remaining Carry Over' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCompLeave' label='Compensation Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCompLeave - this.approvedComp' label='Remaining Compensation Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field value="1" label='Birthday Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='1 - this.approvedBirth' label='Remaining Birthday Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedSick' label='Approved Sick Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedNoPay' label='Approved No Pay Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedExam' label='Approved Examination Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedMat' label='Approved Maternity Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedPat' label='Approved Paternity Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedMar' label='Approved Marriage Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedJury' label='Approved Jury Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='this.approvedCompa' label='Approved Compassionate Leave' disabled box>
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
        approvedExam: 0,
        approvedMat: 0,
        approvedPat: 0,
        approvedMar: 0,
        approvedJury: 0,
        approvedCompa: 0,
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
          this.user.dobstring = moment(this.user.dob, "MMDD").format("ddd MMM D")
          this.loaded = true;
        } else {
          this.$store.commit(mutant.SET_ERROR, 'Error, user does not exist');
          console.log('error loading user, ', this.userId);
        }
      }).catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error.message);
        console.log('Error getting document: ', error);
      });

      this.getPublicHolidays();
    },
    methods: {
      dismissClicked() {
        this.successMessage = '';
        this.saved = false;
      },

      getPublicHolidays() {
        this.$store.dispatch(action.GET_HOLIDAYS,
          { startDate: moment().startOf('year'), endDate: moment().endOf('year') })
          .then(holidays => {
            this.holidays = holidays;
            console.log('holidays,', this.holidays);
          })
          .catch((err) => {
            this.$store.commit(mutant.SET_ERROR, err.message);
          })
          .then(() => {
            this.getApprovedHolidays(this.$store.state.loggedInUser);
          })
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
            var s = entry.startDate.startOf('day'); //this entry's start date
            var e = entry.endDate.startOf('day');
            var dif = '';
            if (entry.halfDay != 'Full') {
              dif = 0.5
              var publicHolidayExclusion = 0;
            } else {
              dif = s.businessDiff(e) + 1;
              var publicHolidayExclusion = 0;
              var index, len;
              for (index = 0, len = this.holidays.length; index < len; ++index) {
                  let h = this.holidays[index];
                  if (h.startDate.startOf('day').isBetween(s, e, null, '[]')) {
                    publicHolidayExclusion += h.startDate.diff(h.endDate, 'days') + 1;
                  }
                }
            }
            if (entry.leaveType == 'ANN') {
              this.approvedAnn += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'CO') {
              this.approvedCo += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'COMP') {
              this.approvedComp += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'SICK') {
              this.approvedSick += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'BL') {
              this.approvedBirth += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'NP') {
              this.approvedNoPay += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'EXAM') {
              this.approvedExam += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'MAT') {
              this.approvedMat += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'PAT') {
              this.approvedPat += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'MAR') {
              this.approvedMar += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'JURY') {
              this.approvedJury += dif - publicHolidayExclusion;
            } else if (entry.leaveType == 'COMPA') {
              this.approvedCompa += dif - publicHolidayExclusion;
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
