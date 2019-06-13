<template>
  <div class="create-location">
    <v-dialog v-model="editDialog" persistent max-width="290">
      <!-- <template v-slot:activator="{ on }">
        <v-btn color="primary" dark v-on="on">Open Dialog</v-btn>
      </template>-->
      <v-card>
        <v-card-title class="headline">Du har osparad data!</v-card-title>
        <v-card-text>Du har osparad data! Vill du ta bort det du har skrivit?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click="denyEditLoc">Disagree</v-btn>
          <v-btn color="green darken-1" flat @click="acceptEditLoc">Agree</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card width="100%">
      <v-card-title>
        <span class="title font-weight-light">Skapa ny Plats</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-container column fluid grow>
            <v-layout height="100%">
              <v-flex md12 fill-height>
                <v-text-field solo v-model="name" :counter="60" label="Namn" required></v-text-field>
                <v-text-field solo v-model="type" :counter="10" label="Typ" required></v-text-field>
                <BrowseLocation
                  @locChanged="locationChanged"
                  :editable="true"
                  @editLoc="checkBeforeEditLoc"
                  @delLoc="delLoc"
                />
              </v-flex>
            </v-layout>
          </v-container>
          <v-container>
            <v-layout flex row align-center justify-center md12>
              <v-btn large color="normal" @click="save">{{createButtonText}}</v-btn>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Parse from "parse";
import Location from "@/components/Location.vue";
import BrowseLocation from "@/components/BrowseLocation.vue";

@Component({
  // @ts-ignore
  components: {
    BrowseLocation
  }
})
export default class CreateLocation extends Vue {
  public objId: string = "";
  public name: string = "";
  public type: string = "";

  public location: any = {};
  public editDialog: boolean = false;
  public editableLocation: any = {};

  public createButtonText = "skapa sak";

  locationChanged(loc: any) {
    this.location = loc;
  }

  checkBeforeEditLoc(loc: any) {
    this.editableLocation = loc;
    if (this.name.length > 0 || this.type.length > 0) {
      this.editDialog = true;
    } else {
      this.acceptEditLoc();
    }
  }

  acceptEditLoc() {
    this.editDialog = false;
    this.name = this.editableLocation.get("name");
    this.objId = this.editableLocation.id;
    this.type = this.editableLocation.get("type");
    this.location = this.editableLocation.get("parent");
    this.createButtonText = "spara sak";
  }

  denyEditLoc() {
    this.editableLocation = null;
    this.editDialog = false;
  }

  delLoc() {
    console.log("Not implemented yet!");
  }

  save() {
    console.log(this.location);
    if (this.objId.length > 0) {
      const ParseLocation = Parse.Object.extend("Location");
      const Location = Parse.Object.extend("Location");
      const query = new Parse.Query(Location);
      // here you put the objectId that you want to update
      query.get(this.objId).then(object => {
        object.set("name", this.name);
        object.set("type", this.type);
        object.set("parent", this.location);
        object.save().then(
          response => {
            this.createButtonText = "skapa sak";
            console.log("Updated Location", response);
          },
          error => {
            console.error("Error while updating Location", error);
          }
        );
      });
    } else {
      const Location = Parse.Object.extend("Location");
      const newLocation = new Location();
      newLocation.set("name", this.name);
      newLocation.set("type", this.type);
      newLocation.set("parent", this.location);
      newLocation
        .save()
        .then((res: any) => console.log(res), (err: any) => console.error(err));
      console.log(newLocation);
    }
  }
}
</script>

<style lang="scss">
.create-location {
  width: 100%;
}
</style>