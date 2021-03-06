/// <reference types="node" />
import { Ask, Bid, BidShares, DecimalValue, EIP712Domain, EIP712Signature, MediaData } from './types';
import { BigNumber, BigNumberish, BytesLike, ContractTransaction, Wallet } from 'ethers';
export declare const WETH_MAINNET = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export declare const WETH_RINKEBY = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
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
export declare function constructMediaData(tokenURI: string, metadataURI: string, contentHash: BytesLike, metadataHash: BytesLike): MediaData;
/**
 * Constructs a BidShares type.
 * Throws an error if the BidShares do not sum to 100 with 18 trailing decimals.
 *
 * @param creator
 * @param owner
 * @param prevOwner
 */
export declare function constructBidShares(creator: number, owner: number, prevOwner: number): BidShares;
/**
 * Validates that BidShares sum to 100
 *
 * @param creator
 * @param owner
 * @param prevOwner
 */
export declare function validateBidShares(creator: DecimalValue, owner: DecimalValue, prevOwner: DecimalValue): void;
/**
 * Constructs an Ask.
 *
 * @param currency
 * @param amount
 */
export declare function constructAsk(currency: string, amount: BigNumberish): Ask;
/**
 * Constructs a Bid.
 *
 * @param currency
 * @param amount
 * @param bidder
 * @param recipient
 * @param sellOnShare
 */
export declare function constructBid(currency: string, amount: BigNumberish, bidder: string, recipient: string, sellOnShare: number): Bid;
/**
 * Validates if the input is exactly 32 bytes
 * Expects a hex string with a 0x prefix or a Bytes type
 *
 * @param value
 */
export declare function validateBytes32(value: BytesLike): void;
/**
 * Validates the URI is prefixed with `https://`
 *
 * @param uri
 */
export declare function validateURI(uri: string): void;
/**
 * Validates and returns the checksummed address
 *
 * @param address
 */
export declare function validateAndParseAddress(address: string): string;
/**
 * Returns the proper network name for the specified chainId
 *
 * @param chainId
 */
export declare function chainIdToNetworkName(chainId: number): string;
/********************
 * Hashing Utilities
 ********************
 */
/**
 * Generates the sha256 hash from a buffer and returns the hash hex-encoded
 *
 * @param buffer
 */
export declare function sha256FromBuffer(buffer: Buffer): string;
/**
 * Generates a sha256 hash from a 0x prefixed hex string and returns the hash hex-encoded.
 * Throws an error if `data` is not a hex string.
 *
 * @param data
 */
export declare function sha256FromHexString(data: string): string;
/**
 * Removes the hex prefix of the passed string if it exists
 *
 * @param hex
 */
export declare function stripHexPrefix(hex: string): string;
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
export declare function signPermitMessage(owner: Wallet, toAddress: string, mediaId: number, nonce: number, deadline: number, domain: EIP712Domain): Promise<EIP712Signature>;
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
export declare function recoverSignatureFromPermit(toAddress: string, mediaId: number, nonce: number, deadline: number, domain: EIP712Domain, eipSig: EIP712Signature): Promise<string>;
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
export declare function recoverSignatureFromMintWithSig(contentHash: BytesLike, metadataHash: BytesLike, creatorShareBN: BigNumber, nonce: number, deadline: number, domain: EIP712Domain, eipSig: EIP712Signature): Promise<string>;
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
export declare function signMintWithSigMessage(owner: Wallet, contentHash: BytesLike, metadataHash: BytesLike, creatorShareBN: BigNumber, nonce: number, deadline: number, domain: EIP712Domain): Promise<EIP712Signature>;
/**
 * Approve a spender address to spend a specified amount of a specified ERC20 from wallet
 *
 * @param wallet
 * @param erc20Address
 * @param spender
 * @param amount
 */
export declare function approveERC20(wallet: Wallet, erc20Address: string, spender: string, amount: BigNumberish): Promise<ContractTransaction>;
/**
 * Returns the `verified` status of a uri.
 * A uri is only considered `verified` if its content hashes to its expected hash
 *
 * @param uri
 * @param expectedHash
 * @param timeout
 */
export declare function isURIHashVerified(uri: string, expectedHash: BytesLike, timeout?: number): Promise<boolean>;
/**
 * Returns the `verified` status of some MediaData.
 * MediaData is only considered `verified` if the content of its URIs hash to their respective hash
 *
 * @param mediaData
 * @param timeout
 */
export declare function isMediaDataVerified(mediaData: MediaData, timeout?: number): Promise<boolean>;
/**
 * Deposits `amount` of ETH into WETH contract and receives `amount` in WETH
 * an ERC-20 representation of ETH
 * @param wallet
 * @param wethAddress
 * @param amount
 */
export declare function wrapETH(wallet: Wallet, wethAddress: string, amount: BigNumber): Promise<ContractTransaction>;
/**
 * Withdraws `amount` of ETH from WETH contract for the specified wallet
 * @param wallet
 * @param wethAddress
 * @param amount
 */
export declare function unwrapWETH(wallet: Wallet, wethAddress: string, amount: BigNumber): Promise<ContractTransaction>;
