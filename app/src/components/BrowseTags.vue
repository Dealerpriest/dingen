<template>
  <div>
    <v-dialog
      tabindex="0"
      autofocus
      v-model="deleteDialog"
      max-width="300px"
      @keyup.esc="deleteDialog = false"
      @keyup.enter="deleteTag"
    >
      <v-card @keypress.enter="deleteTag">
        <v-card-title class="headline" color="red">OOpss..!</v-card-title>
        <v-card-text>Vill du verkligen ta bort?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" flat @click="deleteTag">OK</v-btn>
          <v-btn color="gray darken-1" flat @click="deleteDialog = false">AVBRYT</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-sheet class="pa-3 primary lighten-1">
        <v-layout flex row align-center>
          <v-icon color="white" class="mr-3">tag</v-icon>
          <div class="d-headline" style="color: white">Taggar</div>
          <v-spacer></v-spacer>
          <v-tooltip v-if="multiple" bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click="selectedNodes = []">
                <v-icon color="white">mdi-selection-off</v-icon>
              </v-btn>
            </template>
            <span>Avmarkera</span>
          </v-tooltip>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click="openAllFunc">
                <v-icon color="white">mdi-expand-all</v-icon>
              </v-btn>
            </template>
            <span>{{ openAll ? "Komprimera vyn" : "Expandera vyn" }}</span>
          </v-tooltip>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" v-if="editable" icon @click="createTag()">
                <v-icon large color="white">add</v-icon>
              </v-btn>
            </template>
            <span>Skapa Ny Tagg</span>
          </v-tooltip>
        </v-layout>

        <!-- <input v-model="search"
        @keypress.escape="(console.log('esc pressed'))" type="text"></input>-->
        <v-text-field
          tabindex="0"
          v-model="search"
          @keyup.esc="search = ''"
          label="Sök"
          dark
          flat
          solo-inverted
          hide-details
          clearable
          append-icon="search"
          clear-icon="mdi-close-circle-outline"
        ></v-text-field>
      </v-sheet>
      <v-card-text>
        <CustomTreeView
          v-model="selectedNodes"
          :items="tagTree"
          :open="opened"
          @update:open="openedUpdated"
          :search="search"
          :filter="filterRoots"
          :active.sync="currentlyActive"
          activatable
          :selectable="multiple"
          active-class="grey lighten-2"
          selected-color="indigo"
          expand-icon="mdi-chevron-down"
          indeterminate-icon="$vuetify.icons.checkboxOn"
          ref="tree"
        >
          <template v-if="editable" v-slot:label="data">
            <template v-if="data.item.id == editingID || data.item.id == creatingId">
              <v-text-field
                @focus="$event.target.select()"
                autofocus
                @keyup.esc.stop.prevent="data.item.id == editingID?cancelNameEditing():cancelCreating()"
                @keypress.enter="data.item.id == editingID?saveTag(data.item):saveCreatedTag(data.item)"
                v-model="nameFieldVal"
                class="mr-3"
              ></v-text-field>
            </template>
            <template v-else>
              <span>{{ data.item.name }}</span>
            </template>
          </template>

          <template v-if="editable" v-slot:append="data">
            <template v-if="data.item.id == editingID || data.item.id == creatingId">
              <v-btn
                @click="data.item.id == editingID?saveTag(data.item):saveCreatedTag(data.item)"
                icon
                small
                class="mr-2"
                style="margin: 0"
              >
                <v-icon color="grey darken-2">save</v-icon>
              </v-btn>
              <v-btn
                @click="data.item.id == editingID?cancelNameEditing():cancelCreating()"
                icon
                small
                style="margin: 0"
              >
                <v-icon color="grey darken-2">mdi-cancel</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                @click="
                      editingID = data.item.id;
                      nameFieldVal = data.item.name;
                    "
                icon
                small
                class="mr-2"
                style="margin: 0"
              >
                <v-icon color="grey darken-2">edit</v-icon>
              </v-btn>
              <v-btn
                @click="isDeleting = data.item; deleteDialog = true;"
                icon
                small
                style="margin: 0"
              >
                <v-icon color="grey darken-2">delete</v-icon>
              </v-btn>
            </template>
          </template>
        </CustomTreeView>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
//@ts-ignore
import { Vue, Component, PropSync, Prop, Watch } from "vue-property-decorator";
import Parse from "parse";
import CustomTreeView from "@/components/CustomTreeView.vue";

@Component({
  // @ts-ignore
  components: {
    CustomTreeView
  }
})
export default class BrowseTags extends Vue {
  search: string = "";
  tagTree: any[] = [];
  // open: any[] = [];
  editingID: string = "";
  creatingId: string = "";
  nameFieldVal: string = "";

  isDeleting: any = null;

  deleteDialog: boolean = false;
  openAll: boolean = false;
  createParent: any = null;
  currentlyActive: any[] = [];
  // opened: any[] = [];
  openedPreFiltering: any[] = [];

  get opened() {
    console.log("get opened triggered");
    let matchArray: any[] = [];
    if (this.search != "") {
      if (this.tagTree && this.search) {
        this.tagTree.forEach(item => {
          this.anyMatchInChildren(item, this.search, matchArray);
        });
      }
      return matchArray;
    } else {
      return this.openedPreFiltering;
    }
  }

  openedUpdated(opened: any) {
    console.log("openedUpdate triggered");
    if (this.search == "") {
      this.openedPreFiltering = opened;
    }
    for (const activeItemId of this.currentlyActive) {
      let ascendants = this.getAscendants(activeItemId);
      let shouldStayActive = true;
      for (let ascendant of ascendants) {
        if (opened.indexOf(ascendant.id) == -1) {
          shouldStayActive = false;
        }
      }
      if (!shouldStayActive) {
        console.log("removing active, it was hidden");
        this.currentlyActive.splice(
          this.currentlyActive.indexOf(activeItemId),
          1
        );
      }
    }
  }

  openAllFunc() {
    this.openAll = !this.openAll;
    //@ts-ignore
    this.$refs.tree.updateAll(this.openAll);
  }

  anyMatchInChildren(item: any, search: string, matchArray: any[]): boolean {
    let anyMatch = false;
    item.children.forEach((child: any) => {
      if (this.filter(child, search, "name")) {
        anyMatch = true;
      }
      if (child.children.length) {
        if (this.anyMatchInChildren(child, search, matchArray)) {
          anyMatch = true;
        }
      }
    });
    if (anyMatch) {
      matchArray.push(item.id);
    }
    return anyMatch;
  }

  getAscendants(item: any) {
    let ascendants: any = [];

    function isAscendantTo(item: any, candidate: any, ascendants: any[]) {
      if (item == candidate) {
        //condition 1 is a match
        return true;
      } else if (!candidate.children) {
        //condition 2 is no more children to search
        return false;
      } else {
        //condition 3 search recursively
        for (let child of candidate.children) {
          if (isAscendantTo(item, child, ascendants)) {
            ascendants.push(candidate);
            return true;
          }
        }
      }
      return false;
    }

    for (let candidate of this.tagTree) {
      isAscendantTo(this.getItemById(item), candidate, ascendants);
    }
    return ascendants;
  }

  getParentOf(child: any) {
    let foundParent: any = [null]; // hack to make sure the foundParent is passed around as reference (by using an array). Couldn't make it work with object because of copy of reference!
    this.tagTree.forEach((candidate: any) => {
      this.checkCandidateAgainstChildren(candidate, child, foundParent);
    });
    return foundParent[0];
  }

  checkCandidateAgainstChildren(candidate: any, item: any, parent: any) {
    // console.log("foundParent is currently: ");
    // console.log(parent);
    if (candidate.children) {
      if (this.isParentTo(candidate, item)) {
        parent[0] = candidate;
        // console.log("isParentTo triggered save of foundParent");
        // console.log(candidate);
        // console.log(parent);
      } else {
        candidate.children.forEach((child: any) => {
          this.checkCandidateAgainstChildren(child, item, parent);
        });
      }
    }
  }

  isParentTo(item: any, searchChild: any): any {
    let isParent = false;
    // if (item.children) {
    item.children.forEach((child: any) => {
      if (child == searchChild) {
        //console.log("found parent");
        isParent = true;
      }
    });
    // }
    return isParent;
  }

  //recursive search for ID
  getItemById(id: string) {
    // console.log("searching tagTree for item with ID: " + id);
    // console.log("tagTree is:");
    // console.log(this.tagTree);
    let searchDownTheTree = (item: any, id: string): any => {
      if (item.id == id) {
        //console.log("found item with id: " + id);
        return item;
      }
      let foundItem = null;
      for (let child of item.children) {
        foundItem = searchDownTheTree(child, id);
        if (foundItem) {
          return foundItem;
        }
      }
      return foundItem;
    };
    let foundItem = null;
    for (let item of this.tagTree) {
      foundItem = searchDownTheTree(item, id);
      if (foundItem) {
        return foundItem;
      }
    }
    console.log("didn't find any item for id: " + id);
    return foundItem; // if this is reached no item was found. Bad news :-(
  }

  getItemByTagId(id: string) {
    console.log("searching tagTree for item with ID: " + id);
    console.log("tagTree is:", this.tagTree);
    // console.log(this.tagTree);
    let searchDownTheTree = (item: any, id: string): any => {
      if (item.tag.id == id) {
        //console.log("found item with id: " + id);
        return item;
      }
      let foundItem = null;
      for (let child of item.children) {
        foundItem = searchDownTheTree(child, id);
        if (foundItem) {
          return foundItem;
        }
      }
      return foundItem;
    };
    let foundItem = null;
    for (let item of this.tagTree) {
      foundItem = searchDownTheTree(item, id);
      if (foundItem) {
        return foundItem;
      }
    }
    console.log("didn't find any item for id: " + id);
    return foundItem; // if this is reached no item was found. Bad news :-(
  }

  @PropSync("selected", { type: Array }) selectedItemsProp!: any[];
  @Prop() multiple!: boolean;
  @Prop() editable!: boolean;
  @Prop({ default: () => [] }) preSelTags!: any[];

  shouldUpdate: boolean = false;

  set selectedNodes(selectedIds: string[]) {
    if (this.shouldUpdate) {
      //console.log("set selectNodes called");
      console.log(selectedIds);
      let selectedTags = []; // this.selectedItemsProp = [];
      for (let id of selectedIds) {
        let item = this.getItemById(id);
        if (item.tag) {
          selectedTags.push(item.tag);
        }
      }
      console.log("after filtering items without tag objects:");
      console.log(selectedTags);
      this.selectedItemsProp = selectedTags;
    }
  }

  get selectedNodes() {
    if (this.shouldUpdate) {
      console.log("get selectNodes called");
      console.log("got", this.selectedItemsProp);
      let computeVal = this.selectedItemsProp.map(
        (x: any) => this.getItemByTagId(x.id).id
      );
      console.log("returning this:");
      console.log(computeVal);
      return computeVal;
    } else {
      return [];
    }
  }

  mounted() {
    this.fetchAllTags().then(() => {
      this.shouldUpdate = true;
      console.log(this.preSelTags);
      this.selectedNodes = this.preSelTags.map((x: any) => x.id);
    });
  }

  onSelect(selectedItems: any) {
    console.log("selectTriggered");
    console.log(selectedItems);
  }

  async fetchAllTags() {
    this.tagTree = [];
    this.tagTree = await this.fetchRootTags();
    for (let i = 0; i < this.tagTree.length; i++) {
      this.tagTree[i].children = await this.fetchChildren(this.tagTree[i]);
    }
    console.log("klar");
  }

  async fetchRootTags() {
    const query = new Parse.Query("Tag");
    query.equalTo("parent", null);

    let results = await query.find();
    return results.map(x => {
      return {
        id: x.id,
        tag: x,
        name: x.get("name"),
        children: []
      };
    });
  }

  async fetchChildren(item: any): Promise<any> {
    const query = new Parse.Query("Tag");
    query.equalTo("parent", item.tag);
    let queryResults = await query.find();

    if (queryResults) {
      return await Promise.all(
        queryResults.map(async (x: any) => {
          return {
            id: x.id,
            tag: x,
            name: x.get("name"),
            children: await this.fetchChildren({ tag: x })
          };
        })
      );
    } else {
      return [];
    }
  }

  createTag() {
    let parent = null;
    console.log(this.currentlyActive);
    if (this.currentlyActive.length > 0) {
      parent = this.getItemById(this.currentlyActive[0]);
      this.createParent = parent;
    }

    const newID = Math.floor(Math.random() * 1000000).toString();
    console.log(newID);

    const newObject = {
      id: newID,
      name: "",
      tag: null,
      children: []
    };

    if (parent) {
      parent.children.push(newObject);
      this.creatingId = newID;
      this.openedPreFiltering.push(parent.id);
    } else {
      this.tagTree.push(newObject);
      this.creatingId = newID;
    }
  }

  saveCreatedTag(item: any) {
    const ParseObject = Parse.Object.extend("Tag");
    const newObject = new ParseObject();

    newObject.set("name", this.nameFieldVal);
    if (this.createParent) {
      newObject.set("parent", this.createParent.tag);
    } else {
      newObject.set("parent", null);
    }

    newObject
      .save()
      .then((result: any) => {
        console.log("happy save of da TAG!");
        item.name = this.nameFieldVal;
        item.tag = result;
        this.nameFieldVal = "";
        this.creatingId = "";
        this.createParent = null;
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  saveTag(item: any) {
    item.tag.set("name", this.nameFieldVal);

    item.tag
      .save()
      .then(() => {
        item.name = this.nameFieldVal;
        this.nameFieldVal = "";
        this.editingID = "";
      })
      .catch((err: any) => {
        console.error(err);
      });
    /// Creates a new parse object (we added a node to the hierarchy)
  }

  async deleteTag() {
    this.deleteDialog = false;
    const childrenQuery = new Parse.Query("Tag");
    childrenQuery.equalTo("parent", this.isDeleting.tag);
    let children: any[] = await childrenQuery.find();

    let childrenSaved: number = 0;

    if (children.length > 0) {
      for (let child of children) {
        child.set("parent", this.isDeleting.tag.get("parent"));
        let result = await child.save();
        if (result) {
          childrenSaved++;
        }
      }
    }

    if (childrenSaved == children.length) {
      let result = this.isDeleting.tag.destroy();
      if (result) {
        let parent = this.getParentOf(this.isDeleting);
        if (parent) {
          parent.children.splice(
            parent.children.findIndex((x: any) => x.id == this.isDeleting.id),
            1
          );
          this.getItemById(parent.id).children = [
            ...parent.children,
            ...this.isDeleting.children
          ];
        } else {
          this.tagTree.splice(
            this.tagTree.findIndex((x: any) => x.id == this.isDeleting.id),
            1
          );
          this.tagTree.push(...this.isDeleting.children);
        }

        console.log();
      } else {
        console.error("Fel uppstod när objectet skulle sparas.");
      }
    } else {
      console.error("Fel uppstod när underobject skulle flyttas upp.");
    }
  }

  cancelCreating() {
    if (this.createParent) {
      let index = this.createParent.children.findIndex(
        (x: any) => x.id == this.editingID
      );
      this.createParent.children.splice(index, 1);
    } else {
      let index = this.tagTree.findIndex((x: any) => x.id == this.editingID);
      this.tagTree.splice(index, 1);
    }

    this.cancelNameEditing();
  }

  cancelNameEditing() {
    // let item = this.getItemById(this.isEditing);

    this.nameFieldVal = "";
    this.editingID = "";
    this.createParent = null;
  }

  filterRoots(item: any, search: any, textKey: any): boolean {
    // console.log("filtering node with name " + item[textKey]);
    let parent = this.getParentOf(item);
    let matches = true;
    if (!parent) {
      // console.log("it's a root node");
      matches = item[textKey]
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase());
    }
    // console.log("matches is: " + matches);
    return matches;
  }

  filter(item: any, search: any, textKey: any): boolean {
    let matches = item[textKey]
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase());

    return matches;
  }

  tagSelectionFilter(item: any, queryText: string, itemText: string) {
    return (
      item
        .get("name")
        .toLocaleLowerCase()
        .indexOf(queryText.toLocaleLowerCase()) > -1
    );
  }

  say(text: string) {
    console.log(text);
  }
}
</script>

<style scoped lang="scss">
</style>