<template>
  <div class="browser-location">
    <v-layout column style="height: 50vh; background-color: white; padding: 30px" width="300px">
      <v-flex column>
        <v-icon @click="goToParent" medium left>arrow_back</v-icon>
        <span
          class="font-weight-light"
          style="font-size: 18px"
        >{{ currentLocation ? "Vald plats: " + currentLocation.get("name") : "Välj plats:" }}</span>
        <v-text-field
          v-model="locationSearch"
          append-icon="search"
          clear-icon="mdi-close-circle"
          clearable
          label="Sök plats"
          type="text"
          single-line
          width="100%"
        ></v-text-field>
      </v-flex>
      <v-flex style="overflow: auto" class="elevation-1" width="100%">
        <v-layout width="100%" style="overflow: auto" height="100%">
          <v-card width="100%" height="100%">
            <v-data-table :headers="headers" :items="locations" hide-actions hide-headers md12>
              <template v-slot:items="props">
                <td
                  style="width: 100%"
                  @click="changeLocation(props.item)"
                >{{ props.item.get("name") }}</td>
                <td
                  v-if="editable"
                  class="justify-center layout px-0 md1"
                  style="width: 80px; margin: 0;"
                >
                  <v-icon small class="mr-2" @click="$emit('editLoc', props.item)">edit</v-icon>
                  <v-icon small @click="$emit('delLoc', props.item)">delete</v-icon>
                </td>
              </template>
            </v-data-table>
          </v-card>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop } from "vue-property-decorator";
import Parse from "parse";
import Location from "@/components/Location.vue";

@Component({
  // @ts-ignore
  components: {}
})
export default class Browser extends Vue {
  public locations: any[] = [];
  public currentLocation: any = null;
  public locationSearch: string = "";
  public headers = [
    {
      text: "Underkategorier ",
      align: "left",
      sortable: true,
      value: "name"
    }
  ];
  public editDialog: boolean = true;

  @Prop() editable!: boolean;

  @Watch("locationSearch")
  locSearch(val: string) {
    if (val && val.length > 0) {
      this.locations = this.$store.state.db.locations.filter((x: any) => {
        return x
          .get("name")
          .toLowerCase()
          .includes(val.toLowerCase());
      });
    } else {
      this.locations = this.$store.state.db.locations.filter((x: any) => {
        return x.get("parent") == null;
      });
    }
  }

  public beforeMount() {
    this.$store.dispatch("fetchAllLocations").then(locations => {
      this.locations = locations.filter((x: any) => {
        return x.get("parent") == null;
      });
    });
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
  //width: 300px;
  margin-bottom: 28px;
}
</style>