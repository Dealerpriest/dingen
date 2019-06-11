<template>
  <div class="thing">
    <h1>Skapa THING</h1>
    <input type="text" name="name" v-model="thingName">
    <input type="button" value="Spara" @click="save">

    <h1>Lista things</h1>
    <input type="button" @click="all" value="häämta!">
    <ul>
      <li v-for="thing in things" :key="thing.id">{{thing.get?thing.get("name"):thing}}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Parse from "parse";

export default Vue.extend({
  name: "thing",
  mounted() {
    console.log(Parse);
  },
  data() {
    const obj: {
      thingName: string;
      things: any[];
    } = {
      thingName: "",
      things: []
    };
    return obj;
  },
  methods: {
    all() {
      const Thing = Parse.Object.extend("Thing");
      const query = new Parse.Query(Thing);
      query.find().then(
        results => {
          // You can use the "get" method to get the value of an attribute
          // Ex: response.get("<ATTRIBUTE_NAME>")
          this.things = results;
          console.log(results);
        },
        error => {
          console.error("Error while fetching Thing", error);
        }
      );
    },
    save() {
      const Item = Parse.Object.extend("Thing");
      const myNewObject = new Item();

      myNewObject.set("name", this.thingName);

      myNewObject.save().then(
        (result: any) => {
          console.log("Item created", result);
        },
        (error: any) => {
          console.error("Error while creating Item: ", error);
        }
      );
    }
  },
  components: {}
});
</script>

<style lang="scss">
</style>