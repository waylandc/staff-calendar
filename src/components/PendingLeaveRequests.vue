<template>
  <v-container grid-list-md text-xs-center>
    <h1>Pending Leave Requests</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
    </v-flex>
    <v-layout row wrap>
      <v-flex xs12 v-if="loaded">
        <div>
          <v-data-table :headers='headers' :items='pendingRequests'
            hide-actions dark class='elevation-1'>
            <template slot='items' slot-scope='props'>
              <tr @click='showDetails(props.item.docId)'>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ getStatus(props.item.status) }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.requestor }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>
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
  import Constants from '../models/common.js';
  import moment from 'moment';

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
        ],
        loaded: false,
        pendingRequests: [],
        alert: false,
      }
    },
    created() {
      NProgress.start();

      this.loaded = false;

      this.$store.dispatch('GET_EVENTS',
        {
          start: moment().subtract(6, 'M'), end: moment().add(1, 'y'),
          status: Constants.PENDING,
          user: '' //this.$store.state.loggedInUser.email
        })
        .then(events => {
          this.pendingRequests = events;
          console.log(this.pendingRequests);
          this.loaded = true;
        })
        .catch((error) => {
          this.$store.commit('SET_ERROR', error);
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
    },
    watch: {
      error(value) {
        if (value) {
          this.alert = true;
        }
      },
      alert(value) {
        if (!value) {
          this.$store.commit('SET_ERROR', null);
        }
      },
    },
    methods: {
      showDetails(id) {
        // console.log('showDetails ' + id);
        this.$router.push(`/leaveRequests/${id}`);
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
      }
    }
  }

</script>

<style scoped>
  .mdl-data-table__cell--non-numeric {
    font-size: 12px;
    text-align: left;
  }
</style>