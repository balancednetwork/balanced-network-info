import { isEoaAddress } from 'icon-sdk-js/lib/data/Validator.js';

import { currencyKeyToIconMap, CurrencyKey, Pair } from 'constants/currency';

export enum NetworkId {
  MAINNET = 1,
  YEOUIDO = 3,
  EULJIRO = 2,
  PAGODA = 80,
}

export const NETWORK_ID: number = parseInt(process.env.REACT_APP_NETWORK_ID ?? '1');

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 7): string {
  if (!isEoaAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

const API_ENDPOINTS = {
  [NetworkId.MAINNET]: 'https://balnmainnet.techiast.com:8069',
  [NetworkId.YEOUIDO]: 'https://balanced.techiast.com:8069',
};

export const getAPIEnpoint = () => API_ENDPOINTS[NETWORK_ID];

const Trackers = {
  [NetworkId.MAINNET]: 'https://tracker.icon.foundation',
  [NetworkId.YEOUIDO]: 'https://bicon.tracker.solidwallet.io',
};

export function getTrackerLink(
  networkId: NetworkId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  const prefix = Trackers[networkId];

  switch (type) {
    case 'transaction': {
      return `${prefix}/transaction/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const getCurrencyKeyIcon = (currencyKey: CurrencyKey) => currencyKeyToIconMap[currencyKey];

export const calculateFees = (pair: Pair & { tvl: number; apy: number; participant: number; volume: number }) => {
  return (pair.volume * 3) / 1000;
};
