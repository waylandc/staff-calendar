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
            <v-text-field v-model='user.email' label='email' autocomplete="email" :readonly="true" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model='user.daysAnnualLeave' label='Annual Leave' :readonly="false" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model='user.daysCompLeave' label='Comp Leave' :readonly="false" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model='user.daysCarryOver' label='Carry Over' :readonly="false" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model='user.daysBooked' label='Booked' :readonly="true" box>
            </v-text-field>
          </v-flex>
          <v-flex class="text-xs-center" mt-5>
            <v-btn color="primary" @click.stop="save">Save</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
  import db from '../config/firebaseInit';

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
      this.userId = this.$route.params.id;
      console.log('loading user, ', this.userId);
      const docRef = db.collection('users').doc(this.userId);
      docRef.get().then((doc) => {
        if (doc.exists) {
          this.user = doc.data();
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
        this.$store.dispatch('changePassword',
          {
            newPassword: this.newPassword,
            confirmPassword: this.confirmPassword,
          }
        );
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
