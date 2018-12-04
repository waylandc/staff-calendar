<template>
  <v-container grid-list-md text-xs-center>
    <h1>Change Password</h1>
    <!-- <div v-if="error != ''" class='display-1' style='text-align: center; color: #ff0000'>
      {{ error }}
    </div> -->
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <v-form v-if="loaded" @submit.prevent="changePassword">
        <v-layout column>
          <v-flex>
            <v-alert type="error" dismissible v-model="alert">
              {{ error }}
            </v-alert>
          </v-flex>
          <v-flex>
            <v-text-field v-model='user.email' label='User' autocomplete="email" :readonly="true" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model='newPassword' label='New Password' type="password" autocomplete="new-password" :readonly="false" box>
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field v-model='confirmPassword' label='Confirm Password' type="password" autocomplete="new-password" :readonly="false" box>
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

  export default {
    data() {
      return {
        user: '',
        newPassword: '',
        confirmPassword: '',
        alert: false,
      }
    },
    created() {
      this.loaded = false;
      this.user = this.$store.state.loggedInUser;
      // console.log(this.user);
      this.loaded = true;
    },
    methods: {
      changePassword () {
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
