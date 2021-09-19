import axios from 'axios';
import BigNumber from 'bignumber.js';
import { BalancedJs } from 'packages/BalancedJs';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import {
  SUPPORTED_PAIRS,
  Pair,
  CURRENCY,
  addressToCurrencyKeyMap,
  NetworkId,
  currencyKeyToAddressMap,
} from 'constants/currency';
import { ZERO } from 'constants/number';
import QUERY_KEYS from 'constants/queryKeys';

export const useBnJsContractQuery = <T>(bnJs: BalancedJs, contract: string, method: string, args: any[]) => {
  return useQuery<T, string>(QUERY_KEYS.BnJs(contract, method, args), async () => {
    return bnJs[contract][method](...args);
  });
};

export const useRatesQuery = () => {
  const fetch = async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/token-stats`);

    const rates: { [key in string]: BigNumber } = {};
    const _tokens = data.tokens;
    Object.keys(_tokens).forEach(tokenKey => {
      rates[tokenKey] = BalancedJs.utils.toIcx(_tokens[tokenKey].price);
    });

    return rates;
  };

  return useQuery<{ [key in string]: BigNumber }>('useRatesQuery', fetch);
};

export const useRatesLazyQuery = () => {
  const fetch = async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/token-stats`);

    const rates: { [key in string]: BigNumber } = {};
    const _tokens = data.tokens;
    Object.keys(_tokens).forEach(tokenKey => {
      rates[tokenKey] = BalancedJs.utils.toIcx(_tokens[tokenKey].price);
    });

    return rates;
  };

  return useQuery<{ [key in string]: BigNumber }>('useRatesQuery', fetch);
};

const API_ENDPOINT = process.env.NODE_ENV === 'production' ? 'https://balanced.geometry.io/api/v1' : '/api/v1';

const LAUNCH_DAY = 1619398800000000;
const ONE_DAY = 86400000000;

const contractToSymbolMap = {
  cx88fd7df7ddff82f7cc735c871dc519838cb235bb: 'bnUSD',
  cx2609b924e33ef00b648a409245c7ea394c467824: 'sICX',
  cxf61cd5a45dc9f91c15aa65831a30a90d59a09619: 'BALN',
};

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

export const useHoldingsDataQuery = (timestamp: number = -1) => {
  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  return useQuery('balance-sheet-data', async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/daofund-balance-sheet?timestamp=${timestamp}`);

    const mappedData = Object.keys(data).map(contract => {
      const tokenCount = BalancedJs.utils.toIcx(data[contract], contractToSymbolMap[contract]);
      return {
        symbol: contractToSymbolMap[contract],
        tokens: tokenCount,
        value: tokenCount.times((rates && rates[contractToSymbolMap[contract]]) || 0),
      };
    });

    return mappedData;
  });
};

export const useEarningsDataQuery = (
  start: number = LAUNCH_DAY,
  end: number = new Date().valueOf() * 1_000,
  cacheItem: string = 'earnings-data',
) => {
  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  return useQuery(cacheItem, async () => {
    const { data } = await axios.get(
      `${API_ENDPOINT}/stats/income-statement?start_timestamp=${start}&end_timestamp=${end}`,
    );

    const tokenCount = BalancedJs.utils.toIcx(data.income.loans_fees, 'bnUSD');

    data.income.loans_fees = tokenCount;
    data.income.loans_fees_USD = tokenCount.times((rates && rates['bnUSD']) || 0);

    return data;
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

const useEarnedFeesQuery = () => {
  return useQuery<{ [key in string]: BigNumber }>('stats/dividends-fees', async () => {
    const { data }: { data: { [key in string]: string } } = await axios.get(`${API_ENDPOINT}/stats/dividends-fees`);

    const t: { [key in string]: BigNumber } = {};
    Object.keys(data).forEach(address => {
      t[addressToCurrencyKeyMap[NetworkId.MAINNET][address]] = BalancedJs.utils.toIcx(
        data[address]['total'],
        addressToCurrencyKeyMap[NetworkId.MAINNET][address],
      );
    });

    return t;
  });
};

export const useOverviewInfo = () => {
  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data;

  // TVL
  const tvl = useStatsTVL();

  // fees
  const feesQuery = useEarnedFeesQuery();
  let totalFees: BigNumber | undefined;
  if (feesQuery.isSuccess && ratesQuery.isSuccess && rates) {
    const fees = feesQuery.data;
    totalFees = CURRENCY.reduce((sum: BigNumber, currencyKey: string) => {
      return fees[currencyKey] ? sum.plus(fees[currencyKey].times(rates[currencyKey])) : sum;
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
  const daofundQuery = useBnJsContractQuery<any>(bnJs, 'Daofund', 'getBalances', []);

  const dailyDistribution = dailyDistributionQuery.isSuccess
    ? BalancedJs.utils.toIcx(dailyDistributionQuery.data)
    : null;

  const totalStakedBALN = totalStakedBALNQuery.isSuccess ? BalancedJs.utils.toIcx(totalStakedBALNQuery.data) : null;

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};
  const daofund =
    daofundQuery.isSuccess && ratesQuery.isSuccess
      ? CURRENCY.reduce((sum: BigNumber, currencyKey: string) => {
          return sum.plus(
            BalancedJs.utils
              .toIcx(daofundQuery.data[currencyKey] || '0', currencyKey)
              .times(rates[currencyKey] || ZERO),
          );
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

type Token = {
  holders: number;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  totalSupply: number;
  marketCap: number;
};

export const useAllTokensHoldersQuery = () => {
  const endpoint = `https://tracker.icon.foundation/v3/token/holders?contractAddr=`;

  const fetch = async () => {
    const tokens = CURRENCY.filter(key => key !== 'ICX');

    const data: any[] = await Promise.all(
      tokens.map(currencyKey =>
        axios.get(`${endpoint}${currencyKeyToAddressMap[NetworkId.MAINNET][currencyKey]}`).then(res => res.data),
      ),
    );

    const t = {};
    tokens.forEach((currencyKey, index) => {
      t[currencyKey] = data[index].totalSize;
    });
    return t;
  };

  return useQuery('useAllTokensHoldersQuery', fetch);
};

export const useAllTokensQuery = () => {
  const fetch = async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/token-stats`);
    const timestamp = data.timestamp;
    const tokens: { [key in string]: Token } = {};
    const _tokens = data.tokens;
    CURRENCY.sort((tokenKey1, tokenKey2) => _tokens[tokenKey1].name.localeCompare(_tokens[tokenKey2].name)).forEach(
      tokenKey => {
        const _token = _tokens[tokenKey];
        const token = {
          ..._token,
          price: BalancedJs.utils.toIcx(_token.price).toNumber(),
          totalSupply: BalancedJs.utils.toIcx(_token.total_supply, tokenKey).toNumber(),
          marketCap: BalancedJs.utils
            .toIcx(_token.total_supply, tokenKey)
            .times(BalancedJs.utils.toIcx(_token.price))
            .toNumber(),
          priceChange: _token.price_change,
        };
        tokens[tokenKey] = token;
      },
    );

    return {
      timestamp: timestamp,
      tokens: tokens,
    };
  };

  return useQuery<{ timestamp: number; tokens: { [key in string]: Token } }>('useAllTokensQuery', fetch);
};

export const useAllTokens = () => {
  const holdersQuery = useAllTokensHoldersQuery();
  const allTokensQuery = useAllTokensQuery();

  if (allTokensQuery.isSuccess && holdersQuery.isSuccess) {
    const holders = holdersQuery.data;
    const allTokens = allTokensQuery.data.tokens;
    CURRENCY.forEach(tokenKey => (allTokens[tokenKey].holders = holders[tokenKey]));
    return allTokens;
  }
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

  //
  const { data: IISSInfo } = useBnJsContractQuery<any>(bnJs, 'IISS', 'getIISSInfo', []);
  const stakingAPY = IISSInfo ? new BigNumber(IISSInfo?.variable.rrep).times(3).div(10_000).toNumber() : undefined;

  return {
    totalCollateral: totalCollateral?.integerValue().toNumber(),
    totalCollateralTVL: totalCollateralTVL?.integerValue().toNumber(),
    rate: rate?.toNumber(),
    stakingAPY: stakingAPY,
  };
};

export const useLoanInfo = () => {
  const totalLoansQuery = useBnJsContractQuery<string>(bnJs, 'bnUSD', 'totalSupply', []);
  const totalLoans = totalLoansQuery.isSuccess ? BalancedJs.utils.toIcx(totalLoansQuery.data) : null;

  const dailyDistributionQuery = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const dailyRewards = dailyDistributionQuery.isSuccess
    ? BalancedJs.utils.toIcx(dailyDistributionQuery.data).times(0.1)
    : null;

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};

  const loansAPY =
    dailyRewards && totalLoans && rates['BALN']
      ? dailyRewards.times(365).times(rates['BALN']).div(totalLoans.times(rates['bnUSD']))
      : null;

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
  const dailyDistributionQuery = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const tvls = useAllPairsTVL();
  const { data: rates } = useRatesQuery();

  if (tvls && rates && dailyDistributionQuery.isSuccess) {
    const dailyDistribution = BalancedJs.utils.toIcx(dailyDistributionQuery.data);
    const t = {};
    SUPPORTED_PAIRS.forEach(pair => {
      t[pair.name] =
        pair.rewards && dailyDistribution.times(pair.rewards).times(365).times(rates['BALN']).div(tvls[pair.name]);
    });
    return t;
  }

  return;
};

export const useAllPairsTVLQuery = () => {
  return useQuery<{ [key: string]: { base: BigNumber; quote: BigNumber; total_supply: BigNumber } }>(
    'useAllPairsTVLQuery',
    async () => {
      const res = await Promise.all(
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
          base: BalancedJs.utils.toIcx(item.base, pair.baseCurrencyKey),
          quote: BalancedJs.utils.toIcx(item.quote, pair.quoteCurrencyKey),
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

export const useAllPairsDataQuery = () => {
  return useQuery<{ [key: string]: { base: BigNumber; quote: BigNumber } }>('useAllPairsDataQuery', async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/dex-pool-stats-24h`);
    const t = {};
    SUPPORTED_PAIRS.forEach(pair => {
      const key = `0x${pair.poolId.toString(16)}`;

      const baseAddress = currencyKeyToAddressMap[NetworkId.MAINNET][pair.baseCurrencyKey];
      const quoteAddress = currencyKeyToAddressMap[NetworkId.MAINNET][pair.quoteCurrencyKey];

      t[pair.name] = {};

      // volume
      const _volume = data[key]['volume'];

      t[pair.name]['volume'] = {
        [pair.baseCurrencyKey]: BalancedJs.utils.toIcx(_volume[baseAddress], pair.baseCurrencyKey),
        [pair.quoteCurrencyKey]: BalancedJs.utils.toIcx(_volume[quoteAddress], pair.quoteCurrencyKey),
      };

      // fees
      const _fees = data[key]['fees'];
      t[pair.name]['fees'] = {
        [pair.baseCurrencyKey]: {
          lp_fees: BalancedJs.utils.toIcx(_fees[baseAddress]['lp_fees'], pair.baseCurrencyKey),
          baln_fees: BalancedJs.utils.toIcx(_fees[baseAddress]['baln_fees'], pair.baseCurrencyKey),
        },
        [pair.quoteCurrencyKey]: {
          lp_fees: BalancedJs.utils.toIcx(_fees[quoteAddress]['lp_fees'], pair.quoteCurrencyKey),
          baln_fees: BalancedJs.utils.toIcx(_fees[quoteAddress]['baln_fees'], pair.quoteCurrencyKey),
        },
      };
    });

    return t;
  });
};

export const useAllPairsData = (): { [key in string]: { volume: number; fees: number } } | undefined => {
  const dataQuery = useAllPairsDataQuery();
  const ratesQuery = useRatesQuery();

  if (dataQuery.isSuccess && ratesQuery.isSuccess) {
    const rates = ratesQuery.data || {};
    const data = dataQuery.data || {};

    const t: { [key in string]: { volume: number; fees: number } } = {};

    SUPPORTED_PAIRS.filter(pair => data[pair.name]).forEach(pair => {
      // volume
      const baseVol = data[pair.name]['volume'][pair.baseCurrencyKey].times(rates[pair.baseCurrencyKey]);
      const quoteVol = data[pair.name]['volume'][pair.quoteCurrencyKey].times(rates[pair.quoteCurrencyKey]);
      const volume = baseVol.plus(quoteVol).integerValue().toNumber();

      // fees
      const baseFees = data[pair.name]['fees'][pair.baseCurrencyKey]['lp_fees']
        .plus(data[pair.name]['fees'][pair.baseCurrencyKey]['baln_fees'])
        .times(rates[pair.baseCurrencyKey]);

      const quoteFees = data[pair.name]['fees'][pair.quoteCurrencyKey]['lp_fees']
        .plus(data[pair.name]['fees'][pair.quoteCurrencyKey]['baln_fees'])
        .times(rates[pair.quoteCurrencyKey]);
      const fees = baseFees.plus(quoteFees).integerValue().toNumber();

      t[pair.name] = { volume, fees };
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
  const data = useAllPairsData();
  const participantQuery = useAllPairsParticipantQuery();

  const t: {
    [key: string]: Pair & { tvl: number; apy: number; participant: number; volume: number; fees: number };
  } = {};

  if (apys && participantQuery.isSuccess && tvls && data) {
    const participants = participantQuery.data;

    SUPPORTED_PAIRS.forEach(pair => {
      t[pair.name] = {
        ...pair,
        tvl: tvls[pair.name],
        apy: apys[pair.name],
        participant: participants[pair.name],
        volume: data[pair.name]['volume'],
        fees: data[pair.name]['fees'],
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
        total.fees += pair.fees;
        return total;
      },
      { participant: 0, tvl: 0, volume: 0, fees: 0 },
    );
  }

  return;
};
