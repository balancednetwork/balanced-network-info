import { addresses, CallData } from '@balancednetwork/balanced-js';
import { useQuery, UseQueryResult } from 'react-query';

import bnJs from 'bnJs';
import { NETWORK_ID } from 'constants/config';
import { formatUnits } from 'utils';

export function useTokensCollateralData() {
  const { data: supportedTokens } = useSupportedCollateralTokens();
  console.log(supportedTokens);
  return supportedTokens;
}

export function useSupportedCollateralTokens(): UseQueryResult<{ [key in string]: string }> {
  return useQuery('getCollateralTokens', async () => {
    const data = await bnJs.Loans.getCollateralTokens();

    const cds: CallData[] = Object.keys(data).map(symbol => ({
      target: addresses[NETWORK_ID].loans,
      method: 'getDebtCeiling',
      params: [symbol],
    }));

    const debtCeilingsData = await bnJs.Multicall.getAggregateData(cds);
    const debtCeilings = debtCeilingsData.map(ceiling => parseInt(formatUnits(ceiling)));

    const supportedTokens = {};
    Object.keys(data).forEach((symbol, index) => {
      if (debtCeilings[index] > 0) {
        supportedTokens[symbol] = data[symbol];
      }
    });

    return supportedTokens;
  });
}
