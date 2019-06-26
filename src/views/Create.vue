<template>
  <div class="create">
    <div id="forms">
      <div id="buttons">
        <v-btn depressed large color="normal" @click="changeTab('createThing')">Skapa Ny Sak</v-btn>
        <v-btn depressed large color="normal" @click="changeTab('createLocation')">Skapa Ny Plats</v-btn>
      </div>
      <keep-alive>
        <component :is="tab"/>
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Parse from "parse";
import CreateThing from "@/components/CreateThing.vue";
import CreateObject from "@/components/CreateObject.vue";

@Component({
  // @ts-ignore
  components: {
    CreateThing,
    CreateObject
  },
  props: {}
})
export default class Create extends Vue {
  tab = "createThing";

  changeTab(t: string) {
    this.tab = t;
  }
}
</script>

<style scoped lang="scss">
.create {
  display: flex;
  flex-direction: column;
  align-items: center;

  #forms {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 60vw;
    min-width: 400px;
    margin-bottom: 30px;

    #buttons {
      width: 100%;
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
    }
  }
}
</style>