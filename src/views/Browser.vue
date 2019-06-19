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
      <v-card>
        <v-card-title class="headline">Flytta {{movableObj? movableObj.get("name"): ""}}</v-card-title>
        <BrowseLocation @conChanged="moveConChanged"/>
        <v-layout flex width="100%" row justify-center style="padding-bottom: 16px">
          <v-btn large @click="moveObj">
            <v-icon class="mr-2">mdi-arrow-expand-right</v-icon>flytta
          </v-btn>
        </v-layout>
      </v-card>
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
            <v-breadcrumbs :items="breadcrumbs" divider=">">
              <template v-slot:item="props">
                <p
                  @click="changeContainerById(props.item.id)"
                  :class="[props.item.disabled && 'disabled']"
                >{{ props.item.text }}</p>
              </template>
            </v-breadcrumbs>
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
                    <!-- <div>{{containerAmounts[con.id]? containerAmounts[con.id]["cons"] + " | " + containerAmounts[con.id]["things"]: ""}}</div> -->
                  </v-card-title>
                  <v-card-text width="100%">{{con.get("description")}}</v-card-text>

                  <v-card-actions style="position: absolute; bottom: 0; right: 0;">
                    <v-icon
                      small
                      class="mr-2"
                      color="white"
                      @click="setMovableObj(con)"
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
                :key="thing.thing.id"
                color="grey lighten-2"
                style="margin-bottom: 20px"
              >
                <v-layout flex row align-center>
                  <v-card-title class="card-title" style="width: 100%; padding-bottom: 0">
                    <p class="headline" style="margin: 0">{{thing.thing.get("name")}}</p>
                  </v-card-title>
                  <div style="padding: 0 16px" class="headline">{{thing.thing.get("amount")}}</div>
                </v-layout>

                <v-layout flex row align-center style="padding-left: 12px">
                  <v-chip
                    v-for="tag in thing.tags"
                    :key="tag.id"
                    small
                    color="grey"
                    text-color="white"
                  >
                    <v-avatar>
                      <v-icon>tag</v-icon>
                    </v-avatar>
                    {{tag.get("name")}}
                  </v-chip>
                </v-layout>

                <v-layout flex row>
                  <v-card-text style="padding-top: 12px">{{thing.thing.get("description")}}</v-card-text>

                  <v-card-actions>
                    <v-icon
                      small
                      class="mr-2"
                      color="grey darken-1"
                      @click="setMovableObj(thing.thing)"
                    >mdi-file-move</v-icon>
                    <v-icon
                      small
                      class="mr-2"
                      color="grey darken-1"
                      @click="openCrForm(thing.thing, true)"
                    >edit</v-icon>
                    <v-icon small color="grey darken-1" @click="deleteObject(thing.thing)">delete</v-icon>
                  </v-card-actions>
                </v-layout>
              </v-card>
              <v-card color="grey lighten-2" style="margin-bottom: 20px" ripple>
                <v-layout
                  flex
                  fill-height
                  justify-center
                  align-center
                  row
                  @click="openCrForm(null, true)"
                  style="padding: 20px"
                >
                  <v-icon x-large color="grey darken-1">add</v-icon>
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
import { Watch } from "vue-property-decorator";
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
  moveDialog: boolean = false;
  movableObj: any = null;
  containerSelectedToMove: any = null;

  thingsHeaders: Object[] = [
    { text: "Namn", align: "left", sortable: true, value: "name" },
    { text: "Antal", sortable: true, value: "amount" },
    { text: "Beskrivning", value: "description" },
    { text: "Ändra", value: "name", sortable: false }
  ];

  beforeCreate() {
    console.log("entering Bootstrap#beforeCreate");
  }

  created() {
    console.log("entering Bootstrap#created");
  }

  activated() {
    console.log("entering Bootstrap#activated");
  }

  /*beforeRouteEnter(to: any, from: any, next: any) {
    console.log("entering Bootstrap#beforeRouteEnter");
    next();
  }
*/
  beforeRouteUpdate(to: any, from: any, next: any) {
    console.log("entering Bootstrap#beforeRouteUpdate");
    next();
  }

  beforeMount() {
    if (this.$route.params.id) {
      console.log(this.$route.params.id);
      this.changeContainerById(this.$route.params.id);
    } else {
      this.changeContainer(null);
    }
  }

  // @Watch("$route.hash")
  // routeWatch(val: string) {
  //   console.log(val);
  //   this.changeContainerById(val.substring(1));
  // }

  changeContainerById(id: string) {
    if (id) {
      const query = new Parse.Query("Location");
      query.equalTo("objectId", id);
      query
        .first()
        .then((result: any) => {
          this.changeContainer(result);
        })
        .catch(err => {
          console.error(err);
          this.changeContainer(null);
        });
    } else {
      this.changeContainer(null);
    }
  }

  changeContainer(container: any) {
    this.currentContainer = container;
    let query = null;
    if (this.currentContainer === undefined || this.currentContainer === null) {
      const nullQuery = new Parse.Query("Location");
      nullQuery.equalTo("parent", null);

      const undefinedQuery = new Parse.Query("Location");
      undefinedQuery.equalTo("parent", undefined);

      query = Parse.Query.or(nullQuery, undefinedQuery);
    } else {
      query = new Parse.Query("Location");
      query.equalTo("parent", this.currentContainer);
    }

    query.find().then((results: any[]) => {
      this.containers = results;
      if (container) {
        this.$router.replace("/browser/" + container.id);
      } else {
        this.$router.replace("/browser");
      }

      this.getBreadCrumbs();
      this.updateThingsArray();
      this.updateContainerAmounts();
    });
  }

  updateContainerAmounts() {
    for (let container of this.containers) {
      const query = new Parse.Query("Location");
      this.containerAmounts[container.id] = {};
      query.equalTo("parent", container);
      query
        .count()
        .then(result => {
          this.containerAmounts[container.id]["cons"] = result;
        })
        .catch(err => {
          console.error(err);
          this.containerAmounts[container.id]["cons"] = 0;
        });
      const thingsQuery = new Parse.Query("Thing");
      thingsQuery.equalTo("parent", container);
      thingsQuery
        .count()
        .then(result => {
          if (result) {
            this.containerAmounts[container.id]["things"] = result;
          } else {
            this.containerAmounts[container.id]["things"] = 0;
          }
        })
        .catch(err => {
          console.error(err);
          this.containerAmounts[container.id]["things"] = 0;
        });
    }
  }

  async updateThingsArray() {
    let query = null;

    if (this.currentContainer === undefined || this.currentContainer === null) {
      const nullQuery = new Parse.Query("Thing");
      nullQuery.equalTo("parent", null);

      const undefinedQuery = new Parse.Query("Thing");
      undefinedQuery.equalTo("parent", undefined);

      query = Parse.Query.or(nullQuery, undefinedQuery);
    } else {
      query = new Parse.Query("Thing");
      query.equalTo("parent", this.currentContainer);
    }

    this.things = [];
    const things = await query.find();
    if (things) {
      for (let i = 0; i < things.length; i++) {
        this.things.push({ thing: things[i], tags: [] });
        things[i]
          .get("tags")
          .query()
          .find()
          .then((result: any) => {
            this.things[i].tags = result;
          })
          .catch((err: any) => {
            console.error(err);
          });
      }
    }
  }

  async getTags(thing: any) {
    let tagRelation = thing.relation("tags");
    const relationQuery = tagRelation.query();
    return await relationQuery.find();
  }

  public openCrForm(obj: any, tol: boolean) {
    const form = <CreateLocation>this.$refs.crudForm;
    form.setFormData(obj, tol);
    this.createDialog = true;
  }

  setMovableObj(obj: any) {
    this.movableObj = obj;
    this.moveDialog = true;
  }

  moveConChanged(con: any) {
    this.containerSelectedToMove = con;
  }

  moveObj() {
    if (this.movableObj) {
      this.movableObj.set("parent", this.containerSelectedToMove);
      this.movableObj
        .save()
        .then((result: any) => {
          this.changeContainer(this.currentContainer);
          this.moveDialog = false;
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
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
      this.changeContainer(this.currentContainer.get("parent"));
    }
  }

  public getBreadCrumbs() {
    if (this.currentContainer) {
      let parent = this.currentContainer;
      let crumbs = [];
      while (parent != null && parent != undefined) {
        crumbs.push({
          text: parent.get("name"),
          disabled: false,
          id: parent.id
        });
        parent = parent.get("parent");
      }
      crumbs.push({
        text: "Start",
        disabled: true,
        id: ""
      });
      this.breadcrumbs = crumbs.reverse();
    } else {
      this.breadcrumbs = [
        {
          text: "Start",
          disabled: true,
          id: ""
        }
      ];
    }
  }

  public updOrCrEvent(obj: any) {
    if (obj) {
      if (obj.thing) {
        const foundIndex = this.things.findIndex(
          x => x.thing.id == obj.thing.id
        );
        if (foundIndex >= 0) {
          this.things[foundIndex] = obj;
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
  padding: 10px 23px;

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