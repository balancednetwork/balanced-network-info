import { useMemo } from 'react';

import { addresses, CallData } from '@balancednetwork/balanced-js';
import BigNumber from 'bignumber.js';
import { useDispatch, useSelector } from 'react-redux';

import bnJs from 'bnJs';
import { NETWORK_ID } from 'constants/config';
import useInterval from 'hooks/useInterval';
import { useSupportedCollateralTokens } from 'store/collateral/hooks';
import { formatUnits } from 'utils';

import { AppState } from '..';
import { changeOraclePrice } from './actions';

export function useOraclePrices() {
  return useSelector((state: AppState) => state.oracle.prices);
}

// fetch price data every 5 secs
const PERIOD = 5 * 1000;

export function useFetchOraclePrices() {
  const { data: supportedCollateralTokens } = useSupportedCollateralTokens();
  const dispatch = useDispatch();
  const supportedSymbols = useMemo(() => supportedCollateralTokens && Object.keys(supportedCollateralTokens), [
    supportedCollateralTokens,
  ]);

  useInterval(async () => {
    if (supportedSymbols) {
      const cds: CallData[] = supportedSymbols.map(symbol => {
        return {
          target: addresses[NETWORK_ID].balancedOracle,
          method: 'getLastPriceInLoop',
          params: [symbol],
        };
      });

      cds.push({
        target: addresses[NETWORK_ID].balancedOracle,
        method: 'getLastPriceInLoop',
        params: ['ICX'],
      });

      cds.push({
        target: addresses[NETWORK_ID].balancedOracle,
        method: 'getLastPriceInLoop',
        params: ['USD'],
      });

      const data: string[] = await bnJs.Multicall.getAggregateData(cds);
      const USDloop = data.pop() || '';

      data.forEach((price, index) => {
        if (index < data.length - 1) {
          price != null &&
            dispatch(
              changeOraclePrice({
                symbol: supportedSymbols[index],
                price: new BigNumber(formatUnits(price, 18, 6)).dividedBy(new BigNumber(formatUnits(USDloop, 18, 6))),
              }),
            );
        } else {
          price != null &&
            dispatch(
              changeOraclePrice({
                symbol: 'ICX',
                price: new BigNumber(formatUnits(price, 18, 6)).dividedBy(new BigNumber(formatUnits(USDloop, 18, 6))),
              }),
            );
        }
      });
    }
  }, PERIOD);
}
