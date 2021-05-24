<template>
  <div>
    <div v-if="haveTopology">
      <sui-grid divided="vertically" style="padding-top: 1em">
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <h3 class="ui header">Topology name: {{ getTopologyName }}</h3>
            <sui-button primary size="mini" @click="addNode">
              <sui-icon size="small" name="plus" />Add Node</sui-button
            >
            <sui-button primary size="mini" @click="addEdge">
              <sui-icon size="small" name="plus" />Add Edge</sui-button
            >
            <sui-button color="red" size="mini" @click="deleteClick">
              <sui-icon size="small" name="minus" />Delete Node</sui-button
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
          </div>
        </div>
      </div>
    </div>

    <!-- Add Node -->
    <div>
      <sui-modal v-model="addModal" :closable="false">
        <sui-modal-header>Add node</sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="addNodeAction">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" />
              Information</sui-divider
            >

            <sui-form-fields fields="three">
              <sui-form-field>
                <label>X-Axis</label>
                <input
                  type="text"
                  placeholder="X-Axis"
                  v-model.number="deviceMap.position_x"
                  required
                />
              </sui-form-field>
              <sui-form-field>
                <label>Y-Axis</label>
                <input
                  type="text"
                  placeholder="Y-Axis"
                  v-model.number="deviceMap.position_y"
                  required
                />
              </sui-form-field>
              <sui-form-field>
                <label>Device</label>
                <sui-form-field>
                  <sui-dropdown
                    placeholder="Device"
                    selection
                    :options="allDevice"
                    search
                    v-model.number="deviceMap.device_id"
                    required
                  />
                </sui-form-field>
              </sui-form-field>
            </sui-form-fields>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add device map </sui-button>
              <sui-button @click="addModal = false" type="button">
                close
              </sui-button>
            </sui-form-field>
          </sui-form>
        </sui-modal-content>
      </sui-modal>
    </div>

    <div>
      <!-- Add edge -->
      <sui-modal v-model="addEdgeModal" size="mini" :closable="false">
        <sui-modal-header>Add edge</sui-modal-header>
        <sui-modal-content text style="font-size: 11pt">
          <sui-form @submit.prevent="addEdgeAction">
            <sui-form-field>
              <label>From node</label>
              <sui-dropdown
                placeholder="Edge device"
                selection
                search
                :options="allEdge"
                v-model="edge.map_id"
              />
            </sui-form-field>
            <sui-form-field>
              <label>To node</label>
              <sui-dropdown
                placeholder="Edge device"
                selection
                search
                :options="allEdge"
                v-model="edge.to_node_id"
              />
            </sui-form-field>
            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add edge </sui-button>
              <sui-button @click="addEdgeModal = false" type="button">
                close
              </sui-button>
            </sui-form-field>
          </sui-form>
        </sui-modal-content>
      </sui-modal>
    </div>

    <div>
      <!-- Delete -->
      <sui-modal v-model="deleteModal" size="mini" :closable="false">
        <sui-modal-header>Are you sure to delete?</sui-modal-header>
        <sui-modal-content text style="font-size: 11pt">
          <sui-form @submit.prevent="deleteDeviceMapAction">
            <sui-form-field>
              <label>Node device name</label>
              <sui-dropdown
                placeholder="Edge device"
                selection
                search
                :options="allDeleteEdge"
                v-model="deleteMapID"
              />
            </sui-form-field>
            <sui-form-field style="margin: 2em 0">
              <sui-button negative type="submit">
                Delete device map
              </sui-button>
              <sui-button @click="deleteModal = false" type="button">
                close
              </sui-button>
            </sui-form-field>
          </sui-form>
        </sui-modal-content>
      </sui-modal>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { Network, NodeOptions, EdgeOptions, Node } from "vis-network";
import Option from "@/types/option";
import DeviceType from "@/types/device-type";
import DeviceMap from "@/types/device-map";
import EdgeMap from "@/types/edge";
import Topology from "@/types/topology";
import Device from "@/types/device";
import "vis-network/styles/vis-network.css";

export default Vue.extend({
  props: {
    height: String,
  },
  data() {
    return {
      selectedTopoElement: {} as Option,
      allTopology: [] as Option[],
      allDevice: [] as Option[],
      allEdge: [] as Option[],
      allDeleteEdge: [] as Option[],
      haveTopology: false,
      haveGenerate: false,
      addModal: false,
      addEdgeModal: false,
      deleteModal: false,
      topology: {
        name: null,
        selected: {} as Topology,
        nodeData: [] as NodeOptions[],
        edgesData: [] as EdgeOptions[],
        groupNode: {},
        options: {},
        network: {} as Network,
      },
      edge: {} as EdgeMap,
      deviceMap: {} as DeviceMap,
      deleteMapID: 0,
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
    checkNodeDuplicate(node: any) {
      for (var i = 0; i < this.topology.nodeData.length; i++) {
        var temp = this.topology.nodeData[i] as any;
        if (temp._d_id == node.id) return true;
      }
      return false;
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
            data.edges?.topology?.forEach((element) => {
              var node = {
                id: element.id,
                _d_id: element.edges!.device.id,
                label: element.edges!.device.device_name,
                title: `DeviceName: ${element.edges!.device.device_name}
                            Hostname: ${element.edges!.device.device_hostname}
                            `,
                group: element.edges!.device.edges!.in_type!.device_type_name,
                name: element.edges!.device.device_name,
                x: element.position_x == null ? 0 : element.position_x,
                y: element.position_y == null ? 0 : element.position_y,
                fixed: true,
              } as NodeOptions;
              this.topology.nodeData.push(node);
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
                selectable: true,
                selectConnectedEdges: false,
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
          }
        });

      console.log(this.topology.nodeData);
    },
    deleteClick() {
      this.allDeleteEdge.length = 0;
      this.topology.nodeData.forEach((element: any) => {
        this.allDeleteEdge.push({
          text: element.label,
          value: element.id,
        });
      });
      this.deleteModal = true;
    },
    addNode() {
      this.allDevice.length = 0;
      this.$api_connection
        .secureAPI()
        .get(`/device/get`)
        .then((response) => {
          const data = response.data as Device[];
          data.forEach((element) => {
            if (!this.checkNodeDuplicate(element)) {
              this.allDevice.push({
                text: element.device_name,
                value: element.id,
              });
            }
          });
        });

      this.allEdge.length = 0;
      this.$api_connection
        .secureAPI()
        .get(`/topology/get/${this.selectedTopoElement.value}`)
        .then((response) => {
          (response.data as any).edges?.topology?.forEach((element: any) => {
            this.allEdge.push({
              text: element.edges.device.device_name,
              value: element.id,
            });
          });
        });
      this.addModal = true;
    },
    addEdge() {
      this.allEdge.length = 0;
      this.$api_connection
        .secureAPI()
        .get(`/topology/get/${this.selectedTopoElement.value}`)
        .then((response) => {
          (response.data as any).edges?.topology?.forEach((element: any) => {
            this.allEdge.push({
              text: element.edges.device.device_name,
              value: element.id,
            });
          });
        });
      this.addEdgeModal = true;
    },
    addNodeAction() {
      this.deviceMap.topology_id = this.selectedTopoElement.value;
      this.$api_connection
        .secureAPI()
        .post("/topology-device-map/create", this.deviceMap)
        .then(() => {
          this.$toasted.success("Add device map success");

          if (this.topology.nodeData.length != 0) this.clearTopology();
          this.getTopology();
          this.deviceMap = {} as DeviceMap;
          this.addModal = false;
        })
        .catch(() => {
          this.$toasted.error("Add device map failed!");
        });
    },
    addEdgeAction() {
      this.$api_connection
        .secureAPI()
        .post("/topology-device-map/create-edge", this.edge)
        .then(() => {
          this.$toasted.success("Add edge success");

          if (this.topology.nodeData.length != 0) this.clearTopology();
          this.getTopology();
          this.edge = {} as EdgeMap;
          this.addEdgeModal = false;
        })
        .catch(() => {
          this.$toasted.error("Add edge failed!");
        });
    },
    deleteDeviceMapAction() {
      this.$api_connection
        .secureAPI()
        .delete(`/topology-device-map/delete/${this.deleteMapID}`)
        .then(() => {
          this.$toasted.success("Delete device map success");

          if (this.topology.nodeData.length != 0) this.clearTopology();
          this.getTopology();
          this.deleteMapID = 0;
          this.deleteModal = false;
        })
        .catch(() => {
          this.$toasted.error("Delete device map failed!");
        });
    },
    clearTopology() {
      this.topology.network.destroy();
    },
  },
  mounted() {
    this.getAllTopology();
  },
});
</script>