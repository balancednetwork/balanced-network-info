import keyBy from 'lodash/keyBy';

import { ReactComponent as BALNIcon } from 'assets/tokens/BALN.svg';
import { ReactComponent as bnUSDIcon } from 'assets/tokens/bnUSD.svg';
import { ReactComponent as ICXIcon } from 'assets/tokens/ICX.svg';
import { ReactComponent as sICXIcon } from 'assets/tokens/sICX.svg';

export const CURRENCY_LIST = {
  empty: { symbol: '', decimals: 0, name: 'empty' },
  icx: { symbol: 'ICX', decimals: 3, name: 'ICON' },
  sicx: { symbol: 'sICX', decimals: 3, name: 'Staked ICX' },
  bnusd: { symbol: 'bnUSD', decimals: 3, name: 'ICON Dollar' },
  baln: { symbol: 'BALN', decimals: 3, name: 'Balanced Token' },
};

export const CURRENCY_INFO: {
  [key: string]: {
    name: string;
    symbol: string;
  };
} = {
  BALN: {
    name: 'Balance Tokens',
    symbol: 'BALN',
  },
  bnUSD: {
    name: 'Balanced Dollars',
    symbol: 'bnUSD',
  },
  ICX: {
    name: 'ICON',
    symbol: 'ICX',
  },
  sICX: {
    name: 'Staked ICX',
    symbol: 'sICX',
  },
};

export const CURRENCY = ['ICX', 'sICX', 'bnUSD', 'BALN'];

export const CURRENCY_MAP = keyBy(CURRENCY);

export const currencyKeyToIconMap = {
  [CURRENCY_MAP.ICX]: ICXIcon,
  [CURRENCY_MAP.sICX]: sICXIcon,
  [CURRENCY_MAP.bnUSD]: bnUSDIcon,
  [CURRENCY_MAP.BALN]: BALNIcon,
};

export type CurrencyKey = string;

export const toMarketPair = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: string) =>
  `${baseCurrencyKey} / ${quoteCurrencyKey}`;

export interface Pair {
  baseCurrencyKey: CurrencyKey;
  quoteCurrencyKey: CurrencyKey;
  pair: string;
  poolId: number;
}

export const SUPPORTED_PAIRS: Array<Pair> = [
  {
    baseCurrencyKey: CURRENCY_MAP['sICX'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['sICX'], CURRENCY_MAP['bnUSD']),
    poolId: 2,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['BALN'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['BALN'], CURRENCY_MAP['bnUSD']),
    poolId: 3,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['sICX'],
    quoteCurrencyKey: CURRENCY_MAP['ICX'],
    pair: toMarketPair(CURRENCY_MAP['sICX'], CURRENCY_MAP['ICX']),
    poolId: 1,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['ICX'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['ICX'], CURRENCY_MAP['sICX']),
    poolId: 1,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['bnUSD'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['bnUSD'], CURRENCY_MAP['sICX']),
    poolId: 2,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['bnUSD'],
    quoteCurrencyKey: CURRENCY_MAP['BALN'],
    pair: toMarketPair(CURRENCY_MAP['bnUSD'], CURRENCY_MAP['BALN']),
    poolId: 3,
  },
];

export const BASE_SUPPORTED_PAIRS = [SUPPORTED_PAIRS[0], SUPPORTED_PAIRS[1], SUPPORTED_PAIRS[2]];

export const getFilteredCurrencies = (baseCurrencyKey: CurrencyKey): CurrencyKey[] => {
  return SUPPORTED_PAIRS.filter(pair => pair.baseCurrencyKey === baseCurrencyKey).map(pair => pair.quoteCurrencyKey);
};

export const SUPPORTED_BASE_CURRENCIES = Array.from(new Set(SUPPORTED_PAIRS.map(pair => pair.baseCurrencyKey)));
