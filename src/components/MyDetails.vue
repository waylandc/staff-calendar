<template>
  <v-container grid-list-md text-xs-center>
    <h1>My Details</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded">
        <v-layout row wrap>
          <v-flex xs6>
            <v-text-field v-model='user.firstName' label='firstName' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model='user.lastName' label='lastName' disabled box>
            </v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field v-model='user.email' label='Email' disabled box>
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
            <v-text-field v-model.number='user.daysBooked' label='Booked' disabled box>
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
          <v-flex class="text-xs-center" mt-5 v-if="this.isAdmin">
            <v-btn color="primary" @click.stop="save">Save</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
  import db from '../config/firebaseInit';
  import { createUserModel } from '../models/User';

  export default {
    data() {
      return {
        user: null,
        userId: '',
        alert: false,
        loaded: false,
      }
    },
    created() {
      this.loaded = false;
      this.userId = this.$store.state.loggedInUser.docId;
      const docRef = db.collection('users').doc(this.userId);

      docRef.get().then((doc) => {
        if (doc.exists) {
          this.user = createUserModel(doc.data());
          this.user.docId = this.userId;
          this.loaded = true;
        } else {
          this.$store.commit('SET_ERROR', 'Error, user does not exist');
          console.log('error loading user, ', this.userId);
        }
      }).catch((error) => {
        this.$store.commit('SET_ERROR', error.message);
        console.log('Error getting document: ', error);
      });
    },
    methods: {
      save() {
        this.$store.dispatch('SAVE_USER', { userId: this.userId, user: this.user});
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
          this.$store.commit('SET_ERROR', null);
        }
      },
    },
  }
</script>
