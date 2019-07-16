<template>
  <v-input ref="fileWrapperInput" :value="file" :rules="fileRules">
    <v-card width="100%">
      <v-layout flex row align-center justify-start>
        <input
          v-show="false"
          ref="inputUpload"
          type="file"
          :accept="computedFileTypes"
          @change="fileChanged($event)"
        />
        <v-btn large icon color="primary" @click="$refs.inputUpload.click()">
          <v-icon>mdi-image-plus</v-icon>
        </v-btn>
        <v-tooltip bottom open-delay="1000">
          <template v-slot:activator="{ on }">
            <span
              @click="$refs.inputUpload.click()"
              v-on="on"
              style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: rtl; width: 100%; user-select: none;"
            >{{fileName}}</span>
          </template>
          <span>{{fileName}}</span>
        </v-tooltip>
        <v-btn icon @click="clearFile" style="margin-left: 2px; justify-self: end">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-layout>
    </v-card>
  </v-input>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

@Component({})
export default class FileInput extends Vue {
  file: any = null;
  fileName: string = "Lägg till bild";

  @Prop({ default: 0 }) maxFileSizeMb!: number;
  @Prop({ default: "" }) fileTypes!: string;
  @Prop({ default: null }) value!: any;

  //TODO: Make thisa shit work!!!!
  @Watch("value")
  valueComputed(val: any) {
    this.file = val;
  }

  fileRules: any[] = [
    (file: any): string | boolean => {
      console.log(file);
      if (!file) {
        console.log("no file");
        return true;
      }
      if (file.size > this.maxFileSizeMb * 1024 * 1024) {
        console.log("failed validation on file input. File too big");
        return "För stor fil. Max är " + this.maxFileSizeMb + " MB";
      } else {
        return true;
      }
    }
  ];

  clearFile() {
    this.file = null;
    this.fileName = "Lägg till bild";
    this.$emit("update:file", null);
  }

  get computedFileTypes() {
    return !this.fileTypes ? "" : this.fileTypes;
  }

  fileChanged(evt: any) {
    console.log("file changed:", evt.target.files[0]);
    this.fileName = evt.target.files[0].name;
    this.file = evt.target.files[0];
    this.$emit("update:file", this.file);
  }
}
</script>


