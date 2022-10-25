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
    tokenId: string,
    options?: {
      recipient?: string;
      referrer?: string;
    }
  ): Promise<ContractTransaction> {
    const tx = this.swapETHForSpecificNFTsTx(
      await taker.getAddress(),
      tokenId,
      options
    );
    console.log("lol" + this.contract.interface.encodeFunctionData("ownerOf", [tokenId]));
    return taker.sendTransaction(tx);
  }

  public swapETHForSpecificNFTsTx(
    taker: string,
    tokenId: string,
    options?: {
      recipient?: string;
      referrer?: string;
    }
  ): TxData {
    return {
      from: taker,
      to: "0x1a2D222C3FF93f4F1a9d26b27F6669BF8522Aa62",
      data:
        this.contract.interface.encodeFunctionData("ownerOf", [tokenId])
    };
  }
}
