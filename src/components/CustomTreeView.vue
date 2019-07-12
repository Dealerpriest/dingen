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
  extends: VTreeview,
  methods: {
    updateSelected(key: string | number, isSelected: boolean) {
      console.log("custom updateSelected called");
      //@ts-ignore
      if (!this.nodes.hasOwnProperty(key)) return;

      ///Our custom code that only deals with the checked node
      //@ts-ignore
      this.nodes[key].isSelected = isSelected;
      // changed.set(key, isSelected);
      //@ts-ignore
      this.updateVnodeState(key);
      if (isSelected) {
        //@ts-ignore
        this.selectedCache.add(key);
      } else {
        //@ts-ignore
        this.selectedCache.delete(key);
      }

      ///////////// The Old original version

      // const changed = new Map();
      // const descendants = [key, this.getDescendants(key)];
      // descendants.forEach(descendant => {
      //   this.nodes[descendant].isSelected = isSelected;
      //   this.nodes[descendant].isIndeterminate = false;
      //   changed.set(descendant, isSelected);
      // });

      //@ts-ignore
      // const parents = this.getParents(key);
      // parents.forEach((parent: any) => {
      //   //@ts-ignore
      //   this.nodes[parent] = this.calculateState(
      //     //@ts-ignore
      //     this.nodes[parent],
      //     //@ts-ignore
      //     this.nodes
      //   );
      //   //@ts-ignore
      //   changed.set(parent, this.nodes[parent].isSelected);
      // });

      //const all = [key, ...descendants, ...parents];
      //@ts-ignore
      // all.forEach(this.updateVnodeState);

      // for (const [key, value] of changed.entries()) {
      //   //@ts-ignore
      //   value === true
      //     ? //@ts-ignore
      //       this.selectedCache.add(key)
      //     : //@ts-ignore
      //       this.selectedCache.delete(key);
      // }
    }
  }
};
</script>
