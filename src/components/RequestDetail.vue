<template>
    <v-container grid-list-md text-xs-center>
	<h1>Request Details</h1><br/>
	<v-flex>
	    <v-alert type="error" dismissible v-model="alert">
		{{ error }}
	    </v-alert>
	</v-flex>
	<v-layout row wrap>
	    <v-flex xs12 v-if="loaded" ml-5 mr-5>
		<v-form @submit.prevent>
		    <v-layout row wrap>
			<v-flex xs6>
			    <v-text-field
				v-model='request.title'
					 label='Title'
					 autocomplete="off"
					 :readonly="true"
					 box>
			    </v-text-field>
			</v-flex>
      <v-flex xs6>
			    <v-text-field
            v-model='startString'
            label='Days Remaining'
            autocomplete="off"
            :readonly="true"
            box>
			    </v-text-field>

      </v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model='startString'
					 label='Start Date'
					 autocomplete="off"
					 :readonly="true"
					 box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model = 'endString'
					   label = 'End Date'
					   autocomplete = "off"
					   :readonly = "true"
					   box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model = 'request.halfDay'
					   label = 'Half Day'
					   :readonly = "true"
					   box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model = 'this.convertLeaveType'
					   label = 'Leave Type'
					   :readonly = "true"
				box>
			    </v-text-field>
          <v-text-field
        v-model = 'this.requestorDob'
             label = 'Birthday'
             v-if="this.convertLeaveType === 'Birthday Leave'"
             :readonly = "true"
        box>
          </v-text-field>
          <v-btn small v-if="['Sick','Examination Leave',
          'Compensation','Maternity Leave','Paternity Leave',
          'Marriage Leave'].includes(this.convertLeaveType)"
            color="green"
            @click.stop="downloadAttachment" > Download proof scan copy
          </v-btn>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
					v-model = 'aggrStatus'
						label = 'Status'
						:readonly = "true"
					box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model='request.requestor'
					 label='Requestor'
					 autocomplete = "name"
					 :readonly = "true"
					 box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model='request.firstApprover'
					 label='First Approver'
					 autocomplete = "name"
					 :readonly = "true"
					 box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model = 'request.firstComment'
					   label = 'Approver Comments'
					   :readonly = '!canApproveReject'
					   box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model='request.secondApprover'
					 label='Second Approver'
					 autocomplete = "name"
					 :readonly = "true"
					 box>
			    </v-text-field>
			</v-flex>
			<v-flex xs6>
			    <v-text-field
				v-model = 'request.secondComment'
					   label = 'Approver Comments'
					   :readonly = '!canApproveReject'
					   box>
			    </v-text-field>
			</v-flex>
      <v-flex v-if="this.user.email == this.request.requestor && this.getStatus(this.request.aggregateStatus()) == 'Pending'" class="text-xs-center" mt-5>
			    <v-btn
				color="reject"
				       @click.stop="deleteRequest"
			    >
				Delete
			    </v-btn>
			</v-flex>
      <v-flex v-if="canApproveReject" class="text-xs-center" mt-5>
			    <v-btn
				color="approve"
				       @click.stop="approve"
			    >
				Approve
			    </v-btn>
			    <v-btn
				color="reject"
				       @click.stop="reject"
			    >
				Reject
			    </v-btn>
			</v-flex>
		    </v-layout>
		</v-form>
	    </v-flex>
	</v-layout>
    </v-container>
</template>

<script>
import moment from 'moment-business-days';
import { isNullOrUndefined } from 'util';
import db from '../config/firebaseInit';
import firebase from 'firebase';
import { CalendarEvent } from '../models/CalendarEvent';
import Constants from '../models/common.js';
import * as mutant from '../store/mutation-types';
import * as action from '../store/action-types';

export default {
	name: 'RequestDetail',
	data() {
		return {
			// TODO can/should we move leaveTypes to Constants?
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
			drawer: false,
			request: '',	// CalendarEvent object
			loaded: false,
			propId: '',
			startString: '',
			endString: '',
			user: null,
      requestorDob: '',
			documentRef: null,
			alert: false,
      copyUrl: '',
      approvedAnn: 0,
      approvedCo: 0,
      userDetails: '',
      holidays: [],
		};
	},
	created() {
    this.user = this.$store.state.loggedInUser;
    console.log('user has ', this.user.daysAnnualLeave)
		this.loaded = false;
		this.propId = this.$route.params.id;
		const docRef = db.collection('leaveRequests').doc(this.propId);
		// fetch leaveRequest document which is a JSON object and convert to CalendarEvent
		docRef.get().then((doc) => {
			if (doc.exists) {
				this.request = CalendarEvent.fromJSON(doc.data());
				this.documentRef = docRef;
				this.loaded = true;
        console.log(this.request);
			} else {
				this.$store.commit(mutant.SET_ERROR, 'Error, No such document');
				console.log(this.error);
			}
		}).catch((error) => {
			this.$store.commit(mutant.SET_ERROR, 'Error loading document');
			console.log('error getting document: ', error);
		}).then(() => {
      this.getRequestorDob(this.request.requestor);
      //console.log(this.documentRef);
    })
	},
	computed: {
		aggrStatus() {
			return this.getStatus(this.request.aggregateStatus());
		},
		error() {
			return this.$store.state.error;
		},
		loading() {
			return this.$store.state.loading;
		},

		canApproveReject() {
			// check loggedInUser is approver first, then check state of this request
			return (this.$store.state.loggedInUser.isApprover &&
				this.request.canApproveOrReject(this.$store.state.loggedInUser.email));
		},
		convertLeaveType() {
			// Perform a reverse lookup of the leave type description based on the code
			// stored in database
			const a = this.leaveTypes.filter((lt) => lt.val === this.request.leaveType);
			// console.log(a[0]);
			if (a[0] !== undefined) {
				return a[0].key;
			} else {
				return '';
			}
		},
	},
	methods: {
		// 1. rejections must include a comment
		validateRejection() {
			if (this.$store.state.loggedInUser.email === this.request.firstApprover) {
				return (this.request.firstComment !== '');
			}
			if (this.$store.state.loggedInUser.email === this.request.secondApprover) {
				return (this.request.secondComment !== '');
			}
		},
    downloadAttachment() {

      var startDateSimple = moment(this.request.startDate.toDate()).format("DDMMMYYYY");
      var endDateSimple = moment(this.request.endDate.toDate()).format("DDMMMYYYY");
      //console.log(this.request.leaveType, this.request.requestor,startDateSimple,endDateSimple);
      if (this.request.leaveType == 'SICK') {
        var aggrString = 'sick-leave-copy/'+this.request.requestor+'/'
                          +startDateSimple+'-to-'+endDateSimple+'.pdf';
        console.log('aggrstring: ', aggrString);
      } else if (this.request.leaveType == 'COMP') {
        var aggrString = 'compensation-leave-copy/'+this.request.requestor+'/'
                          +startDateSimple+'-to-'+endDateSimple+'.pdf';
      } else if (this.request.leaveType == 'EXAM') {
        var aggrString = 'exam-leave-copy/'+this.request.requestor+'/'
                          +startDateSimple+'-to-'+endDateSimple+'.pdf';
      } else if (this.request.leaveType == 'MAT') {
        var aggrString = 'maternity-leave-copy/'+this.request.requestor+'/'
                          +startDateSimple+'-to-'+endDateSimple+'.pdf';
      } else if (this.request.leaveType == 'PAT') {
        var aggrString = 'paternity-leave-copy/'+this.request.requestor+'/'
                          +startDateSimple+'-to-'+endDateSimple+'.pdf';
      } else if (this.request.leaveType == 'MAR') {
        var aggrString = 'marriage-leave-copy/'+this.request.requestor+'/'
                          +startDateSimple+'-to-'+endDateSimple+'.pdf';
      }
      //console.log("sdate: ", startDateSimple);
      console.log('downloading: ', aggrString);
      firebase.storage().ref().child(aggrString)
      .getDownloadURL().then(function(url) {
        // `url` is the download URL for 'images/stars.jpg'

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(event) {
          var blob = xhr.response;

          let a = document.createElement("a");
          a.style = "display: none";
          document.body.appendChild(a);

          let url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = aggrString;

          a.click();

          window.URL.revokeObjectURL(url);
        };
        xhr.open('GET', url);
        xhr.send();
      }).catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error.message);
        console.log(error);
      });
    },
     getRequestorDob(person) {
      console.log('start to find dob of ', person);
      const docRef = db.collection('users').where('email', '==', person);

      docRef.get().then((snapshot) => {
        if(snapshot.empty) {
          console.log('no matching documents');
          return;
        }
        snapshot.forEach(doc => {
          this.requestorDob = moment(doc.data().dob, "MMDD").format("ddd MMM D YYYY");
          //console.log(this.requestorDob);
        })
      })
      .catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error.message);
        console.log('Error getting document: ', error);
      });
     },
     getPublicHolidays() {
       this.$store.dispatch(action.GET_HOLIDAYS,
         { startDate: moment().subtract(1, 'y'), endDate: moment().add(1, 'y') })
         .then(holidays => {
           this.holidays = holidays;
           console.log('holidays,', this.holidays);
           this.fetchUser();
         })
         .catch((err) => {
           this.$store.commit(mutant.SET_ERROR, err.message);
         });
     },
    deleteRequest() {
      var item = this.request;
      console.log('item is ', item);
      this.$store.dispatch(action.DELETE_REQUEST, this.documentRef.id)
        .then(() => {
          this.$router.push({ path: `/leaveRequests` });
        })
        .then(() => {
          var startDateSimple = moment(this.request.startDate.toDate()).format("DDMMMYYYY");
          var endDateSimple = moment(this.request.endDate.toDate()).format("DDMMMYYYY");
          if (['SICK','COMP','EXAM','MAT','PAT','MAR'].includes(item.leaveType)) {
            if (this.request.leaveType == 'SICK') {
              var aggrString = 'sick-leave-copy/'+this.request.requestor+'/'
                                +startDateSimple+'-to-'+endDateSimple+'.pdf';
              console.log('aggrstring: ', aggrString);
            } else if (this.request.leaveType == 'COMP') {
              var aggrString = 'compensation-leave-copy/'+this.request.requestor+'/'
                                +startDateSimple+'-to-'+endDateSimple+'.pdf';
            } else if (this.request.leaveType == 'EXAM') {
              var aggrString = 'exam-leave-copy/'+this.request.requestor+'/'
                                +startDateSimple+'-to-'+endDateSimple+'.pdf';
            } else if (this.request.leaveType == 'MAT') {
              var aggrString = 'maternity-leave-copy/'+this.request.requestor+'/'
                                +startDateSimple+'-to-'+endDateSimple+'.pdf';
            } else if (this.request.leaveType == 'PAT') {
              var aggrString = 'paternity-leave-copy/'+this.request.requestor+'/'
                                +startDateSimple+'-to-'+endDateSimple+'.pdf';
            } else if (this.request.leaveType == 'MAR') {
              var aggrString = 'marriage-leave-copy/'+this.request.requestor+'/'
                                +startDateSimple+'-to-'+endDateSimple+'.pdf';
            }

            this.$store.dispatch(action.DELETE_SL, aggrString)
            .then((res)=> {
              console.log('the scan copy is also deleted', res)
            }).catch((error) => {
              console.error('error deleteing doc: ', error);
            });
          }
        })
        .then(() => {
          this.successMessage = 'Request successfully deleted';
        })
        .catch((error) => {
          this.$store.commit(mutant.SET_ERROR, error.message);
          console.error('error deleting request: ', error);
        });
    },
		approve() {
       this.getPublicHolidays();
		},
    approveAction(){
      if (this.validateDate() == false) {
        console.log('the request seems exceeded the quota');
        this.$store.commit(mutant.SET_ERROR, 'the request seems exceeded the quota');
      } else {
        // 'o' is placeholder JSON object we'll write to DB
        var o = {};
        // check if we're the first or second approver
        if (this.$store.state.loggedInUser.email === this.request.firstApprover && this.validateDate() == true) {
          o.firstApprover = this.$store.state.loggedInUser.email;
          if (this.request.firstComment === '') {
            o.firstComment = '** Approved **';
          } else {
            o.firstComment = this.request.firstComment;
          }
          o.firstStatus = Constants.APPROVED;
        }

        if (this.$store.state.loggedInUser.email === this.request.secondApprover && this.validateDate() == true) {
          o.secondApprover = this.$store.state.loggedInUser.email;
          if (this.request.secondComment === '') {
            o.secondComment = '** Approved **';
          } else {
            o.secondComment = this.request.secondComment;
          }
          o.secondStatus = Constants.APPROVED;
        }
        // console.log(o);
        this.documentRef.update(o);
        this.$router.push({ path: '/leaveRequests' });
      }
    },

		reject() {
			if (!this.validateRejection()) {
				this.$store.commit(mutant.SET_ERROR, 'You must include a comment when rejecting');
				return;
			}
			// console.log('reject clicked');
			var o = {};
			// check if we're the first or second approver
			if (this.$store.state.loggedInUser.email === this.request.firstApprover) {
				o.firstApprover = this.$store.state.loggedInUser.email;
				o.firstComment = this.request.firstComment;
				o.firstStatus = Constants.REJECTED;
			}

			if (this.$store.state.loggedInUser.email === this.request.secondApprover) {
				o.secondApprover = this.$store.state.loggedInUser.email;
				o.secondComment = this.request.secondComment;
				o.secondStatus = Constants.REJECTED;
			}

			this.documentRef.update(o);
			this.$router.push({ path: '/leaveRequests' });
		},
    getRemainingDays() {
      this.$store.dispatch(action.GET_EVENTS,
      {
        start: moment().startOf('year'), end: moment().endOf("year"),
        status: Constants.APPROVED,
        user: this.request.requestor
      })
      .then((events) => {
      //this.pendingRequests = events;
      //console.log('the email: ',this.request.requestor,'list out the requests', events);
        events.forEach((entry)=> {
          var s = entry.startDate.startOf('day'); //this entry's start date
          var e = entry.endDate.startOf('day');
          //for halfdays
          if (entry.halfDay != 'Full') {
            if (entry.leaveType == 'ANN') {
              this.approvedAnn += 0.5;
            } else if (entry.leaveType == 'CO') {
              this.approvedCo += 0.5;
            }
          } else { //for full days
            if (entry.leaveType == 'ANN') {
            // get public holidays between the requested start and end date
            // to exclude from the approved leave requests
              var publicHolidayExclusion = 0
              var index, len;
              for (index = 0, len = this.holidays.length; index < len; ++index) {
                  let h = this.holidays[index];
                  if (h.startDate.startOf('day').isBetween(s, e, null, '[]')) {
                    publicHolidayExclusion += h.startDate.diff(h.endDate, 'days') + 1;
                  }
              }
              //console.log('no. of days public holidays excluded', publicHolidayExclusion);
              //console.log(a,b);
              this.approvedAnn += s.businessDiff(e) + 1 - publicHolidayExclusion;
              //console.log('this.approvedAnn, ', this.approvedAnn);
            } else if (entry.leaveType == 'CO') {
              // get public holidays between the requested start and end date
                var publicHolidayExclusion = 0
                var index, len;
                for (index = 0, len = this.holidays.length; index < len; ++index) {
                    let h = this.holidays[index];
                    if (h.startDate.startOf('day').isBetween(s, e, null, '[]')) {
                      publicHolidayExclusion += h.startDate.diff(h.endDate, 'days') + 1;
                    }
                }
              console.log('no. of days public holidays excluded', publicHolidayExclusion);
              this.approvedCo += s.businessDiff(e) + 1 - publicHolidayExclusion;
            }
          }
        })
        this.approveAction();
      })
      .catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error);
        console.log('error, ', error)
      });
    },
    validateDate() {
      console.log('in validateDate()')
      //for halfdays
      if (this.request.halfDay != 'Full') {
        if (this.request.leaveType == 'ANN') {
          var a = moment(this.request.startDate.toDate()).startOf('day');
          var b = moment(this.request.endDate.toDate()).startOf('day');
          //deal with floats
          if (5 > Math.round((this.userDetails.daysAnnualLeave - this.approvedAnn)*10)) {
            return false
          }
        } else if (this.request.leaveType == 'CO') {
          var a = moment(this.request.startDate.toDate()).startOf('day');
          var b = moment(this.request.endDate.toDate()).startOf('day');
          //deal with floats
          if (5 > Math.round((this.userDetails.daysCarryOver - this.approvedCo)*10)) {
            return false
          }
        }
      } else { //for fulldays
        if (this.request.leaveType == 'ANN') {
          var a = moment(this.request.startDate.toDate()).startOf('day');
          var b = moment(this.request.endDate.toDate()).startOf('day');
          // get public holidays between the requested start and end date
          // to exclude from this leave request
          var publicHolidayExclusion = 0
          var index, len;
          for (index = 0, len = this.holidays.length; index < len; ++index) {
              //console.log(this.holidays[index]);
              //console.log(this.holidays[index].startDate.diff(this.holidays[index].endDate, 'days'));
              let h = this.holidays[index];
              //console.log(h.startDate, a, b);
              //console.log(h.startDate.isBetween(a, b, null, '[]'));
              //***assumes each public holiday has duration 1 only
              if (h.startDate.startOf('day').isBetween(a, b, null, '[]')) {
                publicHolidayExclusion += h.startDate.diff(h.endDate, 'days') + 1;
              }
          }
          console.log('no. of days public holidays excluded', publicHolidayExclusion);
          //console.log(a,b);
          //console.log(a.businessDiff(b));
          //console.log('remaining should be = ',this.userDetails.daysCarryOver, '-', this.approvedCo, '+', publicHolidayExclusion);
          //deal with floats
          if ((a.businessDiff(b) + 1 - publicHolidayExclusion)*10 > Math.round((this.userDetails.daysAnnualLeave - this.approvedAnn)*10)) {
            return false;
          }
        } else if (this.request.leaveType == 'CO') {
            var a = moment(this.request.startDate.toDate()).startOf('day');
            var b = moment(this.request.endDate.toDate()).startOf('day');
            // get public holidays between the requested start and end date
            var publicHolidayExclusion = 0
            var index, len;
            for (index = 0, len = this.holidays.length; index < len; ++index) {
                let h = this.holidays[index];
                if (h.startDate.startOf('day').isBetween(a, b, null, '[]')) {
                  publicHolidayExclusion += h.startDate.diff(h.endDate, 'days') + 1;
                }
            }
            console.log('no. of days public holidays excluded', publicHolidayExclusion);
            //console.log(a,b);
            console.log('remaining should be = ',this.userDetails.daysCarryOver, '-', this.approvedCo, '+', publicHolidayExclusion);
            //deal with floats
            if ((a.businessDiff(b) + 1 - publicHolidayExclusion)*10 > Math.round((this.userDetails.daysCarryOver - this.approvedCo)*10)) {
              return false;
            }
          }
      }

      return true;

    },
    fetchUser() {
      this.$store.dispatch(action.GET_USER, { email: this.request.requestor })
        .then((user) => {
          console.log('UserDetails loaded, ', user);
          this.userDetails = user;
          this.getRemainingDays();
        })
        .catch((error) => {
          console.log(error);
          this.$store.commit(mutant.SET_ERROR, error);
        })
    },
		getStatus(s) {
			switch (s) {
			case Constants.PENDING:
				return "Pending";
				break;
			case Constants.APPROVED:
				return "Approved";
				break;
			case Constants.REJECTED:
				return "Rejected";
				break;
			default:
				return "Invalid status";
			};
		},
	},
	watch: {
		// these watch methods are to generate a formatted date value because v-text-field
		// doesn't support formatting of the v-model object. so create a formatted string
		// here and display it on form instead of the v-model
		'request.startDate': function(val, oldVal) {
			this.startString = val.toDate().toDateString();
		},
		'request.endDate': function(val, oldVal) {
			this.endString = val.toDate().toDateString();
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
	}
};
</script>
