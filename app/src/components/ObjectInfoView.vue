<template>
  <div class="object-infoview">
    <template>
      <v-card-title>
        <span>
          <v-icon>{{selectedObject.icon}}</v-icon>
        </span>
        <span class="headline ml-3">{{selectedObject.obj.get("name")}}</span>
      </v-card-title>
      <v-layout width="100%" flex row justify-center v-if="selectedObject.image">
        <div style="width: 70%">
          <v-img :src="selectedObject.image" aspect-ratio="1" contain></v-img>
        </div>
      </v-layout>
      <template v-if="selectedObject.obj.className == 'Thing' && selectedObject.tags.length > 0">
        <v-divider class="mt-3"></v-divider>
        <div class="mt-3 mr-2 ml-2" style="width: 100%">
          <v-chip
            v-for="tag in selectedObject.tags"
            :key="tag.id"
            small
            color="grey"
            text-color="white"
            @click="openTag(tag)"
          >
            <v-avatar>
              <v-icon>tag</v-icon>
            </v-avatar>
            {{tag.get("name")}}
          </v-chip>
        </div>
      </template>

      <template v-if="markedDesc(selectedObject.obj).length > 0">
        <v-card-text v-html="markedDesc(selectedObject.obj)" />
      </template>
      <v-divider></v-divider>
      <v-card-text>
        <table style="width: 100%; font-size: 16px">
          <tbody>
            <tr v-if="selectedObject.obj.className == 'Container'">
              <td>Innehåller</td>
              <td>
                <strong>{{selectedObject.amount.con + " Containrar | " + selectedObject.amount.things + " Saker"}}</strong>
              </td>
            </tr>
            <tr v-if="selectedObject.obj.className == 'Container'">
              <td>Typ</td>
              <td>
                <strong>{{selectedObject.obj.get("type")? selectedObject.obj.get("type"): "--"}}</strong>
              </td>
            </tr>
            <tr v-if="selectedObject.obj.className == 'Thing'">
              <td>Antal</td>
              <td>
                <strong>{{selectedObject.obj.get("amount")? selectedObject.obj.get("amount"): "--"}}</strong>
              </td>
            </tr>
            <tr>
              <td>Ligger i</td>
              <td>
                <strong>{{selectedObject.obj.get("parent")? selectedObject.obj.get("parent").get("name"): "Start"}}</strong>
              </td>
            </tr>
            <tr>
              <td>Skapad</td>
              <td>
                <strong>{{selectedObject.obj.get("createdAt").toLocaleString()}}</strong>
              </td>
            </tr>
            <tr>
              <td>Uppdaterad</td>
              <td>
                <strong>{{selectedObject.obj.get("updatedAt").toLocaleString()}}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </v-card-text>
      <v-card-text class="mt-2" v-if="edit">
        <v-layout flex row justify-center>
          <v-icon medium class="mr-2" color="grey" @click="$emit('editBtn')">edit</v-icon>
          <v-icon medium class="ml-2" color="grey" @click="$emit('deleteBtn')">delete</v-icon>
        </v-layout>
      </v-card-text>
    </template>
  </div>
</template>

<script lang="ts">
import marked from "marked";
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({
  // @ts-ignore
  components: {}
})
export default class Browser extends Vue {
  @Prop() selectedObject!: any;
  @Prop({ default: true }) edit!: any;

  markedDesc(obj: any) {
    return marked(obj.get("description"), {
      sanitize: true
    });
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
}
</script>

<style scoped lang="scss">
</style>