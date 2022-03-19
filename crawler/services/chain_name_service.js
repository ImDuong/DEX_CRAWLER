const fs = require('fs');

//  a DNS service but for block chain
module.exports = class ChainNameService {
    constructor(source_file) {
        this.source_file = source_file;
        this.processSourceFile();
    }

    processSourceFile() {
        let rawdata = fs.readFileSync(this.source_file);
        this.chain_list = JSON.parse(rawdata)
    }

    chainIDToName(chain_id) {
        for (let c of this.chain_list) {
            if (c.chain_id == chain_id) {
                return c.chain_name;
            }
        }
        return "";
    }

    getWSByChainID(chain_id) {
        for (let c of this.chain_list) {
            if (c.chain_id == chain_id) {
                return c.ws_api;
            }
        }
        return "";
    }

    chainNameToID(chain_name) {
        for (let c of this.chain_list) {
            if (c.chain_name == chain_name) {
                return c.chain_id;
            }
        }
        return "";
    }

}
