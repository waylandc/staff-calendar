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
			<v-flex xs12>
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
             label = 'Birthday (MMDD)'
             v-if="this.convertLeaveType === 'Birthday Leave'"
             :readonly = "true"
        box>
          </v-text-field>
          <v-btn small v-if="this.convertLeaveType === 'Sick'"
            color="green"
            @click.stop="downloadAttachment" > Download sick leave scan copy
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
      <v-flex v-if="canEdit" class="text-xs-center" mt-5>
          <v-btn
        color="brown"
              @click.stop="editProperty"
          >
        Edit
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
import moment from 'moment';
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
		};
	},
	created() {
		this.user = this.$store.state.loggedInUser;
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
      if (this.request.firstApprover == this.user.email ||
      this.request.secondApprover == this.user.email) {
        if (this.request.leaveType == 'CO' || this.request.leaveType == 'ANN') {
          this.getRemainingDays(this.request.leaveType);
        }
      }
    });
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
    canEdit() {
      // check is owner of the request, then check state of the request
      return ((this.request.requestor == this.$store.state.loggedInUser.email) &&
        this.request.firstStatus == 0 && this.request.secondStatus == 0
      );
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
      var aggrString = 'sick-leave-copy/'+this.request.requestor+'/'
                        +startDateSimple+'-to-'+endDateSimple+'.pdf'
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
		 editProperty() {
		   console.log('calling editRequest')
		   this.$router.push({ path: `/leaveRequests/edit/${this.propId}` });
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
          this.requestorDob = doc.data().dob;
          //console.log(this.requestorDob);
        })
      })
      .catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error.message);
        console.log('Error getting document: ', error);
      });
     },
		approve() {
      //TODO may recheck availability by grabbing remaining days available

			// 'o' is placeholder JSON object we'll write to DB
			var o = {};
			// check if we're the first or second approver
			if (this.$store.state.loggedInUser.email === this.request.firstApprover) {
				o.firstApprover = this.$store.state.loggedInUser.email;
				if (this.request.firstComment === '') {
					o.firstComment = '** Approved **';
				} else {
					o.firstComment = this.request.firstComment;
				}
				o.firstStatus = Constants.APPROVED;
			}

			if (this.$store.state.loggedInUser.email === this.request.secondApprover) {
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
    getRemainingDays(type) {
      this.$store.dispatch(action.GET_EVENTS,
      {
        start: moment().startOf('year'), end: moment().endOf("year"),
        status: Constants.APPROVED,
        user: this.user.email
      })
    }
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
