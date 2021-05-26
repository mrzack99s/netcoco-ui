<template>
  <div>
    <div class="ui card" style="width: 100%; height: 300px; padding-top: 2em">
      <div class="content" v-if="deviceComitted">
        <h2 class="center aligned ui header">This device [{{ deviceObj.device_name }}] has been committed.</h2>
        <div class="center aligned description">
          <sui-button
            primary
            type="button"
            size="massive"
            disabled
            style="margin-top: 1em"
            @click="commitModal = true"
            >Committed</sui-button
          >
        </div>
      </div>
      <div class="content" v-else>
        <h2 class="center aligned ui header">Commit your configuration</h2>
        <div class="center aligned description">
          <sui-button
            primary
            type="button"
            size="massive"
            style="margin-top: 1em"
            @click="commitModal = true"
            >Commit</sui-button
          >
        </div>
      </div>
    </div>

    <!-- CheckSure -->
    <sui-modal v-model="commitModal" size="mini" :closable="false">
      <sui-modal-content text>
        <sui-segment v-if="loader">
          <sui-dimmer active inverted>
            <sui-loader>Wait a few</sui-loader>
          </sui-dimmer>
          <br />
          <br />
          <br />
        </sui-segment>
        <h1 v-else>Are you sure to commit?</h1>
      </sui-modal-content>
      <sui-modal-actions v-if="!loader">
        <sui-button @click="commitModal = false"> Cancel </sui-button>
        <sui-button positive @click="commitAction()"> Commit </sui-button>
      </sui-modal-actions>
    </sui-modal>

    <!-- End -->
  </div>
</template>
<script lang="ts">
import Device from "@/types/device";
import Vue from "vue";
export default Vue.extend({
  metaInfo: {
    title: "Commit a setting | NetCoCo",
  },
  props: {
    device_id: String,
  },
  data() {
    return {
      loader: false,
      commitModal: false,
      deviceObj: {} as Device,
      deviceComitted: false,
    };
  },
  methods: {
    getDevice() {
      this.$api_connection
        .secureAPI()
        .get(`/device/get/${this.device_id}`)
        .then((response) => {
          this.deviceObj = response.data as Device;
          this.deviceComitted = this.deviceObj.device_commit_config!;
        });
    },
    commitAction() {
      this.loader = true
      this.$api_connection
        .secureAPI()
        .post("/net-automation/commit", this.deviceObj)
        .then(() => {
           this.$toasted.success("Commit configuration success")
           this.commitModal = false
           this.loader = false
           this.getDevice()
        }).catch(()=>{
this.$toasted.error("Commit configuration failed!")
        })
    },
  },
  mounted() {
    this.getDevice();
  },
});
</script>