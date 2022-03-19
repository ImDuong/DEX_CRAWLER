
module.exports = class Dex {
    constructor(data) {
        this.name = data.name;
        if (data.records == undefined) {
            this.records = []
        } else {
            this.records = data.records;
        }
    }

    getFactory(chain_id) {
        if (this.records.length == 0) return "";
        for (var record of this.records) {
            if (record.chain_id == undefined) return "";
            if (record.chain_id == chain_id) {
                return record.factory_address
            }
        }
    }

    getLastPairInfoByChain(chain_id) {
        if (this.records.length == 0) return undefined;
        for (var record of this.records) {
            if (record.chain_id == undefined) return undefined;
            if (record.chain_id == chain_id) {
                return record.last_pair
            }
        }
        return undefined;
    }

    isReadyToInteract(chain_id) {
        if (this.records.length == 0) return false;
        for (var record of this.records) {
            if (record.chain_id == undefined) return false;
            if (record.chain_id == chain_id) {
                if (record.factory_address == undefined) continue;
                if (record.factory_address.length > 0) return true;
            }
        }
        return false;
    }

    isPairExisted(pair, pair_list) {
        if (pair_list == undefined) return false;
        if (pair_list.length == 0) return false;
        for (var p of pair_list) {
            if (pair.isEqualV2(p.token_1, p.token_2)) return true;
        }
        return false;
    }

    updateRouterAddressByChainID(router_address, chain_id) {
        var found = false;
        for (var i = 0; i < this.records.length; i++) {
            if (this.records[i].chain_id == chain_id) {
                this.records[i].router_address = router_address;
                found = true;
            }
        }
        if (!found) {
            this.records.push(
                {
                    "chain_id": chain_id,
                    "router_address": router_address
                }
            )
        }
    }

    updatePairByChainID(pair, chain_id) {
        var found = false;
        var new_pair = {
            "token_1": pair.getFirstToken().address,
            "token_2": pair.getSecondToken().address,
            "pair_address": pair.getPairAddress(),
            "pair_name": pair.getPairName(),
        }
        for (var i = 0; i < this.records.length; i++) {
            if (this.records[i].chain_id == chain_id) {
                if (this.records[i].pairs == undefined) this.records[i].pairs = []
                if (!this.isPairExisted(pair, this.records[i].pairs)) {
                    this.records[i].pairs.push(new_pair)
                    this.records[i].last_pair = new_pair
                }
                found = true;
            }
        }
        // this case may never happen because only dex having factory address for a specific chain will call this statement
        if (!found) {
            this.records.push(
                {
                    "chain_id": chain_id,
                    "pairs": [
                        new_pair
                    ],
                    "last_pair": new_pair
                }
            )

        }
    }

    updateLastSavedPairByChainID(pair, chain_id) {
        for (var i = 0; i < this.records.length; i++) {
            if (this.records[i].chain_id == chain_id) {
                this.records[i].last_pair = {
                    "token_1": pair.getFirstToken().address,
                    "token_2": pair.getSecondToken().address,
                    "pair_name": pair.getPairName(),
                }
                if (pair.getPairAddress() != undefined && pair.getPairAddress().length > 0) {
                    this.records[i].last_pair.pair_name = pair.getPairName();
                    this.records[i].last_pair.pair_address = pair.getPairAddress();
                }
            }
        }
    }
}