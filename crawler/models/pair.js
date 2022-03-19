module.exports = class Pair {
    constructor([tokenA, tokenB]) {
        this.tokenA = tokenA
        this.tokenB = tokenB
        this.pair_name = tokenA.symbol + "_" + tokenB.symbol
        this.pair_address = ""
    }

    setPairAddress(pair_address) {
        this.pair_address = pair_address;
    }

    getFirstToken() {
        return this.tokenA
    }

    getSecondToken() {
        return this.tokenB
    }

    getPairAddress() {
        return this.pair_address
    }

    getPairName() {
        return this.pair_name
    }

    // compare with other pair
    isEqual(pair) {
        if (this.pair_address != undefined && this.pair_address == pair.getPairAddress()) return true;
        return ((this.tokenA.address.toLowerCase() == pair.getFirstToken().address.toLowerCase() && this.tokenB.address.toLowerCase() == pair.getSecondToken().address.toLowerCase()) 
        || (this.tokenA.address.toLowerCase() == pair.getSecondToken().address.toLowerCase() && this.tokenB.address.toLowerCase() == pair.getFirstToken().address.toLowerCase()))
    }

    // compare with pair of addresses
    isEqualV2(addressA, addressB) {
        return ((this.tokenA.address.toLowerCase() == addressA.toLowerCase() && this.tokenB.address.toLowerCase() == addressB.toLowerCase()) 
        || (this.tokenA .address.toLowerCase()== addressB.toLowerCase() && this.tokenB.address.toLowerCase() == addressA.toLowerCase()))
    }
}