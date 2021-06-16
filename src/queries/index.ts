import axios from 'axios';
import BigNumber from 'bignumber.js';
import { BalancedJs } from 'packages/BalancedJs';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { CURRENCY_INFO, SUPPORTED_PAIRS, Pair, CurrencyKey, CURRENCY } from 'constants/currency';
import { ONE, ZERO } from 'constants/number';
import QUERY_KEYS from 'constants/queryKeys';
import { calculateFees } from 'utils';

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

export const useStatsTVL = () => {
  const dexTVL = useDexTVL();
  const collateralInfo = useCollateralInfo();

  if (dexTVL && collateralInfo && collateralInfo.totalCollateralTVL) return dexTVL + collateralInfo.totalCollateralTVL;

  return;
};

export const useOverviewInfo = () => {
  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data;

  // TVL
  const tvl = useStatsTVL();

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
    TVL: tvl,
    BALNMarketCap: BALNMarketCap?.integerValue().toNumber(),
    fees: totalFees?.integerValue().toNumber(),
    transactions: statsTotalTransactions,
  };
};

export const useGovernanceNumOfStakersQuery = () => {
  return useQuery<number>('total-balanced-token-stakers', async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/total-balanced-token-stakers`);
    return data.total_balanced_token_stakers;
  });
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

  const numOfStakersQuery = useGovernanceNumOfStakersQuery();

  return {
    dailyDistribution: dailyDistribution?.integerValue().toNumber(),
    totalStakedBALN: totalStakedBALN?.integerValue().toNumber(),
    daofund: daofund?.integerValue().toNumber(),
    numOfStakers: numOfStakersQuery.data,
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
  holders: number;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  totalSupply: number;
  marketCap: number;
};

export const useAllTokensQuery = () => {
  const fetch = async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/token-stats`);

    const timestamp = data.timestamp;

    const tokens: { [key in string]: Token } = {};
    const _tokens = data.tokens;
    Object.keys(_tokens).forEach(tokenKey => {
      const _token = _tokens[tokenKey];
      const token = {
        ..._token,
        price: BalancedJs.utils.toIcx(_token.price).toNumber(),
        totalSupply: BalancedJs.utils.toIcx(_token.total_supply).toNumber(),
        marketCap: BalancedJs.utils.toIcx(_token.total_supply).times(BalancedJs.utils.toIcx(_token.price)).toNumber(),
        priceChange: _token.price_change,
      };
      tokens[tokenKey] = token;
    });

    return {
      timestamp: timestamp,
      tokens: tokens,
    };
  };

  return useQuery<{ timestamp: number; tokens: { [key in string]: Token } }>('useAllTokensQuery', fetch);
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
    totalCollateral: totalCollateral?.integerValue().toNumber(),
    totalCollateralTVL: totalCollateralTVL?.integerValue().toNumber(),
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

    const t: { [key in string]: number } = {};
    SUPPORTED_PAIRS.forEach(pair => {
      const baseTVL = tvls[pair.name].base.times(rates[pair.baseCurrencyKey]);
      const quoteTVL = tvls[pair.name].quote.times(rates[pair.quoteCurrencyKey]);
      t[pair.name] = baseTVL.plus(quoteTVL).integerValue().toNumber();
    });

    return t;
  }

  return;
};

export const useAllPairsVolumeQuery = () => {
  return useQuery<{ [key: string]: { base: BigNumber; quote: BigNumber } }>('useAllPairsVolumeQuery', async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/exchange-volume-24h`);

    const volumes = {};
    Object.keys(data).forEach(key => {
      const _volume = data[key];
      const volume = {
        base: BalancedJs.utils.toIcx(_volume.base_volume),
        quote: BalancedJs.utils.toIcx(_volume.quote_volume),
      };
      volumes[key] = volume;
    });
    return volumes;
  });
};

export const useAllPairsVolume = () => {
  const volumesQuery = useAllPairsVolumeQuery();
  const ratesQuery = useRatesQuery();

  if (volumesQuery.isSuccess && ratesQuery.isSuccess) {
    const rates = ratesQuery.data || {};
    const volumes = volumesQuery.data || {};

    const t: { [key in string]: number } = {};
    SUPPORTED_PAIRS.forEach(pair => {
      const baseVol = volumes[pair.name].base.times(rates[pair.baseCurrencyKey]);
      const quoteVol = volumes[pair.name].quote.times(rates[pair.quoteCurrencyKey]);
      t[pair.name] = baseVol.plus(quoteVol).integerValue().toNumber();
    });

    return t;
  }

  return;
};

export const useDexTVL = () => {
  const tvls = useAllPairsTVL();

  if (tvls) {
    return SUPPORTED_PAIRS.reduce((sum: number, pair) => {
      return sum + tvls[pair.name];
    }, 0);
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
  const volumes = useAllPairsVolume();
  const participantQuery = useAllPairsParticipantQuery();

  const t: { [key: string]: Pair & { tvl: number; apy: number; participant: number; volume: number } } = {};

  if (apys && participantQuery.isSuccess && tvls && volumes) {
    const participants = participantQuery.data;

    SUPPORTED_PAIRS.forEach(pair => {
      t[pair.name] = {
        ...pair,
        tvl: tvls[pair.name],
        apy: apys[pair.name],
        participant: participants[pair.name],
        volume: volumes[pair.name],
      };
    });
    return t;
  } else return null;
};

export const useAllPairsTotal = () => {
  const allPairs = useAllPairs();

  if (allPairs) {
    return Object.values(allPairs).reduce(
      (total, pair) => {
        total.participant += pair.participant;
        total.tvl += pair.tvl;
        total.volume += pair.volume;
        total.fees += calculateFees(pair);
        return total;
      },
      { participant: 0, tvl: 0, volume: 0, fees: 0 },
    );
  }

  return;
};
