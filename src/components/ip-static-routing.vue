<template>
  <div v-if="!already">
    <sui-dimmer active inverted>
      <sui-loader size="huge">Loading</sui-loader>
    </sui-dimmer>
  </div>
  <div v-else>
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
              <sui-icon name="microchip" /> Add static route
            </sui-button>
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>Network Address</sui-table-header-cell>
          <sui-table-header-cell>Subnet Mask</sui-table-header-cell>
          <sui-table-header-cell>Next Hop Address</sui-table-header-cell>
          <sui-table-header-cell>Broadcast</sui-table-header-cell>
          <sui-table-header-cell>Interface</sui-table-header-cell>
          <sui-table-header-cell />
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(obj, index) in tableFilter" :key="obj.id">
          <sui-table-cell>{{ obj.network_address }}</sui-table-cell>
          <sui-table-cell>{{ obj.subnet_mask }}</sui-table-cell>
          <sui-table-cell>{{ obj.next_hop }}</sui-table-cell>
          <sui-table-cell>
            <span v-if="obj.brd_interface">Yes</span>
            <span v-else>No</span>
          </sui-table-cell>
          <sui-table-cell>{{
            obj.edges.on_interface.interface_name
          }}</sui-table-cell>
          <sui-table-cell collapsing>
            <sui-icon
              name="trash"
              link
              color="red"
              @click="deleteClick(index)"
            />
          </sui-table-cell>
        </sui-table-row>
        <sui-table-header-cell
          colspan="6"
          style="padding: 3em"
          v-if="!haveRoute"
        >
          Not have route
        </sui-table-header-cell>
      </sui-table-body>
      <sui-table-footer v-if="haveRoute">
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
        <sui-modal-header>Add static route </sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="add" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Route
              Information</sui-divider
            >

            <sui-form-field>
              <sui-form-fields fields="three">
                <sui-form-field>
                  <label>Network Address</label>
                  <sui-input
                    type="text"
                    placeholder="Network Address"
                    required
                    v-model="addIPRoute.network_address"
                  />
                  <sui-label
                    basic
                    pointing
                    v-if="addIPRoute.network_address == ''"
                    >Ex. 172.31.255.0
                  </sui-label>
                  <sui-label basic color="red" pointing v-else-if="ipHasError"
                    >Wrong!, Ex. 172.31.255.0
                  </sui-label>
                  <sui-label
                    basic
                    color="green"
                    pointing
                    v-else-if="!ipHasError"
                    >Network Address is correct.
                  </sui-label>
                </sui-form-field>
                <sui-form-field>
                  <label>Subnet Mask</label>
                  <sui-input
                    type="text"
                    placeholder="Subnet Mask"
                    required
                    v-model="addIPRoute.subnet_mask"
                  />
                  <sui-label basic pointing v-if="addIPRoute.subnet_mask == ''"
                    >Ex. 255.255.255.0
                  </sui-label>
                  <sui-label
                    basic
                    color="red"
                    pointing
                    v-else-if="subnetHasError"
                    >Wrong!, Ex. 255.255.255.0
                  </sui-label>
                  <sui-label
                    basic
                    color="green"
                    pointing
                    v-else-if="!subnetHasError"
                    >Subnet Mask is correct.
                  </sui-label>
                </sui-form-field>
                <sui-form-field v-if="!addIPRoute.brd_interface">
                  <label>Next Hop Address</label>
                  <sui-dropdown
                    placeholder="Next Hop Address"
                    required
                    selection
                    :options="options"
                    v-model="selectedOption"
                  />
                </sui-form-field>
              </sui-form-fields>
              <sui-form-fields fields="two">
                <sui-form-field>
                  <label>Interface</label>
                  <sui-dropdown
                    placeholder="Interface"
                    required
                    selection
                    :options="options2"
                    v-model="selectedOption2"
                  />
                </sui-form-field>
                <sui-form-field>
                  <label>Broadcast Interface</label>
                  <div>
                    <sui-checkbox
                      :label="getBrdStatus"
                      toggle
                      v-model="addIPRoute.brd_interface"
                      style="margin: 5px 0 0 5px"
                    />
                  </div>
                </sui-form-field>
              </sui-form-fields>
            </sui-form-field>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add route </sui-button>
              <sui-button @click="addModal = false" type="button">
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
            Network Address:
            <b>{{ selectedRoute.network_address }} </b> <br />
            Subnet Mask:
            <b> {{ selectedRoute.subnet_mask }} </b>
            <br />
            Next Hop Address:
            <b>{{ selectedRoute.next_hop }}</b
            ><br />
            Broadcast Interface:
            <b v-if="selectedRoute.brd_interface">Yes</b>
            <b v-else>No</b>
            <br />
            On Interface:
            <b>{{ selectedRoute.edges.on_interface.interface_name }}</b>
            <br />
          </div>
        </sui-modal-content>
        <sui-modal-actions v-if="!loader">
          <sui-button @click="deleteModal = false"> Cancel </sui-button>
          <sui-button negative @click="deleteAction()"> Delete </sui-button>
        </sui-modal-actions>
      </sui-modal>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import Vue from "vue";

import Device from "@/types/device";
import Option from "@/types/option";
import IPAddress from "@/types/ip-address";
import IPStaticRouting from "@/types/ip-static-routing";
import Interface from "@/types/interface";

interface IPOption extends Option {
  type: IPAddress;
}

interface InterfaceOption extends Option {
  type: Interface;
}

export default Vue.extend({
  props: {
    device_id: String,
  },
  metaInfo: {
    title: "Static Routing setting | NetCoCo",
  },
  data() {
    return {
      ipAddrRegx:
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      subnetRegx:
        /^(((255.){3}(255|254|252|248|240|224|192|128|0+))|((255.){2}(255|254|252|248|240|224|192|128|0+).0)|((255.)(255|254|252|248|240|224|192|128|0+)(.0+){2})|((255|254|252|248|240|224|192|128|0+)(.0+){3}))$/,
      ipHasError: false,
      subnetHasError: false,
      table: {
        perPage: 25,
        currentPagination: 1,
        showTable: [] as IPStaticRouting[],
        filter: "",
      },
      allRoute: [] as IPStaticRouting[],
      haveRoute: false,
      loader: false,
      deviceObj: {} as Device,
      allInterface: [] as Interface[],
      options: [] as IPOption[],
      selectedOption: 0 as number,
      options2: [] as InterfaceOption[],
      selectedOption2: 0 as number,
      selectedRoute: {
        edges: {
          on_device: {} as Device,
          on_interface: {} as Device,
        },
      } as IPStaticRouting,
      addIPRoute: {
        network_address: "",
        subnet_mask: "",
        next_hop: "",
        edges: {
          on_device: {} as Device,
          on_interface: {} as Device,
        },
      } as IPStaticRouting,
      addModal: false,
      deleteModal: false,
      already: false
    };
  },
  computed: {
    getBrdStatus(): string {
      return this.addIPRoute.brd_interface ? "Yes" : "No";
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
      if (this.allRoute) {
        const filtered = this.allRoute.filter((element) => {
          const na = element.network_address.toString().toLowerCase();
          const nmask = element.subnet_mask.toString().toLowerCase();
          const nh = element.next_hop.toString().toLowerCase();
          const intf = element
            .edges!.on_interface!.interface_name.toString()
            .toLowerCase();
          const searchTerm = this.table.filter.toLowerCase();

          return (
            na.includes(searchTerm) ||
            nmask.includes(searchTerm) ||
            nh.includes(searchTerm) ||
            intf.includes(searchTerm)
          );
        }) as any;

        const fromElement: number =
          (this.table.currentPagination - 1) * this.table.perPage;
        const toElement: number =
          (this.table.currentPagination + 1) * this.table.perPage - 1;

        var data = filtered.slice(fromElement, toElement);
        this.table.showTable = filtered;
        this.haveRoute = filtered.length > 0 ? true : false;

        return data;
      }
    },
  },
  methods: {
    addClick() {
      this.addModal = true;
    },
    changePagination(pNumber: number) {
      this.table.currentPagination = pNumber;
    },
    getAllIPCanBeRoute() {
      this.$api_connection
        .secureAPI()
        .get(`/ip-static-routing-table/get/connected/${this.device_id}`)
        .then((response) => {
          const data = response.data as Device[];
          this.options = [] as IPOption[];
          if (data.length > 0) {
            data.forEach((element) => {
              element.edges?.have_ip_addresses?.forEach((e, index) => {
                this.options.push({
                  text: `${element.device_name}, IP Addr: ${e.ip_address}`,
                  value: index as number,
                  type: e,
                });
              });
            });
          } else {
            this.options.push({
              text: `None`,
              value: 0,
              type: {} as IPAddress,
            });
          }
        });
    },
    getAllRoute() {
      this.already = false
      this.$api_connection
        .secureAPI()
        .get(`/device/get/${this.device_id}`)
        .then((response) => {
          this.deviceObj = response.data as Device;

          this.allInterface = this.deviceObj.edges!.interfaces as Interface[];
          this.options2 = [] as InterfaceOption[];
          this.allInterface.forEach((element: Interface, index: number) => {
            this.options2.push({
              text: element.interface_name,
              value: index as number,
              type: element,
            });
          });

          this.allRoute = this.deviceObj.edges!.ip_static_routing!;

          if (this.allRoute) this.haveRoute = true;
        }).finally(() => {
          this.already = true
        })
    },
    deleteClick(i: number) {
      this.selectedRoute = this.table.showTable[i];
      this.deleteModal = true;
    },
    add() {
      if (this.ipHasError || this.subnetHasError) {
        this.$toasted.info("Please correct ip address or subnet mask");
      } else {
        var temp = this.deviceObj;
        temp.edges = {};
        this.addIPRoute.edges!.on_device = this.deviceObj;
        this.addIPRoute.edges!.on_interface =
          this.options2[this.selectedOption2].type;
        
        if(!this.addIPRoute.brd_interface)
          this.addIPRoute.next_hop = this.options[this.selectedOption].type.ip_address;
        else
          this.addIPRoute.next_hop = "0.0.0.0"

        this.loader = true;
        this.$api_connection
          .secureAPI()
          .post("/ip-static-routing-table/create", this.addIPRoute)
          .then(() => {
            this.$toasted.success("Add port-channel interface success");

            this.getAllRoute();
            this.addModal = false;
            this.addIPRoute = {
              network_address: "",
              subnet_mask: "",
              next_hop: "",
              edges: {
                on_device: {} as Device,
                on_interface: {} as Device,
              },
            } as IPStaticRouting;
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
    deleteAction() {
      this.loader = true;
      this.$api_connection
        .secureAPI()
        .delete(`/ip-static-routing-table/delete/${this.selectedRoute.id}`)
        .then(() => {
          this.$toasted.success("Delete route success");

          this.getAllRoute();
          this.deleteModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Delete route failed!");
          this.loader = false;
        });
    },

    ipAddrValidation() {
      this.ipHasError = !this.ipAddrRegx.test(this.addIPRoute.network_address);
    },
    subnetValidation() {
      this.subnetHasError = !this.subnetRegx.test(this.addIPRoute.subnet_mask);
    },
  },
  mounted() {
    this.getAllRoute();
    this.getAllIPCanBeRoute();
  },
  watch: {
    "addIPRoute.network_address"() {
      this.ipAddrValidation();
    },
    "addIPRoute.subnet_mask"() {
      this.subnetValidation();
    },
  },
});
</script>