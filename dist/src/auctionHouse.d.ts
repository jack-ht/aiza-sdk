import { BigNumber, BigNumberish, ethers, Signer } from 'ethers';
import { Provider, TransactionReceipt } from '@ethersproject/providers';
import { AuctionHouse as AuctionHouseContract } from '@htsoft/auction-contracts/dist/typechain';
export interface Auction {
    approved: boolean;
    amount: BigNumber;
    duration: BigNumber;
    firstBidTime: BigNumber;
    reservePrice: BigNumber;
    curatorFeePercentage: number;
    tokenOwner: string;
    bidder: string;
    curator: string;
    auctionCurrency: string;
}
export declare class AuctionHouse {
    readonly chainId: number;
    readonly readOnly: boolean;
    readonly signerOrProvider: Signer | Provider;
    readonly auctionHouse: AuctionHouseContract;
    readonly aizaAddress: string;
    constructor(signerOrProvider: Signer | Provider, chainId: number);
    fetchAuction(auctionId: BigNumberish): Promise<Auction>;
    fetchAuctionFromTransactionReceipt(receipt: TransactionReceipt): Promise<Auction | null>;
    createAuction(tokenId: BigNumberish, duration: BigNumberish, reservePrice: BigNumberish, curator: string, curatorFeePercentages: number, auctionCurrency: string, tokenAddress?: string): Promise<ethers.ContractTransaction>;
    setAuctionApproval(auctionId: BigNumberish, approved: boolean): Promise<ethers.ContractTransaction>;
    setAuctionReservePrice(auctionId: BigNumberish, reservePrice: BigNumberish): Promise<ethers.ContractTransaction>;
    createBid(auctionId: BigNumberish, amount: BigNumberish): Promise<ethers.ContractTransaction>;
    endAuction(auctionId: BigNumberish): Promise<ethers.ContractTransaction>;
    cancelAuction(auctionId: BigNumberish): Promise<ethers.ContractTransaction>;
}
