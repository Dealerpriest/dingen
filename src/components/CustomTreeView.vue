<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
//@ts-ignore
import { components } from "@/vuetifyActuallyALaCarte";
const VTreeview = components.VTreeview;

// @Component({
//   // @ts-ignore
//   // name: "v-customtreeview"
// })

// export default class CustomTreeView extends VTreeview
export default {
  name: "v-customtreeview",
  extends: VTreeview
};
</script>
