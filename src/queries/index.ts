import axios from 'axios';
import BigNumber from 'bignumber.js';
import { BalancedJs } from 'packages/BalancedJs';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { CURRENCY_INFO, SUPPORTED_PAIRS, Pair, CurrencyKey, CURRENCY } from 'constants/currency';
import { ONE, ZERO } from 'constants/number';
import QUERY_KEYS from 'constants/queryKeys';

export const useBnJsContractQuery = <T>(bnJs: BalancedJs, contract: string, method: string, args: any[]) => {
  return useQuery<T, string>(QUERY_KEYS.BnJs(contract, method, args), async () => {
    return bnJs[contract][method](...args);
  });
};

export const useRatesQuery = () => {
  return useQuery<{ [key in CurrencyKey]: BigNumber }>('useRatesQuery', async () => {
    const ICXPricePromise: Promise<any> = bnJs.Band.getReferenceData({ _base: 'ICX', _quote: 'USD' }) //
      .then(res => res.rate);

    const [ICXPrice, sICXICXPrice, BALNbnUSDPrice] = (
      await Promise.all([
        ICXPricePromise, //
        bnJs.Staking.getTodayRate(),
        bnJs.Dex.getPrice(BalancedJs.utils.POOL_IDS.BALNbnUSD),
      ])
    ).map(res => BalancedJs.utils.toIcx(res));

    return {
      ICX: ICXPrice,
      sICX: sICXICXPrice.times(ICXPrice),
      BALN: BALNbnUSDPrice,
      bnUSD: ONE,
    };
  });
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
      time: item.time / 1_000,
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
      time: item.time / 1_000,
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

export const useStatsTVLQuery = () => {
  return useQuery<{ dexInICX: BigNumber; loansInsICX: BigNumber }>('stats/total-value-locked', async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/total-value-locked`);

    return {
      dexInICX: BalancedJs.utils.toIcx(data.dex_value_locked_icx),
      loansInsICX: BalancedJs.utils.toIcx(data.loans_value_locked_sicx),
    };
  });
};

export const useOverviewInfo = () => {
  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data;

  // TVL
  const tvlQuery = useStatsTVLQuery();
  let TVL: BigNumber | undefined;
  if (tvlQuery.isSuccess && ratesQuery.isSuccess && rates) {
    const tvl = tvlQuery.data;
    console.log(tvl.dexInICX.toFixed(), tvl.loansInsICX.toFixed());
    TVL = tvl.dexInICX.times(rates['ICX']).plus(tvl.loansInsICX.times(rates['sICX']));
  }

  // fees
  const feesQuery = useBnJsContractQuery<{ [key: string]: string }>(bnJs, 'Dividends', 'getBalances', []);
  let totalFees: BigNumber | undefined;
  if (feesQuery.isSuccess && ratesQuery.isSuccess && rates) {
    const fees = feesQuery.data;

    totalFees = CURRENCY.reduce((sum: BigNumber, currencyKey: string) => {
      return sum.plus(BalancedJs.utils.toIcx(fees[currencyKey]).times(rates[currencyKey]));
    }, ZERO);
  }

  // baln marketcap
  const totalSupplyQuery = useBnJsContractQuery<string>(bnJs, 'BALN', 'totalSupply', []);
  let BALNMarketCap: BigNumber | undefined;
  if (totalSupplyQuery.isSuccess && ratesQuery.isSuccess && rates) {
    BALNMarketCap = BalancedJs.utils.toIcx(totalSupplyQuery.data).times(rates['BALN']);
  }

  // transactions
  const statsTotalTransactionsQuery = useStatsTotalTransactionsQuery();
  const statsTotalTransactions = statsTotalTransactionsQuery.isSuccess ? statsTotalTransactionsQuery.data : null;

  return {
    TVL: TVL?.integerValue(),
    BALNMarketCap: BALNMarketCap?.integerValue(),
    fees: totalFees?.integerValue(),
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

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};

  const daofund = daofundQuery.isSuccess
    ? CURRENCY.reduce((sum: BigNumber | null, currencyKey: string) => {
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

export const useAllTokensTotalSupplyQuery = () => {
  const fetch = async () => {
    const data: Array<string> = await Promise.all(
      Object.keys(CURRENCY_INFO).map(currencyKey => bnJs[currencyKey].totalSupply()),
    );

    const t: { [key: string]: BigNumber } = {};
    Object.keys(CURRENCY_INFO).forEach((currencyKey, index) => {
      t[currencyKey] = BalancedJs.utils.toIcx(data[index]).integerValue();
    });

    return t;
  };

  return useQuery('useAllTokensTotalSupplyQuery', fetch);
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
  const ratesQuery = useRatesQuery();
  const totalSuppliesQuery = useAllTokensTotalSupplyQuery();

  if (ratesQuery.isSuccess && totalSuppliesQuery.isSuccess) {
    const rates = ratesQuery.data || {};
    const totalSupplies = totalSuppliesQuery.data || {};

    Object.keys(CURRENCY_INFO).forEach(currencyKey => {
      allTokens[currencyKey] = {
        ...CURRENCY_INFO[currencyKey],
        price: rates[currencyKey].toNumber(),
        totalSupply: totalSupplies[currencyKey].toNumber(),
        marketCap: totalSupplies[currencyKey].times(rates[currencyKey]).toNumber(),
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

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};

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

export const useLoanInfo = () => {
  const totalLoansQuery = useBnJsContractQuery<string>(bnJs, 'bnUSD', 'totalSupply', []);
  const totalLoans = totalLoansQuery.isSuccess ? BalancedJs.utils.toIcx(totalLoansQuery.data) : null;

  const dailyDistributionQuery = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const dailyRewards = dailyDistributionQuery.isSuccess
    ? BalancedJs.utils.toIcx(dailyDistributionQuery.data).times(0.25)
    : null;

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};

  const loansAPY =
    dailyRewards && totalLoans && rates['BALN'] ? dailyRewards.times(365).times(rates['BALN']).div(totalLoans) : null;

  const borrowersQuery = useBnJsContractQuery<string>(bnJs, 'Loans', 'getNonzeroPositionCount', []);
  const borrowers = borrowersQuery.isSuccess ? new BigNumber(borrowersQuery.data) : null;

  return {
    totalLoans: totalLoans?.toNumber(),
    loansAPY: loansAPY?.toNumber(),
    dailyRewards: dailyRewards?.toNumber(),
    borrowers: borrowers?.toNumber(),
  };
};

export const useAllPairsAPY = () => {
  const tvls = useAllPairsTVL();
  const { data: rates } = useRatesQuery();

  if (tvls && rates) {
    const t = {};
    SUPPORTED_PAIRS.forEach(pair => {
      t[pair.name] = new BigNumber(pair.rewards || 0).times(365).times(rates['BALN']).div(tvls[pair.name]);
    });
    return t;
  }

  return;
};

export const useAllPairsTVLQuery = () => {
  return useQuery<{ [key: string]: { base: BigNumber; quote: BigNumber; total_supply: BigNumber } }>(
    'useAllPairsTVLQuery',
    async () => {
      const res: Array<any> = await Promise.all(
        SUPPORTED_PAIRS.map(async pair => {
          const { data } = await axios.get(`${API_ENDPOINT}/dex/stats/${pair.poolId}`);
          return data;
        }),
      );
      console.log(res);
      const t = {};
      SUPPORTED_PAIRS.forEach((pair, index) => {
        const item = res[index];
        t[pair.name] = {
          ...item,
          base: BalancedJs.utils.toIcx(item.base),
          quote: BalancedJs.utils.toIcx(item.quote),
          total_supply: BalancedJs.utils.toIcx(item.total_supply),
        };
      });

      return t;
    },
  );
};

export const useAllPairsTVL = () => {
  const tvlQuery = useAllPairsTVLQuery();
  const ratesQuery = useRatesQuery();

  if (tvlQuery.isSuccess && ratesQuery.isSuccess) {
    const rates = ratesQuery.data || {};
    const tvls = tvlQuery.data || {};

    const t = {};
    SUPPORTED_PAIRS.forEach(pair => {
      const baseTVL = tvls[pair.name].base.times(rates[pair.baseCurrencyKey]);
      const quoteTVL = tvls[pair.name].quote.times(rates[pair.quoteCurrencyKey]);
      t[pair.name] = baseTVL.plus(quoteTVL);
    });

    return t;
  }

  return;
};

export const useAllPairsParticipantQuery = () => {
  return useQuery<{ [key: string]: number }>('useAllPairsParticipantQuery', async () => {
    const res: Array<string> = await Promise.all(SUPPORTED_PAIRS.map(pair => bnJs.Dex.totalDexAddresses(pair.poolId)));

    const t = {};
    SUPPORTED_PAIRS.forEach((pair, index) => {
      t[pair.name] = parseInt(res[index]);
    });

    return t;
  });
};

export const useAllPairs = () => {
  const apys = useAllPairsAPY();
  const tvls = useAllPairsTVL();
  const participantQuery = useAllPairsParticipantQuery();

  const t: { [key: string]: Pair & { tvl: number; apy: number; participant: number } } = {};

  if (apys && participantQuery.isSuccess && tvls) {
    const participants = participantQuery.data;

    SUPPORTED_PAIRS.forEach(pair => {
      t[pair.name] = {
        ...pair,
        tvl: tvls[pair.name],
        apy: apys[pair.name],
        participant: participants[pair.name],
      };
    });
    return t;
  } else return null;
};
