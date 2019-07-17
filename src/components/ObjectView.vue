<template>
  <div @click.exact.capture="view == 'block'?selectObject():null" class="view">
    <div v-if="view == 'block'" class="grid-container">
      <div v-for="obj in objects" class="grid-item noselect" :key="obj.obj.id">
        <v-card
          :color="isSelected(obj)? 'blue' : 'cyan darken-2'"
          class="white--text"
          height="100%"
          @dblclick="$emit('openObj', obj)"
          @click.exact="selectObject(obj)"
          @click.ctrl.exact="ctrlSelectObject(obj)"
          @click.shift.exact="shiftSelectObject(obj)"
          style="position: relative;"
          :ripple="false"
        >
          <v-layout width="100%" style="height: calc(100% - 73px)">
            <v-img v-if="obj.image.length > 0" :src="obj.image"></v-img>
            <v-layout v-else-if="toc" flex justify-center align-center>
              <v-icon x-large color="white">shape</v-icon>
            </v-layout>
            <v-layout v-else flex justify-center align-center>
              <v-icon x-large color="white">{{getIconByType(obj)}}</v-icon>
            </v-layout>
          </v-layout>
          <v-divider></v-divider>
          <v-card-title
            class="card-title"
            style="display: flex; flex-direction: column; align-items: flex-start; padding: 10px;"
          >
            <div style="max-width: 100%">
              <v-tooltip bottom open-delay="1000">
                <template v-slot:activator="{ on }">
                  <div class="block-headline" style="max-width: 100%" v-on="on">
                    <p
                      style="overflow: hidden; text-overflow: ellipsis; margin: 0"
                    >{{obj.obj.get("name")}}</p>
                  </div>
                </template>
                <span>{{obj.obj.get("name")}}</span>
              </v-tooltip>
            </div>
            <template v-if="!toc">
              <v-layout flex row justify-center>
                <v-tooltip bottom open-delay="1000">
                  <template v-slot:activator="{ on }">
                    <div v-on="on">{{obj.amount.con}} | {{obj.amount.things}}</div>
                  </template>
                  <span>Innehåller {{obj.amount.con}} contianrar och {{obj.amount.things}} saker</span>
                </v-tooltip>
              </v-layout>
            </template>
            <div v-else>{{obj.obj.get("amount")}}</div>
          </v-card-title>
          <v-card-actions style="position: absolute; bottom: 0; right: 0;">
            <v-menu transition="slide-y-transition" bottom>
              <template v-slot:activator="{ on }">
                <v-btn dark icon v-on="on">
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile avatar @click="$emit('info', obj.obj)">
                  <v-list-tile-avatar>
                    <v-icon color="grey">mdi-information-outline</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-title>Visa Info</v-list-tile-title>
                </v-list-tile>
                <v-list-tile avatar @click="$emit('moveObj', obj.obj)">
                  <v-list-tile-avatar>
                    <v-icon color="grey">mdi-folder-move</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-title>Flytta</v-list-tile-title>
                </v-list-tile>
                <v-list-tile avatar @click="$emit('openCrForm', {obj: obj.obj, item: toc})">
                  <v-list-tile-avatar>
                    <v-icon color="grey">edit</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-title>Redigera</v-list-tile-title>
                </v-list-tile>
                <v-list-tile avatar @click="$emit('dupObj', obj.obj)">
                  <v-list-tile-avatar>
                    <v-icon color="grey">mdi-content-duplicate</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-title>Duplicera</v-list-tile-title>
                </v-list-tile>
                <v-list-tile avatar @click="$emit('convObj', obj.obj)">
                  <v-list-tile-avatar>
                    <v-icon color="grey">mdi-autorenew</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-title>Konvertera</v-list-tile-title>
                </v-list-tile>
                <v-list-tile avatar @click="$emit('deleteObj', obj.obj)">
                  <v-list-tile-avatar>
                    <v-icon color="grey">delete</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-title>Ta Bort</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
      </div>
      <v-flex class="grid-item">
        <v-layout flex fill-height justify-center align-center>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                ripple
                fab
                dark
                large
                color="grey lighten-2"
                @click="$emit('openCrForm', {obj: null, item: toc})"
              >
                <v-icon
                  x-large
                  color="grey darken-1"
                >{{toc? "mdi-shape-plus": "mdi-briefcase-plus-outline"}}</v-icon>
              </v-btn>
            </template>
            <span>Skapa ny {{toc? "sak": "container"}}</span>
          </v-tooltip>
        </v-layout>
      </v-flex>
    </div>
    <v-layout v-if="view == 'list'" flex column class="list-view">
      <v-card></v-card>
      <v-data-table
        :headers="listHeaders"
        :items="listObjects"
        item-key="id"
        hide-actions
        v-model="selectedItems"
        class="elevation-1"
      >
        <template v-slot:items="props">
          <tr
            @click.exact="selectObject(props.item)"
            @click.ctrl.exact="ctrlSelectObject(props.item)"
            @click.shift.exact="shiftSelectObject(props.item)"
            :active="props.selected"
            style="border-bottom: none; border-top: 1px solid lightgrey"
          >
            <td style="width: 34px">
              <v-icon
                @click="props.expanded = !props.expanded"
                primary
              >{{props.expanded?"mdi-chevron-down":"mdi-chevron-right"}}</v-icon>
            </td>
            <td>
              <div class="block-headline">{{ props.item.name }}</div>
            </td>
            <td class="text-xs-center">
              <template v-if="!toc">
                <v-layout flex row justify-center>
                  <v-tooltip bottom open-delay="1000">
                    <template v-slot:activator="{ on }">
                      <div
                        class="block-headline"
                        v-on="on"
                      >{{props.item.amount.con}} | {{props.item.amount.things}}</div>
                    </template>
                    <span>Innehåller {{props.item.amount.con}} contianrar och {{props.item.amount.things}} saker</span>
                  </v-tooltip>
                </v-layout>
              </template>
              <div class="block-headline" v-else>{{props.item.amount}}</div>
            </td>
            <td class="text-xs-right">
              <v-btn icon @click="$emit('info', props.item.obj)">
                <v-icon>mdi-information-outline</v-icon>
              </v-btn>
              <v-menu transition="slide-y-transition" bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="selectObject(props.item)">
                    <v-icon>more_vert</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-tile avatar @click="$emit('info', props.item.obj)">
                    <v-list-tile-avatar>
                      <v-icon color="grey">mdi-information-outline</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-title>Visa Info</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile avatar @click="$emit('moveObj', props.item.obj)">
                    <v-list-tile-avatar>
                      <v-icon color="grey">mdi-folder-move</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-title>Flytta</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile
                    avatar
                    @click="$emit('openCrForm', {obj: props.item.obj, item: toc})"
                  >
                    <v-list-tile-avatar>
                      <v-icon color="grey">edit</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-title>Redigera</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile avatar @click="$emit('dupObj', props.item.obj)">
                    <v-list-tile-avatar>
                      <v-icon color="grey">mdi-content-duplicate</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-title>Duplicera</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile avatar @click="$emit('convObj', props.item.obj)">
                    <v-list-tile-avatar>
                      <v-icon color="grey">mdi-autorenew</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-title>Konvertera</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile avatar @click="$emit('deleteObj', props.item.obj)">
                    <v-list-tile-avatar>
                      <v-icon color="grey">delete</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-title>Ta Bort</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </template>
        <template v-slot:expand="props">
          <v-layout flex row style="padding: 16px 0">
            <v-flex md2 class="mr-3 ml-3">
              <v-img
                height="100px"
                v-if="props.item.image.length > 0"
                :src="props.item.image"
                contain
              ></v-img>
              <v-layout style="height: 100px" v-else-if="toc" flex justify-center align-center>
                <v-icon x-large color="grey">add</v-icon>
              </v-layout>
              <v-layout style="height: 100px" v-else flex justify-center align-center>
                <v-icon x-large color="gray">{{getIconByType(props.item)}}</v-icon>
              </v-layout>
            </v-flex>
            <v-divider vertical></v-divider>

            <v-flex style="align-items: flex-start;" flex column fill-height class="ml-3 mb-2" md12>
              <v-chip
                v-for="tag in props.item.tags"
                :key="tag.id"
                small
                color="grey"
                text-color="white"
              >
                <v-avatar>
                  <v-icon>tag</v-icon>
                </v-avatar>
                {{tag.get("name")}}
              </v-chip>
              <div style="font-size: 16px" class="mt-2">{{props.item.short_desc}}</div>
            </v-flex>
          </v-layout>
        </template>
      </v-data-table>
      <v-layout row justify-center class="mt-3 mb-3">
        <v-tooltip bottom open-delay="1000">
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              ripple
              fab
              dark
              large
              color="grey lighten-2"
              @click="$emit('openCrForm', {obj: null, item: toc})"
            >
              <v-icon large color="grey darken-1">
                {{toc? "mdi-shape-plus":
                "mdi-briefcase-plus-outline"}}
              </v-icon>
            </v-btn>
          </template>
          <span>Skapa ny {{toc? "sak": "container"}}</span>
        </v-tooltip>
      </v-layout>
    </v-layout>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop, PropSync } from "vue-property-decorator";
import { Object } from "parse";

@Component({
  // @ts-ignore
  components: {},
  props: {}
})
export default class ObjectView extends Vue {
  @Prop() objects!: any[];
  @Prop({ default: "block" }) view!: string;
  @Prop() toc!: boolean;
  @PropSync("selected", { type: Array }) selectedItems!: any[];

  listHeaders: any[] = [
    { text: "", value: "expand", sortable: false },
    {
      text: "Namn",
      align: "left",
      value: "name"
    },
    { text: "Antal", value: "amount", align: "center" },
    { text: "", value: "", sortable: false }
  ];

  shiftSelectStartPoint: any = null;

  isSelected(obj: any) {
    return this.selectedItems.find(x => x.obj.id == obj.obj.id) != null;
  }

  get listObjects() {
    return this.objects.map((obj: any) => {
      return {
        name: obj.obj.get("name"),
        amount: obj.obj.get("amount"),
        id: obj.obj.id,
        ...obj
      };
    });
  }

  getIconByType(obj: any) {
    let type = obj.obj.get("type");
    if (type == "city" || type == "stad") {
      return "mdi-city";
    } else if (type == "house" || type == "hus") {
      return "mdi-home-varient";
    } else {
      return "mdi-briefcase";
    }
  }

  selectObject(obj: any) {
    if (obj) {
      this.selectedItems = [obj];
      this.shiftSelectStartPoint = obj.obj;
      this.$emit("objSelected", obj);
    } else {
      this.selectedItems = [];
      this.shiftSelectStartPoint = null;
      this.$emit("objSelected", null);
    }
  }

  shiftSelectObject(obj: any) {
    if (this.shiftSelectStartPoint) {
      if (this.shiftSelectStartPoint.className == obj.obj.className) {
        let startIndex = this.objects.findIndex(
          x => x.obj == this.shiftSelectStartPoint
        );
        let endIndex = this.objects.findIndex(x => x.obj == obj.obj);
        this.selectedItems.splice(startIndex, 1);
        for (
          let i = Math.min(startIndex, endIndex);
          i < Math.max(startIndex, endIndex) + 1;
          i++
        ) {
          this.selectedItems.push(this.objects[i]);
        }
      }
    } else {
      this.shiftSelectStartPoint = obj.obj;
    }
  }

  ctrlSelectObject(obj: any) {
    let objIndex = this.selectedItems.indexOf(obj);
    console.log("tested item's index in selectedItems:", objIndex);
    if (objIndex != -1) {
      this.selectedItems.splice(objIndex, 1);
    } else {
      this.selectedItems.push(obj);
    }
  }

  onClickRow(data: any, evt: any) {
    // if (!evt.target.closest(".prevent-expand")) {
    //   data.expanded = !data.expanded;
    // }
  }
}
</script>

<style scoped lang="scss">
.list-view {
  padding: 0 30px;
  @media screen and (max-width: 700px) {
    padding: 0 20px;
  }
}

.block-headline {
  font-size: 18px;
  line-height: 32px;
  font-weight: 400;
  letter-spacing: normal;
  font-family: Roboto, sans-serif;
  white-space: nowrap;
  margin: 0;

  @media screen and (max-width: 700px) {
    font-size: 18px;
  }
}

.grid-container {
  width: 100%;
  display: grid;
  padding: 0 30px 30px 30px;
  grid-template-columns: repeat(auto-fill, 200px);
  grid-auto-rows: 250px;
  grid-gap: 28px;
  grid-auto-flow: dense;

  @media screen and (max-width: 700px) {
    grid-template-columns: repeat(auto-fill, 100px);
    grid-auto-rows: 130px;
    grid-gap: 14px;
  }

  .grid-item {
    height: 100%;
    width: 100%;

    .card-title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 200px;
      @media screen and (max-width: 700px) {
        width: 130px;
      }
    }
  }
}

.noselect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>