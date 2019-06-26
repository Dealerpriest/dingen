y<template>
  <div class="createThing">
    <v-card width="100%">
      <v-card-title>
        <!-- <v-icon @click="goToParent" medium left>arrow_back</v-icon> -->
        <span class="title font-weight-light">Skapa ny Sak</span>
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-container column fluid grow>
            <v-layout height="100%">
              <v-flex md12 fill-height>
                <v-text-field solo v-model="name" :counter="60" label="Namn" required></v-text-field>
                <v-text-field solo v-model="amount" :counter="10" label="Antal" required></v-text-field>
                <v-combobox
                  v-model="tags"
                  :items="suggestedTags"
                  label="Taggar"
                  chips
                  clearable
                  solo
                  multiple
                  no-filter
                  :search-input.sync="tagSearch"
                  @change="change"
                >
                  <template v-slot:selection="data">
                    <v-chip :selected="data.selected" close @input="removeTag(data.item)">
                      <span>{{data.item.name? data.item.name: data.item}}</span>&nbsp;
                    </v-chip>
                  </template>
                  <template v-slot:item="data">
                    <!-- <template v-if="!data.item.selected">
                      <p>SELECTED</p>
                    </template>-->
                    <template v-if="!data.item.isSub">
                      <v-list-tile-content v-text="data.item.name"></v-list-tile-content>
                    </template>
                    <template v-else>
                      <v-list-tile-avatar>
                        <v-icon>arrow_right</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="'Group'"></v-list-tile-sub-title>
                      </v-list-tile-content>
                    </template>
                  </template>
                </v-combobox>
                <BrowseLocation @locChanged="locationChanged"/>
                <v-textarea solo name="input" label="Beskrivning" value="T" v-model="description"></v-textarea>
              </v-flex>
            </v-layout>
          </v-container>
          <v-container>
            <v-layout flex row align-center justify-center md12>
              <v-btn large color="normal" @click="save">Skapa Sak</v-btn>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from "vue-property-decorator";
import Parse from "parse";
import BrowseLocation from "@/components/BrowseContainer.vue";

@Component({
  // @ts-ignore
  components: {
    BrowseLocation
  },
  props: {}
})
export default class CreateThing extends Vue {
  public name: string = "";
  public description: string = "";
  public amount: string = "";
  public location: any = null;
  public tags: any[] = [];
  public tagSearch: string = "";
  public suggestedTags: any[] = [
    "Electronics",
    { name: "Microkontroller", group: "Group 1", avatar: "" },
    { name: "Annan ", group: "Group 1", avatar: "" },
    { divider: true },
    "Electromekanik",
    "testing"
  ];

  public allTags: any[] = [];

  mounted() {
    const query = new Parse.Query("Tag");
    query.find().then((results: any[]) => {
      this.allTags = results;
      this.suggestedTags = this.allTags.map(x => {
        return { name: x.get("name"), value: x.id };
      });
    });

    /*const starters = new Parse.Query("Tag");
    starters.equalTo("parent", null);
    starters.find().then((results: any[]) => {
      this.suggestedTags = results;
    });*/
  }

  change(event: any) {
    console.log(event);
    this.tagSearch = "";
  }

  @Watch("tagSearch")
  filterTags(val: string, oldVal: string) {
    //Transform the pars array to objecarray compatible with the combobox component
    this.suggestedTags = this.allTags
      .filter(x =>
        x
          .get("name")
          .toLowerCase()
          .includes(val.toLowerCase())
      )
      .map(x => {
        return { name: x.get("name"), value: x.id };
      });

    //add subcategories to the top
    if (
      this.suggestedTags.length > 0 &&
      val &&
      val.toLowerCase() == this.suggestedTags[0].name.toLowerCase()
    ) {
      let subcats = this.allTags.filter(x => {
        let parent = x.get("parent");
        return parent && parent.id == this.suggestedTags[0].value;
      });

      this.suggestedTags.splice(0, 1);

      for (let cat of subcats) {
        this.suggestedTags.splice(0, 0, { name: cat.get("name"), isSub: true });
      }
      if (this.suggestedTags.length - subcats.length >= 1) {
        this.suggestedTags.splice(0, 0, { divider: true });
      }
    }
  }

  locationChanged(loc: any) {
    this.location = loc;
  }

  save() {
    const Item = Parse.Object.extend("Thing");
    const newThing = new Item();

    newThing.set("name", this.name);
    newThing.set("description", this.description);
    newThing.set("parent", this.location);

    newThing
      .save()
      .then((result: any) => {
        console.log("Item created", result);
      })
      .catch((error: any) => {
        console.error("Error while creating Item: ", error);
      });
  }

  removeTag(item: any) {
    this.tags.splice(this.tags.indexOf(item), 1);
    this.tags = [...this.tags];
  }
}
</script>

<style scoped lang="scss">
.createThing {
  width: 100%;
}

#thing-img-prev {
  background-color: lightgray;
  width: 100%;
  height: 100%;
}
</style>