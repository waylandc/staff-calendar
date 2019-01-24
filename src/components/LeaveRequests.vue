<template>
  <v-container grid-list-md text-xs-center>
    <h1>Pending Leave Requests</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
      <v-alert v-if="wasSuccessful" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
        {{ successMessage }}
      </v-alert>
    </v-flex>
    <v-layout row wrap>
      <v-flex xs12 v-if="loaded">
        <v-form>
          <v-flex xs3>
            <v-select
              @input='changeStatusFilter'
              v-model='statusSelected'
              :items='statuses'
              label='Status'>
            </v-select>
          </v-flex>
        </v-form>
        <div>
          <v-data-table :headers='headers' :items='pendingRequests'
            hide-actions dark class='elevation-1'>
            <template slot='items' slot-scope='props'>
              <tr >
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ getStatus(props.item.aggregateStatus()) }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.requestor }}
                </td>
                <td  class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.title }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.startDate.toDate().toDateString() }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.endDate.toDate().toDateString() }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.halfDay }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
                  <v-icon
                    @click='showDetails(props.item.docId)'>
                    info
                  </v-icon>
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
                  <v-icon v-if="props.item.firstStatus == 0
                  && props.item.secondStatus == 0
                  && props.item.requestor == userEmail
                  " @click='deleteRequest(props.item)'>
                    delete
                  </v-icon>
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
  import NProgress from 'nprogress';
  import moment from 'moment-business-days';
  import Constants from '../models/common.js';
	import * as mutant from '../store/mutation-types';
	import * as action from '../store/action-types';

  export default {
    name: 'EventRequests',
    data() {
      return {
        headers: [
          {
            text: 'Status',
            align: 'left',
            sortable: false,
            value: 'status',
          },
          {
            text: 'Requestor',
            align: 'left',
            sortable: true,
            value: 'requestor',
          },
          {
            text: 'Title',
            align: 'left',
            sortable: true,
            value: 'title',
          },
          {
            text: 'Start',
            align: 'left',
            sortable: true,
            value: 'startDate',
          },
          {
            text: 'End',
            align: 'left',
            sortable: false,
            value: 'endDate',
          },
          {
            text: 'Half Day',
            align: 'left',
            sortable: false,
            value: 'halfDay',
          },
          {
            text: 'Details/Edit/Approve',
            align: 'left',
            sortable: false,
          },
          {
            text: 'Delete',
            align: 'left',
            sortable: false,
          },
        ],
        loaded: false,
        pendingRequests: [],
        alert: false,
        statuses: ['All', 'Approved', 'Pending', 'Rejected'],
        statusSelected: 'Pending',
        successMessage: '',
      }
    },
    created() {
      this.getEvents(Constants.PENDING);
      this.userEmail = this.$store.state.loggedInUser.email;
    },
    computed: {
      error() {
        return this.$store.state.error;
      },
      loading() {
        return this.$store.state.loading;
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
    methods: {
      getEvents(stat) {
        NProgress.start();
        this.loaded = false;
        this.$store.dispatch(action.GET_EVENTS,
          {
            start: moment().subtract(6, 'M'), end: moment().add(1, 'y'),
            status: stat,
            user: (this.$store.state.loggedInUser.isApprover ? '' : this.$store.state.loggedInUser.email) //this.$store.state.loggedInUser.email
          })
          .then(events => {
            this.pendingRequests = events;
             //console.log(this.pendingRequests);
            this.loaded = true;
          })
          .catch((error) => {
            this.$store.commit(mutant.SET_ERROR, error);
          });
        NProgress.done();
      },
      showDetails(id) {
        // console.log('showDetails ' + id);
        this.$router.push({ path: `/leaveRequests/${id}` });
      },
      //TODO getStatus should be refactored to be in common.js for reuse
      getStatus(s) {
        switch (s) {
          case Constants.PENDING:
            return "Pending";
            break;
          case Constants.APPROVED:
            return "Approved";
            break;
          case Constants.REJECTED:
            return "Rejected";
            break;
          default:
            return "Invalid status";
        };
      },
      changeStatusFilter() {
        // console.log('status changed, ', this.statusSelected);
        switch(this.statusSelected) {
          case 'Pending':
            this.getEvents(Constants.PENDING);
            break;
          case 'Approved':
            this.getEvents(Constants.APPROVED);
            break;
          case 'Rejected':
            this.getEvents(Constants.REJECTED);
            break;
          case 'All':
            this.getEvents(Constants.ALL);
            break;
          default:
            this.getEvents(Constants.ALL);
        }
      },
      deleteRequest (item) {
        this.$store.dispatch(action.DELETE_REQUEST, [item.docId,
        "sick-leave-copy/"+ this.userEmail + "/" + moment(item.startDate).format("DDMMMYYYY")
        + "-to-" + moment(item.endDate).format("DDMMMYYYY") +".pdf"])
          .then(() => {
            this.getEvents(Constants.PENDING);
          })
          .then(() => {
            this.successMessage = 'Request successfully deleted';
          })
          .catch((error) => {
            this.$store.commit(mutant.SET_ERROR, error.message);
            console.error('error deleting request: ', error);
          });
      },
    }
  }

</script>

<style scoped>
  .mdl-data-table__cell--non-numeric {
    font-size: 12px;
    text-align: left;
  }
</style>
