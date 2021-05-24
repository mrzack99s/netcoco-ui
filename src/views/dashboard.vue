<template>
  <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
    <sui-tab-pane title="Topology">
      <Topology height="550px"/>
    </sui-tab-pane>
  </sui-tab>
</template>

<script lang="ts">
import Vue from "vue";
import Topology from "@/components/topology.vue";
export default Vue.extend({
  components: {
    Topology,
  },
  metaInfo: {
    title: "Dashboard",
  },
  data() {
    return {
      current: null,
      options: [
        {
          text: "Male",
          value: 1,
        },
        {
          text: "Female",
          value: 2,
        },
      ],
    };
  },
});
</script>