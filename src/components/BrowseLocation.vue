<template>
  <div class="browser-location">
    <v-card width="300px" height="300px">
      <v-card-title>
        <v-icon @click="goToParent" medium left>arrow_back</v-icon>
        <span
          class="font-weight-light"
        >{{ currentLocation ? "Vald plats: " + currentLocation.get("name") : "Välj plats:" }}</span>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="locations"
          class="elevation-1"
          hide-actions
          hide-headers
        >
          <template v-slot:items="props">
            <td @click="changeLocation(props.item)">{{ props.item.get("name") }}</td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Parse from "parse";
import Location from "@/components/Location.vue";

@Component({
  // @ts-ignore
  components: {},
  props: {}
})
export default class Browser extends Vue {
  public locations: any[] = [];
  public currentLocation: any = null;
  public headers = [
    {
      text: "Underkategorier ",
      align: "left",
      sortable: true,
      value: "name"
    }
  ];

  public mounted() {
    this.getLocationsByType("building");
  }

  public goToParent() {
    this.currentLocation = this.currentLocation.get("parent");
    this.$emit("locChanged", this.currentLocation);
    if (this.currentLocation) {
      const query = new Parse.Query("Location");
      query.equalTo("parent", this.currentLocation);
      query.find().then((results: any[]) => {
        console.log(results);
        this.locations = results;
      });
    } else {
      const query = new Parse.Query("Location");
      query.equalTo("type", "building");
      query.find().then((results: any[]) => {
        this.locations = results;
      });
    }
  }

  public getLocationsByType(type: string) {
    const query = new Parse.Query("Location");
    query.equalTo("type", type);
    query.find().then((results: any[]) => {
      this.locations = results;
    });
  }

  public changeLocation(location: any) {
    this.$emit("locChanged", location);
    this.currentLocation = location;
    const query = new Parse.Query("Location");
    query.equalTo("parent", location);
    query.find().then((results: any[]) => {
      if (results.length > 0) {
        this.locations = results;
      }
    });
  }
}
</script>

<style scoped lang="scss">
.browser-location {
  width: 300px;
  height: 300px;
}
</style>