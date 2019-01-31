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
              <tr @click='showDetails(props.item.docId, props.item.email)'>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.lastName.toUpperCase() }}, {{ props.item.firstName }}</td>

                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysAnnualLeave }}</td>
                <td :style="{backgroundColor: 'grey'}"
                 class='mdl-data-table__cell--non-numeric'>{{ props.item.approvedAnn }}</td>
                <td :style="{backgroundColor: 'grey'}"
                class='mdl-data-table__cell--non-numeric'>{{ props.item.daysAnnualLeave - props.item.approvedAnn }}</td>

                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysCarryOver }}</td>

                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.approvedComp }}</td>
                <!--<td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysBooked }}</td>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.daysAnnualLeave + props.item.daysCarryOver + props.item.daysCompLeave - props.item.daysBooked }}
                </td>


                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.isApprover }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.isAdmin }}</td>
                -->

              </tr>
            </template>
          </v-data-table>
        </div>
      </v-flex>
      <v-flex class="text-xs-left">
        *for admin, click the respective row to edit days available and status etc.
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
        },
        {
          text: '(approved)',
          align: 'left',
          sortable: false,
          value: 'approvedAlDays',
        },
        {
          text: '(remaining)',
          align: 'left',
          sortable: false,
          value: 'remainingAlDays',
        },
        {
          text: 'Carry',
          align: 'left',
          sortable: false,
          value: 'carryOver',
        },
        {
          text: 'Approved Comp',
          align: 'left',
          sortable: false,
          value: 'compDays',
        },
        /*{
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
      //approvedAnn: '',
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
        //console.log('the email: ',target.email,'list out the requests', events);
        events.forEach((entry)=> {
          var s = entry.startDate; //this entry's start date
          var e = entry.endDate;
          if (entry.leaveType == 'ANN') {
            target.approvedAnn = target.approvedAnn + e.diff(s, 'days') + 1;
            //console.log('target.approvedAnn, ', target.approvedAnn);
          } else if (entry.leaveType == 'COMP') {
            target.approvedComp = target.approvedComp + e.diff(s, 'days') + 1;
          }

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
