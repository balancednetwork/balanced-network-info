import BigNumber from 'bignumber.js';
import { BalancedJs } from 'packages/BalancedJs';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { ONE, ZERO } from 'constants/number';
import QUERY_KEYS from 'constants/queryKeys';

export const useBnJsContractQuery = <T>(bnJs: BalancedJs, contract: string, method: string, args: any[]) => {
  return useQuery<T, string>(QUERY_KEYS.BnJs(contract, method, args), async () => {
    return bnJs[contract][method](...args);
  });
};

export const useRates = () => {
  const ICXPriceQuery = useBnJsContractQuery<{ rate: string }>(bnJs, 'Band', 'getReferenceData', [
    { _base: 'ICX', _quote: 'USD' },
  ]);
  const sICXICXPriceQuery = useBnJsContractQuery<string>(bnJs, 'Staking', 'getTodayRate', []);
  // const sICXPriceQuery = useBnJsContractQuery<string>(bnJs, 'Dex', 'getPrice', [BalancedJs.utils.POOL_IDS.sICXbnUSD]);
  const BALNPriceQuery = useBnJsContractQuery<string>(bnJs, 'Dex', 'getPrice', [BalancedJs.utils.POOL_IDS.BALNbnUSD]);

  return {
    ICX: ICXPriceQuery.isSuccess ? BalancedJs.utils.toIcx(ICXPriceQuery.data.rate) : null,
    sICX:
      sICXICXPriceQuery.isSuccess && ICXPriceQuery.isSuccess
        ? BalancedJs.utils.toIcx(sICXICXPriceQuery.data).times(BalancedJs.utils.toIcx(ICXPriceQuery.data.rate))
        : null,
    BALN: BALNPriceQuery.isSuccess ? BalancedJs.utils.toIcx(BALNPriceQuery.data) : null,
    bnUSD: ONE,
  };
};

export const useOverviewInfo = () => {
  // loan
  const loanTVLQuery = useBnJsContractQuery<string>(bnJs, 'Loans', 'getTotalCollateral', []);

  // dex
  const pool1Query = useBnJsContractQuery<string>(bnJs, 'Dex', 'totalSupply', [BalancedJs.utils.POOL_IDS.sICXICX]);
  const pool2Query = useBnJsContractQuery<string>(bnJs, 'Dex', 'getPoolTotal', [
    BalancedJs.utils.POOL_IDS.sICXbnUSD,
    'cx88fd7df7ddff82f7cc735c871dc519838cb235bb',
  ]);
  const pool3Query = useBnJsContractQuery<string>(bnJs, 'Dex', 'getPoolTotal', [
    BalancedJs.utils.POOL_IDS.BALNbnUSD,
    'cx88fd7df7ddff82f7cc735c871dc519838cb235bb',
  ]);

  const rates = useRates();

  // loan TVL
  const loanTVL =
    loanTVLQuery.isSuccess && rates['sICX'] ? BalancedJs.utils.toIcx(loanTVLQuery.data).times(rates['sICX']) : null;

  // dex TVL
  const poo1TVL =
    pool1Query.isSuccess && rates['ICX'] ? BalancedJs.utils.toIcx(pool1Query.data).times(rates['ICX']) : null;
  const pool2TVL = pool2Query.isSuccess ? BalancedJs.utils.toIcx(pool2Query.data).times(2) : null;
  const pool3TVL = pool3Query.isSuccess ? BalancedJs.utils.toIcx(pool3Query.data).times(2) : null;
  const dexTVL = poo1TVL && pool2TVL && pool3TVL ? poo1TVL.plus(pool2TVL).plus(pool3TVL) : null;

  // TVL
  const TVL = loanTVL && dexTVL ? loanTVL.plus(dexTVL) : null;

  // fees
  const feesQuery = useBnJsContractQuery<{ [key: string]: string }>(bnJs, 'Dividends', 'getBalances', []);

  const fees = feesQuery.isSuccess
    ? ['sICX', 'bnUSD', 'BALN', 'ICX'].reduce((sum: BigNumber | null, currencyKey: string) => {
        if (sum && rates[currencyKey] && feesQuery.data[currencyKey])
          return sum.plus(BalancedJs.utils.toIcx(feesQuery.data[currencyKey]).times(rates[currencyKey]));
        else return null;
      }, ZERO)
    : null;

  // baln marketcap
  const totalSupplyQuery = useBnJsContractQuery<string>(bnJs, 'BALN', 'totalSupply', []);
  const BALNMarketCap =
    totalSupplyQuery.isSuccess && rates['BALN']
      ? BalancedJs.utils.toIcx(totalSupplyQuery.data).times(rates['BALN'])
      : null;

  return {
    TVL: TVL?.integerValue(),
    BALNMarketCap: BALNMarketCap?.integerValue(),
    fees: fees?.integerValue(),
    transactions: null,
  };
};

export const useGovernanceInfo = () => {
  const dailyDistributionQuery = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const totalStakedBALNQuery = useBnJsContractQuery<string>(bnJs, 'BALN', 'totalStakedBalance', []);
  const daofundQuery = useBnJsContractQuery<string>(bnJs, 'Daofund', 'getBalances', []);

  const dailyDistribution = dailyDistributionQuery.isSuccess
    ? BalancedJs.utils.toIcx(dailyDistributionQuery.data)
    : null;

  const totalStakedBALN = totalStakedBALNQuery.isSuccess ? BalancedJs.utils.toIcx(totalStakedBALNQuery.data) : null;

  const rates = useRates();

  const daofund = daofundQuery.isSuccess
    ? ['sICX', 'bnUSD', 'BALN', 'ICX'].reduce((sum: BigNumber | null, currencyKey: string) => {
        if (sum && rates[currencyKey] && daofundQuery.data[currencyKey])
          return sum.plus(BalancedJs.utils.toIcx(daofundQuery.data[currencyKey]).times(rates[currencyKey]));
        else return null;
      }, ZERO)
    : null;

  return {
    dailyDistribution: dailyDistribution?.integerValue(),
    totalStakedBALN: totalStakedBALN?.integerValue(),
    daofund: daofund?.integerValue(),
  };
};

export const useAllTokens = async () => {
  const allTokens = {};

  ['sICX', 'bnUSD', 'BALN', 'ICX'].forEach(async currencyKey => {
    const [name, symbol, totalSupply] = await Promise.all[
      (bnJs[currencyKey].name(), bnJs[currencyKey].symbol(), bnJs[currencyKey].totalSupply())
    ];

    allTokens[currencyKey] = {
      name: name,
      symbol: symbol,
      totalSupply: BalancedJs.utils.toIcx(totalSupply),
    };
  });

  return allTokens;
};
