<template>
  <div>
    <sui-table celled>
      <sui-table-header full-width>
        <sui-table-row>
          <sui-table-header-cell colspan="7">
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
              <sui-icon name="microchip" /> Add po-interface
            </sui-button>
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>PoID</sui-table-header-cell>
          <sui-table-header-cell>Mode</sui-table-header-cell>
          <sui-table-header-cell>VLANs / IP Addr</sui-table-header-cell>
          <sui-table-header-cell>NVLAN / Netmask</sui-table-header-cell>
          <sui-table-header-cell>Layer</sui-table-header-cell>
          <sui-table-header-cell>Status</sui-table-header-cell>
          <sui-table-header-cell />
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(obj, index) in tableFilter" :key="obj.id">
          <sui-table-cell>{{ obj.po_interface_id }}</sui-table-cell>
          <sui-table-cell>{{ obj.edges.mode.interface_mode }}</sui-table-cell>
          <sui-table-cell>
            <span v-if="obj.edges.on_layer.interface_layer == 2">
              <span v-if="obj.edges.have_vlans">
                {{ getIntVlans(obj.edges.have_vlans) }}
              </span>
              <span v-else> - </span>
            </span>
            <span v-else-if="obj.edges.on_layer.interface_layer == 3">
              {{ obj.edges.on_ip_address.ip_address }}
            </span>
          </sui-table-cell>
          <sui-table-cell>
            <span v-if="obj.edges.on_layer.interface_layer == 2">
              <span v-if="obj.edges.native_on_vlan">
                {{ obj.edges.native_on_vlan.vlan_id }}
              </span>
              <span v-else> - </span>
            </span>
            <span v-else-if="obj.edges.on_layer.interface_layer == 3">
              {{ obj.edges.on_ip_address.subnet_mask }}
            </span>
          </sui-table-cell>
          <sui-table-cell
            >layer {{ obj.edges.on_layer.interface_layer }}</sui-table-cell
          >
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
          <sui-table-header-cell colspan="7">
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
        <sui-modal-header>Add port-channel interface </sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="add" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Interface layer
            </sui-divider>
            <sui-form-fields inline>
              <label>Select interface layer</label>
              <sui-form-field v-for="obj in allLayers" :key="obj.id">
                <sui-checkbox
                  :label="`Layer ${obj.interface_layer}`"
                  radio
                  :value="obj"
                  v-model="selectLayer"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Port-channel
              Interface Information</sui-divider
            >

            <span v-if="selectLayer.interface_layer == 2">
              <sui-form-field>
                <sui-form-fields fields="three">
                  <sui-form-field width="seven">
                    <label>Port-channel ID</label>
                    <input
                      type="text"
                      placeholder="Po ID"
                      required
                      disabled
                      v-model="addInterface.po_interface_id"
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
                    getInterfaceMode == 'Access' ||
                    getInterfaceMode == 'Trunking'
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
            </span>
            <span v-if="selectLayer.interface_layer == 3">
              <sui-form-field>
                <sui-form-fields fields="two">
                  <sui-form-field width="seven">
                    <label>Port-channel ID</label>
                    <input
                      type="text"
                      placeholder="Po ID"
                      required
                      disabled
                      v-model="addInterface.po_interface_id"
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

                <sui-form-fields fields="two">
                  <sui-form-field>
                    <label>IP Address</label>
                    <sui-input
                      type="text"
                      :error="ipHasError"
                      placeholder="IP Address"
                      required
                      v-model="ipAddress.ip_address"
                      style="width: 50%"
                    />
                    <sui-label
                      basic
                      pointing="left"
                      v-if="ipAddress.ip_address == ''"
                      >Ex. 172.31.255.254
                    </sui-label>
                    <sui-label
                      basic
                      color="red"
                      pointing="left"
                      v-else-if="ipHasError"
                      >Wrong!, Ex. 172.31.255.254
                    </sui-label>
                    <sui-label
                      basic
                      color="green"
                      pointing="left"
                      v-else-if="!ipHasError"
                      >IP Address is correct.
                    </sui-label>
                  </sui-form-field>

                  <sui-form-field>
                    <label>Subnet Mask</label>
                    <sui-input
                      type="text"
                      placeholder="Subnet Mask"
                      required
                      style="width: 50%"
                      :error="subnetHasError"
                      v-model="ipAddress.subnet_mask"
                    />
                    <sui-label
                      basic
                      pointing="left"
                      v-if="ipAddress.subnet_mask == ''"
                      >Ex. 255.255.255.0
                    </sui-label>
                    <sui-label
                      basic
                      color="red"
                      pointing="left"
                      v-else-if="subnetHasError"
                      >Wrong!, Ex. 255.255.255.0
                    </sui-label>
                    <sui-label
                      basic
                      color="green"
                      pointing="left"
                      v-else-if="!subnetHasError"
                      >Subnet mask is correct.
                    </sui-label>
                  </sui-form-field>
                </sui-form-fields>
              </sui-form-field>
            </span>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add port-channel </sui-button>
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
              ><sui-icon size="large" name="info circle" /> Interface layer
            </sui-divider>
            <sui-form-fields inline>
              <label>Select interface layer</label>
              <sui-form-field v-for="obj in allLayers" :key="obj.id">
                <sui-checkbox
                  :label="`Layer ${obj.interface_layer}`"
                  radio
                  :value="obj"
                  v-model="selectLayer"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Port-channel
              Information</sui-divider
            >
            <span v-if="selectLayer.interface_layer == 2">
              <sui-form-field>
                <sui-form-fields fields="three">
                  <sui-form-field width="seven">
                    <label>Port-channel ID</label>
                    <input
                      type="text"
                      placeholder="Po ID"
                      disabled
                      v-model="selectedInterface.po_interface_id"
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
                    getInterfaceMode == 'Access' ||
                    getInterfaceMode == 'Trunking'
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
                  <span v-if="getInterfaceMode == 'Trunking'">
                    <sui-form-field>
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
                    <sui-form-field>
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
                  </span>
                </sui-form-fields>
              </sui-form-field>
            </span>

            <span v-if="selectLayer.interface_layer == 3">
              <sui-form-field>
                <sui-form-fields fields="two">
                  <sui-form-field width="seven">
                    <label>Port-channel ID</label>
                    <input
                      type="text"
                      placeholder="Po ID"
                      required
                      disabled
                      v-model="selectedInterface.po_interface_id"
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

                <sui-form-fields fields="two">
                  <sui-form-field>
                    <label>IP Address</label>
                    <sui-input
                      type="text"
                      :error="ipHasError"
                      placeholder="IP Address"
                      required
                      v-model="ipAddress.ip_address"
                      style="width: 50%"
                    />
                    <sui-label
                      basic
                      pointing="left"
                      v-if="ipAddress.ip_address == ''"
                      >Ex. 172.31.255.254
                    </sui-label>
                    <sui-label
                      basic
                      color="red"
                      pointing="left"
                      v-else-if="ipHasError"
                      >Wrong!, Ex. 172.31.255.254
                    </sui-label>
                    <sui-label
                      basic
                      color="green"
                      pointing="left"
                      v-else-if="!ipHasError"
                      >IP Address is correct.
                    </sui-label>
                  </sui-form-field>

                  <sui-form-field>
                    <label>Subnet Mask</label>
                    <sui-input
                      type="text"
                      placeholder="Subnet Mask"
                      required
                      style="width: 50%"
                      :error="subnetHasError"
                      v-model="ipAddress.subnet_mask"
                    />
                    <sui-label
                      basic
                      pointing="left"
                      v-if="ipAddress.subnet_mask == ''"
                      >Ex. 255.255.255.0
                    </sui-label>
                    <sui-label
                      basic
                      color="red"
                      pointing="left"
                      v-else-if="subnetHasError"
                      >Wrong!, Ex. 255.255.255.0
                    </sui-label>
                    <sui-label
                      basic
                      color="green"
                      pointing="left"
                      v-else-if="!subnetHasError"
                      >Subnet mask is correct.
                    </sui-label>
                  </sui-form-field>
                </sui-form-fields>
              </sui-form-field>
            </span>

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
            <span v-if="selectedInterface.edges.on_layer.interface_layer == 2">
              Interface mode:
              <b>{{ selectedInterface.edges.mode.interface_mode }} </b> <br />
              Interface VLANs:
              <b> {{ getIntVlans(selectedInterface.edges.have_vlans) }} </b>
              <br />
              Interface Native VLAN:
              <b>{{ selectedInterface.edges.native_on_vlan.vlan_id }} </b>
              <br />
            </span>
            <span
              v-else-if="selectedInterface.edges.on_layer.interface_layer == 3"
            >
              Interface name:
              <b>Port-channel {{ selectedInterface.po_interface_id }} </b>
              <br />
              IP Address:
              <b> {{ selectedInterface.edges.on_ip_address.ip_address }} </b>
              <br />
              Subnet Mask:
              <b>{{ selectedInterface.edges.on_ip_address.subnet_mask }} </b>
              <br />
            </span>
            <span v-else>
              <b>None</b> <br />

              <br />
            </span>
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
import PoInterface from "@/types/po-interface";
import InterfaceMode from "@/types/interface-mode";
import Option from "@/types/option";
import Vlan from "@/types/vlan";
import InterfaceLayer from "@/types/interface-layer";
import IPAddress from "@/types/ip-address";

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
      ipAddrRegx:
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      subnetRegx:
        /^(((255.){3}(255|254|252|248|240|224|192|128|0+))|((255.){2}(255|254|252|248|240|224|192|128|0+).0)|((255.)(255|254|252|248|240|224|192|128|0+)(.0+){2})|((255|254|252|248|240|224|192|128|0+)(.0+){3}))$/,
      ipHasError: false,
      subnetHasError: false,
      ipAddress: {
        ip_address: "",
        subnet_mask: "",
      } as IPAddress,
      table: {
        perPage: 25,
        currentPagination: 1,
        showTable: [] as PoInterface[],
        filter: "",
      },
      allInterface: [] as PoInterface[],
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
          on_layer: {} as InterfaceLayer,
          on_ip_address: {} as IPAddress,
        },
      } as PoInterface,
      addInterface: {
        edges: {
          have_vlans: [] as Vlan[],
          native_on_vlan: {} as Vlan,
          mode: {} as InterfaceMode,
          on_layer: {} as InterfaceLayer,
          on_ip_address: {} as IPAddress,
        },
      } as PoInterface,
      interface_shutdown: true,
      editModal: false,
      addModal: false,
      deleteModal: false,
      allLayers: [] as InterfaceLayer[],
      selectLayer: {} as InterfaceLayer,
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
          const int_name = element.po_interface_id.toString().toLowerCase();
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
      if (this.allInterface)
        this.addInterface.po_interface_id = this.allInterface.length + 1;
      else this.addInterface.po_interface_id = 1;

      this.selectLayer = this.allLayers.find((element) => {
        return element.interface_layer == 2;
      }) as InterfaceLayer;
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

          this.allInterfaceMode.forEach((element: InterfaceMode) => {
            if (element.interface_mode != "EtherChannel")
              this.options.push({
                text: element.interface_mode as string,
                value: this.options.length as number,
                type: element,
              });
          });
        });
    },
    getallInterface() {
      this.allInterface = [] as PoInterface[];
      this.$api_connection
        .secureAPI()
        .get(`/device/get/${this.device_id}`)
        .then((response) => {
          this.deviceObj = response.data as Device;

          this.allInterface = this.deviceObj.edges!
            .po_interfaces as PoInterface[];
          this.allVlans = this.deviceObj.edges?.store_vlans as Vlan[];
          this.vlans = [];
          this.allVlans.forEach((element: Vlan, index: number) => {
            this.vlans.push({
              text: `vid: ${element.vlan_id}` as string,
              value: index as number,
              type: element,
            });
          });

          this.$api_connection
            .secureAPI()
            .get("/net-interface-layer/get")
            .then((response) => {
              this.allLayers = [];
              var data = response.data as InterfaceLayer[];
              data.forEach((element) => {
                if (
                  !(
                    this.$notSupportL3.includes(
                      this.deviceObj.edges!.in_platform!.device_platform_name
                    ) && element.interface_layer == 3
                  )
                )
                  this.allLayers.push(element);
              });
            });

          if (this.allInterface) this.haveInterface = true;
        });
    },
    edit(i: number) {
      if (!this.table.showTable[i].edges!.have_vlans)
        this.table.showTable[i].edges!.have_vlans = [] as Vlan[];
      if (!this.table.showTable[i].edges!.native_on_vlan)
        this.table.showTable[i].edges!.native_on_vlan = this.vlans.find(
          (element) => {
            return element.type.vlan_id == 1;
          }
        )?.type;

      this.selectedInterface = this.table.showTable[i];
      this.selectLayer = this.allLayers.find((element) => {
        return (
          element.interface_layer ==
          this.selectedInterface.edges!.on_layer!.interface_layer
        );
      }) as InterfaceLayer;

      if (!this.selectedInterface.edges?.on_ip_address)
        this.selectedInterface.edges!.on_ip_address = {} as IPAddress;

      this.interface_shutdown = this.selectedInterface.po_interface_shutdown!;
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
        return p.type.id == this.selectedInterface.edges?.native_on_vlan?.id;
      });

      this.ipAddress = this.selectedInterface.edges!.on_ip_address!;

      this.editModal = true;
    },
    deleteInterface(i: number) {
      this.selectedInterface = this.table.showTable[i];
      this.deleteModal = true;
    },
    add() {
      if (
        this.selectLayer.interface_layer == 3 &&
        (this.ipHasError || this.subnetHasError)
      ) {
        this.$toasted.info("Please correct ip address or subnet mask");
      } else {
        var temp = this.deviceObj;
        temp.edges = {};
        this.addInterface.po_interface_shutdown = this.interface_shutdown;
        this.addInterface.edges!.mode = this.options[this.selectedOption].type;
        this.addInterface.edges!.on_device! = temp;
        this.addInterface.edges!.native_on_vlan! =
          this.vlans[this.selectedOption2].type;

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
        this.addInterface.edges!.on_layer! = this.selectLayer;
        this.addInterface.edges!.on_ip_address! = this.ipAddress;
        this.loader = true;
        this.$api_connection
          .secureAPI()
          .post("/po-interface/create", this.addInterface)
          .then(() => {
            this.$toasted.success("Add port-channel interface success");

            this.getallInterface();
            this.addModal = false;
            this.addInterface = {
              edges: {
                have_vlans: [] as Vlan[],
                native_on_vlan: {} as Vlan,
                mode: {} as InterfaceMode,
                on_layer: {} as InterfaceLayer,
                on_ip_address: {} as IPAddress,
              },
            } as PoInterface;
            this.loader = false;
          })
          .catch((err) => {
            if (err.response.data.error)
              this.$toasted.error(this.$capitalize(err.response.data.error));
            else this.$toasted.error("Error!!");
            this.loader = false;
          });
      }
    },
    update() {
      if (
        this.selectLayer.interface_layer == 3 &&
        (this.ipHasError || this.subnetHasError)
      ) {
        this.$toasted.info("Please correct ip address or subnet mask");
      } else {
        this.selectedInterface.edges!.mode =
          this.options[this.selectedOption].type;
        var temp = this.deviceObj;
        temp.edges = {};
        this.selectedInterface.po_interface_shutdown = this.interface_shutdown;
        this.selectedInterface.edges!.on_device! = temp;

        this.selectedInterface.edges!.native_on_vlan! =
          this.vlans[this.selectedOption2].type;

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
            this.selectedInterface.edges?.have_vlans?.push(
              this.vlans[item].type
            );
          });
        }

        this.selectedHaveVlans = [];
        this.selectedInterface.edges!.on_layer! = this.selectLayer;
        this.selectedInterface.edges!.on_ip_address! = this.ipAddress;
        this.loader = true;
        this.$api_connection
          .secureAPI()
          .post("/po-interface/edit", this.selectedInterface)
          .then(() => {
            this.$toasted.success(
              "Update port-channel interface information success"
            );

            this.getallInterface();
            this.editModal = false;
            this.loader = false;
          })
          .catch((err) => {
            if (err.response.data.error)
              this.$toasted.error(this.$capitalize(err.response.data.error));
            else this.$toasted.error("Error!!");
            this.loader = false;
          });
      }
    },
    deleteInterfaceAction() {
      this.loader = true;
      this.$api_connection
        .secureAPI()
        .delete(`/po-interface/delete/${this.selectedInterface.id}`)
        .then(() => {
          this.$toasted.success("Delete port-channel interface success");

          this.getallInterface();
          this.deleteModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Delete port-channel interface failed!");
          this.loader = false;
        });
    },

    ipAddrValidation() {
      this.ipHasError = !this.ipAddrRegx.test(this.ipAddress.ip_address);
    },
    subnetValidation() {
      this.subnetHasError = !this.subnetRegx.test(this.ipAddress.subnet_mask);
    },
  },
  mounted() {
    this.getallInterface();
    this.getAllInterfaceMode();
  },
  watch: {
    "ipAddress.ip_address"() {
      this.ipAddrValidation();
    },
    "ipAddress.subnet_mask"() {
      this.subnetValidation();
    },
  },
});
</script>