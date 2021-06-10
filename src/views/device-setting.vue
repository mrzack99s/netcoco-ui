<template>
  <div v-if="!already">
    <sui-dimmer active inverted>
      <sui-loader size="huge">Loading</sui-loader>
    </sui-dimmer>
  </div>
  <div v-else>
    <sui-segment clearing basic>
      <h4 is="sui-header" floated="right">
        <sui-icon name="microchip" />
        <sui-header-content>{{ header_type_name }}</sui-header-content>
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
      <sui-tab-pane
        title="Vlan Setting"
        v-if="$ableVLANConfig.includes(device.edges.in_type.device_type_name)"
      >
        <VlanSetting :device_id="$route.params.id" />
      </sui-tab-pane>
      <sui-tab-pane title="Interface Setting">
        <InterfaceSetting :device_id="$route.params.id" />
      </sui-tab-pane>
      <sui-tab-pane
        title="IP Static Routing Table Setting"
        v-if="
          $ableIpRouteConfig.includes(device.edges.in_type.device_type_name)
        "
      >
        <IPStaticRoutingTable :device_id="$route.params.id" />
      </sui-tab-pane>
      <sui-tab-pane
        title="Port-channel Interface Setting"
        v-if="
          $ablePortChannelConfig.includes(device.edges.in_type.device_type_name)
        "
      >
        <PoInterfaceSetting :device_id="$route.params.id" />
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
import PoInterfaceSetting from "@/components/po-setting.vue";
import CommitSetting from "@/components/commit-setting.vue";
import VlanSetting from "@/components/vlan-setting.vue";
import Device from "@/types/device";
import IPStaticRoutingTable from "@/components/ip-static-routing.vue";
export default Vue.extend({
  components: {
    InterfaceSetting,
    CommitSetting,
    VlanSetting,
    PoInterfaceSetting,
    IPStaticRoutingTable,
  },
  data() {
    return {
      device: {} as Device,
      header_type_name: "",
      already: false,
    };
  },
  methods: {
    getDevice() {
      this.$api_connection
        .secureAPI()
        .get(`/device/get/${this.$route.params.id}`)
        .then((response) => {
          this.device = response.data as Device;
          // eslint-disable-next-line
          this.header_type_name = this.device.edges!.in_type!
            .device_type_name as string;
          this.already = true;
        });
    },
  },
  mounted() {
    this.getDevice();
  },
});
</script>