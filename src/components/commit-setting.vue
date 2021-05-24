<template>
  <div>
    <div class="ui card" style="width: 100%; height: 300px; padding-top: 2em">
      <div class="content">
        <h2 class="center aligned ui header">Commit your configuration</h2>
        <div class="center aligned description">
          <sui-button
            primary
            type="button"
            size="massive"
            style="margin-top: 1em"
            @click="commitModal=true"
            >Commit</sui-button
          >
        </div>
      </div>
    </div>

    <!-- CheckSure -->
    <sui-modal v-model="commitModal" size="mini" :closable="false">
      <sui-modal-content text>
        <sui-segment v-if="loader">
          <sui-dimmer active inverted>
            <sui-loader>Wait a few</sui-loader>
          </sui-dimmer>
          <br />
          <br />
          <br />
        </sui-segment>
        <h1 v-else>
            Are you sure to commit?
        </h1>
      </sui-modal-content>
      <sui-modal-actions v-if="!loader">
        <sui-button @click="commitModal = false"> Cancel </sui-button>
        <sui-button positive @click="commitAction()">
          Commit
        </sui-button>
      </sui-modal-actions>
    </sui-modal>

    <!-- End -->
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    data(){
        return{
            loader: false,
            commitModal: false
        }
    }
});
</script>