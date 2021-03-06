"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapWETH = exports.wrapETH = exports.isMediaDataVerified = exports.isURIHashVerified = exports.approveERC20 = exports.signMintWithSigMessage = exports.recoverSignatureFromMintWithSig = exports.recoverSignatureFromPermit = exports.signPermitMessage = exports.stripHexPrefix = exports.sha256FromHexString = exports.sha256FromBuffer = exports.chainIdToNetworkName = exports.validateAndParseAddress = exports.validateURI = exports.validateBytes32 = exports.constructBid = exports.constructAsk = exports.validateBidShares = exports.constructBidShares = exports.constructMediaData = exports.WETH_RINKEBY = exports.WETH_MAINNET = void 0;
const tslib_1 = require("tslib");
const address_1 = require("@ethersproject/address");
const tiny_warning_1 = tslib_1.__importDefault(require("tiny-warning"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const sjcl_1 = tslib_1.__importDefault(require("sjcl"));
const Decimal_1 = require("./Decimal");
const ethers_1 = require("ethers");
const bytes_1 = require("@ethersproject/bytes");
const eth_sig_util_1 = require("eth-sig-util");
const ethereumjs_util_1 = require("ethereumjs-util");
const typechain_1 = require("@htsoft/core-contracts/dist/typechain");
const axios_1 = tslib_1.__importDefault(require("axios"));
// // https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
exports.WETH_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
// // https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab
exports.WETH_RINKEBY = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
/********************
 * Type Constructors
 ********************
 */
/**
 * Constructs a MediaData type.
 *
 * @param tokenURI
 * @param metadataURI
 * @param contentHash
 * @param metadataHash
 */
function constructMediaData(tokenURI, metadataURI, contentHash, metadataHash) {
    // validate the hash to ensure it fits in bytes32
    validateBytes32(contentHash);
    validateBytes32(metadataHash);
    validateURI(tokenURI);
    validateURI(metadataURI);
    return {
        tokenURI: tokenURI,
        metadataURI: metadataURI,
        contentHash: contentHash,
        metadataHash: metadataHash,
    };
}
exports.constructMediaData = constructMediaData;
/**
 * Constructs a BidShares type.
 * Throws an error if the BidShares do not sum to 100 with 18 trailing decimals.
 *
 * @param creator
 * @param owner
 * @param prevOwner
 */
function constructBidShares(creator, owner, prevOwner) {
    const decimalCreator = Decimal_1.Decimal.new(parseFloat(creator.toFixed(4)));
    const decimalOwner = Decimal_1.Decimal.new(parseFloat(owner.toFixed(4)));
    const decimalPrevOwner = Decimal_1.Decimal.new(parseFloat(prevOwner.toFixed(4)));
    validateBidShares(decimalCreator, decimalOwner, decimalPrevOwner);
    return {
        creator: decimalCreator,
        owner: decimalOwner,
        prevOwner: decimalPrevOwner,
    };
}
exports.constructBidShares = constructBidShares;
/**
 * Validates that BidShares sum to 100
 *
 * @param creator
 * @param owner
 * @param prevOwner
 */
function validateBidShares(creator, owner, prevOwner) {
    const decimal100 = Decimal_1.Decimal.new(100);
    const sum = creator.value.add(owner.value).add(prevOwner.value);
    if (sum.toString() != decimal100.value.toString()) {
        tiny_invariant_1.default(false, `The BidShares sum to ${sum.toString()}, but they must sum to ${decimal100.value.toString()}`);
    }
}
exports.validateBidShares = validateBidShares;
/**
 * Constructs an Ask.
 *
 * @param currency
 * @param amount
 */
function constructAsk(currency, amount) {
    const parsedCurrency = validateAndParseAddress(currency);
    return {
        currency: parsedCurrency,
        amount: amount,
    };
}
exports.constructAsk = constructAsk;
/**
 * Constructs a Bid.
 *
 * @param currency
 * @param amount
 * @param bidder
 * @param recipient
 * @param sellOnShare
 */
function constructBid(currency, amount, bidder, recipient, sellOnShare) {
    let parsedCurrency;
    let parsedBidder;
    let parsedRecipient;
    try {
        parsedCurrency = validateAndParseAddress(currency);
    }
    catch (err) {
        throw new Error(`Currency address is invalid: ${err.message}`);
    }
    try {
        parsedBidder = validateAndParseAddress(bidder);
    }
    catch (err) {
        throw new Error(`Bidder address is invalid: ${err.message}`);
    }
    try {
        parsedRecipient = validateAndParseAddress(recipient);
    }
    catch (err) {
        throw new Error(`Recipient address is invalid: ${err.message}`);
    }
    const decimalSellOnShare = Decimal_1.Decimal.new(parseFloat(sellOnShare.toFixed(4)));
    return {
        currency: parsedCurrency,
        amount: amount,
        bidder: parsedBidder,
        recipient: parsedRecipient,
        sellOnShare: decimalSellOnShare,
    };
}
exports.constructBid = constructBid;
/**
 * Validates if the input is exactly 32 bytes
 * Expects a hex string with a 0x prefix or a Bytes type
 *
 * @param value
 */
function validateBytes32(value) {
    if (typeof value == 'string') {
        if (bytes_1.isHexString(value) && bytes_1.hexDataLength(value) == 32) {
            return;
        }
        tiny_invariant_1.default(false, `${value} is not a 0x prefixed 32 bytes hex string`);
    }
    else {
        if (bytes_1.hexDataLength(bytes_1.hexlify(value)) == 32) {
            return;
        }
        tiny_invariant_1.default(false, `value is not a length 32 byte array`);
    }
}
exports.validateBytes32 = validateBytes32;
/**
 * Validates the URI is prefixed with `https://`
 *
 * @param uri
 */
function validateURI(uri) {
    if (!uri.match(/^https:\/\/(.*)/)) {
        tiny_invariant_1.default(false, `${uri} must begin with \`https://\``);
    }
}
exports.validateURI = validateURI;
/**
 * Validates and returns the checksummed address
 *
 * @param address
 */
function validateAndParseAddress(address) {
    try {
        const checksummedAddress = address_1.getAddress(address);
        tiny_warning_1.default(address === checksummedAddress, `${address} is not checksummed.`);
        return checksummedAddress;
    }
    catch (error) {
        tiny_invariant_1.default(false, `${address} is not a valid address.`);
    }
}
exports.validateAndParseAddress = validateAndParseAddress;
/**
 * Returns the proper network name for the specified chainId
 *
 * @param chainId
 */
function chainIdToNetworkName(chainId) {
    switch (chainId) {
        case 4: {
            return 'rinkeby';
        }
        case 1: {
            return 'mainnet';
        }
    }
    tiny_invariant_1.default(false, `chainId ${chainId} not officially supported by the Aiza Protocol`);
}
exports.chainIdToNetworkName = chainIdToNetworkName;
/********************
 * Hashing Utilities
 ********************
 */
/**
 * Generates the sha256 hash from a buffer and returns the hash hex-encoded
 *
 * @param buffer
 */
function sha256FromBuffer(buffer) {
    const bitArray = sjcl_1.default.codec.hex.toBits(buffer.toString('hex'));
    const hashArray = sjcl_1.default.hash.sha256.hash(bitArray);
    return '0x'.concat(sjcl_1.default.codec.hex.fromBits(hashArray));
}
exports.sha256FromBuffer = sha256FromBuffer;
/**
 * Generates a sha256 hash from a 0x prefixed hex string and returns the hash hex-encoded.
 * Throws an error if `data` is not a hex string.
 *
 * @param data
 */
function sha256FromHexString(data) {
    if (!bytes_1.isHexString(data)) {
        throw new Error(`${data} is not valid 0x prefixed hex`);
    }
    const bitArray = sjcl_1.default.codec.hex.toBits(data);
    const hashArray = sjcl_1.default.hash.sha256.hash(bitArray);
    return '0x'.concat(sjcl_1.default.codec.hex.fromBits(hashArray));
}
exports.sha256FromHexString = sha256FromHexString;
/**
 * Removes the hex prefix of the passed string if it exists
 *
 * @param hex
 */
function stripHexPrefix(hex) {
    return hex.slice(0, 2) == '0x' ? hex.slice(2) : hex;
}
exports.stripHexPrefix = stripHexPrefix;
/*********************
 * EIP-712 Utilities
 *********************
 */
/**
 * Signs a Aiza Permit Message as specified by EIP-712
 *
 * @param owner
 * @param toAddress
 * @param mediaId
 * @param nonce
 * @param deadline
 * @param domain
 */
async function signPermitMessage(owner, toAddress, mediaId, nonce, deadline, domain) {
    const tokenId = mediaId;
    return new Promise(async (res, reject) => {
        try {
            const sig = eth_sig_util_1.signTypedData_v4(Buffer.from(owner.privateKey.slice(2), 'hex'), {
                data: {
                    types: {
                        EIP712Domain: [
                            { name: 'name', type: 'string' },
                            { name: 'version', type: 'string' },
                            { name: 'chainId', type: 'uint256' },
                            { name: 'verifyingContract', type: 'address' },
                        ],
                        Permit: [
                            { name: 'spender', type: 'address' },
                            { name: 'tokenId', type: 'uint256' },
                            { name: 'nonce', type: 'uint256' },
                            { name: 'deadline', type: 'uint256' },
                        ],
                    },
                    primaryType: 'Permit',
                    domain: domain,
                    message: {
                        spender: toAddress,
                        tokenId,
                        nonce,
                        deadline,
                    },
                },
            });
            const response = ethereumjs_util_1.fromRpcSig(sig);
            res({
                r: response.r,
                s: response.s,
                v: response.v,
                deadline: deadline.toString(),
            });
        }
        catch (e) {
            console.error(e);
            reject(e);
        }
    });
}
exports.signPermitMessage = signPermitMessage;
/**
 * Recovers the address of the private key that signed the Aiza Permit Message
 *
 * @param toAddress
 * @param mediaId
 * @param nonce
 * @param deadline
 * @param domain
 * @param eipSig
 */
async function recoverSignatureFromPermit(toAddress, mediaId, nonce, deadline, domain, eipSig) {
    const r = bytes_1.arrayify(eipSig.r);
    const s = bytes_1.arrayify(eipSig.s);
    const tokenId = mediaId;
    const recovered = eth_sig_util_1.recoverTypedSignature({
        data: {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                Permit: [
                    { name: 'spender', type: 'address' },
                    { name: 'tokenId', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            },
            primaryType: 'Permit',
            domain: domain,
            message: {
                spender: toAddress,
                tokenId,
                nonce,
                deadline,
            },
        },
        sig: ethereumjs_util_1.toRpcSig(eipSig.v, Buffer.from(r), Buffer.from(s)),
    });
    return recovered;
}
exports.recoverSignatureFromPermit = recoverSignatureFromPermit;
/**
 * Recovers the address of the private key that signed a Aiza MintWithSig Message
 *
 * @param contentHash
 * @param metadataHash
 * @param creatorShareBN
 * @param nonce
 * @param deadline
 * @param domain
 * @param eipSig
 */
async function recoverSignatureFromMintWithSig(contentHash, metadataHash, creatorShareBN, nonce, deadline, domain, eipSig) {
    const r = bytes_1.arrayify(eipSig.r);
    const s = bytes_1.arrayify(eipSig.s);
    const creatorShare = creatorShareBN.toString();
    const recovered = eth_sig_util_1.recoverTypedSignature({
        data: {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                MintWithSig: [
                    { name: 'contentHash', type: 'bytes32' },
                    { name: 'metadataHash', type: 'bytes32' },
                    { name: 'creatorShare', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            },
            primaryType: 'MintWithSig',
            domain: domain,
            message: {
                contentHash,
                metadataHash,
                creatorShare,
                nonce,
                deadline,
            },
        },
        sig: ethereumjs_util_1.toRpcSig(eipSig.v, Buffer.from(r), Buffer.from(s)),
    });
    return recovered;
}
exports.recoverSignatureFromMintWithSig = recoverSignatureFromMintWithSig;
/**
 * Signs a Aiza MintWithSig Message as specified by EIP-712
 *
 * @param owner
 * @param contentHash
 * @param metadataHash
 * @param creatorShareBN
 * @param nonce
 * @param deadline
 * @param domain
 */
async function signMintWithSigMessage(owner, contentHash, metadataHash, creatorShareBN, nonce, deadline, domain) {
    try {
        validateBytes32(contentHash);
        validateBytes32(metadataHash);
    }
    catch (err) {
        return Promise.reject(err.message);
    }
    const creatorShare = creatorShareBN.toString();
    return new Promise(async (res, reject) => {
        try {
            const sig = eth_sig_util_1.signTypedData_v4(Buffer.from(owner.privateKey.slice(2), 'hex'), {
                data: {
                    types: {
                        EIP712Domain: [
                            { name: 'name', type: 'string' },
                            { name: 'version', type: 'string' },
                            { name: 'chainId', type: 'uint256' },
                            { name: 'verifyingContract', type: 'address' },
                        ],
                        MintWithSig: [
                            { name: 'contentHash', type: 'bytes32' },
                            { name: 'metadataHash', type: 'bytes32' },
                            { name: 'creatorShare', type: 'uint256' },
                            { name: 'nonce', type: 'uint256' },
                            { name: 'deadline', type: 'uint256' },
                        ],
                    },
                    primaryType: 'MintWithSig',
                    domain: domain,
                    message: {
                        contentHash,
                        metadataHash,
                        creatorShare,
                        nonce,
                        deadline,
                    },
                },
            });
            const response = ethereumjs_util_1.fromRpcSig(sig);
            res({
                r: response.r,
                s: response.s,
                v: response.v,
                deadline: deadline.toString(),
            });
        }
        catch (e) {
            console.error(e);
            reject(e);
        }
    });
}
exports.signMintWithSigMessage = signMintWithSigMessage;
/**
 * Approve a spender address to spend a specified amount of a specified ERC20 from wallet
 *
 * @param wallet
 * @param erc20Address
 * @param spender
 * @param amount
 */
async function approveERC20(wallet, erc20Address, spender, amount) {
    const erc20 = typechain_1.BaseErc20Factory.connect(erc20Address, wallet);
    return erc20.approve(spender, amount);
}
exports.approveERC20 = approveERC20;
/**
 * Returns the `verified` status of a uri.
 * A uri is only considered `verified` if its content hashes to its expected hash
 *
 * @param uri
 * @param expectedHash
 * @param timeout
 */
async function isURIHashVerified(uri, expectedHash, timeout = 10) {
    try {
        validateURI(uri);
        const resp = await axios_1.default.get(uri, {
            timeout: timeout,
            responseType: 'arraybuffer',
        });
        const uriHash = sha256FromBuffer(resp.data);
        const normalizedExpectedHash = bytes_1.hexlify(expectedHash);
        return uriHash == normalizedExpectedHash;
    }
    catch (err) {
        return Promise.reject(err.message);
    }
}
exports.isURIHashVerified = isURIHashVerified;
/**
 * Returns the `verified` status of some MediaData.
 * MediaData is only considered `verified` if the content of its URIs hash to their respective hash
 *
 * @param mediaData
 * @param timeout
 */
async function isMediaDataVerified(mediaData, timeout = 10) {
    const isTokenURIVerified = await isURIHashVerified(mediaData.tokenURI, mediaData.contentHash, timeout);
    const isMetadataURIVerified = await isURIHashVerified(mediaData.metadataURI, mediaData.metadataHash, timeout);
    return isTokenURIVerified && isMetadataURIVerified;
}
exports.isMediaDataVerified = isMediaDataVerified;
/**
 * Deposits `amount` of ETH into WETH contract and receives `amount` in WETH
 * an ERC-20 representation of ETH
 * @param wallet
 * @param wethAddress
 * @param amount
 */
async function wrapETH(wallet, wethAddress, amount) {
    const abi = ['function deposit() public payable'];
    const weth = new ethers_1.ethers.Contract(wethAddress, abi, wallet);
    return weth.deposit({ value: amount });
}
exports.wrapETH = wrapETH;
/**
 * Withdraws `amount` of ETH from WETH contract for the specified wallet
 * @param wallet
 * @param wethAddress
 * @param amount
 */
async function unwrapWETH(wallet, wethAddress, amount) {
    const abi = ['function withdraw(uint256) public'];
    const weth = new ethers_1.ethers.Contract(wethAddress, abi, wallet);
    return weth.withdraw(amount);
}
exports.unwrapWETH = unwrapWETH;
//# sourceMappingURL=utils.js.map