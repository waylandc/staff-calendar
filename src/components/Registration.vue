<template>
  <v-container grid-list-md text-xs-center>
    <h1>Sign Up</h1>
    <v-flex>
      <v-alert type="error" dismissible v-model="alert">
        {{ error }}
      </v-alert>
    </v-flex>
    <v-flex xs12 ml-5 mr-5>
      <v-form>
        <v-layout column>
          <v-flex>
            <v-text-field name="firstName" label="First Name" id="firstName" type="text" v-model="firstName" required></v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field name="lastName" label="Last Name" id="lastName" type="text" v-model="lastName" required></v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field name="dob" label="Date of Birth (MMDD)" id="dob" type="text" v-model="dob" required></v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field name="email" label="Email" id="email" type="email" v-model="email" required></v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field name="password" label="Password" id="password" type="password" v-model="password" required></v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field name="confirmPassword" label="Confirm Password" id="confirmPassword" type="password" v-model="confirmPassword" required :rules="[comparePasswords]"></v-text-field>
          </v-flex>
          <v-flex class="text-xs-center" mt-5>
            <v-btn color="primary" @click.stop="userSignUp">Sign Up</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-container>
</template>

<script>
	import * as mutant from '../store/mutation-types';
	import * as action from '../store/action-types';
  import moment from 'moment-business-days';

export default {
  data() {
    // firstName and lastName not used for firebase auth.
    // TODO we might want to store it somewhere for more personalization
    return {
      firstName: '',
      lastName: '',
      dob: '',
      email: '',
      password: '',
      confirmPassword: '',
      alert: false,
    };
  },
  computed: {
    comparePasswords() {
      return this.password === this.confirmPassword ? true : 'Passwords don\'t match';
    },
    error() {
      return this.$store.state.error;
    },
    loading() {
      return this.$store.state.loading;
    },
  },
  methods: {
    userSignUp() {
      if (this.comparePasswords !== true) {
        this.$store.commit(mutant.SET_ERROR, 'Passwords don\'t match');
        return;
      }
      if (moment(this.dob, "MMDD").isValid() == false) {
        this.$store.commit(mutant.SET_ERROR, 'Date of Birth should be in DDMM format');
        return;
      }
      this.$store.dispatch(action.USER_SIGNUP,
        { email: this.email, password: this.password, firstName: this.firstName, lastName: this.lastName, dob: this.dob });
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
};
</script>
