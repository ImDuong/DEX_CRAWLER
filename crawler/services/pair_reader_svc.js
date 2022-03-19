const fs = require('fs');
const Pair= require('../models/pair.js')

module.exports = class PairReaderService {
    constructor(source_file) {
        this.source_file = source_file
        this.processSourceFile()

        // define pair generation strategy
        this.gen_pairs_util = (arr) => arr.map( (v, i) => arr.slice(i + 1).map(w => [v, w]) ).flat();
    }

    processSourceFile() {
        let rawdata = fs.readFileSync(this.source_file);
        this.source_data = JSON.parse(rawdata)
        this.tokens = this.source_data.tokens
        
        // we group tokens by chains
        this.chainsMap = [];
        for (let tok of this.tokens) {
            if (!(tok.chainId in this.chainsMap)) {
                this.chainsMap[tok.chainId] = [];
            }
            this.chainsMap[tok.chainId].push(tok)
        }
        // const keys = Object.keys(this.chainsMap)
        // for (let k of keys) {
        //     console.log(k, " - ", this.chainsMap[k].length);
        // }
    }

    getChainIDList() {
        return Object.keys(this.chainsMap)
    }

    getTokenListByChainID(chain_id) {
        return this.chainsMap[chain_id]
    }

    getPairsByTokenList(token_list) {
        var gen_pairs = this.gen_pairs_util(token_list)
        var result_pairs = []
        for (let p of gen_pairs) {
            result_pairs.push(
                new Pair(p)
            )
        }
        return result_pairs
    }

}
