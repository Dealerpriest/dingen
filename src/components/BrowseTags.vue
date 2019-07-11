<template>
  <div>
    <v-dialog
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
          <v-btn color="gray darken-1" flat @click="deleteDialog = false"
            >AVBRYT</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-sheet class="pa-3 primary lighten-1">
        <v-layout flex row align-center>
          <v-icon color="white" class="mr-3">tag</v-icon>
          <div class="d-headline" style="color: white">Taggar</div>
          <v-spacer></v-spacer>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click="activeSelectedSet([])">
                <v-icon color="white">mdi-selection-off</v-icon>
              </v-btn>
            </template>
            <span>Avmarkera</span>
          </v-tooltip>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                icon
                @click="
                  openAll = !openAll;
                  $refs.tree.updateAll(openAll);
                "
              >
                <v-icon color="white">mdi-expand-all</v-icon>
              </v-btn>
            </template>
            <span>{{ openAll ? "Komprimera vyn" : "Expandera vyn" }}</span>
          </v-tooltip>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" v-if="editable" icon @click="createTag">
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
        <v-treeview
          :items="tagTree"
          :open="opened"
          :search="search"
          :filter="filterRoots"
          :active="activeSelected"
          @update:active="activeSelectedSet"
          @input="onSelect"
          activatable
          selectable
          active-class="grey lighten-2"
          selected-color="indigo"
          :multiple-active="multiple"
          expand-icon="mdi-chevron-down"
          ref="tree"
        >
          <template v-slot:label="data" v-if="editable">
            <template v-if="data.item.id == isEditing">
              <v-text-field
                @focus="$event.target.select()"
                autofocus
                @keypress.enter="saveTag(data.item)"
                v-model="newName"
                class="mr-3"
              ></v-text-field>
            </template>
            <template v-else>
              <span>{{ data.item.name }}</span>
            </template>
          </template>

          <template v-if="editable" v-slot:append="data">
            <template v-if="data.item.id == isEditing">
              <v-tooltip bottom open-delay="1000">
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="saveTag(data.item)"
                    icon
                    small
                    class="mr-2"
                    style="margin: 0"
                  >
                    <v-icon color="grey darken-2">save</v-icon>
                  </v-btn>
                </template>
                <span>Spara</span>
              </v-tooltip>
              <v-tooltip bottom open-delay="1000">
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="cancelNameEditing()"
                    icon
                    small
                    style="margin: 0"
                  >
                    <v-icon color="grey darken-2">mdi-cancel</v-icon>
                  </v-btn>
                </template>
                <span>Avbryt</span>
              </v-tooltip>
            </template>
            <template v-else>
              <v-tooltip bottom open-delay="1000">
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="
                      isEditing = data.item.id;
                      newName = data.item.name;
                    "
                    icon
                    small
                    class="mr-2"
                    style="margin: 0"
                  >
                    <v-icon color="grey darken-2">edit</v-icon>
                  </v-btn>
                </template>
                <span>Redigera</span>
              </v-tooltip>
              <v-tooltip bottom open-delay="1000">
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="
                      isDeleting = data.item;
                      deleteDialog = true;
                    "
                    icon
                    small
                    style="margin: 0"
                  >
                    <v-icon color="grey darken-2">delete</v-icon>
                  </v-btn>
                </template>
                <span>Ta bort</span>
              </v-tooltip>
            </template>
          </template>
        </v-treeview>
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
  tags: any = null;
  isEditing: string = "";
  isDeleting: any = null;
  newName: string = "";
  deleteDialog: boolean = false;
  openAll: boolean = false;
  createParent: any = null;

  get opened() {
    let matchArray: any[] = [];
    if (this.tagTree && this.search) {
      this.tagTree.forEach(item => {
        this.anyMatchInChildren(item, this.search, matchArray);
      });
    }
    return matchArray;
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

  getParentOf(child: any) {
    let foundParent: any = [null]; // hack to make sure the foundParent is passed around as reference (by using an array). Couldn't make it work with object for some F*CKED up reason!
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
    let foundItem = null;
    for (let item of this.tagTree) {
      foundItem = this.searchDownTheTree(item, id);
      if (foundItem) {
        return foundItem;
      }
    }
    console.log("didn't find any item for id: " + id);
    return foundItem; // if this is reached no item was found. Bad news :-(
  }
  searchDownTheTree(item: any, id: string): any {
    if (item.id == id) {
      //console.log("found item with id: " + id);
      return item;
    }
    let foundItem = null;
    for (let child of item.children) {
      foundItem = this.searchDownTheTree(child, id);
      if (foundItem) {
        return foundItem;
      }
    }
    return foundItem;
  }

  @PropSync("selected", { type: Array }) selectedItemsProp!: any[];
  //@Prop() preSelectedItems: any[];
  @Prop() multiple!: boolean;
  @Prop() editable!: boolean;
  @Prop({ default: () => [] }) preSelTags!: any[];

  shouldUpdate: boolean = false;

  activeSelectedSet(val: any[]) {
    if (this.shouldUpdate) {
      console.log(val);
      this.selectedItemsProp = val.map(
        (x: any) => this.getItemById(x).tag
      ); /*.reduce((acc: any[], x: any) => {
        const tag = this.getItemById(x).tag;
        if (tag) {
          acc.push(tag);
        }
        return acc;
      }, []);*/
    }
  }

  get activeSelected() {
    let computeVal = this.selectedItemsProp.map((x: any) => x.id);
    return computeVal;
  }

  mounted() {
    this.fetchAllTags().then(() => {
      this.shouldUpdate = true;
      console.log(this.preSelTags);
      this.activeSelectedSet(this.preSelTags.map((x: any) => x.id));
    });
  }

  onSelect(event: any, val: any) {
    console.log("selectTriggered");
    console.log(event);
    console.log(val);
  }

  async fetchAllTags() {
    const query = new Parse.Query("Tag");
    const result = await query.find();
    this.tags = result.reduce((acc: any, x: any) => {
      acc[x.id] = x;
      return acc;
    }, {});

    //this.selectedItemsProp = this.activeSelected.map((x: any) => this.tags[x]);

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

  saveTag(item: any) {
    if (item.tag) {
      ///update an existing tag with new stuff
      item.tag.set("name", this.newName);

      item.tag
        .save()
        .then(() => {
          item.name = this.newName;
          this.newName = "";
          this.isEditing = "";
        })
        .catch((err: any) => {
          console.error(err);
        });
    } else {
      /// Creates a new parse object (we added a node to the hierarchy)
      const ParseObject = Parse.Object.extend("Tag");
      const newObject = new ParseObject();

      newObject.set("name", this.newName);
      newObject.set("parent", this.createParent.tag);

      newObject
        .save()
        .then((result: any) => {
          console.log("happy save of da TAG!");
          item.name = this.newName;
          item.tag = result;
          this.newName = "";
          this.isEditing = "";
          this.createParent = null;
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
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
  createTag() {
    let parent = null;
    console.log(this.activeSelected);
    if (this.activeSelected.length > 0) {
      parent = this.getItemById(this.activeSelected[0]);
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
      this.isEditing = newID;
    } else {
      this.tagTree.push(newObject);
      this.isEditing = newID;
    }
  }

  cancelCreating() {
    if (this.createParent) {
      let index = this.createParent.children.findIndex(
        (x: any) => x.id == this.isEditing
      );
      this.createParent.children.splice(index, 1);
    } else {
      let index = this.tagTree.findIndex((x: any) => x.id == this.isEditing);
      this.tagTree.splice(index, 1);
    }

    this.cancelNameEditing();
  }

  cancelNameEditing() {
    // let item = this.getItemById(this.isEditing);

    this.newName = "";
    this.isEditing = "";
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