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
              @click="addModal = true"
            >
              <sui-icon name="microchip" /> Add Device
            </sui-button>
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>Name</sui-table-header-cell>
          <sui-table-header-cell>Hostname</sui-table-header-cell>
          <sui-table-header-cell>SSH Port</sui-table-header-cell>
          <sui-table-header-cell>Platform</sui-table-header-cell>
          <sui-table-header-cell>Type</sui-table-header-cell>
          <sui-table-header-cell />
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(device, index) in tableFilter" :key="device.id">
          <sui-table-cell>{{ device.device_name }}</sui-table-cell>
          <sui-table-cell>{{ device.device_hostname }}</sui-table-cell>
          <sui-table-cell>{{ device.device_ssh_port }}</sui-table-cell>
          <sui-table-cell>{{
            device.edges.in_platform.device_platform_name
          }}</sui-table-cell>
          <sui-table-cell>{{
            device.edges.in_type.device_type_name
          }}</sui-table-cell>
          <sui-table-cell collapsing>
            <sui-button
              icon="plus"
              color="blue"
              content="interface"
              size="mini"
              @click="addInterface(index)"
            />
            <sui-button
              icon="minus"
              color="grey"
              content="interface"
              size="mini"
              @click="cleanInterface(index)"
            />

            <sui-icon name="edit" link color="yellow" @click="edit(index)" />
            <sui-icon
              name="trash"
              link
              color="red"
              @click="deleteDevice(index)"
            />
          </sui-table-cell>
        </sui-table-row>

        <sui-table-header-cell
          colspan="6"
          style="padding: 3em"
          v-if="!haveDevice"
        >
          Not have device
        </sui-table-header-cell>
      </sui-table-body>
      <sui-table-footer v-if="haveDevice">
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
        <sui-modal-header>Add device </sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="add" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Device
              Information</sui-divider
            >
            <sui-form-fields fields="three">
              <sui-form-field width="seven">
                <label>Device Name</label>
                <input
                  type="text"
                  placeholder="Device Name"
                  required
                  v-model="addDevice.device_name"
                />
              </sui-form-field>
              <sui-form-field width="seven">
                <label>Device Hostname</label>
                <input
                  type="text"
                  placeholder="Device Hostname"
                  required
                  v-model="addDevice.device_hostname"
                />
              </sui-form-field>
              <sui-form-field>
                <label>SSH Port</label>
                <input
                  type="text"
                  placeholder="SSH Port"
                  required
                  v-model.number="addDevice.device_ssh_port"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-form-fields fields="two">
              <sui-form-field>
                <label>Device Type</label>
                <sui-dropdown
                  placeholder="Device Type"
                  required
                  search
                  selection
                  :options="options"
                  v-model="selectedOption"
                />
              </sui-form-field>

              <sui-form-field>
                <label>Device Platform</label>
                <sui-dropdown
                  placeholder="Device Platform"
                  required
                  search
                  selection
                  :options="options2"
                  v-model="selectedOption2"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-divider horizontal style="margin: 2em 0"
              ><sui-icon size="large" name="lock" /> Authentication
            </sui-divider>

            <sui-form-field>
              <sui-form-fields fields="three">
                <sui-form-field>
                  <label>Device Username</label>
                  <input
                    type="text"
                    placeholder="Device Username"
                    required
                    v-model="addDevice.device_username"
                  />
                </sui-form-field>
                <sui-form-field>
                  <label>Device Password</label>
                  <input
                    type="password"
                    placeholder="Device Password"
                    required
                    v-model="addDevice.device_password"
                  />
                </sui-form-field>
                <sui-form-field>
                  <label>Device Enable Secret</label>
                  <input
                    type="password"
                    placeholder="Enable Secret"
                    required
                    v-model="addDevice.device_secret"
                  />
                </sui-form-field>
              </sui-form-fields>
            </sui-form-field>
            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add device </sui-button>
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
          >Edit devie id {{ selectedDevice.id }}
        </sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="update" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Device
              Information</sui-divider
            >

            <sui-form-fields fields="three">
              <sui-form-field width="seven">
                <label>Device Name</label>
                <input
                  type="text"
                  placeholder="Device Name"
                  required
                  v-model="selectedDevice.device_name"
                />
              </sui-form-field>
              <sui-form-field width="seven">
                <label>Device Hostname</label>
                <input
                  type="text"
                  placeholder="Device Hostname"
                  required
                  v-model="selectedDevice.device_hostname"
                />
              </sui-form-field>
              <sui-form-field>
                <label>SSH Port</label>
                <input
                  type="text"
                  placeholder="SSH Port"
                  required
                  v-model.number="selectedDevice.device_ssh_port"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-form-fields fields="two">
              <sui-form-field>
                <label>Device Type</label>
                <sui-dropdown
                  placeholder="Device Type"
                  required
                  search
                  selection
                  :options="options"
                  v-model="selectedOption"
                />
              </sui-form-field>

              <sui-form-field>
                <label>Device Platform</label>
                <sui-dropdown
                  placeholder="Device Platform"
                  required
                  search
                  selection
                  :options="options2"
                  v-model="selectedOption2"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-divider horizontal style="margin: 2em 0"
              ><sui-icon size="large" name="lock" /> Authentication
            </sui-divider>

            <sui-form-field>
              <sui-form-fields fields="three">
                <sui-form-field>
                  <label>Device Username</label>
                  <input
                    type="text"
                    placeholder="Device Username"
                    required
                    v-model="selectedDevice.device_username"
                  />
                </sui-form-field>
                <sui-form-field>
                  <label>Device Password</label>
                  <input
                    type="password"
                    placeholder="Device Password"
                    v-model="selectedDevice.device_password"
                  />
                </sui-form-field>
                <sui-form-field>
                  <label>Device Enable Secret</label>
                  <input
                    type="password"
                    placeholder="Enable Secret"
                    v-model="selectedDevice.device_secret"
                  />
                </sui-form-field>
              </sui-form-fields>
            </sui-form-field>
            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Update device </sui-button>
              <sui-button @click="editModal = false" type="button">
                close
              </sui-button>
            </sui-form-field>
          </sui-form>
        </sui-modal-content>
      </sui-modal>
    </div>

    <div>
      <!-- Add Interface -->
      <sui-modal v-model="addIntModal" size="mini" :closable="false">
        <sui-modal-header>Generate interface</sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="generateInterface" :loading="loader">
            <sui-form-field>
              <label>Interface Prefix</label>
              <sui-input
                placeholder="Prefix example. Gigabit1/0/x"
                v-model="net_interface.prefix"
                required
              />
            </sui-form-field>

            <sui-form-fields fields="two">
              <sui-form-field>
                <div class="ui labeled input">
                  <div class="ui label">From</div>
                  <input
                    type="number"
                    min="0"
                    max="48"
                    v-model.number="net_interface.fromInt"
                    required
                  />
                </div>
              </sui-form-field>
              <sui-form-field>
                <div class="ui labeled input">
                  <div class="ui label">To</div>
                  <input
                    type="number"
                    min="0"
                    max="48"
                    v-model.number="net_interface.toInt"
                    required
                  />
                </div>
              </sui-form-field>
            </sui-form-fields>
            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add interface </sui-button>
              <sui-button @click="addIntModal = false" type="button">
                close
              </sui-button>
            </sui-form-field>
          </sui-form>
        </sui-modal-content>
      </sui-modal>
    </div>

    <div>
      <!-- Clean Interface -->
      <sui-modal v-model="cleanModal" size="mini" :closable="false">
        <sui-modal-header>Are you sure to clean interface?</sui-modal-header>
        <sui-modal-content text>
          <div :loading="loader">
            Device Hostname: <b>{{ selectedDevice.device_hostname }} </b><br />
            Device Name: <b>{{ selectedDevice.device_name }} </b> <br />
          </div>
        </sui-modal-content>
        <sui-modal-actions v-if="!loader">
          <sui-button @click="cleanModal = false"> Cancel </sui-button>
          <sui-button negative @click="cleanInterfaceAction()">
            Clean
          </sui-button>
        </sui-modal-actions>
      </sui-modal>
    </div>

    <div>
      <!-- Delete -->
      <sui-modal v-model="deleteModal" size="mini" :closable="false">
        <sui-modal-header>Are you sure to delete?</sui-modal-header>
        <sui-modal-content text>
          <div :loading="loader">
            Device Hostname: <b>{{ selectedDevice.device_hostname }} </b><br />
            Device Name: <b>{{ selectedDevice.device_name }} </b> <br />
          </div>
        </sui-modal-content>
        <sui-modal-actions v-if="!loader">
          <sui-button @click="deleteModal = false"> Cancel </sui-button>
          <sui-button negative @click="deleteDeviceAction()">
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
import DeviceType from "@/types/device-type";
import DevicePlatform from "@/types/device-platform";
import Option from "@/types/option";
import Interface from "@/types/interface";
import InterfaceMode from "@/types/interface-mode";

interface DeviceTypeOption extends Option {
  type: DeviceType;
}
interface DevicePlatformOption extends Option {
  type: DevicePlatform;
}

export default Vue.extend({
  metaInfo: {
    title: "Device management | NetCoCo",
  },
  data() {
    return {
      table: {
        perPage: 25,
        currentPagination: 1,
        showTable: [] as Device[],
        filter: "",
      },
      allDevice: [] as Device[],
      haveDevice: false,
      loader: false,
      allDeviceType: [] as DeviceType[],
      options: [] as DeviceTypeOption[],
      selectedOption: 0 as number,
      options2: [] as DevicePlatformOption[],
      selectedOption2: 0 as number,
      selectedDevice: {} as Device,
      addDevice: {
        device_ssh_port: 22,
        edges: {
          in_type: {} as DeviceType,
          in_platform: {} as DevicePlatform,
        },
      } as Device,
      net_interface: {
        allInt: [] as Interface[],
        prefix: "",
        fromInt: 1,
        toInt: 24,
        on_device: {} as Device,
      },
      allInterfaceMode: [] as InterfaceMode[],
      allDevicePlatform: [] as DevicePlatform[],
      editModal: false,
      addModal: false,
      deleteModal: false,
      addIntModal: false,
      cleanModal: false,
    };
  },
  computed: {
    getPageNumber(): number {
      const pageNumber: number =
        this.table.showTable.length / this.table.perPage;
      return Math.ceil(pageNumber) == 0 ? 1 : Math.ceil(pageNumber);
    },
    tableFilter() {
      const filtered = this.allDevice.filter((element) => {
        const device_name = element.device_name!.toString().toLowerCase();
        const device_hostname = element
          .device_hostname!.toString()
          .toLowerCase();
        const device_username = element
          .device_username!.toString()
          .toLowerCase();
        const device_ssh_port = element
          .device_ssh_port!.toString()
          .toLowerCase();
        const device_type_name = element
          .edges!.in_type!.device_type_name!.toString()
          .toLowerCase();
        const searchTerm = this.table.filter.toLowerCase();

        return (
          device_name.includes(searchTerm) ||
          device_hostname.includes(searchTerm) ||
          device_username.includes(searchTerm) ||
          device_ssh_port.includes(searchTerm) ||
          device_type_name.includes(searchTerm)
        );
      }) as any;

      const fromElement: number =
        (this.table.currentPagination - 1) * this.table.perPage;
      const toElement: number =
        (this.table.currentPagination + 1) * this.table.perPage - 1;

      var data = filtered.slice(fromElement, toElement);
      this.table.showTable = filtered;
      this.haveDevice = filtered.length > 0 ? true : false;

      return data;
    },
  },
  methods: {
    changePagination(pNumber: number) {
      this.table.currentPagination = pNumber;
    },
    getAllInterfaceMode() {
      this.$api_connection
        .secureAPI()
        .get("/net-interface-mode/get")
        .then((response) => {
          this.allInterfaceMode = response.data as InterfaceMode[];
        });
    },
    getAllDevicePlatform() {
      this.$api_connection
        .secureAPI()
        .get("/device-platform/get")
        .then((response) => {
          this.allDevicePlatform = response.data as DevicePlatform[];
          this.allDevicePlatform.forEach((element: DevicePlatform, index) => {
            this.options2.push({
              text: element.device_platform_name,
              value: index as number,
              type: element,
            });
          });
        });
    },
    getAllDevice() {
      this.$api_connection
        .secureAPI()
        .get("/device/get")
        .then((response) => {
          this.allDevice = response.data as Device[];
          this.allDevice.forEach((element) => {
            (element.device_password = ""), (element.device_secret = "");
          });
          if (this.allDevice.length > 0) this.haveDevice = true;

          this.$api_connection
            .secureAPI()
            .get("/device-type/get")
            .then((response) => {
              this.allDeviceType = response.data as DeviceType[];
              response.data.forEach((element: DeviceType, index: number) => {
                this.options.push({
                  text: element.device_type_name as string,
                  value: index as number,
                  type: element,
                });
              });
            });
        });
    },
    generateInterface() {
      for (
        var i = this.net_interface.fromInt;
        i <= this.net_interface.toInt;
        i++
      ) {
        var prefix = this.net_interface.prefix;
        var interFace = {
          interface_name: prefix.replaceAll("x", `${i}`),
          edges: {
            mode: this.allInterfaceMode.find((element) => {
              return element.interface_mode == "None";
            }),
            on_device: this.selectedDevice,
          },
        } as Interface;
        this.net_interface.allInt.push(interFace);
      }

      this.loader = true;

      this.$api_connection
        .secureAPI()
        .post("/net-interface/create-range", this.net_interface.allInt)
        .then((response) => {
          this.net_interface.allInt = response.data;

          this.$toasted.success("Generate interface success");
          this.addIntModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Generate interface failed!");
          this.loader = false;
        });
    },
    addInterface(i: number) {
      this.selectedDevice = this.table.showTable[i];
      this.addIntModal = true;
    },
    edit(i: number) {
      this.selectedDevice = this.table.showTable[i];
      const deviceTypeIndex = this.options.findIndex(
        (element) => element.type.id == this.selectedDevice.edges?.in_type?.id
      );
      this.selectedOption = deviceTypeIndex;
      const platformIndex = this.options2.findIndex(
        (element) => element.type.id == this.selectedDevice.edges?.in_platform?.id
      );
      this.selectedOption2 = platformIndex;
      this.editModal = true;
    },
    deleteDevice(i: number) {
      this.selectedDevice = this.table.showTable[i];
      this.deleteModal = true;
    },
    cleanInterface(i: number) {
      this.selectedDevice = this.table.showTable[i];
      this.cleanModal = true;
    },
    add() {
      this.addDevice.edges!.in_type = this.options[this.selectedOption].type;
      this.addDevice.edges!.in_platform = this.options2[
        this.selectedOption2
      ].type;
      this.loader = true;

      this.$api_connection
        .secureAPI()
        .post("/device/create", this.addDevice)
        .then(() => {
          this.$toasted.success("Add device success");

          this.getAllDevice();
          this.addModal = false;
          this.addDevice = {
            edges: {
              in_type: {} as DeviceType,
            },
          } as Device;
          this.loader = false;
        })
        .catch(() => {
          this.loader = false;
          this.$toasted.error("Add device failed!");
        });
    },
    update() {
      this.selectedDevice.edges!.in_type = this.options[
        this.selectedOption
      ].type;
      this.selectedDevice.edges!.in_platform = this.options2[
        this.selectedOption2
      ].type;

      this.loader = true;

      this.$api_connection
        .secureAPI()
        .post("/device/edit", this.selectedDevice)
        .then(() => {
          this.$toasted.success("Update device information success");

          this.getAllDevice();
          this.editModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Edit device failed!");
          this.loader = false;
        });
    },
    deleteDeviceAction() {
      this.loader = true;
      this.$api_connection
        .secureAPI()
        .delete(`/device/delete/${this.selectedDevice.id}`)
        .then(() => {
          this.$toasted.success("Delete device success");

          this.getAllDevice();
          this.deleteModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Delete device failed!");
          this.loader = false;
        });
    },
    cleanInterfaceAction() {
      this.loader = true;
      this.$api_connection
        .secureAPI()
        .delete(`/net-interface/clean-interface/${this.selectedDevice.id}`)
        .then(() => {
          this.$toasted.success("Clean interface success");

          this.getAllDevice();
          this.cleanModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Clean interface failed!");
          this.loader = false;
        });
    },
  },
  mounted() {
    this.getAllDevice();
    this.getAllDevicePlatform();
    this.getAllInterfaceMode();
  },
});
</script>