<template>
  <v-container grid-list-md text-xs-center>
    <h1>Apply New Leave</h1><br/>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
    </v-flex>
    <v-flex xs12 mr-5 ml-5>
      <v-form>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field
              v-model='title' 
              label='Title' 
              autocomplete="off" 
              box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-select
              box
              v-model = 'halfDay'
              :items = 'duration'
              label = 'Full Day'>
            </v-select>
          </v-flex>
          <v-flex xs6>
            <v-select
            box
              v-model = 'leaveType'
              :items = 'leaveTypes'
              item-value = 'val'
              item-text = 'key'
              label = 'Leave Type'>
            </v-select>
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
              color="approve"
              @click.stop="createRequest"
              >
              Apply
            </v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
//  import db from '../config/firebaseInit';
  import Constants from '../models/common.js';
  import { CalendarEvent } from '../models/CalendarEvent';
  import * as mutant from '../store/mutation-types';
  import * as action from '../store/action-types';

  export default {
    name: 'CreateEvent',
    data() {
      return {
        drawer: false,
        title: '',
        loaded: false,
        startDate: new Date().toISOString().substr(0, 10),
        endDate: new Date().toISOString().substr(0, 10),
        numDays: 0, // TODO useless, remove??
        menu1: false,
        menu2: false,
        sDate: new Date(),
        eDate: new Date(),
        alert: false,
        leaveTypes: [
          {key: 'Annual', val: 'ANN'},
          {key:'Compensation', val: 'COMP'},
          {key: 'Carry Over', val: 'CO'}],
        leaveType: 'Annual',
        duration: ['Full', 'AM', 'PM'],
        halfDay: 'Full'
      };
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
    computed: {
      error() {
        return this.$store.state.error;
      },
      loading() {
        return this.$store.state.loading;
      },
    },
    methods: {
      /**
       * TODO this method is pretty useless as it doesn't subtract weekends and holidays
       * @param Date date1
       * @param Date date2
       */
      daysBetween(date1, date2) {
        //Get 1 day in milliseconds
        var one_day=1000*60*60*24;

        // Convert both dates to milliseconds
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();

        // Calculate the difference in milliseconds
        var difference_ms = date2_ms - date1_ms;
        // Convert back to days and return
        var result = Math.round(difference_ms/one_day);
        return result
      },
      createRequest() {
        // var aa = this.daysBetween(new Date(this.sDate), new Date(this.eDate));
        // console.log('num days, ' + aa);

        const niceTitle = this.$store.state.loggedInUser.firstName + '- ' + this.title;
        const req = new CalendarEvent(
          niceTitle,
          this.sDate,
          this.eDate,
          this.halfDay,
          this.$store.state.loggedInUser.email,
          '', // approver is set when someone approves
          Constants.PENDING,
          null, // docId is populated on a fetch
          this.leaveType,
        );
console.log(req);
        this.$store.dispatch(action.ADD_EVENT, req.toJSON())
          .then((docRef) => {
            // console.log('doc written with id, ', docRef.id);
            this.$router.push('/leaveRequests');
          }).catch((error) => {
            this.$store.commit(mutant.SET_ERROR, error.message);
            console.error('error adding doc: ', error);
          });
      },
    }

  }
</script>

<style>
  .mytext {
    display: inline-block;
    vertical-align: middle;
  }
</style>