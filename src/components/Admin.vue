<template>
  <v-container grid-list-md>
    <v-flex xs10 offset-xs1 v-if="loaded">
      <div>
        <h2>Users</h2>
        <v-data-table :headers='headers' :items='users' hide-actions class='elevation-1'>
          <template slot='items' slot-scope='props'>
            <tr @click='showDetails(props.item.id)'>
              <!-- <td>{{ props.item.id }}</td> -->
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.email }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.admin }}</td>
              <td class='mdl-data-table__cell--non-numeric'>{{ props.item.approver }}</td>
            </tr>
          </template>
        </v-data-table>
        <!-- <v-flex class="text-xs-center" mt-5>
        <v-btn 
          color="primary"
          @click.stop="addProperty"
          >
          Add Property
        </v-btn>
        </v-flex> -->
      </div>
    </v-flex>
  </v-container>
</template>

<script>
import NProgress from 'nprogress';
import db from '../config/firebaseInit';

export default {
  name: 'UserList',
  data() {
    return {
      loaded: false,
      // setup the column headers for the data table
      headers: [
        // {
        //   text: '#',
        //   align: 'left',
        //   sortable: false,
        //   value: 'id',
        // },
        {
          text: 'Email',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Admin',
          align: 'left',
          sortable: true,
          value: 'admin',
        },
        {
          text: 'Approver',
          align: 'left',
          sortable: true,
          value: 'approver',
        },
      ],
      users: [],
    };
  },
  created() {
    NProgress.start();
    db
      .collection('userRoles')
      .orderBy('email')
      .get()
      .then((querySnapshot) => {
        this.loaded = false;
        console.log(querySnapshot.size);
        querySnapshot.forEach((doc) => {
          console.log(doc.data());
          const data = {
            email: doc.data().email,
            admin: doc.data().admin,
            approver: doc.data().approver,
          };
          this.users.push(data);
          console.log(data.size);
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
      this.$router.push('/addProperty')
    },
    showDetails(id) {
      this.$router.push(`/properties/${id}`);
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