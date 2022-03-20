const ethers = require("ethers")
const PairReaderService = require('../services/pair_reader_svc.js')
const ChainNameService = require('../services/chain_name_service.js')
const DexInitiatorService = require('../services/dex_initiator_svc.js');

const outputFile = "./crawler/data/out/dex_data.json"

module.exports = async function PairCrawler(isContinueFromLastCheckpoint) {

    pr = new PairReaderService("./crawler/data/autofarm_token_list.json")
    dexInit = new DexInitiatorService("./crawler/data/dex/autofarm_dex_list.json");
    cns = new ChainNameService("./crawler/data/chain/chain_list.json")

    chainid_list = pr.getChainIDList();
    // // test with bsc chain
    // chosen_chainid = chainid_list[1]
    // tokenlist_0 = pr.getTokenListByChainID(chosen_chainid)
    // tokenpair_0 = pr.getPairsByTokenList(tokenlist_0);
    for (var chosen_chainid of chainid_list) {
        ws_network = cns.getWSByChainID(chosen_chainid)
        if (ws_network == undefined) {
            // todo connect to the moralis-unsupported chain in the near future
            console.log("No speedynode api for chain ", chosen_chainid);
            continue
        }

        tokenlist_0 = pr.getTokenListByChainID(chosen_chainid)
        tokenpair_0 = pr.getPairsByTokenList(tokenlist_0);

        var WSProvider = new ethers.providers.WebSocketProvider(ws_network)

        var dex_name_list = dexInit.getDexNameListByChain(chosen_chainid);
        // short test for pancakeswap in chain bsc
        // tokenpair_0 = [new Pair([{
        //     "name": "8PAY Network",
        //     "symbol": "8PAY",
        //     "address": "0xFeea0bDd3D07eb6FE305938878C0caDBFa169042",
        //     "chainId": 56,
        //     "decimals": 18,
        //     "logoURI": "https://tokens.autofarm.network/56-0xfeea0bdd3d07eb6fe305938878c0cadbfa169042.webp"
        // }, {
        //     "name": "CanYaCoin",
        //     "symbol": "CAN",
        //     "address": "0x007EA5C0Ea75a8DF45D288a4debdD5bb633F9e56",
        //     "chainId": 56,
        //     "decimals": 18,
        //     "logoURI": "https://tokens.autofarm.network/56-0x007ea5c0ea75a8df45d288a4debdd5bb633f9e56.webp"
        // }])]
        console.log("List of crawling dex for chain ", chosen_chainid, ": ", dex_name_list);
        // async function crawl() {
            for (var dex_name of dex_name_list) {
                console.log("Chain", chosen_chainid, ": crawling pairs for", dex_name);
                // import abi
                const DEX_ABI = require('../../abi/factory/' + dex_name.toLowerCase() + "_" + chosen_chainid + "_abi.json")
    
                // create contract for dex
                dex_contract = new ethers.Contract(dexInit.getDexFactory(dex_name, chosen_chainid), DEX_ABI, WSProvider)
    
                var dex_instance = dexInit.getDexByName(dex_name);
                var executed_tokenpair = tokenpair_0;
                console.log("Chain", chosen_chainid, ": crawling pairs for", dex_name, " - original length: ", executed_tokenpair.length);
                if (isContinueFromLastCheckpoint) {
                    var last_pair_info = dex_instance.getLastPairInfoByChain(chosen_chainid);
                    if (last_pair_info != undefined) {
                        var last_pair;
                        var last_idx = -1;
                        for (var idx = 0; idx <= tokenpair_0.length; idx++) {
                            if (tokenpair_0[idx].isEqualV2(last_pair_info.token_1, last_pair_info.token_2)) {
                                last_pair = tokenpair_0[idx];
                                last_idx = idx;
                                break;
                            }
                        }
                        if (last_idx != -1) {
                            console.log("Chain", chosen_chainid, ": crawling pairs for", dex_name, "Continue from the last saved pair: ", last_pair_info);
                            executed_tokenpair = tokenpair_0.slice(last_idx + 1);
                        } else {
                            console.log("Chain", chosen_chainid, ": crawling pairs for", dex_name, "Cannot find last saved pair in token list");
                        }
                    } else {
                        console.log("Chain", chosen_chainid, ": crawling pairs for", dex_name, "Cannot find last saved pair");
                    }
    
                }
    
                // crawl pair
                console.log("Chain", chosen_chainid, ": crawling pairs for", dex_name, " - crawling length: ", executed_tokenpair.length);
                var  cnt = 0;
                for (var pair of executed_tokenpair) {
                    cnt++;
                    let addr = await dex_contract.getPair(
                        pair.getFirstToken().address,
                        pair.getSecondToken().address);
                    num = parseInt(addr, 16);
                    if (num == 0) {
                        dex_instance.updateLastSavedPairByChainID(pair, chosen_chainid);
                        // export data after 50 tries
                        if (cnt >= 50) {
                            dexInit.exportDexToFile(outputFile)
                            console.log("Chain", chosen_chainid, ": crawling pairs for", dex_name, "Last saved: ", pair.getPairName());
                            // refresh counter
                            cnt = 0;
                        }
                        continue;
                    }
                    pair.setPairAddress(addr)
                    console.log("Found a pair (" + pair.getFirstToken().address, ", ", pair.getSecondToken().address, ") (" + pair.getPairName() + "): ", pair.getPairAddress());
                    // dexInit.updateDexPair(pair, dex_name, chosen_chainid)
                    dex_instance.updatePairByChainID(pair, chosen_chainid)
                    dexInit.exportDexToFile(outputFile)
                }
                console.log("Chain ", chosen_chainid, ": done crawling pair for ", dex_name);
            }
            // await new Promise(crawl => {
            //     setImmediate(crawl);
            // });
        // }

        dexInit.exportDexToFile(outputFile)
    }
    dexInit.exportDexToFile(outputFile)
}
