import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractTransaction } from "@ethersproject/contracts";

import * as Addresses from "./addresses";
import { Order } from "./order";
import { TxData, generateReferrerBytes } from "../utils";

import RouterAbi from "./abis/Router.json";

// Sudoswap:
// - fully on-chain
// - pooled liquidity

export class Router {
  public chainId: number;
  public contract: Contract;

  constructor(chainId: number) {
    this.chainId = chainId;
    this.contract = new Contract(
      Addresses.RouterWithRoyalties[this.chainId],
      RouterAbi
    );
  }

  // --- Fill buy order ---

  public async fillBuyOrder(
    taker: Signer,
    order: Order,
    tokenId: string,
    options?: {
      recipient?: string;
      referrer?: string;
    }
  ): Promise<ContractTransaction> {
    const tx = this.fillBuyOrderTx(
      await taker.getAddress(),
      order,
      tokenId,
      options
    );
    return taker.sendTransaction(tx);
  }

  public fillBuyOrderTx(
    taker: string,
    order: Order,
    tokenId: string,
    options?: {
      recipient?: string;
      referrer?: string;
    }
  ): TxData {
    return {
      from: taker,
      to: this.contract.address,
      data:
        this.contract.interface.encodeFunctionData("swapNFTsForToken", [
          [
            {
              pair: order.params.pair,
              nftIds: [tokenId],
            },
          ],
          order.params.price ?? 0,
          options?.recipient ?? taker,
          Math.floor(Date.now() / 1000) + 10 * 60,
        ]) + generateReferrerBytes(options?.referrer),
    };
  }

  // --- swapETHForSpecificNFTs ---

  public async swapETHForSpecificNFTs(
    taker: Signer,
    order: Order,
    tokenId: string,
    options?: {
      recipient?: string;
      referrer?: string;
    }
  ): Promise<ContractTransaction> {
    const tx = this.swapETHForSpecificNFTsTx(
      await taker.getAddress(),
      order,
      tokenId,
      options
    );
    return taker.sendTransaction(tx);
  }

  public swapETHForSpecificNFTsTx(
    taker: string,
    order: Order,
    tokenId: string,
    options?: {
      recipient?: string;
      referrer?: string;
    }
  ): TxData {
    return {
      from: taker,
      to: "0x844d04f79d2c58dcebf8fff1e389fccb1401aa49",
      data:
        this.contract.interface.encodeFunctionData("swapETHForSpecificNFTs", [
          [
            {
              pair: "0x7794C476806731b74ba2049ccd413218248135DA",
              nftIds: [tokenId],
            },
          ],
          taker, //ethRecipient
          taker, //nftRecipient
          Math.floor(Date.now() / 1000) + 10 * 60,
        ])
    };
  }
}
