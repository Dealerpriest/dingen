import Parse from "parse"

export default {
    state: {
        locations: []
    },
    mutations: {
        setLocations(state: any, loc: any) {
            state.locations = loc
        }
    },
    actions: {
        async fetchAllLocations(store: any, callback: Function) {
            var promise = new Promise(function (resolve, reject) {
                if (store.state.locations.length <= 0) {
                    const query = new Parse.Query("Location");
                    query.find().then((results: any[]) => {
                        store.commit("setLocations", results)
                        resolve(results)
                    }, (error) => {
                        reject(error)
                    });
                } else {
                    resolve(store.state.locations)
                }
            });

            return promise
        }
    },
    getters: {}
}