<template>
  <v-container grid-list-md text-xs-center>
    <h1>My Details</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
      <v-alert v-if="saved" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
        {{ successMessage }}
      </v-alert>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded">
        <v-layout row wrap>
          <v-flex xs6>
            <v-text-field v-model='user.firstName' label='First  Name' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.lastName' label='Last Name' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.dob' label='Birthday (MMDD)' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.email' label='Email' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysBooked' label='Booked' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysAnnualLeave' label='Annual Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCompLeave' label='Comp Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver' label='Carry Over' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysSick' label='Sick' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysBirthdayLeave' label='Birthday Leave' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-switch
              :label="`Administrator: ${user.isAdmin.toString()}`"
              v-model="user.isAdmin"
              disabled
            ></v-switch>
          </v-flex>
          <v-flex xs6>
            <v-switch
              :label="`Approver: ${user.isApprover.toString()}`"
              v-model="user.isApprover"
              disabled
            ></v-switch>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
  // This screen should probably be READ ONLY. Allows user to display their entitled

  import db from '../config/firebaseInit';
  import { createUserModel } from '../models/User';
	import * as mutant from '../store/mutation-types';
	import * as action from '../store/action-types';

  export default {
    data() {
      return {
        user: null,
        userId: '',
        alert: false,
        loaded: false,
        saved: false,
        successMessage: '',
      }
    },
    created() {
      this.loaded = false;
      this.userId = this.$store.state.loggedInUser.docId;
      const docRef = db.collection('users').doc(this.userId);

      docRef.get().then((doc) => {
        if (doc.exists) {
          //console.log(doc.data());
          this.user = createUserModel(doc.data());
          //console.log(this.user);
          this.user.docId = this.userId;
          this.loaded = true;
        } else {
          this.$store.commit(mutant.SET_ERROR, 'Error, user does not exist');
          console.log('error loading user, ', this.userId);
        }
      }).catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error.message);
        console.log('Error getting document: ', error);
      });
    },
    methods: {
      dismissClicked() {
        this.successMessage = '';
        this.saved = false;
      },
    },
    computed: {
      error() {
        return this.$store.state.error;
      },
      loading() {
        return this.$store.state.loading;
      },
      isAdmin() {
        return this.$store.getters.isAdmin;
      },

    },
    watch: {
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
  }
</script>
