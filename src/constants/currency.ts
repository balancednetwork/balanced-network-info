import keyBy from 'lodash/keyBy';

import { ReactComponent as BALNIcon } from 'assets/tokens/BALN.svg';
import { ReactComponent as bnUSDIcon } from 'assets/tokens/bnUSD.svg';
import { ReactComponent as ICXIcon } from 'assets/tokens/ICX.svg';
import { ReactComponent as sICXIcon } from 'assets/tokens/sICX.svg';

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

export const toMarketName = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: string) =>
  `${baseCurrencyKey}/${quoteCurrencyKey}`;

export interface Pair {
  baseCurrencyKey: CurrencyKey;
  quoteCurrencyKey: CurrencyKey;
  pair: string;
  poolId: number;
  name: string;
  rewards?: number;
}

export const SUPPORTED_PAIRS: Array<Pair> = [
  {
    baseCurrencyKey: CURRENCY_MAP['sICX'],
    quoteCurrencyKey: CURRENCY_MAP['ICX'],
    pair: toMarketPair(CURRENCY_MAP['sICX'], CURRENCY_MAP['ICX']),
    poolId: 1,
    name: toMarketName(CURRENCY_MAP['sICX'], CURRENCY_MAP['ICX']),
    rewards: 10_000,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['sICX'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['sICX'], CURRENCY_MAP['bnUSD']),
    poolId: 2,
    name: toMarketName(CURRENCY_MAP['sICX'], CURRENCY_MAP['bnUSD']),
    rewards: 17_500,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['BALN'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['BALN'], CURRENCY_MAP['bnUSD']),
    poolId: 3,
    name: toMarketName(CURRENCY_MAP['BALN'], CURRENCY_MAP['bnUSD']),
    rewards: 17_500,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['BALN'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['BALN'], CURRENCY_MAP['sICX']),
    poolId: 4,
    name: toMarketName(CURRENCY_MAP['BALN'], CURRENCY_MAP['sICX']),
    rewards: 5_000,
  },
];
