<template>
  <v-container grid-list-md text-xs-center>
    <h2>Holidays</h2><br/>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
      <v-alert v-if="saved" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
        {{ successMessage }}
      </v-alert>
    </v-flex>
    <div id='adminPanel'>
        <v-form>
          <v-layout row wrap>
            <v-flex xs6>
              <v-text-field
                v-model='newTitle' 
                label='Title' 
                autocomplete="off" 
                box>
              </v-text-field>
            </v-flex>
            <v-flex xs6>
              <v-text-field
                v-model='newCountry' 
                label='Country' 
                autocomplete="off" 
                box>
              </v-text-field>
            </v-flex>
            <v-flex xs6>
              <v-menu
                :close-on-content-click="false"
                v-model="menu1"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >            
                <v-text-field
                  slot='activator'
                  v-model='startDate'
                  label='Start Date'
                  prepend-icon='event'
                  readonly></v-text-field>
                <v-date-picker
                  v-model='startDate'
                  @input='menu1 = false'>
                </v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs6>
              <v-menu
                :close-on-content-click="false"
                v-model="menu2"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot='activator'
                  label='End Date'
                  v-model='endDate'
                  prepend-icon='event'
                  readonly></v-text-field>
                <v-date-picker
                  v-model='endDate'
                  @input='menu2 = false'>
                </v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex class="text-xs-center" mt-5>
              <v-btn
                color = "approve"
                @click.stop = "createHoliday"
              >
                Create Holiday
              </v-btn>
            </v-flex>
          </v-layout>
        </v-form>
    </div>
    <v-layout row wrap>
      <v-flex xs12 v-if="loaded">
        <div>
          <v-data-table :headers='headers' :items='holidays' hide-actions dark class='elevation-1'>
            <template slot='items' slot-scope='props'>
              <tr>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.startDate.toDate().toDateString() }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.title }}</td>
                <td class='mdl-data-table__cell--non-numeric'>{{ props.item.country }}</td>
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
import * as action from '../store/action-types';
	import * as mutant from '../store/mutation-types';

export default {
  data() {
    return {
      headers: tableHeaders,
      holidays: [],
      loaded: false,
      alert: false,
      // this is a string, default date for datepicker
      startDate: new Date().toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),    // this is a string
      menu1: false,
      menu2: false,
      newTitle: '',
      newCountry: 'Hong Kong',
      sDate: new Date(),  // this is a Date
      eDate: new Date(),  // this is a Date
      saved: false,
      successMessage: '',
    }
  },
  mounted() {
    // this needs to be done in mounted or else the DOM doesn't exist yet

    // only display the create holiday pane if user is admin
    var x = document.getElementById('adminPanel');

    if (this.$store.state.loggedInUser.isAdmin) {
      x.style.display = 'block';
    } else {
      x.style.display = 'none';
    }
  },
  created() {
    this.loaded = false;
    this.fetchData();
    NProgress.done();

  },
  methods: {
    fetchData() {
    this.$store.dispatch(action.GET_HOLIDAYS, 
      { startDate: moment().subtract(1, 'y'), endDate: moment().add(1, 'y') })
      .then(holidays => {
        this.holidays = holidays;
        this.loaded = true;
      })
      .catch((err) => {
        this.$store.commit(mutant.SET_ERROR, err.message);
      });

    },
    createHoliday() {
      const newHoliday = {
        title: this.newTitle,
        startDate: this.sDate,
        endDate: this.eDate,
        country: this.newCountry,
      };
      this.$store.dispatch(action.ADD_HOLIDAY, newHoliday)
        .then((docRef) => {
          this.successMessage = 'Successfully created';
          this.saved = true;
        }).catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error.message);
          console.error('error adding doc: ', error);
        });

    },
    dismissClicked() {
      this.successMessage = '';
      this.saved = false;
      // refetch data to refresh
      this.fetchData();
      // empty out the form
      this.startDate = new Date().toISOString().substr(0, 10);  // this is a string
      this.endDate = new Date().toISOString().substr(0, 10);    // this is a string
      this.newTitle= '';
      this.newCountry = 'Hong Kong';
      this.sDate = new Date();  // this is a Date
      this.eDate = new Date();  // this is a Date
      
    },
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
    // The calendar uses strings so we use this method to parse the string
    // and return a Date object to store
    'startDate': function(val, oldVal) {
      this.sDate = new Date(Date.parse(val));
      // console.log('watched start date')
    },
    'endDate': function(val, oldVal) {
      this.eDate = new Date(Date.parse(val));
      // console.log('start date, ' + this.sDate);
      // console.log('end date, ' + this.eDate);
      // console.log('watched end date');
    },
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

  const tableHeaders = [
    {
      text: 'Date',
      align: 'left',
      sortable: true,
      value: 'startDate',
    },
    {
      text: 'Holiday',
      align: 'left',
      sortable: false,
      value: 'title',
    },
    {
      text: 'Country',
      align: 'left',
      sortable: false,
      value: 'country',
    },

  ]
</script>

<style scoped>
  .mdl-data-table__cell--non-numeric {
    font-size: 14px;
    text-align: left;
  }
</style>
