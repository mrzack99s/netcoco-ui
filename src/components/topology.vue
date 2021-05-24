<template>
  <div>
    <div v-if="haveTopology">
      <sui-grid divided="vertically" style="padding-top: 1em">
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <h3 class="ui header">Topology name: {{ getTopologyName }}</h3>
            <router-link
              to="/topology-fullscreen"
              v-if="$route.path != '/topology-fullscreen'"
              ><sui-button primary size="mini">
                <sui-icon name="desktop" />Full screen</sui-button
              ></router-link
            >
            <router-link to="/dashboard" v-else>
              <sui-button primary size="mini">
                <sui-icon name="home" />Back to dashboard</sui-button
              ></router-link
            >
          </sui-grid-column>
          <sui-grid-column>
            <sui-form>
              <sui-form-field>
                <label>Topology</label>
                <sui-dropdown
                  placeholder="Topology Name"
                  selection
                  search
                  :options="allTopology"
                  v-model="selectedTopoElement.value"
                />
              </sui-form-field>
            </sui-form>
          </sui-grid-column>
        </sui-grid-row>
      </sui-grid>

      <sui-card style="width: 100%">
        <sui-card-content>
          <div id="topo" ref="topo" :style="{ height: $props.height }"></div>
        </sui-card-content>
      </sui-card>
    </div>

    <div v-else>
      <div class="ui card" style="width: 100%; height: 300px; padding-top: 2em">
        <div class="content">
          <h2 class="center aligned ui header">Not have a topology</h2>
          <div class="center aligned description">
            <p>Please add your topology</p>
            <router-link to="/topology">
              <sui-button
                primary
                type="button"
                size="small"
                style="margin-top: 1em"
                >Create topology</sui-button
              >
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { Network, NodeOptions, EdgeOptions, Node } from "vis-network";
import Option from "@/types/option";
import DeviceType from "@/types/device-type";
import Topology from "@/types/topology";
import "vis-network/styles/vis-network.css";
import Device from "@/types/device";

export default Vue.extend({
  components: {
  },
  props: {
    height: String,
  },
  data() {
    return {
      selectedTopoElement: {} as Option,
      allTopology: [] as Option[],
      allDevice: [] as Device[],
      haveTopology: false,
      deviceSetting: {
        modal: false,
        device_id: 0,
      },
      topology: {
        name: null,
        selected: {} as Topology,
        nodeData: [] as NodeOptions[],
        edgesData: [] as EdgeOptions[],
        groupNode: {},
        options: {},
        network: {} as Network,
      },
    };
  },
  computed: {
    getTopologyName() {
      const selected = this.selectedTopoElement as Option;
      return selected.text;
    },
  },
  methods: {
    getAllTopology() {
      this.$api_connection
        .secureAPI()
        .get(`/topology/get`)
        .then((response) => {
          // eslint-disable-next-line
          var data = response.data;
          var haveDefault = false;
          if (data.length > 0) {
            // eslint-disable-next-line
            data.forEach((element: any) => {
              this.allTopology.push({
                text: element.topology_name as string,
                value: element.id as number,
              });
              if (element.default) haveDefault = true;
            });

            // eslint-disable-next-line
            data.forEach((element: any, count: any) => {
              if (
                (haveDefault && element.default) ||
                (!haveDefault && count == 0)
              ) {
                this.selectedTopoElement = {
                  text: element.topology_name as string,
                  value: element.id as number,
                };
              }
            });
            this.haveTopology = true;
            this.getTopology();
          }
        });
    },
    /* eslint-disable */
    checkEdgeDuplicate(from: any, to: any) {
      for (var i = 0; i < this.topology.edgesData.length; i++) {
        var edge = this.topology.edgesData[i] as any;
        if (edge.from == to && edge.to == from) return true;
      }
      return false;
    },
    checkCanBeSetting(str: string) {
      return (str == "l3switch" || str == "l2switch") ? true : false
    },
    getTopology() {
      this.$api_connection
        .secureAPI()
        .get(`/device-type/get`)
        .then((response) => {
          const data = response.data as DeviceType[];
          var localData = this.topology.groupNode as any;
          data.forEach((element) => {
            localData[element.device_type_name as any] = {
              shape: "image",
              image: require(`@/assets/images/${element.device_type_name}.png`),
              size: 25,
            } as Node;
          });
          this.topology.groupNode = {};
          this.topology.groupNode = localData;
        });

      this.$api_connection
        .secureAPI()
        .get(`/topology/get/${this.selectedTopoElement.value}`)
        .then((response) => {
          const data = response.data as Topology;
          if (data.edges?.topology?.length) {
            this.topology.nodeData.length = 0;
            this.allDevice.length = 0;
            data.edges?.topology?.forEach((element, index) => {
              var node = {
                id: element.id,
                label: element.edges!.device.device_name,
                title: `DeviceName: ${element.edges!.device.device_name}
                        Hostname: ${element.edges!.device.device_hostname}

                        ${this.checkCanBeSetting(
                          element.edges!.device.edges!.in_type!.device_type_name as string
                        ) ? "Can be setting" : "Cannot be setting"}
                        `,
                group: element.edges!.device.edges!.in_type!.device_type_name,
                name: element.edges!.device.device_name,
                value: element.edges!.device.id,
                x: element.position_x == null ? 0 : element.position_x,
                y: element.position_y == null ? 0 : element.position_y,
                fixed: true,
              };
              this.topology.nodeData.push(node);
              this.allDevice.push(element.edges?.device!);
            });

            this.topology.edgesData.length = 0;
            data.edges.topology.forEach((element) => {
              if (element != null) {
                element.edges?.edge?.forEach((edge) => {
                  if (element.id != edge.id) {
                    if (!this.checkEdgeDuplicate(element.id, edge.id)) {
                      var edgeOption = {
                        from: element.id,
                        to: edge.id,
                      } as EdgeOptions;
                      this.topology.edgesData.push(edgeOption);
                    }
                  }
                });
              }
            });

            this.topology.options = {
              physics: true,
              interaction: {
                hover: true,
                hideEdgesOnDrag: false,
                hideEdgesOnZoom: false,
                hideNodesOnDrag: false,
                zoomView: true,
              },
              groups: this.topology.groupNode,
            };

            this.topology.network = new Network(
              this.$refs.topo as HTMLElement,
              {
                nodes: this.topology.nodeData,
                edges: this.topology.edgesData,
              },
              this.topology.options
            );
            this.topology.network.on("click", (params) => {
              var node = this.topology.nodeData.find((element: any) => {
                return element.id == params.nodes[0];
              });
              if (this.checkCanBeSetting(node?.group as string)) {
                this.$router.push(`/device-setting/${node!.value}`)
              }
            });
          }
        });
    },
    clearTopology() {
      this.topology.network.destroy();
    },
  },
  mounted() {
    this.getAllTopology();
    setInterval(() => {
      if (this.topology.nodeData.length != 0) this.clearTopology();
      this.getTopology();
    }, 45000);
  },
});
</script>