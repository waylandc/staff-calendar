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
          this.events.push(e.toCalendarEvent());
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