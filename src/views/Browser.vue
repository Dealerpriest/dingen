<template>
  <div class="browser">
    <CreateLocation />

    <h1>{{ currentLocation ? currentLocation.get("name") : "Browse" }}</h1>
    <h3 @click="goToParent">Tillbaka</h3>
    <div id="browser-container">
      <template v-for="loc in locations">
        <Location :key="loc.id" :loc="loc" @changeLoc="changeLocation" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Parse from "parse";
import Location from "@/components/Location.vue";
import CreateLocation from "@/components/CreateLocation.vue";

@Component({
  // @ts-ignore
  components: {
    Location,
    CreateLocation
  },
  props: {}
})
export default class Browser extends Vue {
  public locations: any[] = [];
  public currentLocation: any = null;

  public mounted() {
    this.getLocationsByType("building");
  }

  public goToParent() {
    this.currentLocation = this.currentLocation.get("parent");
    const query = new Parse.Query("Location");
    query.equalTo("parent", this.currentLocation);
    query.find().then(results => {
      console.log(results);
      this.locations = results;
    });
  }

  public getLocationsByType(type: string) {
    const query = new Parse.Query("Location");
    query.equalTo("type", type);
    query.find().then(results => {
      this.locations = results;
    });
  }

  public changeLocation(location: any) {
    this.currentLocation = location;
    const query = new Parse.Query("Location");
    query.equalTo("parent", location);
    query.find().then(results => {
      console.log(results);
      this.locations = results;
    });
  }
}
</script>

<style lang="scss">
#browser-container {
  background-color: lightblue;
}
</style>