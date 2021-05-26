<template>
  <div>
    <sui-table celled>
      <sui-table-header full-width>
        <sui-table-row>
          <sui-table-header-cell colspan="6">
            <sui-input
              size="small"
              placeholder="Search"
              icon="search"
              v-model="table.filter"
            />

            <sui-button
              floated="right"
              size="small"
              primary
              labeled
              @click="addClick"
            >
              <sui-icon name="microchip" /> Add interface
            </sui-button>
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>Name</sui-table-header-cell>
          <sui-table-header-cell>Mode</sui-table-header-cell>
          <sui-table-header-cell>VLANs</sui-table-header-cell>
          <sui-table-header-cell>NVLAN</sui-table-header-cell>
          <sui-table-header-cell>Status</sui-table-header-cell>
          <sui-table-header-cell />
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(obj, index) in tableFilter" :key="obj.id">
          <sui-table-cell>{{ obj.interface_name }}</sui-table-cell>
          <sui-table-cell>{{ obj.edges.mode.interface_mode }}</sui-table-cell>
          <sui-table-cell>{{
            getIntVlans(obj.edges.have_vlans)
          }}</sui-table-cell>
          <sui-table-cell>{{
            obj.edges.native_on_vlan.vlan_id
          }}</sui-table-cell>
          <sui-table-cell>{{
            obj.interface_shutdown ? "shutdown" : "no shutdown"
          }}</sui-table-cell>
          <sui-table-cell collapsing>
            <sui-icon name="edit" link color="yellow" @click="edit(index)" />
            <sui-icon
              name="trash"
              link
              color="red"
              @click="deleteInterface(index)"
            />
          </sui-table-cell>
        </sui-table-row>
        <sui-table-header-cell
          colspan="6"
          style="padding: 3em"
          v-if="!haveInterface"
        >
          Not have interface
        </sui-table-header-cell>
      </sui-table-body>
      <sui-table-footer v-if="haveInterface">
        <sui-table-row>
          <sui-table-header-cell colspan="6">
            <sui-menu pagination style="font-size: 10pt">
              <span v-for="p in getPageNumber" :key="p">
                <a
                  is="sui-menu-item"
                  color="black"
                  @click="changePagination(p)"
                  >{{ p }}</a
                >
              </span>
            </sui-menu>
          </sui-table-header-cell>
        </sui-table-row>
      </sui-table-footer>
    </sui-table>

    <!-- Add -->
    <div>
      <sui-modal v-model="addModal" :closable="false">
        <sui-modal-header>Add interface </sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="add" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Interface
              Information</sui-divider
            >
            <sui-form-field>
              <sui-form-fields fields="three">
                <sui-form-field width="seven">
                  <label>Interface Name</label>
                  <input
                    type="text"
                    placeholder="Device Name"
                    required
                    v-model="addInterface.interface_name"
                  />
                </sui-form-field>
                <sui-form-field width="seven">
                  <label>Interface Mode</label>
                  <sui-dropdown
                    placeholder="Interface Mode"
                    required
                    selection
                    :options="options"
                    v-model="selectedOption"
                  />
                </sui-form-field>
                <sui-form-field>
                  <label>Interface Status</label>
                  <div>
                    <sui-checkbox
                      :label="getInterfaceStatus"
                      toggle
                      v-model="interface_shutdown"
                      style="margin: 5px 0 0 5px"
                    />
                  </div>
                </sui-form-field>
              </sui-form-fields>
              <sui-form-fields
                fields="two"
                v-if="
                  getInterfaceMode == 'Access' || getInterfaceMode == 'Trunking'
                "
              >
                <sui-form-field v-if="getInterfaceMode == 'Access'">
                  <label>VLANs</label>
                  <sui-dropdown
                    fluid
                    :options="vlans"
                    placeholder="Vlans"
                    search
                    selection
                    required
                    v-model="selectedAccessVlan"
                  />
                </sui-form-field>
                <sui-form-field v-else>
                  <label>VLANs</label>
                  <sui-dropdown
                    multiple
                    fluid
                    :options="vlans"
                    placeholder="Vlans"
                    search
                    selection
                    required
                    v-model="selectedHaveVlans"
                  />
                </sui-form-field>
                <sui-form-field v-if="getInterfaceMode == 'Trunking'">
                  <label>Native VLAN</label>
                  <sui-dropdown
                    placeholder="Native Vlans"
                    required
                    search
                    selection
                    :options="vlans"
                    v-model="selectedOption2"
                  />
                </sui-form-field>
              </sui-form-fields>
            </sui-form-field>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add interface </sui-button>
              <sui-button @click="addModal = false" type="button">
                close
              </sui-button>
            </sui-form-field>
          </sui-form>
        </sui-modal-content>
      </sui-modal>
    </div>

    <!-- Edit -->
    <div>
      <sui-modal v-model="editModal" :closable="false">
        <sui-modal-header
          >Edit devie id {{ selectedInterface.id }}
        </sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="update" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Interface
              Information</sui-divider
            >
            <sui-form-field>
              <sui-form-fields fields="three">
                <sui-form-field width="seven">
                  <label>Interface Name</label>
                  <input
                    type="text"
                    placeholder="Device Name"
                    disabled
                    v-model="selectedInterface.interface_name"
                  />
                </sui-form-field>
                <sui-form-field width="seven">
                  <label>Interface Mode</label>
                  <sui-dropdown
                    placeholder="Interface Mode"
                    required
                    selection
                    :options="options"
                    v-model="selectedOption"
                  />
                </sui-form-field>
                <sui-form-field>
                  <label>Interface Status</label>
                  <sui-checkbox
                    :label="getInterfaceStatus"
                    toggle
                    v-model="interface_shutdown"
                    style="margin: 5px 0 0 5px"
                  />
                </sui-form-field>
              </sui-form-fields>
              <sui-form-fields
                fields="two"
                v-if="
                  getInterfaceMode == 'Access' || getInterfaceMode == 'Trunking'
                "
              >
                <sui-form-field v-if="getInterfaceMode == 'Access'">
                  <label>VLANs</label>
                  <sui-dropdown
                    fluid
                    :options="vlans"
                    placeholder="Vlans"
                    search
                    selection
                    required
                    v-model="selectedAccessVlan"
                  />
                </sui-form-field>
                <sui-form-field v-else>
                  <label>VLANs</label>
                  <sui-dropdown
                    multiple
                    fluid
                    :options="vlans"
                    placeholder="Vlans"
                    search
                    selection
                    required
                    v-model="selectedHaveVlans"
                  />
                </sui-form-field>
                <sui-form-field v-if="getInterfaceMode == 'Trunking'">
                  <label>Native VLAN</label>
                  <sui-dropdown
                    placeholder="Native Vlans"
                    required
                    search
                    selection
                    :options="vlans"
                    v-model="selectedOption2"
                  />
                </sui-form-field>
              </sui-form-fields>
            </sui-form-field>
            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Update interface </sui-button>
              <sui-button @click="editModal = false" type="button">
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
        <sui-modal-content text>
          <sui-segment v-if="loader">
            <sui-dimmer active inverted>
              <sui-loader>Wait a few</sui-loader>
            </sui-dimmer>
            <br />
            <br />
            <br />
          </sui-segment>
          <div v-else>
            Interface name: <b>{{ selectedInterface.interface_name }} </b><br />
            Interface mode:
            <b>{{ selectedInterface.edges.mode.interface_mode }} </b> <br />
            Interface VLANs:
            <b> {{ getIntVlans(selectedInterface.edges.have_vlans) }} </b>
            <br />
            Interface Native VLAN:
            <b>{{ selectedInterface.edges.native_on_vlan.vlan_id }} </b> <br />
          </div>
        </sui-modal-content>
        <sui-modal-actions v-if="!loader">
          <sui-button @click="deleteModal = false"> Cancel </sui-button>
          <sui-button negative @click="deleteInterfaceAction()">
            Delete
          </sui-button>
        </sui-modal-actions>
      </sui-modal>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import Vue from "vue";

import Device from "@/types/device";
import Interface from "@/types/interface";
import InterfaceMode from "@/types/interface-mode";
import Option from "@/types/option";
import Vlan from "@/types/vlan";

interface InterfaceTypeOption extends Option {
  type: InterfaceMode;
}

interface VlanOption extends Option {
  type: Vlan;
}

export default Vue.extend({
  props: {
    device_id: String,
  },
  metaInfo: {
    title: "Interface setting | NetCoCo",
  },
  data() {
    return {
      table: {
        perPage: 25,
        currentPagination: 1,
        showTable: [] as Interface[],
        filter: "",
      },
      allInterface: [] as Interface[],
      haveInterface: false,
      loader: false,
      deviceObj: {} as Device,
      allInterfaceMode: [] as InterfaceMode[],
      allVlans: [] as Vlan[],
      options: [] as InterfaceTypeOption[],
      selectedOption: 0 as number,
      selectedOption2: 0 as number,
      selectedHaveVlans: [] as number[],
      selectedAccessVlan: 0 as number,
      vlans: [] as VlanOption[],
      selectedInterface: {
        edges: {
          have_vlans: [] as Vlan[],
          native_on_vlan: {} as Vlan,
          mode: {} as InterfaceMode,
          on_device: {} as Device,
        },
      } as Interface,
      addInterface: {
        edges: {
          have_vlans: [] as Vlan[],
          native_on_vlan: {} as Vlan,
          mode: {} as InterfaceMode,
          on_device: {} as Device,
        },
      } as Interface,
      interface_shutdown: true,
      editModal: false,
      addModal: false,
      deleteModal: false,
    };
  },
  computed: {
    getInterfaceStatus(): string {
      return this.interface_shutdown ? "Shutdown" : "No Shutdown";
    },
    getPageNumber(): number {
      const pageNumber: number =
        this.table.showTable.length / this.table.perPage;
      return Math.ceil(pageNumber) == 0 ? 1 : Math.ceil(pageNumber);
    },
    getInterfaceMode(): string {
      return this.options[this.selectedOption] != null
        ? this.options[this.selectedOption].text!
        : "Access";
    },
    tableFilter() {
      if (this.allInterface) {
        const filtered = this.allInterface.filter((element) => {
          const int_name = element.interface_name.toString().toLowerCase();
          const int_mode = element
            .edges!.mode!.interface_mode.toString()
            .toLowerCase();
          const searchTerm = this.table.filter.toLowerCase();

          return int_name.includes(searchTerm) || int_mode.includes(searchTerm);
        }) as any;

        const fromElement: number =
          (this.table.currentPagination - 1) * this.table.perPage;
        const toElement: number =
          (this.table.currentPagination + 1) * this.table.perPage - 1;

        var data = filtered.slice(fromElement, toElement);
        this.table.showTable = filtered;
        this.haveInterface = filtered.length > 0 ? true : false;

        return data;
      }
    },
  },
  methods: {
    getIntVlans(have_vlans: Vlan[]) {
      var str: string = "";

      if (have_vlans.length > 0) {
        if (have_vlans.length > 1) {
          have_vlans.forEach((element, index) => {
            if (index == have_vlans.length - 1) {
              str += `${element.vlan_id!}`;
            } else {
              str += `${element.vlan_id!}, `;
            }
          });
        } else {
          str += `${have_vlans[0].vlan_id!}`;
        }
      }

      return str;
    },
    addClick() {
      this.interface_shutdown = true;
      this.addModal = true;
    },
    changePagination(pNumber: number) {
      this.table.currentPagination = pNumber;
    },
    getAllInterfaceMode() {
      this.$api_connection
        .secureAPI()
        .get("/net-interface-mode/get")
        .then((response) => {
          this.allInterfaceMode = response.data as InterfaceMode[];

          this.allInterfaceMode.forEach(
            (element: InterfaceMode, index: number) => {
              this.options.push({
                text: element.interface_mode as string,
                value: index as number,
                type: element,
              });
            }
          );
        });
    },
    getallInterface() {
      this.allInterface = [] as Interface[];
      this.$api_connection
        .secureAPI()
        .get(`/device/get/${this.device_id}`)
        .then((response) => {
          this.deviceObj = response.data as Device;
          this.allInterface = this.deviceObj.edges!.interfaces as Interface[];

          this.allVlans = this.deviceObj.edges?.store_vlans as Vlan[];
          this.vlans = [];
          this.allVlans.forEach((element: Vlan, index: number) => {
            this.vlans.push({
              text: `vid: ${element.vlan_id}` as string,
              value: index as number,
              type: element,
            });
          });
          if (this.allInterface) this.haveInterface = true;
        });
    },
    edit(i: number) {
      this.selectedInterface = this.table.showTable[i];
      this.interface_shutdown = this.selectedInterface.interface_shutdown!;
      const interfaceModeIndex = this.options.findIndex(
        (element) => element.type.id == this.selectedInterface.edges?.mode?.id
      );
      this.selectedOption = interfaceModeIndex;
      this.selectedHaveVlans = [];
      if (this.selectedInterface.edges?.mode?.interface_mode == "Access") {
        this.selectedAccessVlan = this.vlans.findIndex((p) => {
          const selectedVLAN = this.selectedInterface.edges!.have_vlans?.find(
            (e) => {
              return e.id == p.type.id;
            }
          );
          return p.type.id == selectedVLAN?.id;
        });
        this.selectedHaveVlans.push(this.selectedAccessVlan);
      } else if (
        this.selectedInterface.edges!.mode!.interface_mode == "Trunking"
      ) {
        this.selectedInterface.edges?.have_vlans!.forEach((item) => {
          this.selectedHaveVlans.push(
            this.vlans.findIndex((e) => {
              return e.type.vlan_id == item.vlan_id;
            })
          );
        });
      }
       this.selectedOption2 = this.vlans.findIndex((p) => {
          return p.type.id == this.selectedInterface.edges?.native_on_vlan?.id
        });

      this.editModal = true;
    },
    deleteInterface(i: number) {
      this.selectedInterface = this.table.showTable[i];
      this.deleteModal = true;
    },
    add() {
      var temp = this.deviceObj;
      temp.edges = {};
      this.addInterface.interface_shutdown = this.interface_shutdown;
      this.addInterface.edges!.mode = this.options[this.selectedOption].type;
      this.addInterface.edges!.on_device! = temp;
      this.addInterface.edges!.native_on_vlan! = this.vlans[
        this.selectedOption2
      ].type;

      if (this.addInterface.edges?.mode.interface_mode == "Access") {
        this.addInterface.edges!.have_vlans! = [];
        this.addInterface.edges?.have_vlans?.push(
          this.vlans[this.selectedAccessVlan].type
        );
      } else if (this.addInterface.edges?.mode.interface_mode == "Trunking") {
        this.addInterface.edges!.have_vlans! = [];
        this.selectedHaveVlans.forEach((item) => {
          this.addInterface.edges?.have_vlans?.push(this.vlans[item].type);
        });
      }

      this.selectedHaveVlans = [];
      this.selectedAccessVlan = 0;

      this.loader = true;
      this.$api_connection
        .secureAPI()
        .post("/net-interface/create", this.addInterface)
        .then(() => {
          this.$toasted.success("Add interface success");

          this.getallInterface();
          this.addModal = false;
          this.addInterface = {
            edges: {
              mode: {} as InterfaceMode,
              on_device: {} as Device,
            },
          } as Interface;
          this.loader = false;
        })
        .catch(() => {
          this.loader = false;
          this.$toasted.error("Add interface failed!");
        });
    },
    update() {
      this.selectedInterface.edges!.mode = this.options[
        this.selectedOption
      ].type;
      var temp = this.deviceObj;
      temp.edges = {};
      this.selectedInterface.interface_shutdown = this.interface_shutdown;
      this.selectedInterface.edges!.on_device! = temp;
      this.loader = true;

      this.selectedInterface.edges!.native_on_vlan! = this.vlans[
        this.selectedOption2
      ].type;

      if (this.selectedInterface.edges?.mode.interface_mode == "Access") {
        this.selectedInterface.edges!.have_vlans! = [];
        this.selectedInterface.edges?.have_vlans?.push(
          this.vlans[this.selectedAccessVlan].type
        );
      } else if (
        this.selectedInterface.edges?.mode.interface_mode == "Trunking"
      ) {
        this.selectedInterface.edges!.have_vlans! = [];
        this.selectedHaveVlans.forEach((item) => {
          this.selectedInterface.edges?.have_vlans?.push(this.vlans[item].type);
        });
      }

      this.selectedHaveVlans = [];

      this.$api_connection
        .secureAPI()
        .post("/net-interface/edit", this.selectedInterface)
        .then(() => {
          this.$toasted.success("Update interface information success");

          this.getallInterface();
          this.editModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Update interface failed!");
          this.loader = false;
        });
    },
    deleteInterfaceAction() {
      this.loader = true;
      this.$api_connection
        .secureAPI()
        .delete(`/net-interface/delete/${this.selectedInterface.id}`)
        .then(() => {
          this.$toasted.success("Delete interface success");

          this.getallInterface();
          this.deleteModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Delete interface failed!");
          this.loader = false;
        });
    },
  },
  mounted() {
    this.getallInterface();
    this.getAllInterfaceMode();
  },
});
</script>