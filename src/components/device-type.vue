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
              size="mini"
              primary
              labeled
              @click="addModal = true"
            >
              <sui-icon name="microchip" /> Add Device type
            </sui-button>
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>Name</sui-table-header-cell>
          <sui-table-header-cell />
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(device, index) in tableFilter" :key="device.id">
          <sui-table-cell>{{ device.device_type_name }}</sui-table-cell>
          <sui-table-cell collapsing>
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
          v-if="!haveDeviceType"
        >
          Not have device type
        </sui-table-header-cell>
      </sui-table-body>
      <sui-table-footer v-if="haveDeviceType">
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
        <sui-modal-header>Add device type</sui-modal-header>
        <sui-modal-content text>
          <sui-segment v-if="loader">
            <sui-dimmer active inverted>
              <sui-loader>Wait a few</sui-loader>
            </sui-dimmer>
            <br />
            <br />
            <br />
          </sui-segment>

          <sui-form @submit.prevent="add" v-else>
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Device
              Information</sui-divider
            >

            <sui-form-field>
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                required
                v-model="addDeviceType.device_type_name"
              />
            </sui-form-field>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add device type </sui-button>
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
          >Edit devie type id {{ selectedDeviceType.id }}
        </sui-modal-header>
        <sui-modal-content text>
          <sui-segment v-if="loader">
            <sui-dimmer active inverted>
              <sui-loader>Wait a few</sui-loader>
            </sui-dimmer>
            <br />
            <br />
            <br />
          </sui-segment>
          <sui-form @submit.prevent="update" v-else>
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Device type
              Information</sui-divider
            >

            <sui-form-field>
              <label>Name</label>
              <input
                type="text"
                placeholder="Device Name"
                required
                v-model="selectedDeviceType.device_type_name"
              />
            </sui-form-field>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit">
                Update device type
              </sui-button>
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
            Name: <b>{{ selectedDeviceType.device_type_name }} </b> <br />
          </div>
        </sui-modal-content>
        <sui-modal-actions>
          <sui-button @click="deleteModal = false"> Cancel </sui-button>
          <sui-button negative @click="deleteDeviceTypeAction()">
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

export default Vue.extend({
  metaInfo: {
    title: "Device",
  },
  data() {
    return {
      table: {
        perPage: 25,
        currentPagination: 1,
        showTable: [] as Device[],
        filter: "",
      },
      haveDeviceType: false,
      loader: false,
      allDeviceType: [] as DeviceType[],
      selectedOption: 0 as number,
      selectedDeviceType: {} as DeviceType,
      addDeviceType: {} as DeviceType,
      editModal: false,
      addModal: false,
      deleteModal: false,
    };
  },
  computed: {
    getPageNumber() {
      const pageNumber: number =
        this.table.showTable.length / this.table.perPage;
      return Math.ceil(pageNumber) == 0 ? 1 : Math.ceil(pageNumber);
    },
    tableFilter() {
      const filtered = this.allDeviceType.filter((element) => {
        const device_name = element.device_type_name!.toString().toLowerCase();
        const searchTerm = this.table.filter.toLowerCase();

        return device_name.includes(searchTerm);
      }) as any;

      const fromElement: number =
        (this.table.currentPagination - 1) * this.table.perPage;
      const toElement: number =
        (this.table.currentPagination + 1) * this.table.perPage - 1;

      var data = filtered.slice(fromElement, toElement);
      this.table.showTable = filtered;
      this.haveDeviceType = filtered.length > 0 ? true : false;

      return data;
    },
  },
  methods: {
    changePagination(pNumber: number) {
      this.table.currentPagination = pNumber;
    },
    getAllDeviceType() {
      this.$api_connection
        .secureAPI()
        .get("/device-type/get")
        .then((response) => {
          this.allDeviceType = response.data as DeviceType[];
          if (this.allDeviceType.length > 0) this.haveDeviceType = true;
        });
    },
    edit(i: number) {
      this.selectedDeviceType = this.table.showTable[i];
      this.editModal = true;
    },
    deleteDevice(i: number) {
      this.selectedDeviceType = this.table.showTable[i];
      this.deleteModal = true;
    },
    add() {
      this.$api_connection
        .secureAPI()
        .post("/device-type/create", this.addDeviceType)
        .then(() => {
          this.$toasted.success("Add device type success");
         
            this.getAllDeviceType();
            this.addDeviceType = {};
            this.addModal = false;
          
        })
        .catch(() => {
          this.$toasted.error("Add device type failed!");
        });
    },
    update() {
      this.$api_connection
        .secureAPI()
        .post("/device-type/edit", this.selectedDeviceType)
        .then(() => {
          this.$toasted.success("Update device type information success");
         
            this.getAllDeviceType();
            this.editModal = false;
          
        })
        .catch(() => {
          this.$toasted.error("Edit device type failed!");
        });
    },
    deleteDeviceTypeAction() {
      console.log(this.selectedDeviceType);
      this.$api_connection
        .secureAPI()
        .delete(`/device-type/delete/${this.selectedDeviceType.id}`)
        .then(() => {
          this.$toasted.success("Delete device type success");
         
            this.getAllDeviceType();
            this.deleteModal = false;
          
        })
        .catch(() => {
          this.$toasted.error("Delete device type failed!");
        });
    },
  },
  mounted() {
    this.getAllDeviceType();
  },
});
</script>