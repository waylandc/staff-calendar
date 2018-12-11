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
import moment from 'moment';

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
    this.$store.dispatch('GET_SOME_EVENTS',
      { start: moment().subtract(6, 'M'), end: moment().add(1, 'y'), user: '' })
      .then((events) => {
        events.forEach((e) => {
          this.events.push(e.toCalendarEvent());
        });
        console.log(this.events);
      })
      .catch((error) => {
        console.log(error);
        this.$store.commit('SET_ERROR', error);
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