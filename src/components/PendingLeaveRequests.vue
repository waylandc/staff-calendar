<template>
  <v-container grid-list-md>
    <v-flex xs10 offset-xs1 v-if="loaded">
      <div>
        <h2>Pending Leave Requests</h2>
        <v-data-table :headers='headers' :items='pendingRequests' hide-actions dark class='elevation-1'>
          <template slot='items' slot-scope='props'>
            <tr @click='showDetails(props.item.docId)'>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.status }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.requestor }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.title }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.start }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.end }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.halfDay }}</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-flex>
  </v-container>
</template>

<script>
  import NProgress from 'nprogress';
  import Constants from '../models/common.js';

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
        error: '',
      }
    },
    created() {
      NProgress.start();

      this.loaded = false;

      this.$store.dispatch('GET_EVENTS', { status: Constants.PENDING, user: this.$store.state.loggedInUser })
        .then(events => { 
          this.pendingRequests = events;
          this.loaded = true;
        })
        .catch((err) => {
          this.error = err;
        });

      NProgress.done();
    },
    computed: {
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
    }
  }

</script>