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

           
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>Name</sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(device) in tableFilter" :key="device.id">
          <sui-table-cell>{{ device.device_type_name }}</sui-table-cell>
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
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import Vue from "vue";

import Device from "@/types/device";
import DeviceType from "@/types/device-type";

export default Vue.extend({
  metaInfo: {
    title: "Device type | NetCoCo",
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
    getPageNumber(): number {
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
  },
  mounted() {
    this.getAllDeviceType();
  },
});
</script>