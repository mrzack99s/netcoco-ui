<template>
  <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
    <sui-tab-pane title="Device">
      <Device />
    </sui-tab-pane>
    <sui-tab-pane title="Device type">
      <DeviceType />
    </sui-tab-pane>
  </sui-tab>
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