<template>
    <div class="search">
        <v-layout row fill-height>
            <v-flex>
                <v-card flat height="100%">
                    <v-toolbar>
                        <v-icon>search</v-icon>
                        <v-toolbar-title>Sök</v-toolbar-title>
                    </v-toolbar>

                    <div style="text-align: center; margin-top: 40px">
                        <h3>WIP (En så länge en väldigt enkel sökning. Mer funktioner tillkommer!)</h3>
                    </div>

                    <v-card style="margin: 30px;">
                        <v-card-text>
                            <v-progress-linear indeterminate :active="isLoading" height="4"></v-progress-linear>
                            <v-form
                                    ref="form"
                                    lazy-validation
                            >
                                <v-text-field label="Sök" append-outer-icon="search" clearable
                                              v-model="searchQuery" @input="isTyping = true"></v-text-field>

                                <v-expansion-panel>
                                    <v-expansion-panel-content>
                                        <template v-slot:header>
                                            <div>Avancerat</div>
                                        </template>
                                        <v-card flat>
                                            <v-card-text>
                                                <v-layout flex row justify-center>
                                                    <v-layout style="width: 50%" class="mr-2">
                                                        <v-combobox
                                                                v-model="selectedObjectTypes"
                                                                :items="objectTypes"
                                                                label="Sök i:"
                                                                chips
                                                                clearable
                                                                multiple
                                                                hide-selected
                                                                auto-select-first
                                                                item-text="name"
                                                                item-value="value"
                                                                deletable-chips
                                                                @change="autoSearch? searchObjects(): false"
                                                                required
                                                                :rules="[v => (v && v.length > 0) || 'Du måste välja minst ett object att söka efter.']"
                                                        ></v-combobox>
                                                    </v-layout>
                                                    <v-layout style="width: 50%" class="ml-2">
                                                        <v-combobox
                                                                v-model="selectedObjectFields"
                                                                :items="objectFields"
                                                                label="Fält:"
                                                                chips
                                                                clearable
                                                                multiple
                                                                hide-selected
                                                                auto-select-first
                                                                item-text="name"
                                                                item-value="value"
                                                                deletable-chips
                                                                @change="autoSearch? searchObjects(): false"
                                                                required
                                                                :rules="[v => (v && v.length > 0) || 'Du måste välja minst ett fält att söka i.']"
                                                        ></v-combobox>
                                                    </v-layout>
                                                </v-layout>
                                                <v-switch
                                                        v-model="autoSearch"
                                                        label="Auto sök"
                                                ></v-switch>
                                            </v-card-text>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>

                                <v-layout flex row justify-center class="mt-3">
                                    <v-btn color="info" @click="searchObjects">
                                        <v-icon left dark>search</v-icon>
                                        Sök
                                    </v-btn>
                                </v-layout>
                            </v-form>
                        </v-card-text>
                    </v-card>

                    <v-layout flex column style="padding: 0 30px 30px 30px">
                        <v-card
                                v-for="obj in objects"
                                :key="obj.obj.id"
                                color="grey lighten-2"
                                style="margin-bottom: 20px"
                                @click="openObj(obj.obj)"
                                ripple
                        >
                            <v-layout flex row>
                                <div class="object-icon-container" style="width: 100px">
                                    <v-icon x-large>{{getObjectIcon(obj.obj)}}</v-icon>
                                </div>
                                <v-layout flex column>
                                    <v-card-title class="card-title" style="padding: 16px 16px 8px 0">
                                        <p class="d-headline" style="margin: 0">{{obj.obj.get("name")}}</p>
                                    </v-card-title>
                                    <v-card-text style="padding: 0 16px 8px 4px">
                                        <v-layout v-if="obj.obj.className == 'Thing'" flex row align-center>
                                            <v-chip
                                                    v-for="tag in obj.tags"
                                                    :key="tag.id"
                                                    small
                                                    color="grey"
                                                    text-color="white"
                                            >
                                                <v-avatar>
                                                    <v-icon>tag</v-icon>
                                                </v-avatar>
                                                {{tag.get("name")}}
                                            </v-chip>
                                        </v-layout>
                                        <v-breadcrumbs v-if="obj.breadcrumbs" :items="obj.breadcrumbs" divider=">"
                                                       style="padding: 5px 0">
                                            <template v-slot:item="props">
                                                <a v-if="!props.item.disabled"
                                                   @click="$router.push('/browser/' + props.item.id)"
                                                >{{ props.item.text }}</a>
                                                <p v-else style="margin: 0">{{ props.item.text }}</p>
                                            </template>
                                        </v-breadcrumbs>
                                    </v-card-text>
                                </v-layout>
                            </v-layout>
                        </v-card>
                    </v-layout>
                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Watch} from "vue-property-decorator";
    import Parse from "parse";

    @Component({
        // @ts-ignore
        components: {},
        props: {}
    })
    export default class Search extends Vue {
        isLoading: boolean = false
        objects: any[] = []
        isTyping: boolean = false
        timeoutId: any = null
        autoSearch: boolean = true

        objectFields: any[] = [
            {name: "Namn", value: "name"},
            {name: "Beskrivning", value: "description"},
            {name: "Container Typ", value: "type"},
            {name: "Antal", value: "amount"},
        ]

        objectTypes: any[] = [
            {name: "Containrar", value: "Container"},
            {name: "Things (Saker)", value: "Thing"},
            {name: "Tags", value: "Tag"},
        ]

        searchQuery: string = ""
        selectedObjectFields: any[] = [this.objectFields[0]]
        selectedObjectTypes: any[] = this.objectTypes

        @Watch("searchQuery")
        computeTyping() {
            clearTimeout(this.timeoutId)
            this.timeoutId = setTimeout(() => {
                this.isTyping = false;
            }, 500)
        }

        @Watch("isTyping")
        computeIsTyping(val: string) {
            if (!val && this.autoSearch) {
                this.searchObjects()
            }
        }

        getObjectIcon(obj: any) {
            switch (obj.className) {
                case "Thing":
                    return "mdi-file";
                case "Container":
                    return "folder";
                case "Tag":
                    return "tag";
            }
        }

        async searchObjects() {
            if (this.searchQuery.length > 0 && this.$refs.form.validate()) {
                this.isLoading = true

                const addQuerry = (type: string) => {
                    let regex = new RegExp('[A-ö]*' + this.searchQuery + '[A-ö]*', "gi")
                    return Parse.Query.or(...this.selectedObjectFields.map(x => {
                        const query = new Parse.Query(type);
                        query.matches(x.value, regex, "")
                        return query
                    })).find()
                }

                const results = (await Promise.all(this.selectedObjectTypes.map(x => addQuerry(x.value)))).flat()
                
                this.objects = await Promise.all(results.map(x => {
                    if (x.className == "Container") {
                        return new Promise(async (resolve, reject) => {
                            resolve({obj: x, breadcrumbs: await this.$store.dispatch("getBreadCrumbs", x)});
                        })
                    } else if (x.className == "Tag") {
                        return new Promise(async (resolve, reject) => {
                            resolve({obj: x});
                        })
                    } else if (x.className == "Thing") {
                        return new Promise(async (resolve, reject) => {
                            let tags = []
                            if (x.get("tags")) {
                                tags = await x.get("tags").query().find()
                            }
                            resolve({obj: x, tags: tags, breadcrumbs: await this.$store.dispatch("getBreadCrumbs", x)});
                        })
                    }
                }))
                this.isLoading = false
            } else {
                this.objects = [];
            }
        }

        openObj(obj: any) {
            if (obj.className != "Tag") {
                this.$router.push("/browser/" + obj.id);
            }
        }
    }
</script>

<style scoped lang="scss">
    .object-icon-container {
        width: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>