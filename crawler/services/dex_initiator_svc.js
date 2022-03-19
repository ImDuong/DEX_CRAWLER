const fs = require('fs');

const Dex = require('../models/dex.js');

module.exports = class DexInitiatorService {
    constructor(source_file) {
        this.source_file = source_file;
        this.#processSourceFile();
    }   

    #processSourceFile() {
        let rawdata = fs.readFileSync(this.source_file);
        this.dex_name_list = JSON.parse(rawdata)

        this.dex_datastore = [];
        // initiate dex instance
        for (let dex of this.dex_name_list) {
            this.dex_datastore.push(new Dex({
                "name": dex.name,
                "records": dex.records
            }))
        }
    }

    viewDexDatastore() {
        console.log(this.dex_datastore);
    }

    getDexNameListByChain(chain_id) {
        var dex_name_list = [];
        for (var dex of this.dex_datastore) {
            if (dex.isReadyToInteract(chain_id)) {
                dex_name_list.push(dex.name)
            }
        }
        return dex_name_list;
    }

    getDexByName(dex_name) {
        for (var dex of this.dex_datastore) {
            if (dex.name == dex_name) {
                return dex
            }
        }
        return undefined;
    }

    getDexFactory(dex_name, chain_id) {
        for (var dex of this.dex_datastore) {
            if (dex.name == dex_name) {
                return dex.getFactory(chain_id)
            }
        }
    }

    updateDexRouterAddress(router_address, dex_name, chain_id) {
        var found = false;
        for (var dex of this.dex_datastore) {
            if (dex.name == dex_name) {
                dex.updateRouterAddressByChainID(router_address, chain_id);
                found = true;
            }
        }
        if (!found) {
            var new_dex = new Dex({
                "name": dex_name
            })
            new_dex.updateRouterAddressByChainID(router_address, chain_id);
            this.dex_datastore.push(new_dex)
        }
    }

    updateDexPair(pair, dex_name, chain_id) {
        var found = false;
        for (var dex of this.dex_datastore) {
            if (dex.name == dex_name) {
                dex.updatePairByChainID(pair, chain_id);
                found = true;
            }
        }
        // this case may never happen because only dex having factory address for a specific chain will call this statement
        if (!found) {
            var new_dex = new Dex({
                "name": dex_name
            })
            new_dex.updatePairByChainID(pair, chain_id);
            this.dex_datastore.push(new_dex)
        }
    }

    exportDexToFile(destination_file) {
        let data = JSON.stringify(this.dex_datastore);
        fs.writeFileSync(destination_file, data);
        console.log("Saving data ...");
    }
}