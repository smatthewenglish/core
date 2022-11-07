export type OrderParams = {
  pair: string;
  price: string;
};

export enum DelegationType {
  ERC721 = 1
}

export enum Intent {
  BUY = 3
}

export type Order = {
  id: number;
  type: string;
  currency: string;
  price: string;
  maker: string;
  taker: string;
  deadline: number;
  itemHash: string;
  nft: {
    token: string;
    tokenId?: string;
  };
};