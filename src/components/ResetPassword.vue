<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center" mt-5>
        <h1>Reset Password</h1>
      </v-flex>
      <v-flex xs12 sm6 offset-sm3 mt-3>
        <form @submit.prevent="resetPassword">
          <v-layout column>
            <v-flex>
              <v-alert type="error" dismissible v-model="alert">
                {{ error }}
              </v-alert>
              <v-alert v-if="wasSuccessful" type="success" dismissible v-model="successMessage" @input= "v => v || dismissClicked()">
                {{ successMessage }}
              </v-alert>
            </v-flex>
            <v-flex>
              <v-text-field
                name="email"
                label="Enter your email to reset"
                id="email"
                type="email"
                v-model="email"
                required></v-text-field>
            </v-flex>
            <v-flex class="text-xs-center" mt-5>
              <v-btn color="primary" type="submit">Reset Password</v-btn>
            </v-flex>
          </v-layout>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
	import * as mutant from '../store/mutation-types';
	import * as action from '../store/action-types';

export default {
  data() {
    return {
      email: '',
      alert: false,
      successMessage: '',
    };
  },
  methods: {
    resetPassword() {
      this.$store.dispatch(action.RESET_PASSWORD, { email: this.email })
      .catch((err) => {
        this.$store.commit(mutant.SET_ERROR, err.message);
      })
      this.successMessage = 'Reset Password email sent to ', this.email;
    },
    dismissClicked() {
      this.successMessage = '';
      this.$router.push({ path: '/signin' });
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
