<template lang="html">
  <div class="background">
    <sui-grid centered vertical-align="middle">
      <sui-grid-column>
        <h2 is="sui-header" color="blue" image>
          <sui-header-content>Log-in to the system</sui-header-content>
        </h2>

        <sui-form @submit.prevent="login">
          <sui-segment stacked>
            <sui-form-field>
              <sui-input
                type="text"
                placeholder="Username"
                icon="user"
                v-model="$data.auth.username"
                icon-position="left"
              />
            </sui-form-field>
            <sui-form-field>
              <sui-input
                type="password"
                placeholder="Password"
                icon="lock"
                v-model="$data.auth.password"
                icon-position="left"
              />
            </sui-form-field>
            <sui-button size="large" color="blue" fluid>Login</sui-button>
          </sui-segment>
        </sui-form>

        <sui-message><FooterText /></sui-message>
      </sui-grid-column>
    </sui-grid>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import FooterText from "@/components/footer.text.vue";

export default Vue.extend({
  metaInfo: {
    title: "Login Page",
  },
  data() {
    return {
      auth: {
        username: "" as string,
        password: "" as string,
      },
    };
  },
  components: {
    FooterText,
  },
  methods: {
    login() {
      if (this.auth.username != "" && this.auth.password) {
        this.$api_connection
          .unsecureAPI()
          .post("/login", this.auth)
          .then((response) => {
            localStorage.logged = JSON.stringify(response.data);
            this.$toasted.success("Login success");
            if (localStorage.previousPath != null) {
              const pPath = localStorage.previousPath;
              delete localStorage.previousPath;
              this.$router.push(pPath);
            } else this.$router.push("/dashboard");
          })
          .catch(() => {
            this.$toasted.error("Login failed!");
          });
      } else {
        this.$toasted.info("Please enter a username/password");
      }
    },
    pageOperator() {
      if (localStorage.logged != null) {
        this.$router.push("/dashboard");
      }
    },
  },
  beforeCreate() {
    if (localStorage.logged != null) {
      this.$router.push("/dashboard");
    }
  },
});
</script>

<style lang="css" scoped>
.background {
  background-color: #dadada !important;
  height: 100vh;
  margin: 1em 0;
}

.grid {
  height: 100%;
}

.column {
  max-width: 450px;
  text-align: center !important;
}
</style>