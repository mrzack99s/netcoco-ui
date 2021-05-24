<template>
<sui-container fluid style="padding:0 2em">
      <Topology height="80vh"/>
</sui-container>
</template>

<script lang="ts">
import Vue from "vue";
import Topology from "@/components/topology.vue";
export default Vue.extend({
  components: {
    Topology,
  },
  metaInfo: {
    title: "Topology Fullscreen",
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