import BigNumber from 'bignumber.js';

import { formatUnits } from 'utils';

import { Granularity, HistoryForParams } from './types';
import { GRANULARITY_MILLISECONDS } from './utils';

export function getBitcoinCollateralParams(
  time: number,
  granularity: Granularity,
  backTicks: number,
): HistoryForParams {
  return {
    contract: 'Loans',
    method: 'getTotalCollateralDebt',
    methodParams: [
      { isNumber: false, value: 'BTCB' },
      { isNumber: false, value: 'bnUSD' },
    ],
    granularity: granularity,
    endTime: time,
    startTime: time - backTicks * GRANULARITY_MILLISECONDS[granularity],
    transformation: item => new BigNumber(formatUnits(item, 18, 2)).toNumber(),
  };
}
