<template>
  <div class="create-location">
    <label>Name:</label><input type="text" v-model="name" />
    <label>Type:</label><input type="text" v-model="type" />
    <label>Parent:</label>
      <select v-model="parent">
        <option v-for="location in locations" :key="location.id" :value="location">{{location.get("name")}}</option>
      </select>

    <input type="button" value="save!" @click="save"/>
    
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Parse from 'parse';
import Location from '@/components/Location.vue';

export default Vue.extend({
  name: 'browser',
  mounted() {
    this.getAllLocations();
  },
  data() {
    const obj: {
      name: string,
      type: string,
      parent: any
      locations: any[],
    } = {
      name: '',
      type: '',
      parent: null,
      locations: [],
    };
    return obj;
  },
  methods: {
    getAllLocations() {
      const Location = Parse.Object.extend('Location');
      const query = new Parse.Query(Location);
      query.find().then((results) => {
        this.locations = results;
      });
    },
    save() {
      console.log(this.parent);
      const Location = Parse.Object.extend('Location');
      const newLocation = new Location();
      newLocation.set('name', this.name);
      newLocation.set('type', this.type);
      newLocation.set('parent', this.parent);
      newLocation.save().then((res: any) => console.log(res), (err: any) => console.error(err));
      console.log(newLocation);
    },
  },
  components: {
  },
});
</script>

<style lang="scss">

</style>