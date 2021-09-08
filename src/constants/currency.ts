import keyBy from 'lodash/keyBy';

import { ReactComponent as BALNIcon } from 'assets/tokens/BALN.svg';
import { ReactComponent as bnUSDIcon } from 'assets/tokens/bnUSD.svg';
import { ReactComponent as ICXIcon } from 'assets/tokens/ICX.svg';
import { ReactComponent as IUSDCIcon } from 'assets/tokens/IUSDC.svg';
import { ReactComponent as OMMIcon } from 'assets/tokens/OMM.svg';
import { ReactComponent as sICXIcon } from 'assets/tokens/sICX.svg';
import { ReactComponent as USDSIcon } from 'assets/tokens/USDS.svg';

export const CURRENCY = ['ICX', 'sICX', 'bnUSD', 'BALN', 'IUSDC', 'OMM'];

export const CURRENCY_MAP = keyBy(CURRENCY);

export const currencyKeyToIconMap = {
  ICX: ICXIcon,
  sICX: sICXIcon,
  bnUSD: bnUSDIcon,
  BALN: BALNIcon,
  OMM: OMMIcon,
  IUSDC: IUSDCIcon,
  USDS: USDSIcon,
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
    rewards: 0.07,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['sICX'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['sICX'], CURRENCY_MAP['bnUSD']),
    poolId: 2,
    name: toMarketName(CURRENCY_MAP['sICX'], CURRENCY_MAP['bnUSD']),
    rewards: 0.175,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['BALN'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['BALN'], CURRENCY_MAP['bnUSD']),
    poolId: 3,
    name: toMarketName(CURRENCY_MAP['BALN'], CURRENCY_MAP['bnUSD']),
    rewards: 0.175,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['BALN'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['BALN'], CURRENCY_MAP['sICX']),
    poolId: 4,
    name: toMarketName(CURRENCY_MAP['BALN'], CURRENCY_MAP['sICX']),
    rewards: 0.05,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['IUSDC'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['IUSDC'], CURRENCY_MAP['bnUSD']),
    name: toMarketName(CURRENCY_MAP['IUSDC'], CURRENCY_MAP['bnUSD']),
    poolId: 5,
    rewards: 0.005,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['OMM'],
    quoteCurrencyKey: CURRENCY_MAP['IUSDC'],
    pair: toMarketPair(CURRENCY_MAP['OMM'], CURRENCY_MAP['IUSDC']),
    name: toMarketName(CURRENCY_MAP['OMM'], CURRENCY_MAP['IUSDC']),
    poolId: 6,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['OMM'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['OMM'], CURRENCY_MAP['sICX']),
    name: toMarketName(CURRENCY_MAP['OMM'], CURRENCY_MAP['sICX']),
    poolId: 7,
  },
  // {
  //   baseCurrencyKey: CURRENCY_MAP['OMM'],
  //   quoteCurrencyKey: CURRENCY_MAP['USDS'],
  //   pair: toMarketPair(CURRENCY_MAP['OMM'], CURRENCY_MAP['USDS']),
  //   name: toMarketName(CURRENCY_MAP['OMM'], CURRENCY_MAP['USDS']),
  //   poolId: 8,
  // },
];

export enum NetworkId {
  MAINNET = 1,
  YEOUIDO = 3,
  EULJIRO = 2,
  PAGODA = 80,
}

export const addressToCurrencyKeyMap = {
  [NetworkId.MAINNET]: {
    cx2609b924e33ef00b648a409245c7ea394c467824: 'sICX',
    cx88fd7df7ddff82f7cc735c871dc519838cb235bb: 'bnUSD',
    cxf61cd5a45dc9f91c15aa65831a30a90d59a09619: 'BALN',
    cx0000000000000000000000000000000000000000: 'ICX',
    cxae3034235540b924dfcc1b45836c293dcc82bfb7: 'IUSDC',
    cxbb2871f468a3008f80b08fdde5b8b951583acf06: 'USDS',
    cx1a29259a59f463a67bb2ef84398b30ca56b5830a: 'OMM',
  },
  [NetworkId.YEOUIDO]: {
    cxae6334850f13dfd8b50f8544d5acb126bb8ef82d: 'sICX',
    cxc48c9c81ceef04445c961c5cc8ff056d733dfe3a: 'bnUSD',
    cx36169736b39f59bf19e8950f6c8fa4bfa18b710a: 'BALN',
    cx0000000000000000000000000000000000000000: 'ICX',
    cx65f639254090820361da483df233f6d0e69af9b7: 'IUSDC',
    cxc0666df567a6e0b49342648e98ccbe5362b264ea: 'USDS',
    cx05515d126a47a98c682fa86992329e6c2ec70503: 'OMM',
  },
};

export const currencyKeyToAddressMap = {
  [NetworkId.MAINNET]: {
    sICX: 'cx2609b924e33ef00b648a409245c7ea394c467824',
    bnUSD: 'cx88fd7df7ddff82f7cc735c871dc519838cb235bb',
    BALN: 'cxf61cd5a45dc9f91c15aa65831a30a90d59a09619',
    ICX: 'cx0000000000000000000000000000000000000000',
    IUSDC: 'cxae3034235540b924dfcc1b45836c293dcc82bfb7',
    USDS: 'cxbb2871f468a3008f80b08fdde5b8b951583acf06',
    OMM: 'cx1a29259a59f463a67bb2ef84398b30ca56b5830a',
  },
  [NetworkId.YEOUIDO]: {
    sICX: 'cxae6334850f13dfd8b50f8544d5acb126bb8ef82d',
    bnUSD: 'cxc48c9c81ceef04445c961c5cc8ff056d733dfe3a',
    BALN: 'cx36169736b39f59bf19e8950f6c8fa4bfa18b710a',
    ICX: 'cx0000000000000000000000000000000000000000',
    IUSDC: 'cx65f639254090820361da483df233f6d0e69af9b7',
    USDS: 'cxc0666df567a6e0b49342648e98ccbe5362b264ea',
    OMM: 'cx05515d126a47a98c682fa86992329e6c2ec70503',
  },
};
