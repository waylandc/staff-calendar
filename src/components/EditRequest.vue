<template>
  <v-container grid-list-md text-xs-center>
    <h1>Edit Request</h1><br/>
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
          <v-flex xs6>
            <v-select
            box
              v-model = 'firstApprover'
              :items = 'approvers'
              item-value = 'val'
              item-text = 'key'
              label = 'First Approver'>
            </v-select>
          </v-flex>
          <v-flex xs6>
            <v-select
            box
              v-model = 'secondApprover'
              :items = 'approvers'
              item-value = 'val'
              item-text = 'key'
              label = 'Second Approver'>
            </v-select>
          </v-flex>
          <v-flex class="text-xs-center" mt-5>
            <v-btn
              color="approve"
              @click.stop="updateRequest"
              >
              Save Changes
            </v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
  import moment from 'moment';
  import db from '../config/firebaseInit';
  import Constants from '../models/common.js';
  import { CalendarEvent } from '../models/CalendarEvent';
  import * as mutant from '../store/mutation-types';
  import * as action from '../store/action-types';

  export default {
    name: 'EditRequest',
    data() {
      return {
        drawer: false,
        title: '',
        loaded: false,
        startDate: new Date().toISOString().substr(0, 10),
        endDate: new Date().toISOString().substr(0, 10),
        startString: '',
        endString: '',
        numDays: 0, // TODO useless, remove??
        menu1: false,
        menu2: false,
        sDate: new Date(),
        eDate: new Date(),
        alert: false,
        leaveTypes: [
          {key: 'Annual', val: 'ANN'},
          {key:'Compensation', val: 'COMP'},
          {key: 'Carry Over', val: 'CO'},
	        {key: 'Sick', val: 'SICK'},
          {key: 'Birthday Leave', val: 'BL'}],
        leaveType: 'ANN',
        duration: ['Full', 'AM', 'PM'],
        halfDay: 'Full',
        firstApprover: '',
        secondApprover: '',
        approvers: [],
        request: '',
        dob: '',
      };
    },
    created() {
      this.loaded = false;
      this.propId = this.$route.params.id;
      //fetch approvers
      this.$store.dispatch(action.GET_APPROVERS)
        .then((approvers) => {
          this.approvers = approvers;
          //console.log(this.approvers);
        })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error);
        })
      const docRef = db.collection('leaveRequests').doc(this.propId);
      // fetch leaveRequest document which is a JSON object and convert to CalendarEvent
      docRef.get().then((doc) => {
        if (doc.exists) {
          this.request = CalendarEvent.fromJSON(doc.data());
          this.documentRef = docRef;
        } else {
          this.$store.commit(mutant.SET_ERROR, 'Error, No such document');
          console.log(this.error);
        }}).then(() => {
          this.title = this.request.title;
          this.halfDay = this.request.halfDay;
          this.leaveType = this.request.leaveType;
          this.startDate = moment(this.request.startDate.toDate()).format().substr(0,10);
          this.endDate = moment(this.request.endDate.toDate()).format().substr(0,10);
          this.firstApprover = this.request.firstApprover;
          this.secondApprover = this.request.secondApprover;
          this.loaded = true;
        })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error);
        })
      this.getDob();
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
        // default is 8am which doesn't work because it doesn't really show up as day off on the end day
        this.eDate.setHours(23);
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
      getDob() {
        //get DOB

        this.userId = this.$store.state.loggedInUser.docId;
        const docRef = db.collection('users').doc(this.userId);

        docRef.get().then((doc) => {
          if (doc.exists) {
            //console.log(doc.data());
            this.dob = (doc.data().dob);
            console.log('found dob, ', this.dob);
          } else {
            this.$store.commit(mutant.SET_ERROR, 'Error, user does not exist');
            console.log('error loading user, ', this.userId);
          }
        })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error.message);
          console.log('Error getting document: ', error);
        });
      },
      validateRequest() {
        // console.log(this.leaveType, ', day of year, ', moment(this.eDate).dayOfYear());
        // dayOfYear 90 is March 31, deadline for which carry over leave must be used by
        if (this.leaveType === 'CO' && moment(this.eDate).dayOfYear() > 90) {
          this.$store.commit(mutant.SET_ERROR, 'Carry Over leave must be taken before March 31');
          return false;
        } else if (this.leaveType === 'BL') {
            if ((moment(this.eDate).dayOfYear() - moment(this.sDate).dayOfYear()) !== 0) {
              this.$store.commit(mutant.SET_ERROR, 'Birthday Leave has only one day');
              return false;
            }
            //console.log('showing raw birthday...', this.dob);
            //console.log('showing birthday...', moment(this.dob, 'MMDD').format());
            var a = moment(this.dob, 'MMDD');
            var b = moment(this.eDate);
            var diff = b.diff(a, 'days', true);
            //console.log('difference...', diff);
            if (diff > 8 || diff <0) {
              //console.log('should return false and error...');
              this.$store.commit(mutant.SET_ERROR, 'Birthday Leave should be on that day, or within one week (under discretion)');
              return false;
            }
        }

        if (this.firstApprover == this.$store.state.loggedInUser.email ||
        this.secondApprover == this.$store.state.loggedInUser.email) {
          this.$store.commit(mutant.SET_ERROR, 'Approver cannot be yourself!');
          return false;
        }

        return true;
      },
      updateRequest() {
        if (!this.validateRequest()) {
          return;
        }
        // var aa = this.daysBetween(new Date(this.sDate), new Date(this.eDate));
        // console.log('num days, ' + aa);

        const req = new CalendarEvent(
          this.title,
          this.sDate,
          this.eDate,
          this.halfDay,
          this.$store.state.loggedInUser.email,
          this.firstApprover,
          this.secondApprover,
          Constants.PENDING,
          Constants.PENDING,
          '',
          '',
          this.propId,
          this.leaveType,
        );
        this.$store.dispatch(action.EDIT_EVENT, [this.propId, req.toJSON()])
          .then((docRef) => {
            console.log('id overwritten with changes');
            this.$router.push({ path: '/leaveRequests' });
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
