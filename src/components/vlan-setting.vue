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
              <sui-icon name="microchip" /> Add Vlan
            </sui-button>
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>Vlan ID</sui-table-header-cell>
          <sui-table-header-cell />
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(topo, index) in tableFilter" :key="topo.id">
          <sui-table-cell>{{ topo.vlan_id }}</sui-table-cell>
          <sui-table-cell collapsing>
            <sui-icon
              name="trash"
              link
              color="red"
              @click="deleteVlan(index)"
            />
          </sui-table-cell>
        </sui-table-row>

        <sui-table-header-cell
          colspan="6"
          style="padding: 3em"
          v-if="!haveVlan"
        >
          Not have Vlan
        </sui-table-header-cell>
      </sui-table-body>
      <sui-table-footer v-if="haveVlan">
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
        <sui-modal-header>Add Vlan</sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="add" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Vlan
              Information</sui-divider
            >

            <sui-form-field>
              <label>Vlan ID</label>
              <input
                type="text"
                placeholder="Vlan Id"
                v-model.number="addVlan.vlan_id"
              />
            </sui-form-field>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add Vlan </sui-button>
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
      <sui-modal v-model="deleteModal" size="mini" :closable="false" loading>
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
            Device Name: <b>{{ deviceObj.device_name }} </b> <br />
            Vlan ID: <b>{{ selectedVlan.vlan_id }}</b>
          </div>
        </sui-modal-content>
        <sui-modal-actions v-if="!loader">
          <sui-button @click="deleteModal = false"> Cancel </sui-button>
          <sui-button negative @click="deleteVlanAction()"> Delete </sui-button>
        </sui-modal-actions>
      </sui-modal>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import Vue from "vue";

import Vlan from "@/types/vlan";
import Device from "@/types/device";

export default Vue.extend({
  metaInfo: {
    title: "Device vlan setting | NetCoCo",
  },
  props: {
    device_id: String,
  },
  data() {
    return {
      table: {
        perPage: 25,
        currentPagination: 1,
        showTable: [] as Vlan[],
        filter: "",
      },
      haveVlan: false,
      loader: false,
      allVlan: [] as Vlan[],
      selectedOption: 0 as number,
      selectedVlan: {} as Vlan,
      addVlan: {} as Vlan,
      editModal: false,
      addModal: false,
      deleteModal: false,
      deviceObj: {} as Device,
    };
  },
  computed: {
    getPageNumber(): number {
      const pageNumber: number =
        this.table.showTable.length / this.table.perPage;
      return Math.ceil(pageNumber) == 0 ? 1 : Math.ceil(pageNumber);
    },
    tableFilter() {
      const filtered = this.allVlan.filter((element) => {
        const vid = element.vlan_id!.toString().toLowerCase();
        const searchTerm = this.table.filter.toLowerCase();

        return vid.includes(searchTerm);
      }) as any;

      const fromElement: number =
        (this.table.currentPagination - 1) * this.table.perPage;
      const toElement: number =
        (this.table.currentPagination + 1) * this.table.perPage - 1;

      var data = filtered.slice(fromElement, toElement);
      this.table.showTable = filtered;
      this.haveVlan = filtered.length > 0 ? true : false;

      return data;
    },
  },
  methods: {
    changePagination(pNumber: number) {
      this.table.currentPagination = pNumber;
    },
    getAllVlan() {
      this.$api_connection
        .secureAPI()
        .get(`/device/get/${this.device_id}`)
        .then((response) => {
          this.deviceObj = response.data as Device;
          this.allVlan = this.deviceObj.edges?.store_vlans as Vlan[];
          if (this.allVlan.length > 0) this.haveVlan = true;
        });
    },
    deleteVlan(i: number) {
      this.selectedVlan = this.table.showTable[i];
      this.deleteModal = true;
    },
    add() {
      this.loader = true;
      var temp = this.deviceObj;
      temp.edges!.store_vlans! = [];
      temp.edges?.store_vlans?.push(this.addVlan);
      this.$api_connection
        .secureAPI()
        .post("/device/add-vlan", this.deviceObj)
        .then(() => {
          this.$toasted.success("Add Vlan success");

          this.getAllVlan();
          this.addModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Add Vlan failed!");
          this.loader = false;
        });
    },
    deleteVlanAction() {
      this.loader = true;
      this.$api_connection
        .secureAPI()
        .delete(
          `/device/delete-vlan/${this.deviceObj.id}/${this.selectedVlan.vlan_id}`
        )
        .then(() => {
          this.$toasted.success("Delete Vlan success");

          this.getAllVlan();
          this.deleteModal = false;
          this.loader = false;
        })
        .catch(() => {
          this.$toasted.error("Delete Vlan failed!");
          this.loader = false;
        });
    },
  },
  mounted() {
    this.getAllVlan();
  },
});
</script>