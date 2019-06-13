<template>
  <div class="browser">
    <v-layout row fill-height>
      <v-flex>
        <v-card flat height="100%">
          <v-toolbar>
            <v-btn icon @click="goToParent">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            <v-toolbar-title>Browser {{currentLocation? "- " + currentLocation.get("name"): ""}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>search</v-icon>
            </v-btn>
          </v-toolbar>
          <div class="breadcrumb">
            Path:
            <p v-for="crumb in breadcrumbs" :key="crumb.id">> {{crumb.get("name")}}</p>
          </div>
          <v-spacer v-if="locations.length == 0" class="no-data">
            <h2>Det finns tyvärr ingen data.</h2>
          </v-spacer>
          <div style="height: 100%" v-else>
            <v-spacer class="title font-weight-light">Containers:</v-spacer>

            <div class="grid-container">
              <v-flex v-for="loc in locations" :key="loc.id" class="grid-item">
                <v-card
                  color="cyan darken-2"
                  class="white--text"
                  height="100%"
                  @dblclick="changeLocation(loc)"
                >
                  <v-flex>
                    <v-card-title class="card-title">
                      <div class="headline">{{loc.get("name")}}</div>
                      <div>4</div>
                    </v-card-title>
                    <v-card-text width="100%">Lorem ipsum: Här skrivs beskrivningen. Vad tycks??</v-card-text>
                  </v-flex>
                </v-card>
              </v-flex>
            </div>
            <v-spacer class="title font-weight-light">Things:</v-spacer>
            <!-- <div class="grid-container">
            <v-flex v-for="loc in locations" :key="loc.id" class="grid-item">
              <v-card color="cyan darken-2" class="white--text" height="100%">
                <v-flex>
                  <v-card-title class="card-title">
                    <div class="headline">{{loc.get("name")}}</div>
                    <div>4</div>
                  </v-card-title>
                  <v-card-text width="100%">Lorem ipsum: Här skrivs beskrivningen. Vad tycks??</v-card-text>
                </v-flex>
              </v-card>
            </v-flex>
            </div>-->
          </div>
          <!-- <v-footer class="mt-5">Footer</v-footer> -->
        </v-card>
      </v-flex>
    </v-layout>
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
  }
})
export default class Browser extends Vue {
  public locations: any[] = [];
  public currentLocation: any = null;
  public breadcrumbs: any[] = [];

  public beforeMount() {
    this.$store.dispatch("fetchAllLocations").then(locations => {
      this.locations = locations.filter((x: any) => {
        return x.get("parent") == null;
      });
    });
  }

  public goToParent() {
    this.currentLocation = this.currentLocation.get("parent");
    const query = new Parse.Query("Location");
    query.equalTo("parent", this.currentLocation);
    query.find().then((results: any[]) => {
      console.log(results);
      this.locations = results;
    });
    this.getBreadCrumbs();
  }

  public getBreadCrumbs() {
    if (this.currentLocation) {
      let parent = this.currentLocation;
      let crumbs = [];
      while (parent != null) {
        crumbs.push(parent);
        parent = parent.get("parent");
      }
      this.breadcrumbs = crumbs.reverse();
    } else {
      this.breadcrumbs = [];
    }
  }

  public changeLocation(location: any) {
    this.currentLocation = location;
    const query = new Parse.Query("Location");
    query.equalTo("parent", location);
    query.find().then((results: any[]) => {
      console.log(results);
      this.locations = results;
      this.getBreadCrumbs();
    });
  }
}
</script>

<style scoped lang="scss">
.browser {
  min-height: 100%;
}

.breadcrumb {
  display: flex;
  flex-direction: row;
  padding: 10px 30px;

  p {
    margin: 0;
  }
}

.no-data {
  padding: 30px 0;
  text-align: center;
}

.spacer {
  margin: 10px 0;
  padding: 10px 40px 0 40px;
}

.grid-container {
  width: 100%;
  display: grid;
  padding: 30px;
  grid-auto-flow: column;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 200px;
  grid-gap: 28px;
  //justify-content: space-evenly;
  grid-auto-flow: dense;
  //grid-auto-rows: 200px;
  .grid-item {
    height: 100%;
    width: 100%;

    .card-title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
</style>