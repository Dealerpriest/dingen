<template>
  <div class="browser-location">
    <v-layout column style="height: 50vh; background-color: white; padding: 10px 30px 30px 30px">
      <v-flex row>
        <v-tooltip bottom open-delay="1000">
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" medium left @click="changeContainer(null)">home</v-icon>
          </template>
          <span>Gå till start</span>
        </v-tooltip>
        <v-tooltip bottom open-delay="1500">
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" @click="goToParent" medium left>arrow_back</v-icon>
          </template>
          <span>Gå till förälder</span>
        </v-tooltip>

        <span class="font-weight-light" style="font-size: 18px">Vald Plats:</span>
        <strong
          class="ml-2"
          style="font-size: 18px"
        >{{ selectedContainer ? selectedContainer.get("name") : "Start" }}</strong>
        <v-text-field
          v-model="containerSearch"
          append-icon="search"
          clear-icon="mdi-close-circle"
          clearable
          label="Sök plats"
          type="text"
          single-line
          width="100%"
          @input="isTyping = true"
        ></v-text-field>
      </v-flex>
      <!-- <v-progress-linear indeterminate :active="isLoading" height="4"></v-progress-linear> -->
      <div class="breadcrumb">
        <v-breadcrumbs :items="breadcrumbs" divider=">">
          <template v-slot:item="props">
            <a
              v-if="!props.item.disabled"
              @click="changeContainerById(props.item.id)"
            >{{ props.item.text }}</a>
            <p v-else style="margin: 0">
              <strong>{{ props.item.text }}</strong>
            </p>
          </template>
        </v-breadcrumbs>
      </div>
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
                <td class="justify-center layout px-0">
                  <v-icon class="ml-4">{{props.item.icon}}</v-icon>
                </td>
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
  breadcrumbs: any[] = [];

  timeoutId: any = null;
  isTyping: boolean = false;
  isLoading: boolean = false;

  @Prop() editable!: boolean;

  @Watch("containerSearch")
  computeTyping() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.isTyping = false;
    }, 700);
  }

  @Watch("isTyping")
  computeIsTyping(val: boolean) {
    if (!val) {
      this.searchObjects();
    }
  }

  async searchObjects() {
    this.isLoading = true;
    const conQuery = new Parse.Query("Container");
    if (this.containerSearch && this.containerSearch.length > 0) {
      let regex = new RegExp("[A-ö]*" + this.containerSearch + "[A-ö]*", "gi");
      conQuery.matches("name", regex, "");
    } else {
      conQuery.equalTo("parent", null);
    }
    this.$store.dispatch("getBreadCrumbs", null).then(result => {
      this.breadcrumbs = result;
    });
    this.containers = await conQuery.find();
    this.isLoading = false;
  }

  beforeMount() {
    this.searchObjects();
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

  changeContainerById(id: string) {
    if (id) {
      const query = new Parse.Query("Container");
      query.equalTo("objectId", id);
      query
        .first()
        .then((result: any) => {
          this.changeContainer(result);
        })
        .catch(() => {
          this.changeContainer(null);
        });
    } else {
      this.changeContainer(null);
    }
  }

  public changeContainer(container: any) {
    this.currentContainer = container;
    this.selectedContainer = container;
    this.$emit("conChanged", container);
    let query = null;
    if (this.currentContainer === undefined || this.currentContainer === null) {
      const nullQuery = new Parse.Query("Container");
      nullQuery.equalTo("parent", null);

      const undefinedQuery = new Parse.Query("Container");
      undefinedQuery.equalTo("parent", undefined);

      query = Parse.Query.or(nullQuery, undefinedQuery);
    } else {
      query = new Parse.Query("Container");
      query.equalTo("parent", this.currentContainer);
    }

    query.find().then((results: any[]) => {
      this.containers = results;
      this.$store
        .dispatch("getBreadCrumbs", this.currentContainer)
        .then(result => {
          this.breadcrumbs = result;
        });
    });
  }
}
</script>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  flex-direction: row;

  p {
    margin: 0 5px;
  }
}
</style>