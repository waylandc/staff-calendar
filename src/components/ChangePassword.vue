<template>
  <v-container grid-list-md text-xs-center>
    <h1>Change Password</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
      <v-alert v-if="wasSuccessful" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
        {{ successMessage }}
      </v-alert>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded" @submit.prevent="changePassword">
        <v-layout column>
          <v-flex>
            <v-text-field v-model='user.email' label='User' autocomplete="email" :readonly="true" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model='newPassword' label='New Password' type="password" autocomplete="new-password" :readonly="false" box>
            </v-text-field>
          </v-flex>
          <v-flex class="text-xs-center" mt-5>
            <v-btn color="primary" type="submit">Change Password</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
  import firebase from 'firebase';
  import store from '../store';
	import * as mutant from '../store/mutation-types';
	import * as action from '../store/action-types';

  export default {
    data() {
      return {
        user: '',
        newPassword: '',
        alert: false,
        successMessage: '',
      }
    },
    created() {
      this.loaded = false;
      this.user = this.$store.state.loggedInUser;
      this.loaded = true;
    },
    methods: {
      changePassword () {
        this.$store.dispatch(action.CHANGE_PASSWORD, {newPassword: this.newPassword})
          .then(() => {
            this.successMessage = 'Password successfully changed';
          })
          .catch((error) => {
            console.log(error);
          });
      },
      dismissClicked() {
        this.successMessage = '';
        this.$router.push({ path: '/home' });
      },
    },
    computed: {
      error() {
        return this.$store.state.error;
      },
      loading() {
        return this.$store.state.loading;
      },
      wasSuccessful() {
        return this.successMessage !== '';
      }
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
