<template>
  <div class="browser">
    <v-dialog v-model="createDialog" max-width="700px">
      <CreateLocation
        ref="crudForm"
        :curCon="currentContainer"
        :showBrowser="false"
        @updOrCr="updOrCrEvent"
      />
    </v-dialog>
    <v-dialog v-model="moveDialog" max-width="700px">
      <BrowseLocation/>
    </v-dialog>
    <v-layout row fill-height>
      <v-flex>
        <v-card flat height="100%">
          <v-toolbar>
            <v-btn icon @click="goToParent">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            <v-toolbar-title>Browser {{currentContainer? "- " + currentContainer.get("name"): ""}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>search</v-icon>
            </v-btn>
          </v-toolbar>
          <div class="breadcrumb">
            <h4>Path:</h4>
            <p>Start</p>
            <p v-for="crumb in breadcrumbs" :key="crumb.id">> {{crumb.get("name")}}</p>
          </div>
          <div style="height: 100%">
            <v-spacer class="title font-weight-light">Containers:</v-spacer>
            <div class="grid-container">
              <div v-for="con in containers" :key="con.id" class="grid-item">
                <v-card
                  color="cyan darken-2"
                  class="white--text"
                  height="100%"
                  @dblclick="changeContainer(con)"
                  style="position: relative;"
                >
                  <v-card-title class="card-title">
                    <div>
                      <p class="headline" style="margin: 0">{{con.get("name")}}</p>
                    </div>
                    <div>{{containerAmounts[con.id]}}</div>
                  </v-card-title>
                  <v-card-text width="100%">{{con.get("description")}}</v-card-text>

                  <v-card-actions style="position: absolute; bottom: 0; right: 0;">
                    <v-icon
                      small
                      class="mr-2"
                      color="white"
                      @click="deleteObject(thing)"
                    >mdi-folder-move</v-icon>
                    <v-icon small class="mr-2" color="white" @click="openCrForm(con, false)">edit</v-icon>
                    <v-icon small color="white" @click="deleteObject(con)">delete</v-icon>
                  </v-card-actions>
                </v-card>
              </div>

              <v-flex class="grid-item">
                <v-card
                  ripple
                  color="grey lighten-2"
                  class="white--text"
                  height="100%"
                  @click="openCrForm(null, false)"
                >
                  <v-layout flex fill-height justify-center align-center>
                    <v-icon x-large>add</v-icon>
                  </v-layout>
                </v-card>
              </v-flex>
            </div>
            <v-spacer class="title font-weight-light">Things:</v-spacer>
            <v-layout flex column style="padding: 0 30px 30px 30px">
              <v-card
                v-for="thing in things"
                :key="thing.id"
                class
                color="grey lighten-2"
                height="100%"
                style="margin-bottom: 20px"
              >
                <v-layout flex row align-center>
                  <v-card-title class="card-title" style="width: 100%">
                    <p class="headline" style="margin: 0">{{thing.get("name")}}</p>
                  </v-card-title>
                  <div style="padding: 16px" class="headline">{{thing.get("amount")}}</div>
                </v-layout>

                <v-layout flex row>
                  <v-card-text style="padding-top: 0">{{thing.get("description")}}</v-card-text>

                  <v-card-actions>
                    <v-icon
                      small
                      class="mr-2"
                      color="grey darken-1"
                      @click="deleteObject(thing)"
                    >mdi-file-move</v-icon>
                    <v-icon
                      small
                      class="mr-2"
                      color="grey darken-1"
                      @click="openCrForm(thing, true)"
                    >edit</v-icon>
                    <v-icon small color="grey darken-1" @click="deleteObject(thing)">delete</v-icon>
                  </v-card-actions>
                </v-layout>
              </v-card>
            </v-layout>
          </div>
          <!-- <v-footer class="mt-5">Footer</v-footer> -->
          <v-layout class="floating-button">
            <v-btn color="blue darken-2" dark fab @click="openCrForm(null, true)">
              <v-icon large>add</v-icon>
            </v-btn>
          </v-layout>
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
import BrowseLocation from "@/components/BrowseLocation.vue";

@Component({
  // @ts-ignore
  components: {
    Location,
    CreateLocation,
    BrowseLocation
  }
})
export default class Browser extends Vue {
  containers: any[] = [];
  containerAmounts: any = {};
  things: any[] = [];
  currentContainer: any = null;
  breadcrumbs: any[] = [];
  fab: any = null;
  createDialog: boolean = false;
  moveDialog: boolean = true;

  thingsHeaders: Object[] = [
    { text: "Namn", align: "left", sortable: true, value: "name" },
    { text: "Antal", sortable: true, value: "amount" },
    { text: "Beskrivning", value: "description" },
    { text: "Ändra", value: "name", sortable: false }
  ];

  mounted() {
    this.changeContainer(null);
  }

  changeContainer(location: any) {
    this.currentContainer = location;
    const query = new Parse.Query("Location");
    query.equalTo("parent", this.currentContainer);
    query.find().then((results: any[]) => {
      this.containers = results;
      this.getBreadCrumbs();
      this.updateThingsArray();
      this.updateContainerAmounts();
    });
  }

  updateContainerAmounts() {
    for (let container of this.containers) {
      const query = new Parse.Query("Location");
      query.equalTo("parent", container);
      query
        .count()
        .then(result => {
          this.containerAmounts[container.id] = result;
        })
        .catch(err => {
          console.error(err);
          this.containerAmounts[container.id] = 0;
        });
    }
  }

  public updateThingsArray() {
    const query = new Parse.Query("Thing");
    query.equalTo("parent", this.currentContainer);
    query.find().then((results: any[]) => {
      this.things = results;
    });
  }

  public openCrForm(obj: any, tol: boolean) {
    const form = <CreateLocation>this.$refs.crudForm;
    form.setFormData(obj, tol);
    this.createDialog = true;
  }

  async deleteObject(obj: any) {
    if (obj.className == "Location") {
      const conQuery = new Parse.Query("Location");
      conQuery.equalTo("parent", obj);
      let children: any[] = [];
      const thingQuery = new Parse.Query("Thing");
      thingQuery.equalTo("parent", obj);
      children = [...(await conQuery.find()), ...(await thingQuery.find())];

      let childrenSaved: number = 0;

      if (children.length > 0) {
        for (let child of children) {
          child.set("parent", this.currentContainer);
          let result = await child.save();
          if (result) {
            childrenSaved++;
          }
        }
      }

      if (childrenSaved == children.length) {
        obj.destroy().then(
          (response: any) => {
            console.log("Deleted Thing", response);
            this.changeContainer(this.currentContainer);
          },
          (error: any) => {
            console.error("Error while deleting Thing", error);
          }
        );
      }
    } else {
      obj.destroy().then(
        (response: any) => {
          console.log("Deleted Thing", response);
          this.things.splice(this.things.indexOf(obj), 1);
        },
        (error: any) => {
          console.error("Error while deleting Thing", error);
        }
      );
    }
  }

  public goToParent() {
    if (this.currentContainer) {
      this.currentContainer = this.currentContainer.get("parent");
      const query = new Parse.Query("Location");
      query.equalTo("parent", this.currentContainer);
      query.find().then((results: any[]) => {
        this.containers = results;
      });
      this.getBreadCrumbs();
      this.updateThingsArray();
    }
  }

  public getBreadCrumbs() {
    if (this.currentContainer) {
      let parent = this.currentContainer;
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

  public updOrCrEvent(obj: any) {
    if (obj) {
      console.log("hej");
      if (obj.className == "Thing") {
        const foundIndex = this.things.findIndex(x => x.id == obj.id);
        console.log(foundIndex);
        if (foundIndex >= 0) {
          this.things[foundIndex] = obj;
          console.log("changed");
        } else {
          this.things.push(obj);
        }
      } else if (obj.className == "Location") {
        const foundIndex = this.containers.findIndex(x => x.id == obj.id);
        if (foundIndex >= 0) {
          this.containers[foundIndex] = obj;
        } else {
          this.containers.push(obj);
        }
      }

      this.createDialog = false;
    }
  }
}
</script>

<style scoped lang="scss">
.browser {
  min-height: 100%;
}

.floating-button {
  position: fixed;
  right: 32px;
  bottom: 32px;
}

.breadcrumb {
  display: flex;
  flex-direction: row;
  padding: 10px 30px;

  p {
    margin: 0 5px;
  }
}

.no-data {
  padding: 30px 0;
  text-align: center;
}

.spacer {
  margin: 10px 0;
  padding: 20px 40px 10px 40px;
}

.grid-container {
  width: 100%;
  display: grid;
  padding: 0 30px 30px 30px;
  grid-auto-flow: column;
  grid-template-columns: repeat(auto-fill, 250px);
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 250px;
    }
  }
}
</style>