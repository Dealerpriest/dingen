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
          <v-btn color="gray darken-1" flat @click="deleteDialog = false">AVBRYT</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card max-width="1000">
      <v-sheet class="pa-3 primary lighten-1">
        <v-layout flex row align-center>
          <v-icon color="white" class="mr-3">tag</v-icon>
          <div class="d-headline" style="color: white">Taggar</div>
          <v-spacer></v-spacer>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click="activeSelected = []">
                <v-icon color="white">mdi-selection-off</v-icon>
              </v-btn>
            </template>
            <span>Avmarkera</span>
          </v-tooltip>
          <v-tooltip bottom open-delay="1000">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click=" openAll = !openAll; $refs.tree.updateAll(openAll);">
                <v-icon color="white">mdi-expand-all</v-icon>
              </v-btn>
            </template>
            <span>{{openAll? "Komprimera vyn": "Expandera vyn"}}</span>
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
          :search="search"
          :filter="filter"
          :open="opened"
          :active.sync="activeSelected"
          activatable
          return-object
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
              <span>{{data.item.name}}</span>
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
                  <v-btn v-on="on" @click="cancelNameEditing()" icon small style="margin: 0">
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
                    @click="isEditing = data.item.id; newName = data.item.name"
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
                    @click="isDeleting = data.item; deleteDialog = true"
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

@Component({
  components: {}
})
export default class BrowseTags extends Vue {
  search: string = "";
  tagTree: any[] = [];
  // open: any[] = [];
  tags: any[] = [];
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
      matchArray.push(item);
    }
    return anyMatch;
  }

  foundParent: Object = {};
  getParentOf(child: any) {
    this.foundParent = {};
    this.tagTree.forEach((candidate: any) => {
      this.checkCandidateAgainstChildren(candidate, child, this.foundParent);
    });
    return this.foundParent;
  }

  checkCandidateAgainstChildren(candidate: any, item: any, parent: any) {
    if (this.isParentTo(candidate, item)) {
      parent = candidate;
    } else if (candidate.children) {
      candidate.children.forEach((child: any) => {
        this.checkCandidateAgainstChildren(child, item, parent);
      });
    }
  }

  isParentTo(item: any, searchChild: any): any {
    let isParent = false;
    if (item.children) {
      item.children.forEach((child: any) => {
        if (child == searchChild) {
          console.log("found parent");
          isParent = true;
        }
      });
    }
    return isParent;
  }

  @PropSync("selected", { type: Array, default: [] }) selectedItemsProp!: any[];
  @Prop() multiple!: boolean;
  @Prop() editable!: boolean;

  get activeSelected() {
    return (
      this
        .selectedItemsProp /*.map((x: any) => {
        return { id: x.id, tag: x, name: x.get("name") };
      })*/ ||
      []
    );
  }

  set activeSelected(val: any) {
    this.selectedItemsProp = val; //.map((x: any) => x.tag);
  }

  mounted() {
    this.fetchAllTags();
  }

  async fetchAllTags() {
    this.tagTree = [];
    this.tagTree = await this.fetchRootTags();
    this.tagTree.forEach(async (item: any) => {
      item.children = await this.fetchChildren(item);
    });
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
      newObject.set("parent", this.createParent);

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
        console.log(this.getParentOf(this.isDeleting));
      } else {
        console.error("Fel uppstod när objectet skulle sparas.");
      }
    } else {
      console.error("Fel uppstod när underobject skulle flyttas upp.");
    }
  }

  createTag() {
    let parent = null;
    if (this.activeSelected.length > 0) {
      parent = this.activeSelected[0];
      this.createParent = parent.tag;
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

  cancelNameEditing() {
    this.newName = "";
    this.isEditing = "";
  }

  filter(item: any, search: any, textKey: any) {
    let matches = item[textKey]
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase());
    // if (matches && item.children.length > 0) {
    //   this.opened.push(item.id);
    // } else {
    //   this.opened.splice(this.opened.indexOf(item.id), 1);
    // }

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