<template>
  <div class="create-location" @keydown.ctrl.enter="updateOrCreate">
    <v-dialog v-model="editDialog" persistent max-width="300">
      <v-card>
        <v-card-title class="headline">Du har osparad data!</v-card-title>
        <v-card-text>Du har osparad data! Vill du ta bort det du har skrivit?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="denyEditObj">Avbryt</v-btn>
          <v-btn color="green darken-1" flat @click="acceptEditObj">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div width="100%">
      <v-card-title>
        <span class="title font-weight-light">{{formTitle}}</span>
      </v-card-title>
      <v-card-text>
        <v-form
          v-model="formIsValid"
          @keydown.ctrl.enter="$refs.form.validate()? updateOrCreate(): false"
          ref="form"
          lazy-validation
        >
          <v-container column fluid grow>
            <v-layout height="100%">
              <v-flex md12 fill-height>
                <v-text-field
                  solo
                  v-model="name"
                  ref="nameInput"
                  label="Namn"
                  required
                  :rules="[v => !!v || 'Ett namn är nödvändigt!']"
                ></v-text-field>
                <v-text-field v-if="thingOrContainer" solo v-model="amount" label="Antal"></v-text-field>
                <v-textarea
                  solo
                  name="input"
                  label="Beskrivning"
                  v-model="description"
                  @keydown.ctrl.enter="$refs.form.validate()? updateOrCreate(): false"
                ></v-textarea>
                <v-card raised style="height: 150px; overflow: auto; margin-bottom: 30px">
                  <v-card-text v-html="getMarkedDesc"></v-card-text>
                </v-card>
                <v-text-field v-if="!thingOrContainer" solo v-model="type" label="Typ"></v-text-field>
                <FileInput
                  @update:file="file = $event"
                  :value="file"
                  :maxFileSizeMb="2"
                  fileTypes="image/*"
                ></FileInput>

                <v-combobox
                  v-if="thingOrContainer"
                  v-model="tags"
                  label="Taggar"
                  chips
                  readonly
                  solo
                  multiple
                  class="mt-3"
                >
                  <template v-slot:selection="data">
                    <v-chip :selected="data.selected" close @input="removeTag(data.item)">
                      <span>{{data.item.get("name")}}</span>&nbsp;
                    </v-chip>
                  </template>
                  <template v-slot:item="data">
                    <!-- <template v-if="!data.item.selected">
                                          <p>SELECTED</p>
                    </template>-->
                    <template v-if="!data.item.isSub">
                      <v-list-tile-content v-text="data.item.name"></v-list-tile-content>
                    </template>
                    <template v-else>
                      <v-list-tile-avatar>
                        <v-icon>arrow_right</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="'Undertagg'"></v-list-tile-sub-title>
                      </v-list-tile-content>
                    </template>
                  </template>
                </v-combobox>
                <BrowseTags
                  v-if="thingOrContainer"
                  :selected.sync="tags"
                  :preSelTags="tags"
                  :multiple="true"
                  :editable="true"
                />
              </v-flex>
            </v-layout>
          </v-container>
          <v-container>
            <v-layout flex row align-center justify-center md12>
              <v-btn
                :disabled="!formIsValid"
                large
                color="normal"
                @click="$refs.form.validate()? updateOrCreate(): false"
              >{{this.updatableObj? "Spara" : "Skapa"}}</v-btn>
              <v-btn large color="error" @click="$emit('close'); resetForm()">{{"Avbryt"}}</v-btn>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop } from "vue-property-decorator";
import Parse from "parse";
import marked from "marked";
import BrowseContainer from "@/components/BrowseContainer.vue";
import BrowseTags from "@/components/BrowseTags.vue";
import FileInput from "@/components/FileInput.vue";

@Component({
  // @ts-ignore
  components: {
    BrowseContainer,
    BrowseTags,
    FileInput
  }
})
export default class CreateObject extends Vue {
  updatableObj: any = null;
  updatableObjCache: any = null;
  name: string = "";
  amount: string = "";
  type: string = "";
  tags: any[] = [];
  file: any = null;
  formIsValid: boolean = true;

  container: any = null;
  editDialog: boolean = false;

  thingOrContainer: boolean = false;
  description: string = "";

  @Prop() curCon!: any;

  get formTitle() {
    if (this.updatableObj) {
      return "Ändra: " + this.updatableObj.get("name");
    } else {
      if (this.thingOrContainer) {
        return "Skapa ny sak:";
      } else {
        return "Skapa ny container:";
      }
    }
  }

  get getMarkedDesc() {
    return this.description && this.description.length > 0
      ? marked(this.description, { sanitize: true })
      : "Förhandvisning för beskrivningen..";
  }

  @Watch("curCon")
  computeCurrentContainer(val: any) {
    this.container = val;
  }

  public setFormData(obj: any, toc: boolean) {
    console.log("setFormData triggered");
    //@ts-ignore
    //this.$nextTick(() => this.$refs.nameInput.$el.children[0].focus())
    this.thingOrContainer = toc;
    if (obj != null) {
      if (this.updatableObj) {
        //replace currently edited object with the new
        this.updatableObj = obj;
        this.acceptEditObj();
      } else {
        if (
          this.name.length > 0 ||
          this.type.length > 0 ||
          this.description.length > 0 ||
          this.amount.length > 0 ||
          this.tags.length > 0 ||
          this.file != null
        ) {
          this.updatableObjCache = obj;
          //trigger question to lose data
          this.editDialog = true;
        } else {
          this.updatableObjCache = null;
          this.updatableObj = obj;
          this.file = null;
          this.acceptEditObj();
        }
      }
    } else if (this.updatableObj) {
      this.resetForm();
    }
  }

  containerChanged(con: any) {
    this.container = con;
  }

  mounted() {
    if (this.curCon) {
      this.container = this.curCon;
    }
  }

  acceptEditObj() {
    this.editDialog = false;
    if (this.updatableObjCache) {
      this.updatableObj = this.updatableObjCache;
    }

    if (this.updatableObj.className == "Thing") {
      this.amount = this.updatableObj.get("amount");
      let relation = this.updatableObj.relation("tags");
      const relationQuery = relation.query();
      relationQuery
        .find()
        .then((result: any) => {
          this.tags = result;
        })
        .catch((err: any) => {
          console.error(err);
        });
    } else if (this.updatableObj.className == "Container") {
      this.type = this.updatableObj.get("type");
    }
    this.file = null;
    this.name = this.updatableObj.get("name");
    this.description = this.updatableObj.get("description");
  }

  denyEditObj() {
    this.editDialog = false;
  }

  removeTag(item: any) {
    this.tags.splice(this.tags.indexOf(item), 1);
    this.tags = [...this.tags];
  }

  resetForm() {
    this.updatableObj = null;
    this.name = "";
    this.description = "";
    this.amount = "";
    this.type = "";
    this.tags = [];
    this.file = null;
    //@ts-ignore
    this.$refs.form.resetValidation();
  }

  async updateOrCreate() {
    if (this.updatableObj) {
      this.updatableObj.set("name", this.name);
      this.updatableObj.set("description", this.description);

      if (this.file) {
        let parseFile = new Parse.File(this.file.name, this.file);
        this.updatableObj.set("image", parseFile);
      }

      if (this.updatableObj.className == "Thing") {
        this.updatableObj.set("amount", this.amount);
        let tagRelation = this.updatableObj.relation("tags");
        const relationQuery = tagRelation.query();
        let result = await relationQuery.find();
        if (result && result.length > 0) {
          tagRelation.remove(result);
        }

        tagRelation = this.updatableObj.relation("tags");

        if (this.tags.length > 0) {
          tagRelation.add(this.tags);
        }
      } else if (this.updatableObj.className == "Container") {
        this.updatableObj.set("type", this.type);
      }

      this.updatableObj.save().then(
        async (response: any) => {
          console.log("Updated object", response);
          if (this.updatableObj.className == "Thing") {
            this.$emit(
              "updOrCr",
              await this.$store.dispatch("parseThing", response)
            );
          } else {
            this.$emit(
              "updOrCr",
              await this.$store.dispatch("parseContainer", response)
            );
          }
          this.resetForm();
        },
        (error: any) => {
          console.error("Error while updating object", error);
          this.$emit("updOrCr", null);
        }
      );
    } else {
      if (this.thingOrContainer) {
        const Item = Parse.Object.extend("Thing");
        const newThing = new Item();
        if (this.file) {
          console.log(this.file.name);
          console.log(this.file.size);
          let parseFile = new Parse.File(this.file.name, this.file);
          newThing.set("image", parseFile);
        }

        newThing.set("name", this.name);
        newThing.set("description", this.description);
        newThing.set("amount", this.amount);
        newThing.set("parent", this.container);

        if (this.tags.length > 0) {
          let tagRelation = newThing.relation("tags");
          tagRelation.add(this.tags);
        }

        newThing
          .save()
          .then(async (result: any) => {
            console.log("Item created", result);
            this.$emit(
              "updOrCr",
              await this.$store.dispatch("parseThing", result)
            );
            this.resetForm();
          })
          .catch((error: any) => {
            console.error("Error while creating Item: ", error);
            this.$emit("updOrCr", null);
          });
      } else {
        const Container = Parse.Object.extend("Container");
        const newContainer = new Container();
        newContainer.set("name", this.name);
        newContainer.set("type", this.type);
        newContainer.set("description", this.description);
        newContainer.set("parent", this.container);
        if (this.file) {
          let parseFile = new Parse.File(this.file.name, this.file);
          newContainer.set("image", parseFile);
        }
        newContainer.save().then(
          async (result: any) => {
            this.$emit(
              "updOrCr",
              await this.$store.dispatch("parseContainer", result)
            );
            this.resetForm();
          },
          (err: any) => {
            console.error(err);
            this.$emit("updOrCr", null);
          }
        );
      }
    }
  }
}
</script>

<style lang="scss">
.create-location {
  width: 100%;
}
</style>