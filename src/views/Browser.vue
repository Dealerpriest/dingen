<template>
    <div class="browser">
        <v-snackbar v-model="showInfo" bottom right :timeout="3000" color="green">
            {{ infoText }}
            <v-btn dark flat @click="showInfo = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
        <v-dialog v-model="errorDialog" max-width="300px">
            <v-card>
                <v-card-title class="headline" color="red">OOpss..!</v-card-title>
                <v-card-text>{{errorMsg}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat @click="errorDialog = false">OK</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="warningDialog" max-width="300px">
            <v-card>
                <v-card-title class="headline">Varning.</v-card-title>
                <v-card-text>{{warningMsg}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat @click="selectedObjectAction()">OK</v-btn>
                    <v-btn color="gray darken-1" flat @click="warningDialog = false; selectedObjectAction = null">
                        Avrbyt
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="loadingDialog" persistent max-width="300px">
            <v-card>
                <v-card-title class="headline">Loading..</v-card-title>
                <v-card-text>
                    <v-layout flex row justify-center align-center style="margin: 10px 0 30px 0">
                        <v-progress-circular :value="0" indeterminate size="64" width="6"></v-progress-circular>
                    </v-layout>

                </v-card-text>

            </v-card>
        </v-dialog>
        <v-dialog v-model="createDialog" max-width="700px">
            <CreateObject
                    ref="crudForm"
                    :curCon=currentObject
                    :showBrowser="false"
                    @updOrCr="updOrCrEvent"
            />
        </v-dialog>
        <v-dialog v-model="moveDialog" max-width="700px">
            <v-card>
                <v-card-title class="headline">Flytta {{selectedObject? selectedObject.get("name"): ""}}</v-card-title>
                <BrowseContainer ref="browseContainer" @conChanged="moveConChanged"/>
                <v-layout flex width="100%" row justify-center style="padding-bottom: 16px">
                    <v-btn large @click="moveObj">
                        <v-icon class="mr-2">mdi-arrow-expand-right</v-icon>
                        flytta
                    </v-btn>
                </v-layout>
            </v-card>
        </v-dialog>
        <v-layout row fill-height>
            <v-flex>
                <v-card flat height="100%">
                    <v-toolbar>
                        <v-btn icon @click="goToParent">
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <v-toolbar-title>Browser {{currentObject? "- " +currentObject.get("name"): ""}}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon>
                            <v-icon>search</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <div class="breadcrumb">
                        <v-breadcrumbs :items="breadcrumbs" divider=">">
                            <template v-slot:item="props">
                                <a
                                        v-if="!props.item.disabled"
                                        @click="changeContainerById(props.item.id)"
                                >{{ props.item.text }}</a>
                                <p v-else>{{ props.item.text }}</p>
                            </template>
                        </v-breadcrumbs>
                    </div>
                    <div v-if="currentObject && currentObject.className === 'Thing'">
                        <v-layout flex row reverse style="margin-right: 30px">
                            <v-icon medium color="grey" @click="openCrForm(currentObject, true)">edit</v-icon>
                            <v-icon medium class="mr-2" color="grey" @click="setDeletableObj(currentObject)">delete
                            </v-icon>
                        </v-layout>
                        <v-card style="margin: 10px 30px 30px 30px">
                            <v-card-title>
                                <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
                                    <p class="headline" style="margin: 0">{{thingInformation.name}}</p>
                                    <p>{{thingInformation.amount}}</p>
                                </div>
                            </v-card-title>
                            <v-layout flex row align-center style="padding-left: 12px">
                                <v-chip
                                        v-for="tag in thingInformation.tags"
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
                            <v-card-text width="100%" v-html="thingInformation.description"></v-card-text>
                        </v-card>
                    </div>
                    <div v-else style="height: 100%">
                        <v-spacer class="title font-weight-light">Containers:</v-spacer>
                        <div class="grid-container">
                            <div v-if="containers" v-for="con in containers" :key="con.obj.id" class="grid-item">
                                <v-card
                                        :color="selectedObject && selectedObject.id == con.obj.id? 'blue' : 'cyan darken-2'"
                                        class="white--text"
                                        height="100%"
                                        @dblclick="openObject(con)"
                                        @click="selectObject(con)"
                                        style="position: relative;"
                                        ripple
                                >
                                    <v-card-title class="card-title">
                                        <div style="max-width: 100%">
                                            <v-tooltip bottom open-delay="1000">
                                                <template v-slot:activator="{ on }">
                                                    <div class="headline" v-on="on" style="max-width: 100%">
                                                        <p style="overflow: hidden; text-overflow: ellipsis; margin: 0">
                                                            {{con.obj.get("name")}}
                                                        </p>
                                                    </div>
                                                </template>
                                                <span>{{con.obj.get("name")}}</span>
                                            </v-tooltip>
                                        </div>
                                        <div>{{con.amounts}}</div>
                                    </v-card-title>
                                    <v-card-text width="100%">{{con.short_desc}}</v-card-text>

                                    <v-card-actions style="position: absolute; bottom: 0; right: 0;">
                                        <v-menu transition="slide-y-transition" bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn dark icon v-on="on">
                                                    <v-icon>more_vert</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list>
                                                <v-list-tile avatar @click="setMovableObj(con.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">mdi-folder-move</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Flytta</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="openCrForm(con.obj, false)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">edit</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Redigera</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="setDuplicateObj(con.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">mdi-content-duplicate</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Duplicera</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="setConvertObj(con.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">mdi-autorenew</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Konvertera till Sak</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="setDeletableObj(con.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">delete</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Ta Bort</v-list-tile-title>
                                                </v-list-tile>
                                            </v-list>
                                        </v-menu>
                                    </v-card-actions>
                                </v-card>
                            </div>

                            <v-flex class="grid-item">
                                <v-card
                                        ripple
                                        color="grey lighten-2"
                                        class="white--text"
                                        height="100%"
                                        @click="openCrForm(null, false)"
                                >
                                    <v-layout flex fill-height justify-center align-center>
                                        <v-icon x-large>add</v-icon>
                                    </v-layout>
                                </v-card>
                            </v-flex>
                        </div>
                        <v-spacer class="title font-weight-light">Things:</v-spacer>
                        <v-layout flex column style="padding: 0 30px 30px 30px">
                            <v-card
                                    v-for="thing in things"
                                    :key="thing.obj.id"
                                    :color="selectedObject && selectedObject.id == thing.obj.id? 'blue' : 'grey lighten-2'"
                                    style="margin-bottom: 20px"
                                    @dblclick="openObject(thing)"
                                    @click="selectObject(thing)"
                                    ripple
                            >
                                <v-layout flex row align-center>
                                    <v-card-title class="card-title" style="width: 100%; padding-bottom: 0">
                                        <v-tooltip bottom open-delay="1000">
                                            <template v-slot:activator="{ on }">
                                                <div class="headline" v-on="on" style="max-width: 100%">
                                                    <p style="overflow: hidden; text-overflow: ellipsis; margin: 0">
                                                        {{thing.obj.get("name")}}
                                                    </p>
                                                </div>
                                            </template>
                                            <span>{{thing.obj.get("name")}}</span>
                                        </v-tooltip>
                                    </v-card-title>
                                    <div style="padding: 0 16px" class="headline">{{thing.obj.get("amount")}}</div>
                                </v-layout>

                                <v-layout flex row align-center style="padding-left: 12px">
                                    <v-chip
                                            v-for="tag in thing.tags"
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

                                <v-layout flex row>
                                    <v-card-text style="padding-top: 12px">{{thing.short_desc}}
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-menu transition="slide-y-transition" bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn icon v-on="on">
                                                    <v-icon>more_vert</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list>
                                                <v-list-tile avatar @click="setMovableObj(thing.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">mdi-folder-move</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Flytta</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="openCrForm(thing.obj, true)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">edit</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Redigera</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="setDuplicateObj(thing.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">mdi-content-duplicate</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Duplicera</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="setConvertObj(thing.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">mdi-autorenew</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Konvertera till Container</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile avatar @click="setDeletableObj(thing.obj)">
                                                    <v-list-tile-avatar>
                                                        <v-icon color="grey">delete</v-icon>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-title>Ta Bort</v-list-tile-title>
                                                </v-list-tile>
                                            </v-list>
                                        </v-menu>
                                    </v-card-actions>
                                </v-layout>
                            </v-card>
                            <v-card color="grey lighten-2" style="margin-bottom: 20px" ripple>
                                <v-layout
                                        flex
                                        fill-height
                                        justify-center
                                        align-center
                                        row
                                        @click="openCrForm(null, true)"
                                        style="padding: 20px"
                                >
                                    <v-icon x-large color="grey darken-1">add</v-icon>
                                </v-layout>
                            </v-card>
                        </v-layout>
                    </div>
                    <!-- <v-footer class="mt-5">Footer</v-footer> -->

                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import marked from "marked"
    import Parse from "parse";
    import removeMd from "remove-markdown"
    import CreateObject from "@/components/CreateObject.vue";
    import BrowseContainer from "@/components/BrowseContainer.vue";

    @Component({
        // @ts-ignore
        components: {
            CreateObject,
            BrowseContainer
        }
    })
    export default class Browser extends Vue {
        containers: any[] = [];
        things: any[] = [];
        currentObject: any = null;
        selectedObject: any = null;
        selectedObjectAction: any = null;
        thingInformation: any = {};
        breadcrumbs: any[] = [];
        createDialog: boolean = false;
        moveDialog: boolean = false;
        containerSelectedToMove: any = null;
        errorMsg: string = "";
        errorDialog: boolean = false;
        loadingDialog: boolean = false;
        warningDialog: boolean = false;
        warningMsg: string = ""
        showInfo: boolean = false;
        infoText: string = "";


        beforeMount() {
            if (this.$route.params.id) {
                this.changeContainerById(this.$route.params.id);
            } else {
                this.changeContainer(null);
            }
            this.loadingDialog = true;
        }

        error(msg: any) {
            this.errorMsg = msg.toString();
            this.errorDialog = true;
        }

        info(msg: any) {
            this.infoText = msg.toString();
            this.showInfo = true;
        }

        async updateThingInfo() {
            this.thingInformation = {
                amount: this.currentObject.get("amount"),
                name: this.currentObject.get("name"),
                description: marked(this.currentObject.get("description"), {sanitize: true}),
                tags: await this.currentObject.get("tags").query().find()
            }
        }

        openObject(obj: any) {
            this.loadingDialog = true;

            if (obj) {
                if (obj.obj.className == "Container") {
                    this.changeContainer(obj.obj)
                } else {
                    this.currentObject = obj.obj;
                    this.updateThingInfo();
                    this.getBreadCrumbs()
                    this.loadingDialog = false;
                }
            } else {
                this.changeContainer(null)
            }
        }

        selectObject(obj: any) {
            this.selectedObject = obj.obj;
        }

        changeContainerById(id: string) {
            this.loadingDialog = true;
            if (id) {
                const query = new Parse.Query("Container");
                query.equalTo("objectId", id);
                query
                    .first()
                    .then((result: any) => {
                        this.changeContainer(result);
                    })
                    .catch(() => {
                        this.changeContainer(null);
                    });
            } else {
                this.changeContainer(null);
            }
        }

        async changeContainer(container: any) {
            if (this.currentObject != container) {
                this.selectedObject = null;
            }

            this.currentObject = container;
            let query = null;
            if (container) {
                this.$router.replace("/browser/" + container.id);
            } else {
                this.$router.replace("/browser");
            }
            if (this.currentObject === undefined || this.currentObject === null) {
                const nullQuery = new Parse.Query("Container");
                nullQuery.equalTo("parent", null);

                const undefinedQuery = new Parse.Query("Container");
                undefinedQuery.equalTo("parent", undefined);

                query = Parse.Query.or(nullQuery, undefinedQuery);
            } else {
                query = new Parse.Query("Container");
                query.equalTo("parent", this.currentObject);
            }

            let results = await query.find()

            if (results) {
                this.containers = []

                for (let con of results) {
                    let parsedContainer = await this.$store.dispatch("parseContainer", con)
                    this.containers.push(parsedContainer)
                }
            } else {
                this.containers = []
            }

            this.loadingDialog = false;

            this.getBreadCrumbs();
            this.updateThingsArray();
            //this.updateContainerAmounts();
        }

        async updateThingsArray() {
            let query = null;

            if (this.currentObject === undefined || this.currentObject === null) {
                const nullQuery = new Parse.Query("Thing");
                nullQuery.equalTo("parent", null);

                const undefinedQuery = new Parse.Query("Thing");
                undefinedQuery.equalTo("parent", undefined);

                query = Parse.Query.or(nullQuery, undefinedQuery);
            } else {
                query = new Parse.Query("Thing");
                query.equalTo("parent", this.currentObject);
            }

            this.things = [];
            const things = await query.find();
            if (things) {
                for (let i = 0; i < things.length; i++) {
                    this.things.push({obj: things[i], tags: [], short_desc: removeMd(things[i].get("description"))});
                    things[i]
                        .get("tags")
                        .query()
                        .find()
                        .then((result: any) => {
                            this.things[i].tags = result;
                        })
                        .catch((err: any) => {
                            console.error(err);
                        });
                }
            }
            this.loadingDialog = false;
        }

        public openCrForm(obj: any, tol: boolean) {
            const form = <CreateObject>this.$refs.crudForm;
            form.setFormData(obj, tol);
            this.createDialog = true;
        }

        setMovableObj(obj: any) {
            this.selectedObject = obj;
            const form = <BrowseContainer>this.$refs.browseContainer;
            form.changeContainer(this.currentObject);
            this.moveDialog = true;
        }

        moveConChanged(con: any) {
            this.containerSelectedToMove = con;
        }

        async moveObj() {
            if (this.selectedObject) {
                if (this.containerSelectedToMove && this.selectedObject.id == this.containerSelectedToMove.id) {
                    this.error("Du kan inte flytta en container till sig själv!")
                    return
                }

                this.loadingDialog = true;
                let parent = this.containerSelectedToMove;
                let parents = [];
                while (parent != null && parent != undefined) {
                    parents.push(parent);
                    parent = parent.get("parent");
                }
                for (let p of parents) {
                    if (p.id == this.selectedObject.id) {
                        this.loadingDialog = false;
                        this.error("Du kan inte flytta en container till en under-container.")
                        return
                    }
                }

                this.selectedObject.set("parent", this.containerSelectedToMove);
                this.selectedObject
                    .save()
                    .then(() => {
                        this.changeContainer(this.currentObject);
                        this.moveDialog = false;
                        this.info("Flyttade " + this.selectedObject.get("name") + " till " + this.containerSelectedToMove.get("name"))

                    })
                    .catch((err: any) => {
                        this.error("Kunde inte flytta " + this.selectedObject.get("name") + " till " + this.containerSelectedToMove.get("name") + ". \nTesta igen senare.")
                        console.error(err);
                    })
                    .finally(() => {
                        this.selectedObjectAction = null;
                    });
            }
        }

        setConvertObj(obj: any) {
            this.selectedObject = obj;
            this.warningDialog = true;
            this.selectedObjectAction = this.convertObject
            this.warningMsg = "Vill du konvertera '" + obj.get("name") + "' till en " +
                (obj.className == "Thing"? "Container?" : "Sak?")
        }

        async convertObject() {
            if (this.selectedObject) {
                let convertedClassName: string;

                if (this.selectedObject.className == "Thing") {
                    convertedClassName = "Container"
                } else {
                    convertedClassName = "Thing"
                }
                const ParseObject = Parse.Object.extend(convertedClassName);
                const newObject = new ParseObject()

                newObject.set("name", this.selectedObject.get("name"));
                newObject.set("description", this.selectedObject.get("description"));
                newObject.set("parent", this.selectedObject.get("parent"))

                let result = await newObject.save()
                if (result) {
                    this.deleteObject(false).then(async () => {
                        if (convertedClassName == "Container") {
                            this.info("Konverterade '" + this.selectedObject.get("name") + "' till en Container")
                            this.updOrCrEvent(await this.$store.dispatch("parseContainer", result), false)
                        } else {
                            this.info("Konverterade '" + this.selectedObject.get("name") + "' till en Sak")
                            this.updOrCrEvent(await this.$store.dispatch("parseThing", result), false)
                        }
                    }).catch((err: any) => {
                        this.error("Fel uppstod vi konvertering")
                        console.error(err)
                    }).finally(() => {
                        this.selectedObjectAction = null;
                    })
                }
            }
        }

        setDuplicateObj(obj: any) {
            this.selectedObject = obj;
            this.warningDialog = true;
            this.selectedObjectAction = this.duplicateObj
            this.warningMsg = "Vill du duplicera '" + obj.get("name") + "'?"
        }

        async duplicateObj() {
            this.warningDialog = false;
            const ParseObject = Parse.Object.extend(this.selectedObject.className);
            const clone = new ParseObject();
            if (this.selectedObject) {
                clone.set("name", this.selectedObject.get("name"));
                clone.set("description", this.selectedObject.get("description"));
                clone.set("parent", this.selectedObject.get("parent"))

                if (clone.className == "Thing") {
                    clone.set("amount", this.selectedObject.get("amount"));
                    let tagRelation = clone.relation("tags");
                    const relationQuery = tagRelation.query();
                    let result = await relationQuery.find();
                    if (result && result.length > 0) {
                        tagRelation.add(result);
                    }

                } else if (clone.className == "Container") {
                    clone.set("type", this.selectedObject.get("type"));
                }

                clone.save().then(async (result: any) => {
                    this.info("Duplicerade " + this.selectedObject.get("name"))
                    if (result.className == "Container") {
                        this.updOrCrEvent(await this.$store.dispatch("parseContainer", result))
                    } else {
                        this.updOrCrEvent(await this.$store.dispatch("parseThing", result))
                    }
                }).catch((err: any) => {
                    console.error(err)
                }).finally(() => {
                    this.selectedObjectAction = null;
                })
            }
        }

        setDeletableObj(obj: any) {
            this.warningDialog = true;
            this.selectedObject = obj;
            this.selectedObjectAction = this.deleteObject;
            this.warningMsg = "Vill du verkligen ta bort '" + obj.get("name") + "'?"
        }

        deleteObject(shouldInform = true) {
            return new Promise(async (resolve, reject) => {
                this.warningDialog = false;
                this.loadingDialog = true;
                if (this.selectedObject.className == "Container") {
                    const conQuery = new Parse.Query("Container");
                    conQuery.equalTo("parent", this.selectedObject);
                    const thingQuery = new Parse.Query("Thing");
                    thingQuery.equalTo("parent", this.selectedObject);
                    let children: any[] = [...(await conQuery.find()), ...(await thingQuery.find())];

                    let childrenSaved: number = 0;

                    if (children.length > 0) {
                        for (let child of children) {
                            child.set("parent", this.selectedObject.get("parent"));
                            let result = await child.save();
                            if (result) {
                                childrenSaved++;
                            }
                        }
                    }

                    if (childrenSaved == children.length) {
                        let result = this.selectedObject.destroy();
                        if (result) {
                            if (shouldInform) {
                                this.info("Tog bort " + this.selectedObject.get("name"))
                            }
                            this.changeContainer(this.currentObject);
                            resolve(result)
                        } else {
                            this.error("Error när en sak skulle tas bort!")
                            console.error("Error while deleting Thing", result);
                            reject(result)
                        }

                        this.selectedObjectAction = null;
                        this.loadingDialog = false
                    } else {
                        this.error("Fel uppstod när underobject skulle flyttas.")
                        reject(null)
                    }
                } else if (this.selectedObject.className == "Thing") {
                    let result = this.selectedObject.destroy();
                    if (result) {
                        if (shouldInform) {
                            this.info("Tog bort " + this.selectedObject.get("name"))
                        }
                        if (this.currentObject && this.currentObject.id == this.selectedObject.id) {
                            this.goToParent()
                        } else {
                            this.things.splice(this.things.findIndex(x => x.obj.id == this.selectedObject.id), 1);
                        }
                        resolve(result)
                    } else {
                        console.error("Error while deleting Thing", result);
                        reject(result)
                    }
                    this.selectedObjectAction = null;
                    this.loadingDialog = false
                }
            })
        }

        goToParent() {
            if (this.currentObject) {
                this.loadingDialog = true
                this.changeContainer(this.currentObject.get("parent"));
            }
        }

        getBreadCrumbs() {
            if (this.currentObject) {
                let parent = this.currentObject;
                let crumbs = [];
                while (parent != null && parent != undefined) {
                    crumbs.push({
                        text: parent.get("name"),
                        disabled: parent.className == "Thing",
                        id: parent.id
                    });
                    parent = parent.get("parent");
                }
                crumbs.push({
                    text: "Start",
                    disabled: false,
                    id: ""
                });
                this.breadcrumbs = crumbs.reverse();
            } else {
                this.breadcrumbs = [
                    {
                        text: "Start",
                        disabled: true,
                        id: ""
                    }
                ];
            }
        }

        public updOrCrEvent(obj: any, shouldInform = true) {
            if (obj) {
                console.log(obj)
                if (obj.obj.className == "Thing") {
                    if (this.currentObject && this.currentObject.id === obj.obj.id) {
                        this.currentObject = obj.obj
                        this.updateThingInfo()
                    } else {
                        const foundIndex = this.things.findIndex(
                            x => x.obj.id == obj.obj.id
                        );
                        if (foundIndex >= 0) {
                            this.things[foundIndex] = obj;
                            if (shouldInform) {
                                this.info("Uppdaterade " + obj.obj.get("name"))
                            }
                        } else {
                            this.things.push(obj);
                            if (shouldInform) {
                                this.info("Skapade en ny sak!")
                            }
                        }
                    }

                } else if (obj.obj.className == "Container") {
                    const foundIndex = this.containers.findIndex(
                        x => x.obj.id == obj.obj.id
                    );
                    if (foundIndex >= 0) {
                        this.containers[foundIndex] = obj;
                        if (shouldInform) {
                            this.info("Uppdaterade " + obj.obj.get("name"))
                        }
                    } else {
                        this.containers.push(obj);
                        if (shouldInform) {
                            this.info("Skapade ny container!")
                        }
                    }
                }

                this.createDialog = false;
            } else {
                this.error("Fel uppstod! Kunde inte skapa eller uppdatera objekt. Information har kanske inte sparats.")
            }
        }
    }
</script>

<style scoped lang="scss">
    .browser {
        min-height: 100%;
    }

    .floating-button {
        position: fixed;
        right: 32px;
        bottom: 32px;
    }

    .breadcrumb {
        display: flex;
        flex-direction: row;
        padding: 10px 23px;

        p {
            margin: 0 5px;
        }
    }

    .no-data {
        padding: 30px 0;
        text-align: center;
    }

    .spacer {
        margin: 10px 0;
        padding: 20px 40px 10px 40px;
    }

    .grid-container {
        width: 100%;
        display: grid;
        padding: 0 30px 30px 30px;
        grid-template-columns: repeat(auto-fill, 250px);
        grid-auto-rows: 200px;
        grid-gap: 28px;
        //justify-content: space-evenly;
        grid-auto-flow: dense;
        //grid-auto-rows: 200px;
        .grid-item {
            height: 100%;
            width: 100%;

            .card-title {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 250px;
            }
        }
    }
</style>