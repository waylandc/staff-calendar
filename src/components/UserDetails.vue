<template>
  <v-container grid-list-md text-xs-center>
    <h1>User Profile</h1>
    <!-- <div v-if="error != ''" class='display-1' style='text-align: center; color: #ff0000'>
      {{ error }}
    </div> -->
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded" >
        <v-layout column>
          <v-flex>
            <v-alert type="error" dismissible v-model="alert">
              {{ error }}
            </v-alert>
          </v-flex>
          <v-flex>
            <v-text-field v-model='user.email' label='email' autocomplete="email" disabled box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model.number='user.daysAnnualLeave' label='Annual Leave' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model.number='user.daysCompLeave' label='Comp Leave' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model.number='user.daysCarryOver' label='Carry Over' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model.number='user.daysBooked' label='Booked' :readonly="!this.isAdmin" box>
            </v-text-field>
          </v-flex>
          <v-layout>
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
          </v-layout>
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
        documentRef: null,
        loaded: false,
      }
    },
    created() {
      this.loaded = false;
      if (this.$route.params.id != null) {
        this.userId = this.$route.params.id;
      } else {
        this.userId = this.$store.state.loggedInUser.docId;
      }

      const docRef = db.collection('users').doc(this.userId);
      docRef.get().then((doc) => {
        if (doc.exists) {
          this.user = createUserModel(doc.data());
          this.user.docId = this.userId;
          console.log('retrieved user, ', doc.data());
          this.documentRef = docRef;
          this.loaded = true;
        } else {
        // TODO errors don't work on this page. something about no setter for 'error'
          this.error = 'Error, No such user';
          console.log(this.error);
        }
      }).catch((error) => {
        // TODO errors don't work on this page. something about no setter for 'error'
        console.log('error getting document: ', error);
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
          this.$store.commit('setError', null);
        }
      },
    },
  }
</script>
