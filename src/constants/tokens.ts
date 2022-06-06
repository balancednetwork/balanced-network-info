import { Token, Currency } from 'types/balanced-sdk-core/index';

export const NULL_CONTRACT_ADDRESS = 'cx0000000000000000000000000000000000000000';

const NETWORK_ID = 1;

export const isNativeCurrency = (token?: Currency): boolean => {
  return token instanceof Token && token.address === ICX.address;
};

export const isBALN = (token?: Currency): boolean => {
  return token instanceof Token && token.address === BALN.address;
};

export const ICX = new Token(NETWORK_ID, NULL_CONTRACT_ADDRESS, 18, 'ICX', 'ICX');
export const sICX = new Token(NETWORK_ID, 'cx2609b924e33ef00b648a409245c7ea394c467824', 18, 'sICX', 'Staked ICX');
export const bnUSD = new Token(
  NETWORK_ID,
  'cx88fd7df7ddff82f7cc735c871dc519838cb235bb',
  18,
  'bnUSD',
  'Balanced Dollar',
);
export const BALN = new Token(NETWORK_ID, 'cxf61cd5a45dc9f91c15aa65831a30a90d59a09619', 18, 'BALN', 'Balance Token');
export const IUSDC = new Token(NETWORK_ID, 'cxae3034235540b924dfcc1b45836c293dcc82bfb7', 6, 'IUSDC', 'ICON USD Coin');
export const USDS = new Token(NETWORK_ID, 'cxbb2871f468a3008f80b08fdde5b8b951583acf06', 18, 'USDS', 'Stably USD');
export const OMM = new Token(NETWORK_ID, 'cx1a29259a59f463a67bb2ef84398b30ca56b5830a', 18, 'OMM', 'Omm Token');
export const CFT = new Token(NETWORK_ID, 'cx2e6d0fc0eca04965d06038c8406093337f085fcf', 18, 'CFT', 'Craft');
export const METX = new Token(NETWORK_ID, 'cx369a5f4ce4f4648dfc96ba0c8229be0693b4eca2', 18, 'METX', 'Metanyx');
export const IUSDT = new Token(NETWORK_ID, 'cx3a36ea1f6b9aa3d2dd9cb68e8987bcc3aabaaa88', 6, 'IUSDT', 'ICON Tether');
export const GBET = new Token(NETWORK_ID, 'cx6139a27c15f1653471ffba0b4b88dc15de7e3267', 18, 'GBET', 'GangstaBet Token');

export const SUPPORTED_TOKENS: { [chainId: number]: Token[] } = {
  [NETWORK_ID]: [ICX, sICX, bnUSD, BALN, IUSDC, OMM, USDS, CFT, METX, IUSDT, GBET],
};

export const SUPPORTED_TOKENS_LIST = SUPPORTED_TOKENS[NETWORK_ID];

export const SUPPORTED_TOKENS_MAP_BY_ADDRESS: {
  [key: string]: Currency;
} = SUPPORTED_TOKENS_LIST.reduce((prev, cur) => {
  prev[cur.address] = cur;
  return prev;
}, {});

export interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: {
    readonly [key: string]: string | number | boolean | null;
  };
}
