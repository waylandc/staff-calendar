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
            <v-text-field label="Select pdf" @click='pickFile' v-if="leaveType == 'SICK' || leaveType == 'COMP'
            || leaveType == 'EXAM' || leaveType == 'MAT' || leaveType == 'PAT'
            || leaveType == 'MAR'" v-model='imageName' prepend-icon='attach_file'>
            </v-text-field>
              <input
                type="file"
                style="display: none"
                ref="image"
                accept="application/pdf"
                @change="onFilePicked"
              >
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
  import moment from 'moment-business-days';
  import db from '../config/firebaseInit';
  import Constants from '../models/common.js';
  import { CalendarEvent } from '../models/CalendarEvent';
  import { createUserModel } from '../models/User';
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
          {key: 'Carry Over', val: 'CO'},
	        {key: 'Sick', val: 'SICK'},
          {key: 'Birthday Leave', val: 'BL'},
          {key: 'No Pay', val: 'NP'},
          {key: 'Examination Leave', val: 'EXAM'},
          {key: 'Maternity Leave', val: 'MAT'},
          {key: 'Paternity Leave', val: 'PAT'},
          {key: 'Marriage Leave', val: 'MAR'},
          {key: 'Jury', val: 'JURY'},
          {key: 'Compassionate Leave', val: 'COMPA'},

          ],
        leaveType: 'ANN',
        duration: ['Full', 'AM', 'PM'],
        halfDay: 'Full',
        firstApprover: '',
        secondApprover: '',
        approvers: [],
        dob: '',
        imageName: '',
        imageUrl: '',
        imageFile: '',
        selfHolidays: [],
      };
    },
    created() {
      this.loaded = false;
      this.$store.dispatch(action.GET_APPROVERS)
        .then((approvers) => {
          this.approvers = approvers;
          //console.log(this.approvers);
          this.loaded = true;
        })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error);
        })
      this.getDob();
      this.getSelfHolidays();
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
        // hack, needed to set end time to this for multi day leaves to display correctly
        this.eDate.setHours(23);
        this.eDate.setMinutes(59);
        this.eDate.setSeconds(59);
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
            console.log(doc.data());
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

      getSelfHolidays() {
        //get all pending
        this.$store.dispatch(action.GET_EVENTS,
        {
          start: moment().startOf('year'), 
          end: moment().endOf('year'),
          status: Constants.PENDING,
          user: this.$store.state.loggedInUser.email
        })
        .then(events => {
          this.pendingRequests = events;
          console.log('list out the pending requests', this.pendingRequests);
          events.forEach((entry)=> {
            this.selfHolidays.push(entry);
            })
          //console.log(this.selfHolidays);
        })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error);
          return false
        });

        //get all approved
        this.$store.dispatch(action.GET_EVENTS,
        {
          start: moment().startOf('year'), 
          end: moment().endOf('year'),
          status: Constants.APPROVED,
          user: this.$store.state.loggedInUser.email
        })
        .then(events => {
          this.pendingRequests = events;
          console.log('list out the approved requests', this.pendingRequests);
          events.forEach((entry)=> {
            this.selfHolidays.push(entry);
            })
          //console.log(this.selfHolidays);
          })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error);
          return false
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
  //          console.log('showing raw birthday...', this.dob);
  //          console.log('showing birthday...', moment(this.dob, 'MMDD').format());
            if (typeof this.dob === "undefined") {
              this.$store.commit(mutant.SET_ERROR, 'date of birth cannot be read, try to refresh page and try again');
              return false;
            }
        } else if (this.leaveType == 'COMP' || this.leaveType == 'EXAM' || this.leaveType == 'MAT'
            || this.leaveType == 'PAT' || this.leaveType == 'MAR') {
          if (this.imageFile == '') {
            this.$store.commit(mutant.SET_ERROR, 'Please attach proof copy');
            console.log('sensed error..');
            return false;
          }
        } else if (this.leaveType == 'SICK' && (moment(this.eDate).diff(moment(this.sDate), 'days') > 1)) {
          console.log(moment(this.eDate).diff(moment(this.sDate), 'days'));
          // sick leaves more than 1 day require a doctors note
          if (this.imageFile == '') {
            this.$store.commit(mutant.SET_ERROR, 'Please attach proof copy');
            console.log('sensed error..');
            return false;
          }
        }
        if (this.firstApprover === '') {
          this.$store.commit(mutant.SET_ERROR, 'You must specify at least one approver');
          return false;
        }

        if (this.firstApprover == this.secondApprover) {
          this.$store.commit(mutant.SET_ERROR, 'Approvers should be different');
          return false;
        }

        if (this.firstApprover == this.$store.state.loggedInUser.email ||
        this.secondApprover == this.$store.state.loggedInUser.email) {
          this.$store.commit(mutant.SET_ERROR, 'Approver cannot be yourself!');
          return false;
        }

        if (this.halfDay != 'Full') {
          if (moment(this.sDate).dayOfYear()
          - moment(this.eDate).dayOfYear() != 0 ) {
            this.$store.commit(mutant.SET_ERROR, 'A half day leave should be within a day');
            return false;
          }
        }

        //start and end of request must not be weekend
        if ((moment(this.sDate).isBusinessDay() && moment(this.eDate).isBusinessDay()) == false) {
          this.$store.commit(mutant.SET_ERROR, 'Leave should not be starting or ending on weekend');
          return false;
        }

        //check own request overlaps
        var sDateSimple = moment(this.sDate).format("DDMMMYYYY");
        var eDateSimple = moment(this.eDate).format("DDMMMYYYY");
        //console.log('start and end of the request: ', sDateSimple, 'and', eDateSimple);
        for (var i = 0; i < this.selfHolidays.length; i++) {
          
          // this IF allows 2 non conflicting half day leaves on same day by short circuiting the
          // following clash detection
          if (this.selfHolidays[i].halfDay != 'Full' 
              && moment(this.selfHolidays[i].startDate.format("DDMMMYYYY")).isSame(sDateSimple)
              && this.selfHolidays[i].halfDay != this.halfDay) {
                continue;
          }

          let cri1 = moment(sDateSimple, "DDMMMYYYY").diff(moment(this.selfHolidays[i].startDate.format("DDMMMYYYY"))) > 0; //new request is later than the ith holiday
          let cri2 = moment(eDateSimple, "DDMMMYYYY").diff(moment(this.selfHolidays[i].endDate.format("DDMMMYYYY"))) < 0; //new request is older than the ith holiday
          if ((cri1 || cri2) == false) {
            console.log('error in: ', sDateSimple, eDateSimple, this.selfHolidays[i].startDate, this.selfHolidays[i].endDate);
            this.$store.commit(mutant.SET_ERROR, 'Your leave request clashed with your previous approved/pending requests!');
            return false;
          }
        }

        return true;
      },


      createRequest() {
        if (!this.validateRequest()) {
          return;
        }
        // var aa = this.daysBetween(new Date(this.sDate), new Date(this.eDate));
        // console.log('num days, ' + aa);

        const niceTitle = this.$store.state.loggedInUser.firstName + ' - ' + this.title;
        const req = new CalendarEvent(
          niceTitle,
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
          null, // docId is populated on a fetch
          this.leaveType,
        );
        if (this.halfDay !== 'Full') {
          console.log('half day applied, applying hours to date')
          if (this.halfDay === 'AM') {
            this.sDate.setHours(9)
          } else if (this.halfDay === 'PM') {
            this.sDate.setHours(12)
          }
        }

        console.log(req);
        this.$store.dispatch(action.ADD_EVENT, req.toJSON())
          .then((docRef) => {
            console.log('doc written with id, ', docRef);
            //this.$router.push({ path: '/leaveRequests' });
          }).catch((error) => {
            this.$store.commit(mutant.SET_ERROR, error.message);
            console.log(error)
          }).then(()=> {
            if (this.imageFile != '') {
              var sDateSimple = moment(this.sDate).format("DDMMMYYYY");
              var eDateSimple = moment(this.eDate).format("DDMMMYYYY");
              if (this.leaveType == 'SICK') {
                var aggrString = 'sick-leave-copy/'+this.$store.state.loggedInUser.email+'/'
                                  +sDateSimple+'-to-'+eDateSimple+'.pdf';
                console.log('aggrstring: ', aggrString);
              } else if (this.leaveType == 'COMP') {
                var aggrString = 'compensation-leave-copy/'+this.$store.state.loggedInUser.email+'/'
                                  +sDateSimple+'-to-'+eDateSimple+'.pdf';
              } else if (this.leaveType == 'EXAM') {
                var aggrString = 'exam-leave-copy/'+this.$store.state.loggedInUser.email+'/'
                                  +sDateSimple+'-to-'+eDateSimple+'.pdf';
              } else if (this.leaveType == 'MAT') {
                var aggrString = 'maternity-leave-copy/'+this.$store.state.loggedInUser.email+'/'
                                  +sDateSimple+'-to-'+eDateSimple+'.pdf';
              } else if (this.leaveType == 'PAT') {
                var aggrString = 'paternity-leave-copy/'+this.$store.state.loggedInUser.email+'/'
                                  +sDateSimple+'-to-'+eDateSimple+'.pdf';
              } else if (this.leaveType == 'MAR') {
                var aggrString = 'marriage-leave-copy/'+this.$store.state.loggedInUser.email+'/'
                                  +sDateSimple+'-to-'+eDateSimple+'.pdf';
              }

              this.$store.dispatch(action.UPLOAD_SL, [this.imageFile, aggrString])
              .then((res)=>{
                //response
                console.log(aggrString,' uploaded', res);
                this.$router.push({ path: '/leaveRequests' });
              }).catch((error) => {
                this.$store.commit(mutant.SET_ERROR, error.message);
                console.error('error adding doc: ', error);
              });

            } else {
              this.$router.push({ path: '/leaveRequests' });
            }
        });
      },

        pickFile () {
            this.$refs.image.click ()
        },

        onFilePicked (e) {
        const files = e.target.files
        if(files[0] !== undefined) {
        this.imageName = files[0].name
        if(this.imageName.lastIndexOf('.') <= 0) {
          return
        }
        const fr = new FileReader ()
        fr.readAsDataURL(files[0])
        fr.addEventListener('load', () => {
          this.imageUrl = fr.result
          this.imageFile = files[0] // this is an image file that can be sent to server...
          //console.log('file becomes ', this.imageFile);
        })
        } else {
          this.imageName = ''
          this.imageFile = ''
          this.imageUrl = ''
        }
        }
    }

  }
</script>

<style>
  .mytext {
    display: inline-block;
    vertical-align: middle;
  }
</style>
