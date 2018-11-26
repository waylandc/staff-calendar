<template>
  <v-container grid-list-md text-xs-center>
    <v-flex xs10 offset-xs1 v-if="loaded">
      <div>
        <h2>Pending Leave Requests</h2>
        <v-data-table :headers='headers' :items='pendingRequests' hide-actions class='elevation-1'>
          <template slot='items' slot-scope='props'>
            <tr @click='showDetails(props.item.id)'>
              <!-- <td>{{ props.item.id }}</td> -->
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.status }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.requestor }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.title }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.start.format('YYYY MM DD') }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.end.format('YYYY MM DD') }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.halfDay }}</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-flex>
  </v-container>
</template>

<script>
  import db from '../config/firebaseInit';
  import NProgress from 'nprogress';
  import moment from 'moment';
  import Constants from '../config/common.js';

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
            sortable: true,
            value: 'endDate',
          },
          {
            text: 'All Day',
            align: 'left',
            sortable: true,
            value: 'allDate',
          },
          {
            text: 'Half Day',
            align: 'left',
            sortable: true,
            value: 'halfDay',
          },
        ],
        loaded: false,
        pendingRequests: [],
      }
    },
    created() {
      NProgress.start();

      // let's load all pending requests
      // TODO only load requests for current user, unless approver
      db.collection('leaveRequests').where('status', '==', Constants.PENDING).get()
      .then(
        (snaps) => {
            this.loaded = false;
            snaps.forEach((req) => {
            var a = {
              id: req.id,
              title: req.data().title,
              allDay: req.data().allDay,
              start: moment(),
              end: moment().add(2, 'd'),
              halfDay: req.data().halfDay,
              requestor: req.data().user,
              status: req.data().status,
            }
            console.log(req.id);
            this.pendingRequests.push(a);
          });
          this.loaded = true;
          // console.log(this.pendingRequests)
        },
      )
      .catch((error) => {
        console.log(error);
      });
      NProgress.done();
    },
    computed: {
      loading() {
        return this.$store.state.loading;
      },
    },
    methods: {
      showDetails(id) {
        console.log('showDetails ' + id);
        this.$router.push(`/leaveRequests/${id}`);
      },
    }
  }

</script>