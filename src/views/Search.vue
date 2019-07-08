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

                    <v-card style="margin: 30px; padding: 16px">
                        <v-text-field label="Sök" append-icon="search" v-model="searchQuery" @input="isTyping = true"></v-text-field>
                    </v-card>

                    <v-layout flex column style="padding: 0 30px 30px 30px">
                        <v-card
                                v-for="obj in objects"
                                :key="obj.id"
                                color="grey lighten-2"
                                style="margin-bottom: 20px"
                                @click="openObj(obj)"
                                ripple
                        >
                            <v-layout flex row>
                                <div class="object-icon-container" style="width: 100px">
                                    <v-icon x-large>{{getObjectIcon(obj)}}</v-icon>
                                </div>
                                <v-layout flex column>
                                    <v-card-title class="card-title" style="padding: 16px 16px 8px 0">
                                        <p class="headline" style="margin: 0">{{obj.get("name")}}</p>
                                    </v-card-title>
                                    <v-card-text style="padding: 0 16px 8px 4px">breadcrumb</v-card-text>
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
        searchQuery: string = ""
        isTyping: boolean = false
        timeoutId: any = null

        @Watch("searchQuery")
        computeTyping() {
            clearTimeout(this.timeoutId)
            this.timeoutId = setTimeout(() => {
                this.isTyping = false;
            }, 500)
        }

        @Watch("isTyping")
        computeIsTyping(val: string) {
            if (!val) {
                this.searchObjects()
            }
        }

        mounted() {
            /*
            const conQuery = new Parse.Query("Container");
            conQuery
                .find()
                .then((results: any[]) => {
                    this.objects = [...this.objects, ...results];
                })
                .catch(err => {
                    console.log(err);
                });
            const thingQuery = new Parse.Query("Thing");
            thingQuery
                .find()
                .then((results: any[]) => {
                    this.objects = [...this.objects, ...results];
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
            const tagQuery = new Parse.Query("Tag");
            tagQuery
                .find()
                .then((results: any[]) => {
                    this.objects = [...this.objects, ...results];
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });*/
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
            if (this.searchQuery.length > 0) {
                const conQuery = new Parse.Query("Container");
                let regex = new RegExp('[A-ö]*' + this.searchQuery + '[A-ö]*', "gi")
                conQuery.matches("name", regex, "")
                const results = await conQuery.find()
                console.log(results.length)
                this.objects = results
            } else {
                this.objects = [];
            }
        }

        openObj(obj: any) {
            if (obj.className === "Thing") {
                this.$router.push("/browser/" + obj.get("parent").id);
            } else if (obj.className === "Container") {
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