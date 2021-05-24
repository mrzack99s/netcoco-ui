<template>
  <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
    <sui-tab-pane title="Interface Setting">
      <InterfaceSetting :device_id="$route.params.id"/>
    </sui-tab-pane>
    <sui-tab-pane title="Commit Setting">
      <CommitSetting :device_id="$route.params.id"/>
    </sui-tab-pane>
  </sui-tab>
</template>

<script lang="ts">
import Vue from "vue";
import InterfaceSetting from "@/components/interface-setting.vue";
import CommitSetting from "@/components/commit-setting.vue";
export default Vue.extend({
  components: {
    InterfaceSetting,
    CommitSetting,
  },
});
</script>