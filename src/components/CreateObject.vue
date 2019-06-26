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
        <v-card width="100%">
            <v-card-title>
                <span class="title font-weight-light">{{formTitle}}</span>
            </v-card-title>
            <v-card-text>
                <v-form @keydown.ctrl.enter="updateOrCreate">
                    <v-container column fluid grow>
                        <v-layout height="100%">
                            <v-flex md12 fill-height>
                                <v-text-field solo v-model="name" ref="nameInput" :counter="60" label="Namn" required>

                                </v-text-field>
                                <v-textarea solo name="input" label="Beskrivning" v-model="description"
                                            @keydown.ctrl.enter="updateOrCreate"></v-textarea>
                                <v-card raised style="height: 150px; overflow: auto; margin-bottom: 30px">
                                    <v-card-text v-html="getMarkedDesc"></v-card-text>
                                </v-card>
                                <v-text-field
                                        v-if="thingOrContainer"
                                        solo
                                        v-model="amount"
                                        :counter="10"
                                        label="Antal"
                                ></v-text-field>
                                <v-text-field
                                        v-if="!thingOrContainer"
                                        solo
                                        v-model="type"
                                        :counter="10"
                                        label="Typ"
                                ></v-text-field>
                                <v-combobox
                                        v-if="thingOrContainer"
                                        v-model="tags"
                                        :items="suggestedTags"
                                        label="Taggar"
                                        chips
                                        clearable
                                        solo
                                        multiple
                                        no-filter
                                        :search-input.sync="tagSearch"
                                        @change="change"
                                >
                                    <template v-slot:selection="data">
                                        <v-chip :selected="data.selected" close @input="removeTag(data.item)">
                                            <span>{{data.item.name? data.item.name: data.item}}</span>&nbsp;
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
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <v-container>
                        <v-layout flex row align-center justify-center md12>
                            <v-btn
                                    large
                                    color="normal"
                                    @click="updateOrCreate"
                            >{{this.updatableObj? "spara" : "Skapa"}}
                            </v-btn>
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
    import {Watch, Prop} from "vue-property-decorator";
    import Parse from "parse";
    import marked from "marked"
    import BrowseContainer from "@/components/BrowseContainer.vue";

    @Component({
        // @ts-ignore
        components: {
            BrowseContainer
        }
    })
    export default class CreateObject extends Vue {
        public updatableObj: any = null;
        public updatableObjCache: any = null;
        public name: string = "";
        public amount: string = "";
        public type: string = "";
        public tags: any[] = [];
        public tagSearch: string = "";
        public suggestedTags: any[] = [];
        public allTags: any[] = [];

        public container: any = null;
        public editDialog: boolean = false;

        public thingOrContainer: boolean = false;
        public description: string = "";

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
            return this.description && this.description.length > 0?
                marked(this.description, {sanitize: true}): "Förhandvisning för beskrivningen.."
        }

        @Watch("curCon")
        computeCurrentContainer(val: any) {
            this.container = val;
        }

        public setFormData(obj: any, toc: boolean) {
            //@ts-ignore
            //this.$nextTick(() => this.$refs.nameInput.$el.children[0].focus())
            this.thingOrContainer = toc;
            if (obj != null) {
                if (this.updatableObj) {
                    this.updatableObj = obj;
                    this.acceptEditObj()
                } else {
                    if (
                        this.name.length > 0 ||
                        this.type.length > 0 ||
                        this.description.length > 0 ||
                        this.amount.length > 0 ||
                        this.tags.length > 0
                    ) {
                        this.updatableObjCache = obj;
                        this.editDialog = true;
                    } else {
                        this.updatableObjCache = null;
                        this.updatableObj = obj;
                        this.acceptEditObj();
                    }
                }
            } else if (this.updatableObj) {
                this.updatableObj = null;
                this.name = "";
                this.description = "";
                this.amount = "";
                this.type = "";
                this.tags = [];
            }
        }

        containerChanged(con: any) {
            this.container = con;
        }

        change(event: any) {
            console.log(event);
            this.tagSearch = "";
        }

        mounted() {
            const query = new Parse.Query("Tag");
            query.find().then((results: any[]) => {
                this.allTags = results;
                this.suggestedTags = this.allTags.map(x => {
                    return {name: x.get("name"), value: x};
                });
            });

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
                        this.tags = result.map((x: any) => {
                            return {name: x.get("name"), value: x};
                        });
                    })
                    .catch((err: any) => {
                        console.error(err);
                    });
            } else if (this.updatableObj.className == "Container") {
                this.type = this.updatableObj.get("type");
            }
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

        @Watch("tagSearch")
        filterTags(val: string) {
            //Transform the pars array to objecarray compatible with the combobox component
            if (val == null) {
                val = "";
            }
            this.suggestedTags = this.allTags
                .filter(x =>
                    x
                        .get("name")
                        .toLowerCase()
                        .includes(val.toLowerCase())
                )
                .map(x => {
                    return {name: x.get("name"), value: x};
                });

            //add subcategories to the top
            if (
                this.suggestedTags.length > 0 &&
                val &&
                val.toLowerCase() == this.suggestedTags[0].name.toLowerCase()
            ) {
                let subcats = this.allTags.filter(x => {
                    let parent = x.get("parent");
                    return parent && parent.id == this.suggestedTags[0].value;
                });

                this.suggestedTags.splice(0, 1);

                for (let cat of subcats) {
                    this.suggestedTags.splice(0, 0, {name: cat.get("name"), isSub: true});
                }
                if (this.suggestedTags.length - subcats.length >= 1) {
                    this.suggestedTags.splice(0, 0, {divider: true});
                }
            }
        }

        async updateOrCreate() {
            if (this.updatableObj) {
                this.updatableObj.set("name", this.name);
                this.updatableObj.set("description", this.description);

                if (this.updatableObj.className == "Thing") {
                    this.updatableObj.set("amount", this.amount);
                    let tagRelation = this.updatableObj.relation("tags");
                    const relationQuery = tagRelation.query();
                    let result = await relationQuery.find();
                    if (result && result.length > 0) {
                        tagRelation.remove(result);
                    }

                    tagRelation = this.updatableObj.relation("tags")

                    let formatedTags = this.tags
                        .filter(x => {
                            return typeof x === "object";
                        })
                        .map(x => x.value);

                    if (formatedTags.length > 0) {
                        tagRelation.add(formatedTags);
                    }

                } else if (this.updatableObj.className == "Container") {
                    this.updatableObj.set("type", this.type);
                }

                this.updatableObj.save().then(async (response: any) => {
                        console.log("Updated object", response);
                        if (this.updatableObj.className == "Thing") {
                            this.$emit("updOrCr", await this.$store.dispatch("parseThing", response));
                        } else {
                            this.$emit("updOrCr", await this.$store.dispatch("parseContainer", response));
                        }
                        this.updatableObj = null;
                        this.name = "";
                        this.description = "";
                        this.amount = "";
                        this.type = "";
                        this.tags = [];
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

                    newThing.set("name", this.name);
                    newThing.set("description", this.description);
                    newThing.set("amount", this.amount);
                    newThing.set("parent", this.container);
                    let formatedTags = this.tags
                        .filter(x => {
                            return typeof x === "object";
                        })
                        .map(x => x.value);
                    if (formatedTags.length > 0) {
                        let tagRelation = newThing.relation("tags");
                        tagRelation.add(formatedTags);
                    }
                    console.log("sjsda")
                    newThing
                        .save()
                        .then(async (result: any) => {
                            console.log("Item created", result);
                            this.$emit("updOrCr", await this.$store.dispatch("parseThing", result));
                            this.updatableObj = null;
                            this.name = "";
                            this.description = "";
                            this.amount = "";
                            this.type = "";
                            this.tags = [];
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
                    newContainer.save().then(
                        async (result: any) => {
                            this.$emit("updOrCr", await this.$store.dispatch("parseContainer", result));
                            this.updatableObj = null;
                            this.name = "";
                            this.description = "";
                            this.amount = "";
                            this.type = "";
                            this.tags = [];
                            console.log(result);
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