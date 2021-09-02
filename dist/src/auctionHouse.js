"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionHouse = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const typechain_1 = require("@htsoft/auction-contracts/dist/typechain");
const _4_json_1 = tslib_1.__importDefault(require("@htsoft/auction-contracts/dist/addresses/4.json"));
const _4_json_2 = tslib_1.__importDefault(require("@htsoft/auction-contracts/dist/addresses/4.json"));
const addresses_1 = require("./addresses");
const utils_1 = require("./utils");
class AuctionHouse {
    constructor(signerOrProvider, chainId) {
        this.chainId = chainId;
        this.readOnly = !ethers_1.Signer.isSigner(signerOrProvider);
        this.signerOrProvider = signerOrProvider;
        const address = chainId === 1
            ? // @ts-ignore
                _4_json_2.default.auctionHouse
            : _4_json_1.default.auctionHouse;
        this.auctionHouse = typechain_1.AuctionHouse__factory.connect(address, signerOrProvider);
        const network = utils_1.chainIdToNetworkName(chainId);
        this.aizaAddress = addresses_1.addresses[network].media;
    }
    async fetchAuction(auctionId) {
        return this.auctionHouse.auctions(auctionId);
    }
    async fetchAuctionFromTransactionReceipt(receipt) {
        for (const log of receipt.logs) {
            const description = this.auctionHouse.interface.parseLog(log);
            if (description.args.auctionId && log.address === this.auctionHouse.address) {
                return this.fetchAuction(description.args.auctionId);
            }
        }
        return null;
    }
    async createAuction(tokenId, duration, reservePrice, curator, curatorFeePercentages, auctionCurrency, tokenAddress = this.aizaAddress) {
        return this.auctionHouse.createAuction(tokenId, tokenAddress, duration, reservePrice, curator, curatorFeePercentages, auctionCurrency);
    }
    async setAuctionApproval(auctionId, approved) {
        return this.auctionHouse.setAuctionApproval(auctionId, approved);
    }
    async setAuctionReservePrice(auctionId, reservePrice) {
        return this.auctionHouse.setAuctionReservePrice(auctionId, reservePrice);
    }
    async createBid(auctionId, amount) {
        const { auctionCurrency } = await this.auctionHouse.auctions(auctionId);
        // If ETH auction, include the ETH in this transaction
        if (auctionCurrency === ethers_1.ethers.constants.AddressZero) {
            return this.auctionHouse.createBid(auctionId, amount, { value: amount });
        }
        else {
            return this.auctionHouse.createBid(auctionId, amount);
        }
    }
    async endAuction(auctionId) {
        return this.auctionHouse.endAuction(auctionId);
    }
    async cancelAuction(auctionId) {
        return this.auctionHouse.cancelAuction(auctionId);
    }
}
exports.AuctionHouse = AuctionHouse;
//# sourceMappingURL=auctionHouse.js.map