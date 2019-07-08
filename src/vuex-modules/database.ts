import Parse from "parse"
import removeMd from "remove-markdown"

export default {
    state: {
        locations: []
    },
    mutations: {
        setContainers(state: any, loc: any) {
            state.locations = loc
        }
    },
    actions: {
        fetchAllLocations(store: any, callback: Function) {
            return new Promise(function (resolve, reject) {
                if (store.state.locations.length <= 0) {
                    const query = new Parse.Query("Container");
                    query.find().then((results: any[]) => {
                        store.commit("setContainers", results)
                        resolve(results)
                    }, (error) => {
                        reject(error)
                    });
                } else {
                    resolve(store.state.locations)
                }
            });
        },

        parseContainer(store: any, container: any) {
            return new Promise(async (resolve, reject) =>{
                let amount = {con: 0, things: 0}

                const query = new Parse.Query("Container");
                const thingsQuery = new Parse.Query("Thing");
                query.equalTo("parent", container)
                thingsQuery.equalTo("parent", container);

                const [conAmount, thingAmount] = await Promise.all([query.count(), thingsQuery.count()])
                if (conAmount || thingAmount) {
                    amount = {con: conAmount, things: thingAmount}
                }

                resolve({obj: container, amounts: amount, short_desc: removeMd(container.get("description")), isSelected: false})
            })
        },

        parseThing(store: any, thing: any) {
            return new Promise(async (resolve, reject) =>{
                let tags = []
                if (thing.get("tags")) {
                    tags = await thing.get("tags").query().find()
                }
                resolve({obj: thing, tags: tags, short_desc: removeMd(thing.get("description")), isSelected: false});
            })
        },

        duplicateObject(store: any, obj: any) {
            return new Promise(async (resolve, reject) => {
                if (obj) {
                    const ParseObject = Parse.Object.extend(obj.className);
                    const clone = new ParseObject();
                    clone.set("name", obj.get("name"));
                    clone.set("description", obj.get("description"));
                    clone.set("parent", obj.get("parent"))

                    if (clone.className == "Thing") {
                        clone.set("amount", obj.get("amount"));
                        let tagRelation = clone.relation("tags");
                        const relationQuery = tagRelation.query();
                        let result = await relationQuery.find();
                        if (result && result.length > 0) {
                            tagRelation.add(result);
                        }
                    } else if (clone.className == "Container") {
                        clone.set("type", obj.get("type"));
                    }

                    let result = await clone.save()
                    if (result) {
                        resolve(result)
                    } else {
                        reject(result)
                    }
                } else {
                    reject("Objekt inte definerat!")
                }
            })
        },

        deleteObject(store: any, obj: any) {
            return new Promise(async (resolve, reject) => {
                if (obj) {
                    if (obj.className == "Container") {
                        const conQuery = new Parse.Query("Container");
                        conQuery.equalTo("parent", obj);
                        const thingQuery = new Parse.Query("Thing");
                        thingQuery.equalTo("parent", obj);
                        let children: any[] = [...(await conQuery.find()), ...(await thingQuery.find())];

                        let childrenSaved: number = 0;

                        if (children.length > 0) {
                            for (let child of children) {
                                child.set("parent", obj.get("parent"));
                                let result = await child.save();
                                if (result) {
                                    childrenSaved++;
                                }
                            }
                        }

                        if (childrenSaved == children.length) {
                            let result = obj.destroy();
                            if (result) {
                                resolve(result)
                            } else {
                                reject("Fel uppstod när objectet skulle sparas.")
                            }
                        } else {
                            reject("Fel uppstod när underobject skulle flyttas upp.")
                        }
                    } else if (obj.className == "Thing") {
                        let result = obj.destroy();
                        if (result) {
                            resolve(result)
                        } else {
                            console.error("Error while deleting Thing", result);
                            reject("Fel när saken skulle tas bort (Parse)")
                        }
                    }
                } else {
                    reject("Objekt inte definerat!")
                }
            })
        },
        convertObject(store: any, obj: any) {
            return new Promise(async (resolve, reject) => {
                if (obj) {
                    let convertedClassName: string;

                    if (obj.className == "Thing") {
                        convertedClassName = "Container"
                    } else {
                        convertedClassName = "Thing"
                    }
                    const ParseObject = Parse.Object.extend(convertedClassName);
                    const newObject = new ParseObject()

                    newObject.set("name", obj.get("name"));
                    newObject.set("description", obj.get("description"));
                    newObject.set("parent", obj.get("parent"))

                    let result = await newObject.save()
                    if (result) {
                        let delResult = await store.dispatch("deleteObject", obj)
                        if (delResult) {
                            resolve(result)
                        } else {
                            reject(delResult)
                        }
                    } else {
                        reject(result)
                    }
                }else {
                    reject("Objekt inte definerat!")
                }
            })
        },

        moveObject(store: any, {obj, selectedContainer}: {obj: any, selectedContainer: any})  {
            return new Promise(async (resolve, reject) => {
                if (obj) {
                    if (selectedContainer && obj.id == selectedContainer) {
                        reject("Du kan inte flytta en container till sig själv!")
                    } else {
                        let parent = selectedContainer;
                        let parents = [];
                        while (parent != null && parent != undefined) {
                            parents.push(parent);
                            parent = parent.get("parent");
                        }

                        if (parents.find(x => x.id == obj.id)) {
                            reject("Du kan inte flytta en container till en under-container.")
                        } else {
                            obj.set("parent", selectedContainer);
                            let result = await obj.save()
                            if (result) {
                                resolve(result)
                            } else {
                                console.error(result)
                                reject(result)
                            }
                        }
                    }
                } else {
                    reject("Objekt inte definerat!")
                }
            })

        }
    },
    getters: {}
}