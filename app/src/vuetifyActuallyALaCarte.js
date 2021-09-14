import Vuetify from "vuetify";

let output;
// Subvert the Vuetify.install method to give us the same built components that
// it normally provides to the Vue.use method when registering Vuetify globally.
const syntheticSubvertingVue = {
  use(installer, options) {
    output = {
      ...options
    };
  }
};
Vuetify.install(syntheticSubvertingVue);

// At the time of writing this at Vuetify 1.5.14, this output object gives us
// properties `components` and `directives`, in case you need either of those
export default output;
export const components = output.components;
export const directives = output.directives;
