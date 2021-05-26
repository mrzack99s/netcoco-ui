<template>
<div>
      <sui-segment clearing basic>
      <h2 is="sui-header" floated="left">
        <sui-icon name="settings" />
        <sui-header-content
          >Topology Builder
          <sui-header-subheader>Manage your topoloy</sui-header-subheader>
        </sui-header-content>
      </h2>
    </sui-segment>
  <sui-tab :menu="{ vertical: true, fluid: true }" menu-position="left">
    <sui-tab-pane title="Create a topology">
        <TopologyTable />
    </sui-tab-pane>
    <sui-tab-pane title="Device mapping to topology">
        <CreateTopology height="500px" />
    </sui-tab-pane>
  </sui-tab>
</div>
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