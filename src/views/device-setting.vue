<template>
  <div>
    <sui-segment clearing basic>
      <h4 is="sui-header" floated="right">
        <sui-icon name="microchip" />
        <sui-header-content>{{
          device.edges.in_type.device_type_name
        }}</sui-header-content>
      </h4>
      <h2 is="sui-header" floated="left">
        <sui-icon name="settings" />
        <sui-header-content
          >{{ device.device_name }} setting
          <sui-header-subheader>Manage your preferences</sui-header-subheader>
        </sui-header-content>
      </h2>
    </sui-segment>

    <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
      <sui-tab-pane title="Vlan Setting">
        <VlanSetting :device_id="$route.params.id" />
      </sui-tab-pane>
      <sui-tab-pane title="Interface Setting">
        <InterfaceSetting :device_id="$route.params.id" />
      </sui-tab-pane>
      <sui-tab-pane title="Commit Setting">
        <CommitSetting :device_id="$route.params.id" />
      </sui-tab-pane>
    </sui-tab>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import InterfaceSetting from "@/components/interface-setting.vue";
import CommitSetting from "@/components/commit-setting.vue";
import VlanSetting from "@/components/vlan-setting.vue";
import Device from "@/types/device";
export default Vue.extend({
  components: {
    InterfaceSetting,
    CommitSetting,
    VlanSetting,
  },
  data() {
    return {
      device: {} as Device,
    };
  },
  methods: {
    getDevice() {
      this.$api_connection
        .secureAPI()
        .get(`/device/get/${this.$route.params.id}`)
        .then((response) => {
          this.device = response.data as Device;
        });
    },
  },
  mounted() {
    this.getDevice();
  },
});
</script>