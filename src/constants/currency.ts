import keyBy from 'lodash/keyBy';

import { ReactComponent as BALNIcon } from 'assets/tokens/BALN.svg';
import { ReactComponent as bnUSDIcon } from 'assets/tokens/bnUSD.svg';
import { ReactComponent as CFTIcon } from 'assets/tokens/CFT.svg';
import { ReactComponent as ICXIcon } from 'assets/tokens/ICX.svg';
import { ReactComponent as IUSDCIcon } from 'assets/tokens/IUSDC.svg';
import { ReactComponent as IUSDTIcon } from 'assets/tokens/IUSDT.svg';
import { ReactComponent as METXIcon } from 'assets/tokens/METX.svg';
import { ReactComponent as OMMIcon } from 'assets/tokens/OMM.svg';
import { ReactComponent as sICXIcon } from 'assets/tokens/sICX.svg';
import { ReactComponent as USDSIcon } from 'assets/tokens/USDS.svg';

export const CURRENCY = ['ICX', 'sICX', 'bnUSD', 'BALN', 'IUSDC', 'OMM', 'USDS', 'CFT', 'METX', 'IUSDT'];

export const CURRENCY_MAP = keyBy(CURRENCY);

export const currencyKeyToIconMap = {
  ICX: ICXIcon,
  sICX: sICXIcon,
  bnUSD: bnUSDIcon,
  BALN: BALNIcon,
  OMM: OMMIcon,
  IUSDC: IUSDCIcon,
  USDS: USDSIcon,
  CFT: CFTIcon,
  METX: METXIcon,
  IUSDT: IUSDTIcon,
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
    rewards: 0.05,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['sICX'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['sICX'], CURRENCY_MAP['bnUSD']),
    poolId: 2,
    name: toMarketName(CURRENCY_MAP['sICX'], CURRENCY_MAP['bnUSD']),
    rewards: 0.145,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['BALN'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['BALN'], CURRENCY_MAP['bnUSD']),
    poolId: 3,
    name: toMarketName(CURRENCY_MAP['BALN'], CURRENCY_MAP['bnUSD']),
    rewards: 0.145,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['BALN'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['BALN'], CURRENCY_MAP['sICX']),
    poolId: 4,
    name: toMarketName(CURRENCY_MAP['BALN'], CURRENCY_MAP['sICX']),
    rewards: 0.1,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['IUSDC'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['IUSDC'], CURRENCY_MAP['bnUSD']),
    name: toMarketName(CURRENCY_MAP['IUSDC'], CURRENCY_MAP['bnUSD']),
    poolId: 5,
    rewards: 0.025,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['IUSDT'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['IUSDT'], CURRENCY_MAP['bnUSD']),
    name: toMarketName(CURRENCY_MAP['IUSDT'], CURRENCY_MAP['bnUSD']),
    poolId: 15,
    rewards: 0.005,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['USDS'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['USDS'], CURRENCY_MAP['bnUSD']),
    name: toMarketName(CURRENCY_MAP['USDS'], CURRENCY_MAP['bnUSD']),
    poolId: 10,
    rewards: 0.02,
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
  {
    baseCurrencyKey: CURRENCY_MAP['OMM'],
    quoteCurrencyKey: CURRENCY_MAP['USDS'],
    pair: toMarketPair(CURRENCY_MAP['OMM'], CURRENCY_MAP['USDS']),
    name: toMarketName(CURRENCY_MAP['OMM'], CURRENCY_MAP['USDS']),
    poolId: 8,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['CFT'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['CFT'], CURRENCY_MAP['sICX']),
    name: toMarketName(CURRENCY_MAP['CFT'], CURRENCY_MAP['sICX']),
    poolId: 9,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['METX'],
    quoteCurrencyKey: CURRENCY_MAP['bnUSD'],
    pair: toMarketPair(CURRENCY_MAP['METX'], CURRENCY_MAP['bnUSD']),
    name: toMarketName(CURRENCY_MAP['METX'], CURRENCY_MAP['bnUSD']),
    poolId: 11,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['METX'],
    quoteCurrencyKey: CURRENCY_MAP['sICX'],
    pair: toMarketPair(CURRENCY_MAP['METX'], CURRENCY_MAP['sICX']),
    name: toMarketName(CURRENCY_MAP['METX'], CURRENCY_MAP['sICX']),
    poolId: 12,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['METX'],
    quoteCurrencyKey: CURRENCY_MAP['IUSDC'],
    pair: toMarketPair(CURRENCY_MAP['METX'], CURRENCY_MAP['IUSDC']),
    name: toMarketName(CURRENCY_MAP['METX'], CURRENCY_MAP['IUSDC']),
    poolId: 13,
  },
  {
    baseCurrencyKey: CURRENCY_MAP['METX'],
    quoteCurrencyKey: CURRENCY_MAP['USDS'],
    pair: toMarketPair(CURRENCY_MAP['METX'], CURRENCY_MAP['USDS']),
    name: toMarketName(CURRENCY_MAP['METX'], CURRENCY_MAP['USDS']),
    poolId: 14,
  },
];

export enum NetworkId {
  MAINNET = 1,
  YEOUIDO = 3,
  EULJIRO = 2,
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
    cx2e6d0fc0eca04965d06038c8406093337f085fcf: 'CFT',
    cx369a5f4ce4f4648dfc96ba0c8229be0693b4eca2: 'METX',
    cx3a36ea1f6b9aa3d2dd9cb68e8987bcc3aabaaa88: 'IUSDT',
  },
  [NetworkId.YEOUIDO]: {
    cxae6334850f13dfd8b50f8544d5acb126bb8ef82d: 'sICX',
    cxc48c9c81ceef04445c961c5cc8ff056d733dfe3a: 'bnUSD',
    cx36169736b39f59bf19e8950f6c8fa4bfa18b710a: 'BALN',
    cx0000000000000000000000000000000000000000: 'ICX',
    cx65f639254090820361da483df233f6d0e69af9b7: 'IUSDC',
    cxc0666df567a6e0b49342648e98ccbe5362b264ea: 'USDS',
    cx05515d126a47a98c682fa86992329e6c2ec70503: 'OMM',
    cxf7313d7fd611c99b8db29e298699be4b1fd86661: 'CFT',
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
    CFT: 'cx2e6d0fc0eca04965d06038c8406093337f085fcf',
    METX: 'cx369a5f4ce4f4648dfc96ba0c8229be0693b4eca2',
    IUSDT: 'cx3a36ea1f6b9aa3d2dd9cb68e8987bcc3aabaaa88',
  },
  [NetworkId.YEOUIDO]: {
    sICX: 'cxae6334850f13dfd8b50f8544d5acb126bb8ef82d',
    bnUSD: 'cxc48c9c81ceef04445c961c5cc8ff056d733dfe3a',
    BALN: 'cx36169736b39f59bf19e8950f6c8fa4bfa18b710a',
    ICX: 'cx0000000000000000000000000000000000000000',
    IUSDC: 'cx65f639254090820361da483df233f6d0e69af9b7',
    USDS: 'cxc0666df567a6e0b49342648e98ccbe5362b264ea',
    OMM: 'cx05515d126a47a98c682fa86992329e6c2ec70503',
    CFT: 'cxf7313d7fd611c99b8db29e298699be4b1fd86661',
  },
};
