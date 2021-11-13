<template>
  <div>
    <sui-segment clearing basic>
      <h4 is="sui-header" floated="right">
        <sui-icon name="hand pointer outline" />
        <sui-header-content>Click on device for configure</sui-header-content>
      </h4>
      <h2 is="sui-header" floated="left">
        <sui-icon name="server" />
        <sui-header-content
          >Dashboard
          <sui-header-subheader>Overview system</sui-header-subheader>
        </sui-header-content>
      </h2>
    </sui-segment>

    <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
      <sui-tab-pane title="Topology" style="min-height: 200px">
        <Topology height="450px" />
      </sui-tab-pane>
    </sui-tab>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Topology from "@/components/topology.vue";
export default Vue.extend({
  components: {
    Topology,
  },
  metaInfo: {
    title: "Dashboard | NetCoCo",
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