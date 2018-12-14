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
              <tr @click='showDetails(props.item.docId)'>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.email }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysAnnualLeave }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysCompLeave }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysBooked }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysCarryOver }}</td>
                <td class='mdl-data-table__cell--non-numeric'>
                  {{ props.item.daysAnnualLeave + props.item.daysCarryOver + props.item.daysCompLeave - props.item.daysBooked }}
                </td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.isApprover }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.isAdmin }}</td>
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
import db from '../config/firebaseInit';

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
          text: 'Email',
          align: 'left',
          sortable: false, // TODO sortable true doesn't work
          value: 'name',
        },
        {
          text: 'Annual Leave',
          align: 'left',
          sortable: false,
          value: 'alDays',
        },
        {
          text: 'Compensation',
          align: 'left',
          sortable: false,
          value: 'compDays',
        },
        {
          text: 'Carry Over',
          align: 'left',
          sortable: false,
          value: 'carryOver',
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
        }
      ],
      users: [],
      alert: false,
    };
  },
  created() {
    NProgress.start();
    this.loaded = false;
    this.$store.dispatch('GET_USERS')
      .then(users => {
        this.users = users;
        this.loaded = true;
      })
      .catch((err) => {
        this.$store.commit('SET_ERROR', err.message);
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
    }
  },
  methods: {
    addProperty() {
      this.$router.push('/addUser')
    },
    showDetails(id) {
      this.$router.push(`/users/${id}`);
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