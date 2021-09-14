<template>
  <div class="search" style="height: 100vh; overflow: hidden auto">
    <div class="wrapper-view">
      <div class="main-view">
        <v-layout flex colum justify-center>
          <v-card class="main-wrapper">
            <v-card style="margin: 30px;">
              <v-card-text>
                <v-progress-linear indeterminate :active="isLoading" height="4"></v-progress-linear>
                <v-form ref="form" lazy-validation>
                  <v-text-field
                    label="Sök"
                    append-outer-icon="search"
                    clearable
                    v-model="searchQuery"
                    @input="isTyping = true"
                    @keypress.enter.prevent="submitSearch"
                  ></v-text-field>

                  <v-expansion-panel>
                    <v-expansion-panel-content>
                      <template v-slot:header>
                        <div>Avancerat</div>
                      </template>
                      <v-card>
                        <v-card-text>
                          <div style="width: 220px">
                            <p style="margin: 0">
                              <strong>Hämta från:</strong>
                            </p>
                            <v-layout>
                              <v-checkbox
                                @change="searchSettingsChanged"
                                v-model="selectedObjectTypes"
                                label="Containers"
                                value="Container"
                              ></v-checkbox>
                              <v-checkbox
                                @change="searchSettingsChanged"
                                v-model="selectedObjectTypes"
                                label="Saker"
                                value="Thing"
                              ></v-checkbox>
                            </v-layout>
                            <p style="margin: 0">
                              <strong>Matcha mot:</strong>
                            </p>
                            <v-layout style="width: 320px">
                              <v-checkbox
                                @change="searchSettingsChanged"
                                v-model="selectedObjectFields"
                                label="Namn"
                                value="name"
                              ></v-checkbox>
                              <v-checkbox
                                @change="searchSettingsChanged"
                                v-model="selectedObjectFields"
                                label="Beskrivning"
                                value="description"
                              ></v-checkbox>
                              <v-checkbox
                                @change="searchSettingsChanged"
                                v-if="!(selectedObjectTypes.indexOf('Thing') < 0)"
                                v-model="matchAgainstTags"
                                label="Taggar"
                              ></v-checkbox>
                            </v-layout>
                          </div>
                          <v-switch v-model="autoSearch" label="Auto sök"></v-switch>
                        </v-card-text>
                      </v-card>
                    </v-expansion-panel-content>
                  </v-expansion-panel>

                  <v-layout flex row justify-center class="mt-3">
                    <v-btn color="info" @click="submitSearch">
                      <v-icon left dark>search</v-icon>Sök
                    </v-btn>
                  </v-layout>
                </v-form>
              </v-card-text>
            </v-card>

            <v-layout flex column>
              <template v-for="(obj, index) in objects">
                <v-divider :key="index" />
                <v-layout
                  :key="obj.obj.id"
                  color="grey lighten-2"
                  @click="openObj(obj)"
                  ripple
                  class="clickable"
                >
                  <v-layout flex row>
                    <div class="object-icon-container">
                      <v-img v-if="obj.image" :src="obj.image" width="70%" contain></v-img>
                      <v-icon v-else x-large>{{obj.icon}}</v-icon>
                    </div>
                    <v-layout flex column>
                      <v-card-title style="padding-bottom: 0">
                        <p class="d-headline" style="margin: 0">{{obj.obj.get("name")}}</p>
                      </v-card-title>
                      <v-card-text>
                        <div style="width: 100%">
                          <v-icon>tag</v-icon>
                          <v-chip
                            v-for="tag in obj.tags"
                            :key="tag.id"
                            small
                            color="grey"
                            text-color="white"
                            @click="openTag(tag)"
                          >{{tag.get("name")}}</v-chip>
                        </div>
                        <v-breadcrumbs
                          class="pl-0"
                          v-if="obj.breadcrumbs"
                          :items="obj.breadcrumbs"
                          divider=">"
                        >
                          <template v-slot:item="props">
                            <a
                              v-if="!props.item.disabled"
                              @click="$router.push('/browser/' + props.item.id)"
                            >{{ props.item.text }}</a>
                            <p v-else style="margin: 0;">{{ props.item.text }}</p>
                          </template>
                        </v-breadcrumbs>
                      </v-card-text>
                    </v-layout>
                  </v-layout>
                </v-layout>
              </template>
            </v-layout>
          </v-card>
        </v-layout>
      </div>
      <v-divider vertical></v-divider>
      <div v-if="detailedView && selectedObject != null" class="side-view">
        <div style="position: relative; z-index: 1;">
          <v-btn
            color="normal"
            @click="detailedView = false"
            style="position: absolute; top: 0; right: 0;"
            icon
          >
            <v-icon>close</v-icon>
          </v-btn>
        </div>
        <ObjectInfoView :edit="false" :selectedObject="selectedObject" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from "vue-property-decorator";
import Parse from "parse";
import ObjectInfoView from "@/components/ObjectInfoView.vue";

@Component({
  components: { ObjectInfoView }
})
export default class Search extends Vue {
  isLoading: boolean = false;
  objects: any[] = [];
  isTyping: boolean = false;
  timeoutId: any = null;
  autoSearch: boolean = true;
  allTags: any[] = [];

  searchQuery: string = "";
  selectedObjectTypes: any[] = ["Thing", "Container"];
  selectedObjectFields: any[] = ["name"];
  matchAgainstTags: boolean = true;

  detailedView: boolean = false;
  selectedObject: any = null;

  @Watch("searchQuery")
  computeTyping() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.isTyping = false;
    }, 500);
  }

  @Watch("isTyping")
  computeIsTyping(val: string) {
    if (!val && this.autoSearch) {
      console.log("replacing history post");
      this.$router.replace({
        path: "search",
        query: this.getSearchParamsObject()
      });
    }
  }

  openObj(obj: any) {
    this.selectedObject = obj;
    this.detailedView = true;
  }

  openTag(tag: any) {
    this.$router.push({
      path: "search",
      query: {
        q: tag.get("name"),
        types: '["Thing"]',
        fields: "[]",
        tags: "true"
      }
    });
  }

  searchSettingsChanged() {
    this.$router.replace({
      path: "search",
      query: this.getSearchParamsObject()
    });
  }

  submitSearch() {
    console.log("pushing to history");
    this.$router.push({
      path: "search",
      query: this.getSearchParamsObject()
    });
  }

  getSearchParamsObject() {
    return {
      q: this.searchQuery,
      types: JSON.stringify(this.selectedObjectTypes),
      fields: JSON.stringify(this.selectedObjectFields),
      tags: this.matchAgainstTags.toString()
    };
  }

  parseSearchParams(params: any) {
    if (params.q) {
      this.searchQuery = params.q;
    }
    if (params.types) {
      this.selectedObjectTypes = JSON.parse(params.types);
    }
    if (params.fields) {
      this.selectedObjectFields = JSON.parse(params.fields);
    }
    if (params.tags) {
      this.matchAgainstTags = params.tags == "true";
    }
  }

  get isMobile() {
    if (screen.width <= 700) {
      return true;
    } else {
      return false;
    }
  }

  beforeRouteEnter(to: any, from: any, next: any) {
    console.log("beforeRouteEnter triggered");
    next((vm: any) => {
      vm.parseSearchParams(to.query);
      vm.searchObjects();
    });
  }

  beforeRouteUpdate(to: any, from: any, next: any) {
    console.log("beforeRouteUpdate triggered");
    this.parseSearchParams(to.query);
    this.searchObjects();
    next();
  }

  async fetchAllTags() {
    const query = new Parse.Query("Tag");
    this.allTags = (await query.find()).map((x: any) => {
      return {
        id: x.id,
        name: x.get("name"),
        parent: x.get("parent") ? x.get("parent").id : null,
        tag: x
      };
    });
    console.log("he");
  }

  getTagChildren(id: string) {
    let tagChildren: any[] = [];

    const fetchChildren = (tags: any[], tag: any) => {
      let children = this.allTags.filter((x: any) => {
        return x.parent == tag.id;
      });

      tags.push(...children);

      for (let child of children) {
        fetchChildren(tags, child);
      }
    };

    fetchChildren(tagChildren, this.allTags.find(x => x.id == id));

    return tagChildren;
  }

  async getThingsWithTags(tagIds: any[]) {
    var innerQuery = new Parse.Query("Tag");
    innerQuery.containedIn("objectId", tagIds);
    var query = new Parse.Query("Thing");
    query.matchesQuery("tags", innerQuery);
    return (await query.find()).map((x: any) => {
      return { obj: x, score: 50 };
    });
  }

  async searchObjects() {
    this.searchQuery = this.searchQuery.trim();
    if (this.searchQuery && this.searchQuery.length > 0) {
      this.isLoading = true;

      if (this.allTags.length <= 0) {
        await this.fetchAllTags();
      }

      let regex = new RegExp("[A-ö]*" + this.searchQuery + "[A-ö]*", "gi");
      let results: any[] = [];

      if (this.selectedObjectFields.length > 0) {
        const addQuery = (type: string) => {
          return Parse.Query.or(
            ...this.selectedObjectFields.map(x => {
              const query = new Parse.Query(type);
              query.matches(x, regex, "");
              return query;
            })
          )
            .find()
            .then((results: any) => {
              return results.map((x: any) => {
                let objWithScore = {
                  obj: x,
                  score: 0
                };
                for (let field of this.selectedObjectFields) {
                  if (x.get(field) && x.get(field).match(regex)) {
                    if (field == "name") {
                      objWithScore.score +=
                        100 +
                        Math.floor(
                          (this.searchQuery.length / x.get("name").length) * 50
                        );
                    }
                    if (field == "description") {
                      objWithScore.score += 10;
                    }
                  }
                }
                return objWithScore;
              });
            });
        };

        results = (await Promise.all(
          this.selectedObjectTypes.map(x => addQuery(x))
        )).flat();
      }

      if (
        this.matchAgainstTags &&
        this.selectedObjectTypes.indexOf("Thing") >= 0
      ) {
        let matchedTags = this.allTags.filter(x => x.name.match(regex));
        for (let matchedTag of matchedTags) {
          let tagChildren = this.getTagChildren(matchedTag.id).map(x => x.id);
          let tagsToMatch = [matchedTag.id, ...tagChildren];
          results.push(...(await this.getThingsWithTags(tagsToMatch)));
        }
      }

      let parsedObjects = await Promise.all(
        results.map((x: any) => {
          if (x.obj.className == "Container") {
            return new Promise(async (resolve, reject) => {
              resolve({
                ...x,
                ...(await this.$store.dispatch("parseContainer", x.obj)),
                breadcrumbs: await this.$store.dispatch("getBreadCrumbs", x.obj)
              });
            });
          } else {
            return new Promise(async (resolve, reject) => {
              resolve({
                ...x,
                ...(await this.$store.dispatch("parseThing", x.obj)),
                breadcrumbs: await this.$store.dispatch("getBreadCrumbs", x.obj)
              });
            });
          }
        })
      );

      //Filter away duplicates
      this.objects = parsedObjects
        .reduce((acc: any[], x: any) => {
          let index = acc.findIndex((y: any) => y.obj.id == x.obj.id);
          if (index == -1) {
            acc.push(x);
          } else {
            acc[index].score += x.score;
          }
          return acc;
        }, [])
        .sort((a: any, b: any) => (a.score < b.score ? 1 : -1));
      this.isLoading = false;
    }
  }
}
</script>

<style lang="scss">
.object-icon-container {
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.v-breadcrumbs li:nth-child(2n) {
  padding: 0px 8px !important;
}

.wrapper-view {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  height: 100%;
}

.main-view {
  width: 100%;
  overflow-y: auto;
}

.side-view {
  width: 35%;
  min-width: 400px;
  overflow: hidden auto;

  @media screen and (max-width: 700px) {
    width: 100vw;
    min-width: 100vw;
    margin: 0;
  }
}

.main-wrapper {
  width: 80%;
  margin: 30px 0;

  @media screen and (max-width: 700px) {
    width: 100%;
    margin: 0;
  }
}

.clickable:hover {
  background-color: rgba(0, 0, 0, 0.08);
}
</style>