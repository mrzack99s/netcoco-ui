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
              <sui-icon name="microchip" /> Add topology
            </sui-button>
          </sui-table-header-cell>
        </sui-table-row>

        <sui-table-row>
          <sui-table-header-cell>Name</sui-table-header-cell>
          <sui-table-header-cell>Description</sui-table-header-cell>
          <sui-table-header-cell />
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="(topo, index) in tableFilter" :key="topo.id">
          <sui-table-cell>{{ topo.topology_name }}</sui-table-cell>
          <sui-table-cell>{{ topo.topology_description }}</sui-table-cell>
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
          v-if="!haveTopology"
        >
          Not have topology
        </sui-table-header-cell>
      </sui-table-body>
      <sui-table-footer v-if="haveTopology">
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
        <sui-modal-header>Add topology</sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="add" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> Topology
              Information</sui-divider
            >

            <sui-form-fields fields="two">
              <sui-form-field>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  v-model="addTopology.topology_name"
                />
              </sui-form-field>
              <sui-form-field>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Description"
                  v-model="addTopology.topology_description"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Add topology </sui-button>
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
          >Edit devie type id {{ selectedTopology.id }}
        </sui-modal-header>
        <sui-modal-content text>
          <sui-form @submit.prevent="update" :loading="loader">
            <sui-divider horizontal style="margin-bottom: 2em"
              ><sui-icon size="large" name="info circle" /> topology
              Information</sui-divider
            >

            <sui-form-fields fields="two">
              <sui-form-field>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  v-model="selectedTopology.topology_name"
                />
              </sui-form-field>
              <sui-form-field>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Description"
                  v-model="selectedTopology.topology_description"
                />
              </sui-form-field>
            </sui-form-fields>

            <sui-form-field style="margin: 2em 0">
              <sui-button positive type="submit"> Update topology </sui-button>
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
          <div :loading="loader">
            Name: <b>{{ selectedTopology.device_type_name }} </b> <br />
          </div>
        </sui-modal-content>
        <sui-modal-actions>
          <sui-button @click="deleteModal = false"> Cancel </sui-button>
          <sui-button negative @click="deleteTopologyAction()">
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

import TopologyType from "@/types/topology";

export default Vue.extend({
  metaInfo: {
    title: "Create a topology | NetCoCo",
  },
  data() {
    return {
      table: {
        perPage: 25,
        currentPagination: 1,
        showTable: [] as TopologyType[],
        filter: "",
      },
      haveTopology: false,
      loader: false,
      allTopology: [] as TopologyType[],
      selectedOption: 0 as number,
      selectedTopology: {} as TopologyType,
      addTopology: {} as TopologyType,
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
      const filtered = this.allTopology.filter((element) => {
        const topo_name = element.topology_name!.toString().toLowerCase();
        const topo_des = element.topology_description!.toString().toLowerCase();
        const searchTerm = this.table.filter.toLowerCase();

        return topo_name.includes(searchTerm) || topo_des.includes(searchTerm);
      }) as any;

      const fromElement: number =
        (this.table.currentPagination - 1) * this.table.perPage;
      const toElement: number =
        (this.table.currentPagination + 1) * this.table.perPage - 1;

      var data = filtered.slice(fromElement, toElement);
      this.table.showTable = filtered;
      this.haveTopology = filtered.length > 0 ? true : false;

      return data;
    },
  },
  methods: {
    changePagination(pNumber: number) {
      this.table.currentPagination = pNumber;
    },
    getAllTopology() {
      this.$api_connection
        .secureAPI()
        .get("/topology/get")
        .then((response) => {
          this.allTopology = response.data as TopologyType[];
          if (this.allTopology.length > 0) this.haveTopology = true;
        });
    },
    edit(i: number) {
      this.selectedTopology = this.table.showTable[i];
      this.editModal = true;
    },
    deleteDevice(i: number) {
      this.selectedTopology = this.table.showTable[i];
      this.deleteModal = true;
    },
    add() {
      this.$api_connection
        .secureAPI()
        .post("/topology/create", this.addTopology)
        .then(() => {
          this.$toasted.success("Add topology success");

          this.getAllTopology();
          this.addModal = false;
        })
        .catch(() => {
          this.$toasted.error("Add topology failed!");
        });
    },
    update() {
      this.$api_connection
        .secureAPI()
        .post("/topology/edit", this.selectedTopology)
        .then(() => {
          this.$toasted.success("Update topology information success");

          this.getAllTopology();
          this.editModal = false;
        })
        .catch(() => {
          this.$toasted.error("Edit topology failed!");
        });
    },
    deleteTopologyAction() {
      console.log(this.selectedTopology);
      this.$api_connection
        .secureAPI()
        .delete(`/topology/delete/${this.selectedTopology.id}`)
        .then(() => {
          this.$toasted.success("Delete topology success");

          this.getAllTopology();
          this.deleteModal = false;
        })
        .catch(() => {
          this.$toasted.error("Delete topology failed!");
        });
    },
  },
  mounted() {
    this.getAllTopology();
  },
});
</script>