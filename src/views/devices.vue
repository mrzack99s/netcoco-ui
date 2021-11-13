<template>
  <div>
    <sui-segment clearing basic>
      <h2 is="sui-header" floated="left">
        <sui-icon name="list alternate" />
        <sui-header-content
          >Device Management
          <sui-header-subheader>Manage your device</sui-header-subheader>
        </sui-header-content>
      </h2>
    </sui-segment>

    <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
      <sui-tab-pane title="Device" style="min-height: 200px">
        <Device />
      </sui-tab-pane>
      <sui-tab-pane title="Device type" style="min-height: 200px">
        <DeviceType />
      </sui-tab-pane>
    </sui-tab>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Device from "@/components/device.vue";
import DeviceType from "@/components/device-type.vue";
export default Vue.extend({
  components: {
    Device,
    DeviceType,
  },
});
</script>