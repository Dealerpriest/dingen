<template>
  <div class="search" style="height: 100vh; overflow: hidden auto">
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
              ></v-text-field>

              <v-expansion-panel>
                <v-expansion-panel-content>
                  <template v-slot:header>
                    <div>Avancerat</div>
                  </template>
                  <v-card>
                    <v-card-text>
                      <v-layout flex row justify-center>
                        <v-layout justify-left style="width: 50%" class="mr-2">
                          <p>Hämta från:</p>
                          <v-checkbox
                            @change="searchObjects"
                            v-model="selectedObjectTypes"
                            label="Containers"
                            value="Container"
                          ></v-checkbox>
                          <v-checkbox
                            @change="searchObjects"
                            v-model="selectedObjectTypes"
                            label="Saker"
                            value="Thing"
                          ></v-checkbox>
                          <!-- <v-combobox
                              v-model="selectedObjectTypes"
                              :items="objectTypes"
                              label="Sök i:"
                              chips
                              clearable
                              multiple
                              hide-selected
                              auto-select-first
                              item-text="name"
                              item-value="value"
                              deletable-chips
                              @change="autoSearch? searchObjects(): false"
                              required
                              :rules="[v => (v && v.length > 0) || 'Du måste välja minst ett object att söka efter.']"
                          ></v-combobox>-->
                        </v-layout>
                        <v-layout style="width: 50%" class="ml-2">
                          <p>Matcha mot:</p>
                          <v-checkbox
                            @change="searchObjects"
                            v-model="selectedObjectFields"
                            label="Namn"
                            value="name"
                          ></v-checkbox>
                          <v-checkbox
                            @change="searchObjects"
                            v-model="selectedObjectFields"
                            label="Beskrivning"
                            value="description"
                          ></v-checkbox>
                          <v-checkbox
                            @change="searchObjects"
                            v-if="!(selectedObjectTypes.indexOf('Thing') < 0)"
                            v-model="matchAgainstTags"
                            label="Taggar"
                          ></v-checkbox>
                          <!-- <v-combobox
                              v-model="selectedObjectFields"
                              :items="objectFields"
                              label="Fält:"
                              chips
                              clearable
                              multiple
                              hide-selected
                              auto-select-first
                              item-text="name"
                              item-value="value"
                              deletable-chips
                              @change="autoSearch? searchObjects(): false"
                              required
                              :rules="[v => (v && v.length > 0) || 'Du måste välja minst ett fält att söka i.']"
                          ></v-combobox>-->
                        </v-layout>
                      </v-layout>
                      <v-switch v-model="autoSearch" label="Auto sök"></v-switch>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-layout flex row justify-center class="mt-3">
                <v-btn color="info" @click="searchObjects">
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
              style="margin-bottom: 20px"
              @click="openObj(obj.obj)"
              ripple
            >
              <v-layout flex row>
                <div class="object-icon-container">
                  <v-img v-if="obj.image" :src="obj.image" width="70%" contain></v-img>
                  <v-icon v-else x-large>{{getObjectIcon(obj.obj)}}</v-icon>
                </div>
                <v-layout flex column>
                  <v-card-title>
                    <p
                      class="d-headline"
                      style="margin: 0"
                    >{{obj.obj.get("name") + " | " + obj.score}}</p>
                  </v-card-title>
                  <v-card-text>
                    <v-layout v-if="obj.obj.className == 'Thing'" flex row align-center>
                      <v-icon>tag</v-icon>
                      <v-chip
                        v-for="tag in obj.tags"
                        :key="tag.id"
                        small
                        color="grey"
                        text-color="white"
                      >{{tag.get("name")}}</v-chip>
                    </v-layout>
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
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from "vue-property-decorator";
import Parse from "parse";

@Component({
  // @ts-ignore
  components: {},
  props: {}
})
export default class Search extends Vue {
  isLoading: boolean = false;
  objects: any[] = [];
  isTyping: boolean = false;
  timeoutId: any = null;
  autoSearch: boolean = true;
  allTags: any[] = [];

  get isMobile() {
    if (screen.width <= 700) {
      return true;
    } else {
      return false;
    }
  }

  // objectFields: any[] = [
  //   { name: "Namn", value: "name" },
  //   { name: "Beskrivning", value: "description" },
  //   { name: "Container Typ", value: "type" },
  //   { name: "Antal", value: "amount" }
  //   //{ name: "Taggar", value: "tags" }
  // ];

  // objectTypes: any[] = [
  //   { name: "Containrar", value: "Container" },
  //   { name: "Things (Saker)", value: "Thing" }
  // ];

  searchQuery: string = "micro";
  selectedObjectTypes: any[] = ["Thing", "Container"];
  selectedObjectFields: any[] = ["name"];
  matchAgainstTags: boolean = true;

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
      this.searchObjects();
    }
  }

  beforeMount() {
    this.fetchAllTags();
  }

  getObjectIcon(obj: any) {
    switch (obj.className) {
      case "Thing":
        return "mdi-file";
      case "Container":
        return "folder";
      case "Tag":
        return "tag";
    }
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
    //@ts-ignore
    if (this.searchQuery.length > 0 && this.$refs.form.validate()) {
      this.isLoading = true;
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
    } else {
      this.objects = [];
    }
  }

  openObj(obj: any) {
    if (obj.className != "Tag") {
      this.$router.push("/browser/" + obj.id);
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

.main-wrapper {
  width: 70%;
  margin: 30px 0;

  @media screen and (max-width: 700px) {
    width: 100%;
    margin: 0;
  }
}
</style>