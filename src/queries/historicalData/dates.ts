//months and days indexed from 0

import { Granularity } from './types';

export const DATES = {
  //btcb added to balanced collateral
  cx5b5a03cb525a1845d0af3a872d525b18a810acb0: new Date(2022, 8, 21).getTime(),
  //eth added to balanced collateral
  cx288d13e1b63563459a2ac6179f237711f6851cb5: new Date(2022, 11, 8).getTime(),
};

export const DATE_DEFAULT = new Date(2021, 3, 26).getTime();

export const DATE_STABILITY_FUND_LAUNCH = new Date(2022, 4, 13).getTime();

export const DEFAULT_GRANULARITY: Granularity = 'weekly';
