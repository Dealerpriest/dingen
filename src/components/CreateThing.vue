<template>
  <div class="createThing">
    <v-card width="100%" min-width="680px">
      <v-card-title>
        <!-- <v-icon @click="goToParent" medium left>arrow_back</v-icon> -->
        <span class="title font-weight-light">Skapa ny Sak</span>
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-container>
            <v-layout>
              <v-flex xs12 md8>
                <v-text-field v-model="name" :counter="60" label="Namn" required></v-text-field>
                <v-text-field v-model="amount" :counter="10" label="Antal" required></v-text-field>
                <v-textarea name="input" label="Beskrivning" value="T" v-model="description"></v-textarea>
              </v-flex>

              <v-flex xs12 md4>
                <div id="thing-img-prev"></div>
              </v-flex>
            </v-layout>
            <hr>
            <v-layout>
              <v-flex xs12 md8>
                <BrowseLocation @locChanged="locationChanged"/>
              </v-flex>
              <v-flex xs12 md8>
                <BrowseLocation @locChanged="locationChanged"/>
              </v-flex>
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
import Parse from "parse";
import BrowseLocation from "@/components/BrowseLocation.vue";

@Component({
  // @ts-ignore
  components: {
    BrowseLocation
  },
  props: {}
})
export default class CreateThing extends Vue {
  name: string = "";
  description: string = "";
  amount: string = "";
  location: any = null;

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