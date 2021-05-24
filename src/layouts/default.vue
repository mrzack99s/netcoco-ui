<template lang="html">
  <div>
    <sui-menu fixed inverted>
      <sui-container>
        <router-link  is="sui-menu-item" to="/dashboard" class="header" >
          NetCoCo
        </router-link>

        <router-link is="sui-menu-item" to="/dashboard">Dashboard</router-link>
        <router-link is="sui-menu-item" to="/devices">Devices</router-link>
        <router-link is="sui-menu-item" to="/topology">Topology</router-link>
        <div is="sui-menu-menu" position="right">
        <span is="sui-menu-item">
            <sui-button color="red" @click="logout()">Logout</sui-button>
        </span>
      </div>
      </sui-container>
    </sui-menu>
    

    <sui-container class="main">
      <router-view />
    </sui-container>


    <sui-segment vertical class="footer center aligned">
        <FooterText />
    </sui-segment>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import FooterText from "@/components/footer.text.vue";
export default Vue.extend({
  components: {
    FooterText,
  },
  methods: {
    clearSession() {
      delete localStorage.logged;
      this.$router.push("/login");
    },
    logout() {
      const localSession = localStorage.logged;
      const session = JSON.parse(localSession);
      this.$api_connection
        .unsecureAPI()
        .post("/logout", {
          username: session.username,
          password: session.APISecret,
        })
        .then(() => {
          this.$toasted.success("Logout success");
          this.clearSession();
        })
        .catch(() => {
          this.$toasted.error("Logout failed!");
        });
    },
  }
});
</script>

<style lang="css" scoped>
.header {
  height: 60px;
}
img.logo {
  margin-right: 1.5em !important;
}
.main {
  margin: 2.5em 0em 0em;
  padding: 5em 0em;
}
.wireframe {
  margin: 2em 0;
}
.footer {
  margin: 5em 0em 0em;
  padding: 5em 0em;
}
</style>
