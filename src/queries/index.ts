import React from 'react';

import axios from 'axios';
import BigNumber from 'bignumber.js';
import { BalancedJs } from 'packages/BalancedJs';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { CURRENCY_INFO, BASE_SUPPORTED_PAIRS, Pair } from 'constants/currency';
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

const API_ENDPOINT = process.env.NODE_ENV === 'production' ? 'https://balanced.geometry.io/api/v1' : '/api/v1';

const LAUNCH_DAY = 1619398800000000;
const ONE_DAY = 86400000000;

export const useCollateralChartDataQuery = (
  start: number = LAUNCH_DAY,
  end: number = new Date().valueOf() * 1_000,
  interval: number = ONE_DAY,
) => {
  return useQuery<{ time: number; value: number }[]>('collateral-chart-data', async () => {
    const { data }: { data: { time: number; value: string }[] } = await axios.get(
      `${API_ENDPOINT}/stats/collateral-chart?start_timestamp=${start}&end_timestamp=${end}&time_interval=${interval}`,
    );

    return data.map(item => ({
      time: item.time / 1_000_000,
      value: BalancedJs.utils.toIcx(item.value).integerValue().toNumber(),
    }));
  });
};

export const useLoanChartDataQuery = (
  start: number = LAUNCH_DAY,
  end: number = new Date().valueOf() * 1_000,
  interval: number = ONE_DAY,
) => {
  return useQuery<{ time: number; value: number }[]>('loan-chart-data', async () => {
    const { data }: { data: { time: number; value: string }[] } = await axios.get(
      `${API_ENDPOINT}/stats/loans-chart?start_timestamp=${start}&end_timestamp=${end}&time_interval=${interval}`,
    );

    return data.map(item => ({
      time: item.time / 1_000_000,
      value: BalancedJs.utils.toIcx(item.value).integerValue().toNumber(),
    }));
  });
};

export const useStatsTotalTransactionsQuery = () => {
  return useQuery<{ [key: string]: number }>('stats/total-transactions', async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/total-transactions`);
    return data;
  });
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

  // transactions
  const statsTotalTransactionsQuery = useStatsTotalTransactionsQuery();
  const statsTotalTransactions = statsTotalTransactionsQuery.isSuccess ? statsTotalTransactionsQuery.data : null;

  return {
    TVL: TVL?.integerValue(),
    BALNMarketCap: BALNMarketCap?.integerValue(),
    fees: fees?.integerValue(),
    transactions: statsTotalTransactions,
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
    dailyDistribution: dailyDistribution?.integerValue().toNumber(),
    totalStakedBALN: totalStakedBALN?.integerValue().toNumber(),
    daofund: daofund?.integerValue(),
  };
};

export const usePrices = () => {
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

export const useTotalSupplies = () => {
  const [totalSupplies, setTotalSupplies] = React.useState<{ [key: string]: BigNumber }>();

  React.useEffect(() => {
    const fetch = async () => {
      const data: Array<string> = await Promise.all(
        Object.keys(CURRENCY_INFO).map(currencyKey => bnJs[currencyKey].totalSupply()),
      );

      const t: { [key: string]: BigNumber } = {};
      Object.keys(CURRENCY_INFO).forEach((currencyKey, index) => {
        t[currencyKey] = BalancedJs.utils.toIcx(data[index]).integerValue();
      });

      setTotalSupplies(t);
    };

    fetch();
  }, []);

  return totalSupplies;
};

type Token = {
  name: string;
  symbol: string;
  price: number;
  totalSupply: number;
  marketCap: number | null;
};

export const useAllTokens = () => {
  const allTokens: { [key: string]: Token } = {};

  const prices = usePrices();

  const totalSupplies = useTotalSupplies();

  if (prices && totalSupplies) {
    Object.keys(CURRENCY_INFO).forEach(currencyKey => {
      allTokens[currencyKey] = {
        ...CURRENCY_INFO[currencyKey],
        price: prices[currencyKey] ? prices[currencyKey].toNumber() : null,
        totalSupply: totalSupplies[currencyKey].toNumber(),
        marketCap:
          prices[currencyKey] && totalSupplies[currencyKey]
            ? totalSupplies[currencyKey].times(prices[currencyKey]).toNumber()
            : null,
      };
    });
    return allTokens;
  }

  return null;
};

export const useCollateralInfo = () => {
  const rateQuery = useBnJsContractQuery<string>(bnJs, 'Staking', 'getTodayRate', []);
  const rate = rateQuery.isSuccess ? BalancedJs.utils.toIcx(rateQuery.data) : null;

  const totalCollateralQuery = useBnJsContractQuery<string>(bnJs, 'Loans', 'getTotalCollateral', []);
  const totalCollateral = totalCollateralQuery.isSuccess ? BalancedJs.utils.toIcx(totalCollateralQuery.data) : null;

  const rates = useRates();

  // loan TVL
  const totalCollateralTVL =
    totalCollateralQuery.isSuccess && rates['sICX']
      ? BalancedJs.utils.toIcx(totalCollateralQuery.data).times(rates['sICX'])
      : null;

  return {
    totalCollateral: totalCollateral?.toNumber(),
    totalCollateralTVL: totalCollateralTVL?.toNumber(),
    rate: rate?.toNumber(),
    depositors: null,
  };
};

export const useLoansInfo = () => {
  const totalLoansQuery = useBnJsContractQuery<string>(bnJs, 'bnUSD', 'totalSupply', []);
  const totalLoans = totalLoansQuery.isSuccess ? BalancedJs.utils.toIcx(totalLoansQuery.data) : null;

  const dailyDistributionQuery = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const dailyRewards = dailyDistributionQuery.isSuccess
    ? BalancedJs.utils.toIcx(dailyDistributionQuery.data).times(0.25)
    : null;

  const rates = useRates();

  const loansAPY =
    dailyRewards && totalLoans && rates['BALN'] ? dailyRewards.times(365).times(rates['BALN']).div(totalLoans) : null;

  return {
    totalLoans: totalLoans?.toNumber(),
    loansAPY: loansAPY?.toNumber(),
    dailyRewards: dailyRewards?.toNumber(),
    borrowers: null,
  };
};

export const useAllPairsAPYQuery = () => {
  return useQuery<{ [key: string]: number }>('useAPYs', async () => {
    const res: Array<string> = await Promise.all(
      BASE_SUPPORTED_PAIRS.map(pair => bnJs.Rewards.getAPY(`${pair.baseCurrencyKey}/${pair.quoteCurrencyKey}`)),
    );

    const t = {};
    BASE_SUPPORTED_PAIRS.forEach((pair, index) => {
      t[`${pair.baseCurrencyKey}/${pair.quoteCurrencyKey}`] = BalancedJs.utils.toIcx(res[index]).toNumber();
    });

    return t;
  });
};

export const useAllPairsTVL = () => {
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
  const pool1TVL =
    pool1Query.isSuccess && rates['ICX'] ? BalancedJs.utils.toIcx(pool1Query.data).times(rates['ICX']) : null;
  const pool2TVL = pool2Query.isSuccess ? BalancedJs.utils.toIcx(pool2Query.data).times(2) : null;
  const pool3TVL = pool3Query.isSuccess ? BalancedJs.utils.toIcx(pool3Query.data).times(2) : null;

  return {
    'sICX/ICX': pool1TVL?.toNumber(),
    'sICX/bnUSD': pool2TVL?.toNumber(),
    'BALN/bnUSD': pool3TVL?.toNumber(),
  };
};

export const useAllPairs = () => {
  const apysQuery = useAllPairsAPYQuery();
  const tvls = useAllPairsTVL();

  const t: { [key: string]: Pair & { tvl: number; apy: number } } = {};
  if (apysQuery.isSuccess) {
    const apys = apysQuery.data;
    BASE_SUPPORTED_PAIRS.forEach(pair => {
      t[`${pair.baseCurrencyKey}/${pair.quoteCurrencyKey}`] = {
        ...pair,
        tvl: tvls[`${pair.baseCurrencyKey}/${pair.quoteCurrencyKey}`],
        apy: apys[`${pair.baseCurrencyKey}/${pair.quoteCurrencyKey}`],
      };
    });
    return t;
  } else return null;
};
