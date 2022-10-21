import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import * as Sudoswap from "@reservoir0x/sdk/src/sudoswap";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import { getChainId, reset, setupNFTs } from "../../../utils";

describe("Sudoswap - SingleToken Erc721", () => {
  const chainId = getChainId();

  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  let erc721: Contract;

  beforeEach(async () => {
    [deployer, alice, bob, carol] = await ethers.getSigners();

    ({ erc721 } = await setupNFTs(deployer));
  });

  afterEach(reset);

  it("Fill sell order", async () => {
    
    let tokenId: string = "6855";

    const exchange = new Sudoswap.Router(chainId);
  
    //TODO: should we find these on chain??? from 'OrderParams'
    let pair: string = "0x7794C476806731b74ba2049ccd413218248135DA";
    let price = parseEther("0.002");

    let taker: SignerWithAddress = bob;
    // Create buy order.
    let order = new Sudoswap.Order(chainId, {
      pair: pair,
      price: price.toString(),
    });
    
    await exchange.fillBuyOrder(taker, order, tokenId);

    // Foundation escrows the NFT when creating sell orders.
    //expect(await erc721.ownerOf(tokenId), bob.address);
  });
});
