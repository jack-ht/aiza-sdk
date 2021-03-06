"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aiza = void 0;
const tslib_1 = require("tslib");
const Decimal_1 = require("./Decimal");
const abstract_signer_1 = require("@ethersproject/abstract-signer");
const typechain_1 = require("@htsoft/core-contracts/dist/typechain");
const addresses_1 = require("./addresses");
const utils_1 = require("./utils");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
class Aiza {
    constructor(signerOrProvider, chainId, mediaAddress, marketAddress) {
        if (!mediaAddress != !marketAddress) {
            tiny_invariant_1.default(false, 'Aiza Constructor: mediaAddress and marketAddress must both be non-null or both be null');
        }
        if (abstract_signer_1.Signer.isSigner(signerOrProvider)) {
            this.readOnly = false;
        }
        else {
            this.readOnly = true;
        }
        this.signerOrProvider = signerOrProvider;
        this.chainId = chainId;
        if (mediaAddress && marketAddress) {
            const parsedMediaAddress = utils_1.validateAndParseAddress(mediaAddress);
            const parsedMarketAddress = utils_1.validateAndParseAddress(marketAddress);
            this.mediaAddress = parsedMediaAddress;
            this.marketAddress = parsedMarketAddress;
        }
        else {
            const network = utils_1.chainIdToNetworkName(chainId);
            this.mediaAddress = addresses_1.addresses[network].media;
            this.marketAddress = addresses_1.addresses[network].market;
        }
        this.media = typechain_1.MediaFactory.connect(this.mediaAddress, signerOrProvider);
        this.market = typechain_1.MarketFactory.connect(this.marketAddress, signerOrProvider);
    }
    /*********************
     * Aiza View Methods
     *********************
     */
    /**
     * Fetches the content hash for the specified media on the Aiza Media Contract
     * @param mediaId
     */
    async fetchContentHash(mediaId) {
        return this.media.tokenContentHashes(mediaId);
    }
    /**
     * Fetches the metadata hash for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchMetadataHash(mediaId) {
        return this.media.tokenMetadataHashes(mediaId);
    }
    /**
     * Fetches the content uri for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchContentURI(mediaId) {
        return this.media.tokenURI(mediaId);
    }
    /**
     * Fetches the metadata uri for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchMetadataURI(mediaId) {
        return this.media.tokenMetadataURI(mediaId);
    }
    /**
     * Fetches the creator for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchCreator(mediaId) {
        return this.media.tokenCreators(mediaId);
    }
    /**
     * Fetches the current bid shares for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchCurrentBidShares(mediaId) {
        return this.market.bidSharesForToken(mediaId);
    }
    /**
     * Fetches the current ask for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchCurrentAsk(mediaId) {
        return this.market.currentAskForToken(mediaId);
    }
    /**
     * Fetches the current bid for the specified bidder for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     * @param bidder
     */
    async fetchCurrentBidForBidder(mediaId, bidder) {
        return this.market.bidForTokenBidder(mediaId, bidder);
    }
    /**
     * Fetches the permit nonce on the specified media id for the owner address
     * @param address
     * @param mediaId
     */
    async fetchPermitNonce(address, mediaId) {
        return this.media.permitNonces(address, mediaId);
    }
    /**
     * Fetches the current mintWithSig nonce for the specified address
     * @param address
     * @param mediaId
     */
    async fetchMintWithSigNonce(address) {
        return this.media.mintWithSigNonces(address);
    }
    /*********************
     * Aiza Write Methods
     *********************
     */
    /**
     * Updates the content uri for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     * @param tokenURI
     */
    async updateContentURI(mediaId, tokenURI) {
        try {
            this.ensureNotReadOnly();
            utils_1.validateURI(tokenURI);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.updateTokenURI(mediaId, tokenURI);
    }
    /**
     * Updates the metadata uri for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     * @param metadataURI
     */
    async updateMetadataURI(mediaId, metadataURI) {
        try {
            this.ensureNotReadOnly();
            utils_1.validateURI(metadataURI);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.updateTokenMetadataURI(mediaId, metadataURI);
    }
    /**
     * Mints a new piece of media on an instance of the Aiza Media Contract
     * @param mintData
     * @param bidShares
     */
    async mint(mediaData, bidShares) {
        try {
            this.ensureNotReadOnly();
            utils_1.validateURI(mediaData.metadataURI);
            utils_1.validateURI(mediaData.tokenURI);
            utils_1.validateBidShares(bidShares.creator, bidShares.owner, bidShares.prevOwner);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        const gasEstimate = await this.media.estimateGas.mint(mediaData, bidShares);
        const paddedEstimate = gasEstimate.mul(110).div(100);
        return this.media.mint(mediaData, bidShares, { gasLimit: paddedEstimate.toString() });
    }
    /**
     * Mints a new piece of media on an instance of the Aiza Media Contract
     * @param creator
     * @param mediaData
     * @param bidShares
     * @param sig
     */
    async mintWithSig(creator, mediaData, bidShares, sig) {
        try {
            this.ensureNotReadOnly();
            utils_1.validateURI(mediaData.metadataURI);
            utils_1.validateURI(mediaData.tokenURI);
            utils_1.validateBidShares(bidShares.creator, bidShares.owner, bidShares.prevOwner);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.mintWithSig(creator, mediaData, bidShares, sig);
    }
    /**
     * Sets an ask on the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     * @param ask
     */
    async setAsk(mediaId, ask) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.setAsk(mediaId, ask);
    }
    /**
     * Sets a bid on the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     * @param bid
     */
    async setBid(mediaId, bid) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.setBid(mediaId, bid);
    }
    /**
     * Removes the ask on the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async removeAsk(mediaId) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.removeAsk(mediaId);
    }
    /**
     * Removes the bid for the msg.sender on the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async removeBid(mediaId) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.removeBid(mediaId);
    }
    /**
     * Accepts the specified bid on the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     * @param bid
     */
    async acceptBid(mediaId, bid) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.acceptBid(mediaId, bid);
    }
    /**
     * Grants the spender approval for the specified media using meta transactions as outlined in EIP-712
     * @param sender
     * @param mediaId
     * @param sig
     */
    async permit(spender, mediaId, sig) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.permit(spender, mediaId, sig);
    }
    /**
     * Revokes the approval of an approved account for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async revokeApproval(mediaId) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.revokeApproval(mediaId);
    }
    /**
     * Burns the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async burn(mediaId) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.burn(mediaId);
    }
    /***********************
     * ERC-721 View Methods
     ***********************
     */
    /**
     * Fetches the total balance of media owned by the specified owner on an instance of the Aiza Media Contract
     * @param owner
     */
    async fetchBalanceOf(owner) {
        return this.media.balanceOf(owner);
    }
    /**
     * Fetches the owner of the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchOwnerOf(mediaId) {
        return this.media.ownerOf(mediaId);
    }
    /**
     * Fetches the mediaId of the specified owner by index on an instance of the Aiza Media Contract
     * @param owner
     * @param index
     */
    async fetchMediaOfOwnerByIndex(owner, index) {
        return this.media.tokenOfOwnerByIndex(owner, index);
    }
    /**
     * Fetches the total amount of non-burned media that has been minted on an instance of the Aiza Media Contract
     */
    async fetchTotalMedia() {
        return this.media.totalSupply();
    }
    /**
     * Fetches the mediaId by index on an instance of the Aiza Media Contract
     * @param index
     */
    async fetchMediaByIndex(index) {
        return this.media.tokenByIndex(index);
    }
    /**
     * Fetches the approved account for the specified media on an instance of the Aiza Media Contract
     * @param mediaId
     */
    async fetchApproved(mediaId) {
        return this.media.getApproved(mediaId);
    }
    /**
     * Fetches if the specified operator is approved for all media owned by the specified owner on an instance of the Aiza Media Contract
     * @param owner
     * @param operator
     */
    async fetchIsApprovedForAll(owner, operator) {
        return this.media.isApprovedForAll(owner, operator);
    }
    /***********************
     * ERC-721 Write Methods
     ***********************
     */
    /**
     * Grants approval to the specified address for the specified media on an instance of the Aiza Media Contract
     * @param to
     * @param mediaId
     */
    async approve(to, mediaId) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.approve(to, mediaId);
    }
    /**
     * Grants approval for all media owner by msg.sender on an instance of the Aiza Media Contract
     * @param operator
     * @param approved
     */
    async setApprovalForAll(operator, approved) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.setApprovalForAll(operator, approved);
    }
    /**
     * Transfers the specified media to the specified to address on an instance of the Aiza Media Contract
     * @param from
     * @param to
     * @param mediaId
     */
    async transferFrom(from, to, mediaId) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.transferFrom(from, to, mediaId);
    }
    /**
     * Executes a SafeTransfer of the specified media to the specified address if and only if it adheres to the ERC721-Receiver Interface
     * @param from
     * @param to
     * @param mediaId
     */
    async safeTransferFrom(from, to, mediaId) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.media.safeTransferFrom(from, to, mediaId);
    }
    /****************
     * Miscellaneous
     * **************
     */
    /**
     * Returns the EIP-712 Domain for an instance of the Aiza Media Contract
     */
    eip712Domain() {
        // Due to a bug in ganache-core, set the chainId to 1 if its a local blockchain
        // https://github.com/trufflesuite/ganache-core/issues/515
        const chainId = this.chainId == 50 ? 1 : this.chainId;
        return {
            name: 'Aiza',
            version: '1',
            chainId: chainId,
            verifyingContract: this.mediaAddress,
        };
    }
    /**
     * Checks to see if a Bid's amount is evenly splittable given the media's current bidShares
     *
     * @param mediaId
     * @param bid
     */
    async isValidBid(mediaId, bid) {
        const isAmountValid = await this.market.isValidBid(mediaId, bid.amount);
        const decimal100 = Decimal_1.Decimal.new(100);
        const currentBidShares = await this.fetchCurrentBidShares(mediaId);
        const isSellOnShareValid = bid.sellOnShare.value.lte(decimal100.value.sub(currentBidShares.creator.value));
        return isAmountValid && isSellOnShareValid;
    }
    /**
     * Checks to see if an Ask's amount is evenly splittable given the media's current bidShares
     *
     * @param mediaId
     * @param ask
     */
    isValidAsk(mediaId, ask) {
        return this.market.isValidBid(mediaId, ask.amount);
    }
    /**
     * Checks to see if a piece of media has verified uris that hash to their immutable hashes
     *
     * @param mediaId
     * @param timeout
     */
    async isVerifiedMedia(mediaId, timeout = 10) {
        try {
            const [tokenURI, metadataURI, contentHash, metadataHash] = await Promise.all([
                this.fetchContentURI(mediaId),
                this.fetchMetadataURI(mediaId),
                this.fetchContentHash(mediaId),
                this.fetchMetadataHash(mediaId),
            ]);
            const mediaData = utils_1.constructMediaData(tokenURI, metadataURI, contentHash, metadataHash);
            return utils_1.isMediaDataVerified(mediaData, timeout);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
    }
    /******************
     * Private Methods
     ******************
     */
    /**
     * Throws an error if called on a readOnly == true instance of Aiza Sdk
     * @private
     */
    ensureNotReadOnly() {
        if (this.readOnly) {
            throw new Error('ensureNotReadOnly: readOnly Aiza instance cannot call contract methods that require a signer.');
        }
    }
}
exports.Aiza = Aiza;
//# sourceMappingURL=aiza.js.map