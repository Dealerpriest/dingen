<template>
  <div class="location" @click="changeLocation">
    {{ loc.get("name") }} | {{ loc.id }}
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Parse from "parse";

export default Vue.extend({
  name: "browser",
  mounted() {
    // console.log(this.loc.name)
  },

  props: {
    loc: Object
  },
  data() {
    return {};
  },
  methods: {
    changeLocation() {
      console.log("clicked");
      this.$emit("changeLoc", this.loc);
    }
  },
  components: {}
});
</script>

<style lang="scss">
.location {
  background-color: lightgray;
  display: flex;
}
</style>