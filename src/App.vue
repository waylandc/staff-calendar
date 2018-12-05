<template>
  <v-app>
    <v-navigation-drawer v-model="drawer"  app>
      <v-list>
        <v-list-tile v-for="item in menuItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="userSignOut" v-if="isAuthenticated">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Sign Out</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left color="primary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer" dark></v-toolbar-side-icon>
      <v-flex xl24 class="text-sm-center headline" mx-auto>
      <router-link to="/" tag="span" style="cursor: pointer">
        OAX Staff Calendar
      </router-link>
      </v-flex>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer app fixed>
      <span>&copy; 2018 Wayland Chan</span>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data: () => ({
      miniVariant: false, // condenses nav drawer width
      drawer: false,
    }),
    computed: {
      isAuthenticated() {
        return this.$store.getters.isAuthenticated;
      },
      menuItems() {
        // Return a different menu depending on whether user is logged in or not and if admin
        if (this.isAdmin) {
          return [
            // first line of drawer is covered by banner so HACK here
            // not found isn't really a link, but we put it in so Calendar link is visible
            { title: 'Not Found', link: '/', icon: 'settings' },
            { title: 'Calendar', link: '/home', icon: 'home' },
            { title: 'Apply Leave', link: '/createRequest', icon: 'settings' },
            { title: 'Leave Requests', link: '/leaveRequests', icon: 'home' },
            { title: 'Users', link: '/users', icon: 'settings' },
            { title: 'Change Password', link: '/changePassword', icon: 'settings' },
          ];
        }

        if (this.isAuthenticated) {
          return [
            // first line of drawer is covered by banner so HACK here
            // not found isn't really a link, but we put it in so Calendar link is visible
            { title: 'Not Found', link: '/', icon: 'settings' },
            { title: 'Calendar', link: '/home', icon: 'home' },
            { title: 'Apply Leave', link: '/createRequest', icon: 'settings' },
            { title: 'Leave Requests', link: '/leaveRequests', icon: 'home' },
            { title: 'Change Password', link: '/changePassword', icon: 'settings' },
          ];
        }
        return [
          { title: 'Register', link: '/register', icon: 'face' },
          { title: 'Sign In', link: '/signin', icon: 'lock_open' },
        ];
      },
    },
    props: {
      // TODO - is this needed? Search shows nothing. Dec 5
      source: String,
    },
    methods: {
      userSignOut() {
        this.$store.dispatch('userSignOut');
      },
    },
  };
</script>

