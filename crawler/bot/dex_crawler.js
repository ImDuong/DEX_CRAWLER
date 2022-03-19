const axios = require('axios')
const PairReaderService = require('../services/pair_reader_svc.js')
const ChainNameService = require('../services/chain_name_service.js')
const DexInitiatorService = require('../services/dex_initiator_svc.js');

const outputFile = "./crawler/data/out/dex_data2.json"

module.exports = async function DexCrawler() {
    pr = new PairReaderService("./crawler/data/autofarm_token_list.json")
    dexInit = new DexInitiatorService("./crawler/data/dex/autofarm_dex_list.json");
    cns = new ChainNameService("./crawler/data/chain/chain_list.json")

    chainid_list = pr.getChainIDList();

    // test with bsc chain
    // tokenlist_0 = pr.getTokenListByChainID(chainid_list[1])
    // tokenpair_0 = pr.getPairsByTokenList(tokenlist_0);

    for (var chosen_chainid of chainid_list) {
        tokenlist_0 = pr.getTokenListByChainID(chosen_chainid)
        tokenpair_0 = pr.getPairsByTokenList(tokenlist_0);
        for (var pair of tokenpair_0) {
            axios.get('https://dex.autofarm.network/get_quotes', {
                params: {
                    input_amt: 1000000000000000000,
                    input_token: pair.getFirstToken().address,
                    output_token: pair.getSecondToken().address,
                    chain: cns.chainIDToName(chosen_chainid)
                }
            })
                .then(res => {
                    console.log(`statusCode: ${res.status}`)
                    let routeList = res.data.swaps
                    for (let r of routeList) {
                        var pair_objs = Object.keys(r.pair_addresses_obj);
                        for (var p of pair_objs) {
                            dexInit.updateDexRouterAddress(r.pair_addresses_obj[p].dex_router_address, r.pair_addresses_obj[p].dex, chosen_chainid);
                        }
                    }
                    // export dex data
                    dexInit.viewDexDatastore();
                    dexInit.exportDexToFile(outputFile)
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }
}