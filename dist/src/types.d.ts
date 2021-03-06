import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';
/**
 * Internal type to represent a Decimal Value
 */
export declare type DecimalValue = {
    value: BigNumber;
};
/**
 * Aiza Media Protocol BidShares
 */
export declare type BidShares = {
    owner: DecimalValue;
    prevOwner: DecimalValue;
    creator: DecimalValue;
};
/**
 * Aiza Media Protocol Ask
 */
export declare type Ask = {
    currency: string;
    amount: BigNumberish;
};
/**
 * Aiza Media Protocol Bid
 */
export declare type Bid = {
    currency: string;
    amount: BigNumberish;
    bidder: string;
    recipient: string;
    sellOnShare: DecimalValue;
};
/**
 * Aiza Media Protocol MediaData
 */
export declare type MediaData = {
    tokenURI: string;
    metadataURI: string;
    contentHash: BytesLike;
    metadataHash: BytesLike;
};
/**
 * EIP712 Signature
 */
export declare type EIP712Signature = {
    deadline: BigNumberish;
    v: number;
    r: BytesLike;
    s: BytesLike;
};
/**
 * EIP712 Domain
 */
export declare type EIP712Domain = {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
};
