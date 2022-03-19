const fastcsv = require("fast-csv");
const fs = require("fs");
const ChainNameService = require('./chain_name_service.js')
cns = new ChainNameService("./crawler/data/chain/chain_list.json")

module.exports = class DexWriterService {
    constructor(source_file) {
        this.source_file = source_file
        this.#processSourceFile()

    }

    #processSourceFile() {
        let rawdata = fs.readFileSync(this.source_file);
        this.dex_list = JSON.parse(rawdata)

        this.dex_processed_list = []
        for (var dex of this.dex_list) {
            for (var record of dex.records) {
                if (record.pairs == undefined) continue;
                for (var pair of record.pairs) {
                    this.dex_processed_list.push(
                        {
                            "Dex Name": dex.name,
                            "Router Address": record.router_address,
                            "Factory Address": record.factory_address,
                            "Chain Name": cns.chainIDToName(record.chain_id),
                            "Chain ID": record.chain_id,
                            "Pair Name": pair.pair_name,
                            "Token0 Address": pair.token_1,
                            "Token1 Address": pair.token_2,
                            "Pair Address": pair.pair_address 
                        }
                    )
                }
            }
        }
    }

    exportData(destination_file) {
        console.log(this.dex_processed_list);
        const ws = fs.createWriteStream(destination_file);
        fastcsv
            .write(this.dex_processed_list, { headers: true })
            .on("finish", function () {
                console.log("Write to ", destination_file, " successfully!");
            })
            .pipe(ws);
    }

}