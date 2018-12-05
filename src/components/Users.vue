<template>
  <v-container grid-list-md>
    <v-flex xs10 offset-xs1 v-if="loaded">
      <div>
        <h2>Users</h2>
        <v-data-table :headers='headers' :items='users' hide-actions class='elevation-1'>
          <template slot='items' slot-scope='props'>
            <tr @click='showDetails(props.item.id)'>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.email }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysAnnualLeave }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysCompensation }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysBooked }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.daysCarryOver }}</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-flex>
  </v-container>
</template>

<script>
import NProgress from 'nprogress';
import db from '../config/firebaseInit';

// This page should only be viewable by admin/approvers for privacy issues
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
          sortable: true,
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
      ],
      users: [],
    };
  },
  created() {
    NProgress.start();
    // TODO should we put this in API??
    db
      .collection('users')
      .orderBy('email')
      .get()
      .then((querySnapshot) => {
        this.loaded = false;
        querySnapshot.forEach((doc) => {
          var data = {
            id: doc.id,
            email: doc.data().email,
            daysAnnualLeave: doc.data().daysAnnualLeave,
            daysCompensation: doc.data().daysCompLeave,
            daysCarryOver: doc.data().daysCarryOver,
            daysBooked: doc.data().daysBooked,
          };
          this.users.push(data);
        });
        this.loaded = true;
      });

    NProgress.done();
  },
  computed: {
    loading() {
      return this.$store.state.loading;
    },
  },
  methods: {
    addProperty() {
      this.$router.push('/addUser')
    },
    showDetails(id) {
      this.$router.push(`/users/${id}`);
    },
  },
};
</script>

// not sure how to change fonts. I could've created custom class but didn't want to add it everywhere so this seems to 
// override it within this component
<style scoped>
  .mdl-data-table__cell--non-numeric {
    font-size: 12px;
  }
</style>