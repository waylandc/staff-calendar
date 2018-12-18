<template>
  <v-container grid-list-md text-xs-center>
    <h1>User Profile</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
      <v-alert v-if="saved" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
        {{ successMessage }}
      </v-alert>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded" >
        <v-layout row wrap>
          <v-flex xs6>
            <v-text-field v-model='user.firstName' label='firstName' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.lastName' label='lastName' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.email' label='email' autocomplete="email" disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysBooked' label='Booked' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysAnnualLeave' label='Annual Leave' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCompLeave' label='Comp Leave' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysCarryOver' label='Carry Over' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model.number='user.daysSick' label='Sick' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-switch
              :label="`Administrator: ${user.isAdmin.toString()}`"
              v-model="user.isAdmin"
            ></v-switch>
          </v-flex>
          <v-flex xs6>
            <v-switch
              :label="`Approver: ${user.isApprover.toString()}`"
              v-model="user.isApprover"
            ></v-switch>
          </v-flex>
          <v-flex xs6 v-if="this.isAdmin">
            <v-btn color="primary" @click.stop="save">Save</v-btn>
          </v-flex>
          <v-flex xs6 v-if="this.isAdmin">
            <v-btn color="reject" @click.stop="resetPassword">Reset Password</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
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
        documentRef: null,
        loaded: false,
        saved: false,
        successMessage: '',
      }
    },
    created() {
      this.loaded = false;
      this.userId = this.$route.params.id;
      // TODO refactor this to use api.js
      const docRef = db.collection('users').doc(this.userId);
      docRef.get().then((doc) => {
        if (doc.exists) {
          this.user = createUserModel(doc.data());
          this.user.docId = this.userId;
          // console.log('retrieved user, ', doc.data());
          this.documentRef = docRef;
          this.loaded = true;
        } else {
          this.$store.commit(mutant.SET_ERROR, 'Error, user does not exist');
          console.log(this.error);
        }
      }).catch((error) => {
        this.$store.commit(mutant.SET_ERROR, error.message);
        console.log('error getting document: ', error);
      });

    },
    methods: {
      save() {
        this.$store.dispatch(action.SAVE_USER, { userId: this.userId, user: this.user});
        this.successMessage = 'Successfully saved';
        this.saved = true;
      },
      dismissClicked() {
        this.successMessage = '';
        this.saved = false;
        this.$router.push({ path: '/users' });
      },
      resetPassword() {
        this.$store.dispatch(action.RESET_PASSWORD, { email: this.user.email });
        this.successMessage = 'Reset Password email sent to ', this.user.email;
        this.saved = true;
      }
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
