<template>
    <div class="view">
        <div v-if="view == 'block'" class="grid-container">
            <div v-for="obj in objects" class="grid-item noselect" :key="obj.obj.id">
                <v-card
                        :color="obj.isSelected? 'blue' : 'cyan darken-2'"
                        class="white--text"
                        height="100%"
                        @dblclick="$emit('openObj', obj)"
                        @click.exact="$emit('selectObj', obj)"
                        @click.ctrl.exact="$emit('ctrlSelectObj', obj)"
                        @click.shift.exact="$emit('shiftSelectObj', obj)"
                        style="position: relative;"
                        ripple
                >
                    <v-card-title class="card-title"
                                    style="display: flex; flex-direction: column; justify-content: space-between">
                        <div style="max-width: 100%">
                            <v-tooltip bottom open-delay="1000" >
                                <template v-slot:activator="{ on }">
                                    <div class="d-headline" style="max-width: 100%" v-on="on">
                                        <p style="overflow: hidden; text-overflow: ellipsis; margin: 0">
                                            {{obj.obj.get("name")}}
                                        </p>
                                    </div>
                                </template>
                                <span>{{obj.obj.get("name")}}</span>
                            </v-tooltip>
                        </div>
                        <template v-if="!toc">
                            <v-layout flex row justify-center>
                                <v-tooltip v-if="obj.obj.get('type')"  bottom open-delay="1000">
                                    <template v-slot:activator="{ on }">
                                        <div v-on="on" class="mr-3" style="max-width: 70%">
                                            <p style="overflow: hidden; text-overflow: ellipsis; margin: 0; white-space: nowrap">
                                                {{obj.obj.get("type")}}
                                            </p>
                                        </div>
                                    </template>
                                    <span>Typ: {{obj.obj.get("type")}}</span>
                                </v-tooltip>
                                <v-tooltip  bottom open-delay="1000">
                                    <template v-slot:activator="{ on }">
                                        <div v-on="on">
                                            {{obj.amounts.con}} | {{obj.amounts.things}}
                                        </div>
                                    </template>
                                    <span>Innehåller {{obj.amounts.con}} contianrar och {{obj.amounts.things}} saker</span>
                                </v-tooltip>
                            </v-layout>
                        </template>
                        <div v-else>
                            {{obj.obj.get("amount")}}
                        </div>
                    </v-card-title>
                    <v-card-text width="100%">{{obj.short_desc}}</v-card-text>
                    <v-card-actions style="position: absolute; bottom: 0; right: 0;">
                        <v-menu transition="slide-y-transition" bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn dark icon v-on="on">
                                    <v-icon>more_vert</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-tile avatar @click="$emit('moveObj', obj.obj)">
                                    <v-list-tile-avatar>
                                        <v-icon color="grey">mdi-folder-move</v-icon>
                                    </v-list-tile-avatar>
                                    <v-list-tile-title>Flytta</v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile avatar @click="$emit('openCrForm', {obj: obj.obj, item: toc})">
                                    <v-list-tile-avatar>
                                        <v-icon color="grey">edit</v-icon>
                                    </v-list-tile-avatar>
                                    <v-list-tile-title>Redigera</v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile avatar @click="$emit('dupObj', obj.obj)">
                                    <v-list-tile-avatar>
                                        <v-icon color="grey">mdi-content-duplicate</v-icon>
                                    </v-list-tile-avatar>
                                    <v-list-tile-title>Duplicera</v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile avatar @click="$emit('convObj', obj.obj)">
                                    <v-list-tile-avatar>
                                        <v-icon color="grey">mdi-autorenew</v-icon>
                                    </v-list-tile-avatar>
                                    <v-list-tile-title>Konvertera</v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile avatar @click="$emit('deleteObj', obj.obj)">
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
                <v-layout flex fill-height justify-center align-center>
                    <v-tooltip bottom open-delay="1000">
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" ripple fab dark large color="grey lighten-2"
                                   @click="$emit('openCrForm', {obj: null, item: toc})">
                                <v-icon x-large color="grey darken-1">
                                    {{toc? "mdi-shape-plus": "mdi-briefcase-plus-outline"}}
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>Skapa ny {{toc? "sak": "container"}}</span>
                    </v-tooltip>
                </v-layout>
            </v-flex>
        </div>
        <v-layout v-if="view == 'list'" flex column class="list-view">
            <template v-for="obj in objects">
                <v-tooltip bottom open-delay="1000" :key="obj.obj.id">
                    <template v-slot:activator="{ on }">
                        <v-card
                                v-on="on"
                                :color="obj.isSelected? 'blue' : 'grey lighten-2'"
                                style="margin-bottom: 20px"
                                @dblclick="$emit('openObj', obj)"
                                @click.exact="$emit('selectObj', obj)"
                                @click.ctrl.exact="$emit('ctrlSelectObj', obj)"
                                @click.shift.exact="$emit('shiftSelectObj', obj)"
                                ripple
                                class="noselect"
                        >
                            <v-layout flex row align-center>
                                <v-card-title class="card-title" style="width: 80%; padding-bottom: 0">
                                    <div class="d-headline" style="max-width: 100%">
                                        <p style="overflow: hidden; text-overflow: ellipsis; margin: 0; white-space: nowrap">
                                            {{obj.obj.get("name")}}
                                        </p>
                                    </div>
                                </v-card-title>
                                <template v-if="!toc">
                                    <v-layout flex column style="align-items: flex-end; width: 20%">
                                        <v-tooltip v-if="!toc" bottom open-delay="1000">
                                            <template v-slot:activator="{ on }">
                                                <div v-on="on" style="margin: 16px 16px 0 0; white-space: nowrap"
                                                     class="d-headline font-weight-light">
                                                    <p style="overflow: hidden; text-overflow: ellipsis; margin: 0;">
                                                        {{obj.amounts.con}} | {{obj.amounts.things}}
                                                    </p>
                                                </div>
                                            </template>
                                            <span>Innehåller {{obj.amounts.con}} contianrar och {{obj.amounts.things}} saker</span>
                                        </v-tooltip>
                                        <v-tooltip v-if="obj.obj.get('type')"  bottom open-delay="1000">
                                            <template v-slot:activator="{ on }">
                                                <div v-on="on" style="max-width: 20%; margin-right: 16px">
                                                    <p style="overflow: hidden; text-overflow: ellipsis; margin: 0; white-space: nowrap">
                                                        {{obj.obj.get("type")}}
                                                    </p>
                                                </div>
                                            </template>
                                            <span>Typ: {{obj.obj.get("type")}}</span>
                                        </v-tooltip>
                                    </v-layout>
                                </template>
                                <div v-else style="width: 20%; margin: 16px 16px 0 0; white-space: nowrap"
                                     class="d-headline font-weight-light">
                                    <p style="overflow: hidden; text-overflow: ellipsis; margin: 0; text-align: right">
                                        {{obj.obj.get("amount")}}
                                    </p>
                                </div>

                            </v-layout>

                            <v-layout v-if="toc" flex row align-center style="padding-left: 12px">
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

                            <v-layout flex row>
                                <v-card-text style="padding-top: 12px">{{obj.short_desc}}
                                </v-card-text>

                                <v-card-actions>
                                    <v-menu transition="slide-y-transition" bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn icon v-on="on">
                                                <v-icon>more_vert</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list>
                                            <v-list-tile avatar @click="$emit('moveObj', obj.obj)">
                                                <v-list-tile-avatar>
                                                    <v-icon color="grey">mdi-folder-move</v-icon>
                                                </v-list-tile-avatar>
                                                <v-list-tile-title>Flytta</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile avatar @click="$emit('openCrForm', {obj: obj.obj, item: toc})">
                                                <v-list-tile-avatar>
                                                    <v-icon color="grey">edit</v-icon>
                                                </v-list-tile-avatar>
                                                <v-list-tile-title>Redigera</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile avatar @click="$emit('dupObj', obj.obj)">
                                                <v-list-tile-avatar>
                                                    <v-icon color="grey">mdi-content-duplicate</v-icon>
                                                </v-list-tile-avatar>
                                                <v-list-tile-title>Duplicera</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile avatar @click="$emit('convObj', obj.obj)">
                                                <v-list-tile-avatar>
                                                    <v-icon color="grey">mdi-autorenew</v-icon>
                                                </v-list-tile-avatar>
                                                <v-list-tile-title>Konvertera</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile avatar @click="$emit('deleteObj', obj.obj)">
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
                    </template>
                    <span>{{obj.obj.get("name")}}</span>
                </v-tooltip>
            </template>
            <v-layout row justify-center style="margin-bottom: 20px">
                <v-tooltip bottom open-delay="1000">
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" ripple fab dark large color="grey lighten-2"
                               @click="$emit('openCrForm', {obj: null, item: toc})">
                            <v-icon large color="grey darken-1">{{toc? "mdi-shape-plus":
                                "mdi-briefcase-plus-outline"}}
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>Skapa ny {{toc? "sak": "container"}}</span>
                </v-tooltip>
            </v-layout>
        </v-layout>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Watch, Prop} from "vue-property-decorator";

    @Component({
        // @ts-ignore
        components: {},
        props: {}
    })
    export default class ObjectView extends Vue {
        @Prop() objects!: any[]
        @Prop({default: 'block'}) view!: string
        @Prop() toc!: boolean
    }
</script>

<style scoped lang="scss">
    .list-view {
        padding: 0 30px;
        @media screen and (max-width: 700px) {
            padding: 0 20px;
        }
    }

    .grid-container {
        width: 100%;
        display: grid;
        padding: 0 30px 30px 30px;
        grid-template-columns: repeat(auto-fill, 250px);
        grid-auto-rows: 200px;
        grid-gap: 28px;
        grid-auto-flow: dense;

        @media screen and (max-width: 700px) {
            grid-template-columns: repeat(auto-fill, 130px);
            grid-auto-rows: 100px;
            grid-gap: 14px;
        }

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
                @media screen and (max-width: 700px) {
                    width: 130px;
                }
            }
        }
    }

    .noselect {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
</style>