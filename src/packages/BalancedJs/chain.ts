export enum SupportedChainId {
  MAINNET = 1,
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [SupportedChainId.MAINNET];

interface ChainInfo {
  readonly name: string;
  readonly node: string;
  readonly APIEndpoint: string;
  readonly debugAPIEndpoint: string;
  readonly chainId: number;
  readonly tracker: string;
}

export const CHAIN_INFO: { readonly [chainId: number]: ChainInfo } = {
  [SupportedChainId.MAINNET]: {
    name: 'ICON Mainnet',
    node: 'https://ctz.solidwallet.io',
    APIEndpoint: 'https://ctz.solidwallet.io/api/v3',
    debugAPIEndpoint: 'https://ctz.solidwallet.io/api/debug/v3',
    chainId: 1,
    tracker: 'https://tracker.icon.foundation',
  },
};
