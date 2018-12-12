<template>
  <v-container grid-list-md text-xs-center>
    <h1>Request Details</h1>
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
                v-model='request.requestor' 
                label='Requestor' 
                autocomplete = "name" 
                :readonly = "true" 
                box>
              </v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model = 'request.approverComment'
                label = 'Approver Comments'
                :readonly = '!canApproveReject'
                box>
              </v-text-field>
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
  import db from '../config/firebaseInit';
  import Constants from '../models/common.js';

  export default {
    name: 'RequestDetail',
    data() {
      return {
        drawer: false,
        request: '',
        loaded: false,
        propId: '',
        startString: '',
        endString: '',
        user: null,
        documentRef: null,
        alert: false,
//        approverComment: '',
      };
    },
    created() {
      this.user = this.$store.state.loggedInUser;
      this.loaded = false;
      this.propId = this.$route.params.id;
      const docRef = db.collection('leaveRequests').doc(this.propId);
      console.log(this.user.email + ' is admin, ' + this.user.isAdmin);
      console.log(this.user.email + ' is approver, ' + this.user.isApprover);
      docRef.get().then((doc) => {
        if (doc.exists) {
          this.request = doc.data();
          this.documentRef = docRef;
          this.loaded = true;
        } else {
          this.$store.commit('SET_ERROR', 'Error, No such document');
          console.log(this.error);
        }
      }).catch((error) => {
        this.$store.commit('SET_ERROR', 'Error loading document');
        console.log('error getting document: ', error);
      });
    },
    computed: {
      error() {
        return this.$store.state.error;
      },
      loading() {
        return this.$store.state.loading;
      },
      canApproveReject() {
        return (this.$store.state.loggedInUser.isApprover && this.request.status === Constants.PENDING)
      }
    },
    methods: {
      // TODO don't support edit request yet
      // https://gitlab.com/waylandc/oax-staff-calendar/issues/5
      // editProperty() {
      //   console.log('calling editRequest')
      //   this.$router.push(`/leaveRequest/edit/${this.propId}`);
      // },
      approve() {
        // TODO approve/reject should be moved to api.js and invoked by dispatching an action
        console.log('approve clicked, ', this.propId);
        var o = {};
        o.status = 1;
        o.approverComment = this.approverComment;
        o.approver = this.$store.state.loggedInUser.email;
        this.documentRef.update(o);
        this.$router.push('/leaveRequests');
     },
      reject() {
        console.log('reject clicked');
        var o = {};
        o.status = 2;
        o.approverComment = this.approverComment;
        o.approver = this.$store.state.loggedInUser.email;
        this.documentRef.update(o);
        this.$router.push('/leaveRequests');
      }
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
          this.$store.commit('SET_ERROR', null);
        }
      },
    }
  };
</script>
