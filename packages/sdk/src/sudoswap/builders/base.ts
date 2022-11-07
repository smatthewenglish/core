import { BigNumberish } from "@ethersproject/bignumber";

export interface BaseBuildParams {
direction: "buy";
contract: string;
maker: string;
paymentToken: string;
price: BigNumberish;
fees?: {
    recipient: string;
    amount: BigNumberish;
}[];
}

export abstract class BaseBuilder {
    public chainId: number;
  
    constructor(chainId: number) {
      this.chainId = chainId;
    }
  
    protected defaultInitialize(params: BaseBuildParams) {
      params.fees = params.fees ?? [];
    }
}
