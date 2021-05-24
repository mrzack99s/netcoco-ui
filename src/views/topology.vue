<template>
  <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
    <sui-tab-pane title="Create Topology">
        <TopologyTable />
    </sui-tab-pane>
    <sui-tab-pane title="Device mapping to topology">
        <CreateTopology height="500px" />
    </sui-tab-pane>
  </sui-tab>
</template>

<script lang="ts">
import Vue from "vue";
import CreateTopology from "@/components/create-topology.vue";
import TopologyTable from "@/components/topology-table.vue";
export default Vue.extend({
  components: {
      CreateTopology,
      TopologyTable
  },
});
</script>