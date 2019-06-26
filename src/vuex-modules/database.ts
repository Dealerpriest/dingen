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
        async fetchAllLocations(store: any, callback: Function) {
            var promise = new Promise(function (resolve, reject) {
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

            return promise
        },

        async parseContainer(store: any, container: any) {
            return new Promise(async (resolve, reject) =>{
                let amount = 0

                const query = new Parse.Query("Container");
                const thingsQuery = new Parse.Query("Thing");
                query.equalTo("parent", container)
                thingsQuery.equalTo("parent", container);

                const amounts = await Promise.all([query.count(), thingsQuery.count()])
                if (amounts) {
                    amount = amounts.reduce((acc: number, x: number ) => {
                        acc += x; return acc
                    }, 0)
                }

                resolve({obj: container, amounts: amount, short_desc: removeMd(container.get("description"))})
            })
        },

        async parseThing(store: any, thing: any) {
            return new Promise(async (resolve, reject) =>{
                let tags = []
                if (thing.get("tags")) {
                    tags = await thing.get("tags").query().find()
                }
                resolve({obj: thing, tags: tags, short_desc: removeMd(thing.get("description"))});
            })
        }
    },
    getters: {}
}