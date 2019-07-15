<template>
  <v-input ref="fileWrapperInput" :value="file" :rules="fileRules">
    <input
      v-show="false"
      ref="inputUpload"
      type="file"
      :accept="computedFileTypes"
      @change="fileChanged($event)"
    />
    <v-btn round color="primary" @click="$refs.inputUpload.click()">Ladda upp bild</v-btn>
    <span>{{fileName}}</span>
  </v-input>
</template>

<script lang="ts">
//@ts-ignore
import { components } from "@/vuetifyActuallyALaCarte";
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop } from "vue-property-decorator";

export default class FileInput extends Vue {
  @Prop() maxFileSizeMb!: number;
  @Prop() fileTypes!: string;
  file: any = null;
  fileName: string = "";
  fileRules: any[] = [
    (v: any): any => {
      if (!this.file) {
        console.log("no file");
        this.$emit("update:file", null);
        return true;
      }

      if (this.file.size > this.maxFileSizeMb * 1024 * 1024) {
        console.log("failed validation on file input");
        this.$emit("update:file", null);
        return "För stor fil. Max är " + this.maxFileSizeMb + " MB";
      } else {
        this.$emit("update:file", this.file);
        return true;
      }
    }
  ];

  get computedFileTypes(): any {
    return !this.fileTypes ? "" : this.fileTypes;
  }

  fileChanged(evt: any) {
    // console.log(evt.target.files[0].name);
    this.fileName = evt.target.files[0].name;
    this.file = evt.target.files[0];
  }
}
</script>

<style>
</style>


