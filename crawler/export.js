const DexWriterService = require('./services/dex_writer_svc.js');

const outputFile = "./crawler/data/out/dex_data.csv"

let dw = new DexWriterService("./crawler/data/out/dex_data.json")
dw.exportData(outputFile)