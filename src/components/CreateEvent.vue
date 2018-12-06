<template>
  <v-container grid-list-md text-xs-center>
    <h2>Apply New Leave</h2>
    <div v-if="error != ''" class='display-1' style='text-align: center; color: #ff0000'>
      {{ error }}
    </div>
    <v-flex xs12>
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
            <v-checkbox
              v-model='am' 
              label='AM' 
              box>
            </v-checkbox>
          </v-flex>
          <v-flex xs6>
            <v-checkbox
              v-model='pm' 
              label='PM' 
              box>
            </v-checkbox>
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
  import db from '../config/firebaseInit';
  import * as common from '../models/common.js';

  export default {
    name: 'CreateEvent',
    data() {
      return {
        error: '',
        drawer: false,
        title: '',
        loaded: false,
        //propId: '',
        startDate: new Date().toISOString().substr(0, 10),
        endDate: new Date().toISOString().substr(0, 10),
        am: false,
        pm: false,
        numDays: 0, // TODO useless, remove??
        menu1: false,
        menu2: false,
        sDate: new Date(),
        eDate: new Date(),
      };
    },
    watch: {
      'startDate': function(val, oldVal) {
        this.sDate = new Date(Date.parse(val));
        // console.log('watched start date')
      },
      'endDate': function(val, oldVal) {
        this.eDate = new Date(Date.parse(val));
        // console.log('start date, ' + this.sDate);
        // console.log('end date, ' + this.eDate);
        // console.log('watched end date');
      }
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

        // Let's figure out if user is applying for half day leave or not
        // both checked, so just ignore
        var halfDay = '';
        if (this.am && this.pm) {
          halfDay = '';
        } else if (this.am) {
          halfDay = 'AM';
        } else if (this.pm) {
          halfDay = 'PM';
        }
        const req = {
          title: this.title,
          user: this.$store.state.loggedInUser.email,
          startDate: this.sDate,
          endDate: this.eDate,
          halfDay: halfDay,
          status: 0,
        };

        this.$store.dispatch('ADD_EVENT', req)
          .then((docRef) => {
            // console.log('doc written with id, ', docRef.id);
            this.$router.push('/leaveRequests');
          }).catch((error) => {
            // TODO stay on page and display error to use
            console.error('error adding doc: ', error);
          });
      },
    }

  }
</script>
