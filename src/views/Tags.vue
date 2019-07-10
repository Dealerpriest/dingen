<template>
  <div>
    <v-card>
      <BrowseTags :selected.sync="parentTag" :multiple="false" :editable="true" />
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Parse from "parse";
import BrowseTags from "@/components/BrowseTags.vue";

@Component({
  // @ts-ignore
  components: { BrowseTags }
})
export default class Tags extends Vue {
  tagName: string = "";
  parentTag: any[] = [];
  tags: any[] = [];
}
</script>

<style scoped lang="scss">
</style>