import { BalancedJs } from '@balancednetwork/balanced-js';
import { Token } from '@balancednetwork/sdk-core';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { ZERO } from 'constants/number';
import { PairInfo, SUPPORTED_PAIRS } from 'constants/pairs';
import QUERY_KEYS from 'constants/queryKeys';
import { SUPPORTED_TOKENS_LIST, SUPPORTED_TOKENS_MAP_BY_ADDRESS } from 'constants/tokens';
import { contractToInfoMap } from 'pages/PerformanceDetails/utils';

import { ContractData, PerformaceData } from '../pages/PerformanceDetails/types';

export const useBnJsContractQuery = <T>(bnJs: BalancedJs, contract: string, method: string, args: any[]) => {
  return useQuery<T, string>(QUERY_KEYS.BnJs(contract, method, args), async () => {
    try {
      return bnJs[contract][method](...args);
    } catch (e) {
      console.log(contract, method);
      throw e;
    }
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

const API_ENDPOINT = process.env.NODE_ENV === 'production' ? 'https://balanced.sudoblock.io/api/v1' : '/api/v1';

export const LAUNCH_DAY = 1619398800000000;
export const ONE_DAY = 86400000000;

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

export const useEarningsDataQuery = (
  start: number = LAUNCH_DAY,
  end: number = new Date().valueOf() * 1_000,
  cacheItem: string = 'earnings-data',
) => {
  return useQuery<PerformaceData>(cacheItem, async () => {
    const { data } = await axios.get(
      `${API_ENDPOINT}/stats/income-statement?start_timestamp=${start}&end_timestamp=${end}`,
    );
    const loanIncometokenCount = BalancedJs.utils.toIcx(data.income.loans_fees, 'bnUSD');
    data.income.loans_fees = loanIncometokenCount;

    data.income.swap_fees = Object.keys(data.income.swap_fees)
      .filter(contract => Object.keys(contractToInfoMap).indexOf(contract) >= 0)
      .map(contract => {
        const contractInfo = contractToInfoMap[contract];
        const contractFeeTokenCount = BalancedJs.utils.toIcx(data.income.swap_fees[contract], contractInfo.symbol);

        return {
          info: contractToInfoMap[contract],
          tokens: contractFeeTokenCount,
        };
      });

    data.expenses = Object.keys(data.expenses)
      .filter(contract => Object.keys(contractToInfoMap).indexOf(contract) >= 0)
      .map(contract => {
        const contractInfo = contractToInfoMap[contract];
        const contractExpenseTokenCount = BalancedJs.utils.toIcx(data.expenses[contract], contractInfo.symbol);

        return {
          info: contractToInfoMap[contract],
          tokens: contractExpenseTokenCount,
        };
      });

    return data;
  });
};

export const useHoldingsDataQuery = (timestamp: number = -1, cacheItem: string = 'holdings-data') => {
  return useQuery<ContractData[]>(cacheItem, async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/daofund-balance-sheet?timestamp=${timestamp}`);
    const mappedData = Object.keys(data)
      .filter(contract => Object.keys(contractToInfoMap).indexOf(contract) >= 0)
      .map(contract => {
        const tokenCount = BalancedJs.utils.toIcx(data[contract], contractToInfoMap[contract].symbol);
        return {
          info: contractToInfoMap[contract],
          tokens: tokenCount,
        };
      });
    return mappedData;
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
      t[SUPPORTED_TOKENS_MAP_BY_ADDRESS[address].symbol!] = BalancedJs.utils.toIcx(
        data[address]['total'],
        SUPPORTED_TOKENS_MAP_BY_ADDRESS[address].symbol!,
      );
    });

    return t;
  });
};

export const usePlatformDayQuery = () => {
  return useQuery<number>(QUERY_KEYS.PlatformDay, async () => {
    const res = await bnJs.Governance.getDay();
    return parseInt(res, 16);
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
    totalFees = SUPPORTED_TOKENS_LIST.reduce((sum: BigNumber, token: Token) => {
      return fees[token.symbol!] ? sum.plus(fees[token.symbol!].times(rates[token.symbol!])) : sum;
    }, ZERO);
  }

  // baln marketcap
  const totalSupplyQuery = useBnJsContractQuery<string>(bnJs, 'BALN', 'totalSupply', []);
  let BALNMarketCap: BigNumber | undefined;
  if (totalSupplyQuery.isSuccess && ratesQuery.isSuccess && rates) {
    BALNMarketCap = BalancedJs.utils.toIcx(totalSupplyQuery.data).times(rates['BALN']);
  }

  // transactions
  const { data: platformDay } = usePlatformDayQuery();

  return {
    TVL: tvl,
    BALNMarketCap: BALNMarketCap?.integerValue().toNumber(),
    fees: totalFees?.integerValue().toNumber(),
    platformDay: platformDay,
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
  const daofundQuery = useBnJsContractQuery<any>(bnJs, 'DAOFund', 'getBalances', []);

  const dailyDistribution = dailyDistributionQuery.isSuccess
    ? BalancedJs.utils.toIcx(dailyDistributionQuery.data)
    : null;

  const totalStakedBALN = totalStakedBALNQuery.isSuccess ? BalancedJs.utils.toIcx(totalStakedBALNQuery.data) : null;

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};
  const daofund =
    daofundQuery.isSuccess && ratesQuery.isSuccess
      ? SUPPORTED_TOKENS_LIST.reduce((sum: BigNumber, token: Token) => {
          return sum.plus(
            BalancedJs.utils
              .toIcx(daofundQuery.data[token.address] || '0', token.symbol!)
              .times(rates[token.symbol!] || ZERO),
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

export type MetaToken = {
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
    const tokens = SUPPORTED_TOKENS_LIST.filter(token => token.symbol !== 'ICX');

    const data: any[] = await Promise.all(
      tokens.map((token: Token) => axios.get(`${endpoint}${token.address}`).then(res => res.data)),
    );

    const t = {};
    tokens.forEach((token: Token, index) => {
      t[token.symbol!] = data[index].totalSize;
    });
    return t;
  };

  return useQuery('useAllTokensHoldersQuery', fetch);
};

export const useAllTokensQuery = () => {
  const fetch = async () => {
    const { data } = await axios.get(`${API_ENDPOINT}/stats/token-stats`);
    const timestamp = data.timestamp;
    const tokens: { [key in string]: MetaToken } = {};
    const _tokens = data.tokens;
    SUPPORTED_TOKENS_LIST.sort((token0, token1) =>
      _tokens[token0.symbol!].name.localeCompare(_tokens[token1.symbol!].name),
    ).forEach(token => {
      const _token = _tokens[token.symbol!];
      const token1 = {
        ..._token,
        price: BalancedJs.utils.toIcx(_token.price).toNumber(),
        totalSupply: BalancedJs.utils.toIcx(_token.total_supply, token.symbol!).toNumber(),
        marketCap: BalancedJs.utils
          .toIcx(_token.total_supply, token.symbol!)
          .times(BalancedJs.utils.toIcx(_token.price))
          .toNumber(),
        priceChange: _token.price_change,
      };
      tokens[token.symbol!] = token1;
    });

    return {
      timestamp: timestamp,
      tokens: tokens,
    };
  };

  return useQuery<{ timestamp: number; tokens: { [key in string]: MetaToken } }>('useAllTokensQuery', fetch);
};

export const useAllTokens = () => {
  const holdersQuery = useAllTokensHoldersQuery();
  const allTokensQuery = useAllTokensQuery();

  if (allTokensQuery.isSuccess && holdersQuery.isSuccess) {
    const holders = holdersQuery.data;
    const allTokens = allTokensQuery.data.tokens;
    SUPPORTED_TOKENS_LIST.forEach(token => (allTokens[token.symbol!].holders = holders[token.symbol!]));
    return allTokens;
  }
};

export const useCollateralInfo = () => {
  const rateQuery = useBnJsContractQuery<string>(bnJs, 'Staking', 'getTodayRate', []);
  const rate = rateQuery.isSuccess ? BalancedJs.utils.toIcx(rateQuery.data) : null;

  const totalCollateralQuery = useBnJsContractQuery<string>(bnJs, 'sICX', 'balanceOf', [
    'cx66d4d90f5f113eba575bf793570135f9b10cece1',
  ]);

  const totalCollateral = totalCollateralQuery.isSuccess ? BalancedJs.utils.toIcx(totalCollateralQuery.data) : null;

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};

  // loan TVL
  const totalCollateralTVL =
    totalCollateralQuery.isSuccess && rates['sICX']
      ? BalancedJs.utils.toIcx(totalCollateralQuery.data).times(rates['sICX'])
      : null;

  const { data: IISSInfo } = useBnJsContractQuery<any>(bnJs, 'IISS', 'getIISSInfo', []);
  const { data: PRepsInfo } = useBnJsContractQuery<any>(bnJs, 'IISS', 'getPReps', []);
  const totalDelegated = PRepsInfo ? new BigNumber(PRepsInfo?.totalDelegated) : undefined;
  const stakingAPY =
    IISSInfo && totalDelegated
      ? new BigNumber(IISSInfo?.variable.Iglobal)
          .times(new BigNumber(IISSInfo.variable.Ivoter).times(12))
          .div(totalDelegated.times(100))
          .toNumber()
      : undefined;

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
  const { data: balnAllocation } = useBnJsContractQuery<{ [key: string]: string }>(
    bnJs,
    'Rewards',
    'getRecipientsSplit',
    [],
  );
  const loansBalnAllocation = BalancedJs.utils.toIcx(balnAllocation?.Loans || 0);

  const dailyDistributionQuery = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const dailyRewards =
    dailyDistributionQuery.isSuccess && loansBalnAllocation.isGreaterThan(0)
      ? BalancedJs.utils.toIcx(dailyDistributionQuery.data).times(loansBalnAllocation)
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
          const { data } = await axios.get(`${API_ENDPOINT}/dex/stats/${pair.id}`);
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
      const key = `0x${pair.id.toString(16)}`;

      const baseAddress = pair.baseToken.address;
      const quoteAddress = pair.quoteToken.address;

      if (data[key]) {
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
      }
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
    const res: Array<string> = await Promise.all(SUPPORTED_PAIRS.map(pair => bnJs.Dex.totalDexAddresses(pair.id)));

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
    [key: string]: PairInfo & { tvl: number; apy: number; participant: number; volume?: number; fees?: number };
  } = {};

  if (apys && participantQuery.isSuccess && tvls && data) {
    const participants = participantQuery.data;

    SUPPORTED_PAIRS.forEach(pair => {
      t[pair.name] = {
        ...pair,
        tvl: tvls[pair.name],
        apy: apys[pair.name],
        participant: participants[pair.name],
      };

      if (data[pair.name]) {
        t[pair.name].volume = data[pair.name]['volume'];
        t[pair.name].fees = data[pair.name]['fees'];
      }
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
        total.volume += pair.volume ? pair.volume : 0;
        total.fees += pair.fees ? pair.fees : 0;
        return total;
      },
      { participant: 0, tvl: 0, volume: 0, fees: 0 },
    );
  }

  return;
};
