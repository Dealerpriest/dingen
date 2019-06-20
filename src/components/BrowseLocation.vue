<template>
  <div class="browser-location">
    <v-layout column style="height: 50vh; background-color: white; padding: 10px 30px 30px 30px">
      <v-flex column>
        <v-icon @click="goToParent" medium left>arrow_back</v-icon>
        <span
          class="font-weight-light"
          style="font-size: 18px"
        >{{ selectedContainer ? "Vald plats: " + selectedContainer.get("name") : "Välj plats:" }}</span>
        <v-text-field
          v-model="containerSearch"
          append-icon="search"
          clear-icon="mdi-close-circle"
          clearable
          label="Sök plats"
          type="text"
          single-line
          width="100%"
        ></v-text-field>
      </v-flex>
      <v-flex style="overflow: auto" class="elevation-1" width="100%" fill-height>
        <v-card width="100%" height="100%">
          <v-data-table
            :headers="headers"
            :items="containers"
            hide-actions
            hide-headers
            md12
            item-key="id"
          >
            <template v-slot:items="props">
              <tr
                @click="selectContainer(props.item)"
                :active="selectedContainer === props.item"
                @dblclick="changeContainer(props.item)"
              >
                <td style="width: 100%">{{ props.item.get("name") }}</td>
                <td
                  v-if="editable"
                  class="justify-center layout px-0 md1"
                  style="width: 80px; margin: 0;"
                >
                  <v-icon small class="mr-2" @click="$emit('editCon', props.item)">edit</v-icon>
                  <v-icon small @click="$emit('delCon', props.item)">delete</v-icon>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop } from "vue-property-decorator";
import Parse from "parse";
import Location from "@/components/Location.vue";

@Component({
  // @ts-ignore
  components: {}
})
export default class Browser extends Vue {
  selectedContainer: any = null;
  containers: any[] = [];
  currentContainer: any = null;
  containerSearch: string = "";
  headers = [
    {
      text: "Underkategorier ",
      align: "left",
      sortable: true,
      value: "name"
    }
  ];
  editDialog: boolean = true;

  @Prop() editable!: boolean;

  @Watch("containerSearch")
  conSearch(val: string) {
    if (val && val.length > 0) {
      this.containers = this.$store.state.db.locations.filter((x: any) => {
        return x
          .get("name")
          .toLowerCase()
          .includes(val.toLowerCase());
      });
    } else {
      this.containers = this.$store.state.db.locations.filter((x: any) => {
        return x.get("parent") == null;
      });
    }
  }

  beforeMount() {
    this.$store.dispatch("fetchAllLocations").then(locations => {
      this.containers = locations.filter((x: any) => {
        return x.get("parent") == null;
      });
    });
  }

  goToParent() {
      if (this.currentContainer) {
        this.$emit("conChanged", this.selectedContainer);
        this.changeContainer(this.currentContainer.get("parent"));
      }
  }

  selectContainer(con: any) {
    this.selectedContainer = con;
    this.$emit("conChanged", con);
  }

  changeContainer(container: any) {
    this.currentContainer = container;
    this.selectedContainer = container;
    let query = null;
    if (this.currentContainer === undefined || this.currentContainer === null) {
      const nullQuery = new Parse.Query("Location");
      nullQuery.equalTo("parent", null);

      const undefinedQuery = new Parse.Query("Location");
      undefinedQuery.equalTo("parent", undefined);

      query = Parse.Query.or(nullQuery, undefinedQuery);
    } else {
      query = new Parse.Query("Location");
      query.equalTo("parent", this.currentContainer);
    }

    query.find().then((results: any[]) => {
      this.containers = results;
    });
  }
}
</script>

<style scoped lang="scss">
</style>