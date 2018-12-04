<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center" mt-5>
        <h1>Home page</h1>
      </v-flex>
      <v-flex xs12 class="text-xs-center" mt-3>
        <full-calendar :config='config' :events='events'/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import FullCalendar from 'vue-full-calendar';
import moment from 'moment';

export default {
  name: 'HomeCalendar',
  data () {
    // TODO load events from DB
    return {
      events: [
        {
          title: 'My Birthday',
          allDay: true,
          start: moment(),
          end: moment().add(1, 'd'),
          // employee: 'Wayland',
        },
                {
          title: 'Your Birthday',
          allDay: true,
          start: moment(),
          end: moment().add(1, 'd'),
          // employee: 'Wayland',
        },
                {
          title: 'My Birthday',
          allDay: true,
          start: moment(),
          end: moment().add(9, 'd'),
          // employee: 'Wayland',
        },
                {
          title: 'Your Birthday',
          allDay: false,
          start: moment(),
          end: moment().add(1, 'd'),
          // employee: 'Wayland',
        },
                {
          title: 'My Birthday',
          allDay: true,
          start: moment(),
          end: moment().add(1, 'd'),
          // employee: 'Wayland',
        },
                {
          title: 'Your Birthday',
          allDay: true,
          start: moment(),
          end: moment().add(1, 'd'),
          // employee: 'Wayland',
        }


      ],
      config: {
        defaultView: 'month',
        eventRender: function(event, element) {
          // console.log(event);
          // element.attr('employee', event.employee);
        }
      },
    }
  }
};
</script>