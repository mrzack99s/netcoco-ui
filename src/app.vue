<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  methods: {
    checkLogin() {
      if (localStorage.logged != null) {
        const localSession = localStorage.logged;
        const session = JSON.parse(localSession);
        this.$api_connection
          .unsecureAPI()
          .post("/check", {
            username: session.username,
            password: session.api_secret,
          })
          .then((response) => {
            if (!response.data.authorized) {
              delete localStorage.logged;
              localStorage.previousPath = this.$route.path;
              this.$router.push("/login");
            }
          })
          .catch(() => {
            delete localStorage.logged;
            localStorage.previousPath = this.$route.path;
            this.$router.push("/login");
          });
      } else {
        delete localStorage.logged;
        this.$router.push("/login");
      }
    },
  },
  beforeUpdate() {
    this.checkLogin();
  },
});
</script>