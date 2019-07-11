<template>
  <div>
    <v-layout style="width: 100%; padding: 30px">
      <BrowseTags
        :selected.sync="parentTag"
        :preSelTags="parentTag"
        :multiple="false"
        :editable="true"
        style="width: 100%"
      />
    </v-layout>
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