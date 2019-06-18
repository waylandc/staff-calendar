<template>
  <v-container grid-list-md text-xs-center>
    <h2>Users</h2><br/>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
    </v-flex>
    <v-layout row wrap>
      <v-flex xs12 v-if="loaded">
        <div>
          <v-data-table :headers='headers' :items='users' hide-actions dark class='elevation-1'>
            <template slot='items' slot-scope='props'>
              <tr>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.lastName.toUpperCase() }}, {{ props.item.firstName }}</td>

                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysAnnualLeave }}</td>
                <td :style="{backgroundColor: 'grey'}"
                class='mdl-data-table__cell--non-numeric'>{{ props.item.daysAnnualLeave - props.item.approvedAnn }}</td>

                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysCarryOver }}</td>
                <td :style="{backgroundColor: 'grey'}"
                class='mdl-data-table__cell--non-numeric'>{{ props.item.daysCarryOver - props.item.approvedCarry }}</td>


                <td class='mdl-data-table__cell--non-numeric'>
                  <v-icon
                    @click='showDetails(props.item.docId, props.item.email)'>
                    info
                  </v-icon>
                </td>

                <!--<td class='mdl-data-table__cell--non-numeric'>{{ props.item.approvedSick }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.approvedComp }}</td>
                <td class='mdl-data-table__cell--non-numeric'>1</td>
                <td :style="{backgroundColor: 'grey'}"
                class='mdl-data-table__cell--non-numeric'>{{ props.item.approvedBirthday }}</td>

                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.approvedNoPay }}</td>

                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.isApprover }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.isAdmin }}</td>
                -->

              </tr>
            </template>
          </v-data-table>
        </div>
      </v-flex>
      <v-flex class="text-xs-left">
        * for admin, click the respective row to edit days available and status etc.
        <br/>
        * apvd = approved
        <br/>
        * rmng = remaining
        <br/>
        * chances are the decimals in strange form -- float problem
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import NProgress from 'nprogress';
import moment from 'moment-business-days';
import Constants from '../models/common.js';
import db from '../config/firebaseInit';
	import * as mutant from '../store/mutation-types';
	import * as action from '../store/action-types';

// This page should only be viewable by admin/approvers for privacy issues
// protected by router beforeEach guard
export default {
  name: 'UserList',
  data() {
    return {
      loaded: false,
      // setup the column headers for the data table
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: false, // TODO sortable true doesn't work
          value: 'name',
        },
        {
          text: 'Annual',
          align: 'left',
          sortable: false,
          value: 'alDays',
          width: '100px',
        },
        {
          text: 'remaining',
          align: 'left',
          sortable: false,
          value: 'remainingAlDays',
        },
        {
          text: 'Carry Over',
          align: 'left',
          sortable: false,
          value: 'carryOver',
        },
        {
          text: 'remaining',
          align: 'left',
          sortable: false,
          value: 'remainingComp',
        },
        {
          text: 'More Details',
          align: 'left',
          sortable: false,
        },
        /*{
          text: 'Birthday',
          align: 'left',
          sortable: false,
          value: 'birthDays',
        },
        {
          text: '(apvd)',
          align: 'left',
          sortable: false,
          value: 'approvedBirthDays',
        },
        {
          text: 'Apvd No Pay',
          align: 'left',
          sortable: false,
          value: 'approvedNpDays',
        },
        {
          text: 'Booked',
          align: 'left',
          sortable: false,
          value: 'booked',
        },
        {
          text: 'Remaining',
          align: 'left',
          sortable: false,
          value: 'remaining',
        },
        {
          text: 'Approver',
          align: 'left',
          sortable: false,
          value: 'approver',
        },
        {
          text: 'Admin',
          align: 'left',
          sortable: false,
          value: 'admin',
        }*/
      ],
      users: [],
      alert: false,
      holidays: [],
    };
  },
  created() {
    NProgress.start();
    this.loaded = false;
    this.$store.dispatch(action.GET_USERS)
      .then((users) => {
        this.users = users;
        //console.log(this.users);
        this.loaded = true;
      })
      .catch((err) => {
        this.$store.commit(mutant.SET_ERROR, err.message);
      })
      .then(() => {
        this.getPublicHolidays();
      })
      .then(() => {
        this.users.forEach((u) => {
          this.getApprovedHolidays(u);
        })
      });

    NProgress.done();
  },
  computed: {
    error() {
      return this.$store.state.error;
    },
    loading() {
      return this.$store.state.loading;
    },
    // TODO should we be persisting this instead of calculating?
    calcRemaining(user) {
      return (user.daysAnnualLeave + user.daysCarryOver + user.daysCompLeave) - user.daysBooked;
    },
  },
  methods: {
    addProperty() {
      this.$router.push({ path: '/addUser' })
    },

    showDetails(id, email) {
      this.$store.dispatch(action.SHOW_USER_DETAILS, { email: email, id: id });
    },

    getPublicHolidays() {
      this.$store.dispatch(action.GET_HOLIDAYS,
        { startDate: moment().subtract(1, 'y'), endDate: moment().add(1, 'y') })
        .then(holidays => {
          this.holidays = holidays;
          console.log('holidays,', this.holidays)
        })
        .catch((err) => {
          this.$store.commit(mutant.SET_ERROR, err.message);
        });
    },

    getApprovedHolidays(target) {
      console.log('in getApprovedHolidays()', target);
      this.$store.dispatch(action.GET_EVENTS,
      {
        start: moment().startOf('year'), end: moment().endOf("year"),
        status: Constants.APPROVED,
        user: target.email
      })
      .then((events) => {
        //this.pendingRequests = events;
        //console.log('the email: ',target.email,'list out the requests', events);
        events.forEach((entry)=> {
          var s = entry.startDate.startOf('day'); //this entry's start date
          var e = entry.endDate.startOf('day');
          var publicHolidayExclusion = 0
          var index, len;
          for (index = 0, len = this.holidays.length; index < len; ++index) {
              let h = this.holidays[index];
              //console.log(h.startDate, s, e);
              //console.log(h.startDate.isBetween(s, e, null, '[]'));
              if (h.startDate.startOf('day').isBetween(s, e, null, '[]')) {
                publicHolidayExclusion += h.startDate.diff(h.endDate, 'days') + 1;
              }
            }
          //*** note this approvedAnn and approvedCarry will exclude public holiday and weekend
          if (entry.leaveType == 'ANN') {
            if (entry.halfDay != 'Full') {
              target.approvedAnn += 0.5;
            } else {
              target.approvedAnn += s.businessDiff(e) + 1;

            //console.log('approvedAnn = ', target.approvedAnn);
            //console.log('no. of days public holidays exluded', publicHolidayExclusion)
            target.approvedAnn -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'CO') {
            if (entry.halfDay != 'Full') {
              target.approvedCarry += 0.5;
            } else {
              target.approvedCarry += s.businessDiff(e) + 1;
              target.approvedCarry -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'COMP') {
            if (entry.halfDay != 'Full') {
              target.approvedComp += 0.5;
            } else {
              target.approvedComp += s.businessDiff(e) + 1;
              target.approvedComp -= publicHolidayExclusion;
            }
          } /*else if (entry.leaveType == 'SICK') {
            if (entry.halfDay != 'Full') {
              target.approvedSick += 0.5;
            } else {
              target.approvedSick += s.businessDiff(e) + 1;
              target.approvedSick -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'BL') {
            if (entry.halfDay != 'Full') {
              target.approvedBirthday += 0.5;
            } else {
              target.approvedBirthday += s.businessDiff(e) + 1;
              target.approvedBirthday -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'NP') {
            if (entry.halfDay != 'Full') {
              target.approvedNoPay += 0.5;
            } else {
              target.approvedNoPay += s.businessDiff(e) + 1;
              target.approvedNoPay -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'EXAM') {
            if (entry.halfDay != 'Full') {
              target.approvedExam += 0.5;
            } else {
              target.approvedExam += s.businessDiff(e) + 1;
              target.approvedExam -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'MAT') {
            if (entry.halfDay != 'Full') {
              target.approvedMat += 0.5;
            } else {
              target.approvedMat += s.businessDiff(e) + 1;
              target.approvedMat -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'PAT') {
            if (entry.halfDay != 'Full') {
              target.approvedPat += 0.5;
            } else {
              target.approvedPat += s.businessDiff(e) + 1;
              target.approvedPat -= publicHolidayExclusion;
            }
          } else if (entry.leaveType == 'MAR') {
            target.approvedMar += s.businessDiff(e) + 1;
          } else if (entry.leaveType == 'JURY') {
            target.approvedJury += s.businessDiff(e) + 1;
          } else if (entry.leaveType == 'COMPA') {
            target.approvedCompa += s.businessDiff(e) + 1;
          }*/

        })
        //console.log(target.email, target.approvedAnn);
      })
      .catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error);
        console.log('error, ', error)
      });
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
};
</script>

// not sure how to change fonts. I could've created custom class but didn't want to add it everywhere so this seems to
// override it within this component
// TODO should this be put in master css?
<style scoped>
  .mdl-data-table__cell--non-numeric {
    font-size: 12px;
    text-align: left;
  }

</style>
