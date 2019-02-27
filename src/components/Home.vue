<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center">
        <h1>Home page</h1>
      </v-flex>
      <v-flex xs12 class="text-xs-center" mt-3 ml-5 mr-5>
        <full-calendar
          :config='config'
          :events='events'/>
          <!-- :event-sources='eventSources'
          @event-selected='eventSelected'/> -->
      </v-flex>
      <v-flex class="text-xs-center">
        <br/>
        <b>Public Holiday </b><v-icon color='red'>event</v-icon>
        <b>Annual </b><v-icon color='purple'>event</v-icon>
        <b>Compensation </b><v-icon color='yellow'>event</v-icon>
        <br/>
        <b>Carry Over </b><v-icon color='purple accent-1'>event</v-icon>
        <b>Sick </b><v-icon color='light-blue darken-2'>event</v-icon>
        <b>No Pay </b><v-icon color='orange'>event</v-icon>
        <br/>
        <b>Others </b><v-icon color='light-green accent-3'>event</v-icon>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import NProgress from 'nprogress';
import FullCalendar from 'vue-full-calendar';
import moment from 'moment-business-days';
import Constants from '../models/common.js';
import { CalendarEvent } from '../models/CalendarEvent';
import * as mutant from '../store/mutation-types';
import * as action from '../store/action-types';

export default {
  name: 'HomeCalendar',
  data () {
    return {
      loaded: false,
      events: [],
      // eventSources:[],
      // eventSelected: '',
      config: {
        weekends: false,
        defaultView: 'month',
        eventRender: function(event, element) {
        }
      },
    }
  },
  created() {
    NProgress.start();
    this.loaded = false;
    // fetch all holidays
    this.$store.dispatch(action.GET_HOLIDAYS, { startDate: moment().subtract(3, 'M'), endDate: moment().add(1, 'y') })
        .then(holidays => {
          let ce;

          holidays.forEach((h) => {
            // some fields aren't populated b/c they're not relevant for a Holiday
            // we just want to construct a CalendarEvent in order to use the toCalendarEvent()
            ce = new CalendarEvent(h.title, h.startDate, h.endDate, '', '', '', '', Constants.PENDING, null, '');
            ce = ce.toCalendarEvent();
            ce.cssClass = 'holiday';
            ce.textColor = 'red';
            ce.backgroundColor = 'white';
            ce.borderColor = 'grey lighten-2';
            this.events.push(ce);
          });
        })
        .catch((err) => {
          this.$store.commit(mutant.SET_ERROR, err.message);
        });
    // fetch all approved leave requests
    this.$store.dispatch(action.GET_EVENTS,
      { start: moment().subtract(6, 'M'), end: moment().add(1, 'y'), user: '', status: Constants.APPROVED })
      .then((events) => {
        events.forEach((e) => {
          let ce2;
          //console.log('each e:', e);
          ce2 = e.toCalendarEvent();
          if (e.leaveType == 'ANN') {
            ce2.color = 'purple';
          } else if (e.leaveType == 'COMP') {
            ce2.color = 'Gold';
          } else if (e.leaveType == 'CO') {
            ce2.color = 'pink';
          } else if (e.leaveType == 'SICK') {
            ce2.color = 'DodgerBlue';
          } else if (e.leaveType == 'NP') {
            ce2.color = 'orange';
          } else {
            ce2.color = 'Chartreuse';
          }
          this.events.push(ce2);
        });
        // console.log(this.events);
      })
      .catch((error) => {
        console.log(error);
        this.$store.commit(mutant.SET_ERROR, error);
      });
    this.loaded = true;
    NProgress.done();
  }
//  methods: {
//    next() {
//      this.$refs.calendar.fireMethod('next');
//    },
//  }
};
</script>

<style>
  .vue-holiday {
    background-color: #00a65a;
  }
</style>
