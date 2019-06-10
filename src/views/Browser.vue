<template>
  <div class="browser">
    <CreateLocation/>

    <h1>{{currentLocation?currentLocation.get("name"):"Browse"}}</h1>
    <h3 @click="goToParent">Tillbaka</h3>
    <template v-for="loc in locations">
      <Location :key="loc.id" :loc="loc" @changeLoc="changeLocation"/>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Parse from "parse";
import Location from "@/components/Location.vue"
import CreateLocation from "@/components/CreateLocation.vue"

export default Vue.extend({
  name: 'browser',
  mounted() {
    this.getLocationsByType("building")
  },
  components: {
    Location, CreateLocation
  },
  data() {
    let obj: {
      locations: Array<any>,
      currentLocation: any
    } = {
      locations: [],
      currentLocation: null
    };
    return obj
  },
  methods: {
    goToParent() {
      this.currentLocation = this.currentLocation.get("parent");
      const query = new Parse.Query("Location");
      query.equalTo("parent", this.currentLocation);
      query.find().then((results) => {
        console.log(results)
        this.locations = results
      });
    },
    getLocationsByType(type: string) {
      const query = new Parse.Query("Location");
      query.equalTo("type", type);
      query.find().then((results) => {
        this.locations = results
      });
    },
    changeLocation(location: any) {
      this.currentLocation = location
      const query = new Parse.Query("Location");
      query.equalTo("parent", location);
      query.find().then((results) => {
        console.log(results)
        this.locations = results
      });
    }
  }
});
</script>

<style lang="scss">

</style>