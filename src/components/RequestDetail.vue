<template>
  <v-container grid-list-md text-xs-center>
    <h2>Request Details</h2>
    <div v-if="error != ''" class='display-1' style='text-align: center; color: #ff0000'>
      {{ error }}
    </div>
    <v-flex xs10 offset-xs1 v-if="loaded">
      <v-form>
        <v-layout row wrap>
          <v-flex xs6>
            <v-text-field
              v-model='request.user' 
              label='Requestor' 
              autocomplete="name" 
              :readonly="true" 
              box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field
              v-model='request.title' 
              label='Title' 
              autocomplete="off" 
              box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field
              v-model='startString'
              label='Start Date' 
              autocomplete="off" 
              box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field
              v-model='endString' 
              label='End Date' 
              autocomplete="off" 
              box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-checkbox
              v-model='request.fullDay' 
              label='Full Day'
              :readonly="true" 
              box>
            </v-checkbox>
          </v-flex>
          <v-flex xs6>
            <v-checkbox
              v-model='request.halfDay' 
              label='Half Day' 
              :readonly="true" 
              box>
            </v-checkbox>
          </v-flex>
          <v-flex v-if="this.$store.state.user.approver" class="text-xs-center" mt-5>
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
  </v-container>
</template>

<script>
  import db from '../config/firebaseInit';

  export default {
    name: 'RequestDetail',
    data() {
      return {
        error: '',
        drawer: false,
        request: '',
        loaded: false,
        propId: '',
        startString: '',
        endString: '',
      };
    },
    created() {
      this.loaded = false;
      this.propId = this.$route.params.id;
      const docRef = db.collection('leaveRequests').doc(this.propId);
      console.log('are we admin, ' + this.$store.state.user.admin);
      console.log('are we approver, ' + this.$store.state.user.approver);
      docRef.get().then((doc) => {
        if (doc.exists) {
          // console.log('document data: ', doc.data());
          this.request = doc.data();
          this.loaded = true;
        } else {
          this.error = 'Error, No such document';
          console.log(this.error);
        }
      }).catch((error) => {
        console.log('error getting document: ', error);
      });
    },
    computed: {
      loading() {
        return this.$store.state.loading;
      },
    },
    methods: {
      editProperty() {
        console.log('calling editRequest')
        this.$router.push(`/leaveRequest/edit/${this.propId}`);
      },
      approve() {
        console.log('approve clicked');
      },
      reject() {
        console.log('reject clicked');
      }
    },
    watch: {
      // these watch methods are to generate a formatted date value because v-text-field
      // doesn't support formatting of the v-model object. so create a formatted string
      // here and display it on form instead of the v-model 
      'request.startDate': function(val, oldVal) {
        console.log(val.toDate());
        //var a = new Date(val.val());
        this.startString = val.toDate().toDateString();
        // console.log();
      },
      'request.endDate': function(val, oldVal) {
        this.endString = val.toDate().toDateString();
      }
    }
  };
</script>
