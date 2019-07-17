<template>
  <v-input ref="fileWrapperInput" :value="file" :rules="fileRules">
    <v-card
      @dragenter="dragEnterFile($event)"
      @dragover="dragOverFile($event)"
      @drop="dropFile($event)"
      width="100%"
    >
      <v-layout flex row align-center justify-start>
        <input
          v-show="false"
          ref="inputUpload"
          type="file"
          :accept="computedFileTypes"
          @change="fileChanged($event)"
        />
        <v-btn
          icon
          large
          :color="thumbSrc? 'transparent': 'primary'"
          @click="$refs.inputUpload.click()"
        >
          <v-img width="100%" aspect-ratio="1" v-if="thumbSrc" :src="thumbSrc?thumbSrc:''"></v-img>
          <v-icon v-else>mdi-image-plus</v-icon>
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
        <v-btn icon @click="clear" style="margin-left: 2px; justify-self: end">
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
  thumbSrc: any = null;

  @Prop({ default: 0 }) maxFileSizeMb!: number;
  @Prop({ default: "" }) fileTypes!: string;
  // @Prop({ default: null }) value!: any;

  //TODO: Make thisa shit work!!!!
  // @Watch("value")
  // valueComputed(val: any) {
  //   console.log("@Watch('value) triggered in FileInput.vue", val);
  //   this.file = val;
  //   if (val && val.name) {
  //     this.fileName = val.name;
  //   } else {
  //     this.fileName = "";
  //   }
  // }

  fileRules: any[] = [
    (file: any): string | boolean => {
      console.log("file validation triggered. file is: ", file);
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

  clear() {
    console.log("clearing file input");
    this.file = null;
    this.thumbSrc = null;
    (<HTMLInputElement>this.$refs.inputUpload).value = "";
    this.fileName = "Lägg till bild";
    this.$emit("update:file", null);
  }

  get computedFileTypes() {
    return !this.fileTypes ? "" : this.fileTypes;
  }

  fileChanged(evt: any) {
    console.log("native file input changed:", evt.target.files[0]);
    if (!evt.target.files[0]) {
      this.clear();
    } else {
      this.fileName = evt.target.files[0].name;
      this.file = evt.target.files[0];
      this.$emit("update:file", this.file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        // console.log("filereader onload triggered: ", e.target.result);
        this.thumbSrc = e.target.result;
        // console.log("thumbSrc is: ", this.thumbSrc);
      };
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  dragEnterFile(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }

  dragOverFile(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }

  dropFile(e: any) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
  }
}
</script>


