import { BigNumberish } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";

import { BaseBuildParams, BaseBuilder } from "./base";
import { Order } from "../order";
import * as Types from "../types";

interface BuildParams extends BaseBuildParams {
  tokenId: BigNumberish;
}

export class SingleTokenBuilder extends BaseBuilder {

  public build(params: BuildParams) {
    this.defaultInitialize(params);

    return new Order(this.chainId, {
      kind: params.amount ? "erc1155-single-token" : "erc721-single-token",
      direction:
      fees: params.fees!.map(({ recipient, amount }) => ({
        recipient: lc(recipient),
        amount: s(amount),
        feeData: BytesEmpty,
      })),

    });
  }

}