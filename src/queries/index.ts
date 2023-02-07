import { addresses, BalancedJs, CallData } from '@balancednetwork/balanced-js';
import { CurrencyAmount, Token, Fraction } from '@balancednetwork/sdk-core';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useQuery, UseQueryResult } from 'react-query';

import bnJs from 'bnJs';
import { ZERO } from 'constants/number';
import { PairInfo, SUPPORTED_PAIRS } from 'constants/pairs';
import QUERY_KEYS from 'constants/queryKeys';
import { SUPPORTED_TOKENS_LIST, SUPPORTED_TOKENS_MAP_BY_ADDRESS, TOKENS_OMITTED_FROM_STATS } from 'constants/tokens';
import { getTimestampFrom } from 'pages/PerformanceDetails/utils';
import { formatUnits } from 'utils';

import { useBlockDetails, useDaoFundHoldings, usePOLData } from './blockDetails';

const WEIGHT_CONST = 10 ** 18;

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

export type RewardDistributionRaw = {
  Base: Map<string, Fraction>;
  Fixed: Map<string, Fraction>;
  Voting: Map<string, Fraction>;
};

export type RewardDistribution = {
  Base: Map<string, Fraction>;
  Fixed: Map<string, Fraction>;
  Voting: Map<string, Fraction>;
};

export type MetaToken = {
  info: Token;
  holders: number;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  totalSupply: number;
  marketCap: number;
};

type DataPeriod = '24h' | '30d';

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
const PERCENTAGE_DISTRIBUTED = new BigNumber(0.6);

export const LAUNCH_DAY = 1619398800000000;
export const ONE_DAY = 86400000000;

export const useEarningsDataQuery = (
  start: number = LAUNCH_DAY,
  end: number = new Date().valueOf() * 1_000,
  cacheItem: string = 'earnings-data',
) => {
  const { data: blockStart } = useBlockDetails(start);
  const { data: blockEnd } = useBlockDetails(end);
  const { data: rates } = useRatesQuery();

  return useQuery<
    | {
        income: {
          loans: BigNumber;
          fund: BigNumber;
          liquidity: { amount: BigNumber; value: BigNumber };
          swaps: { [key: string]: { amount: BigNumber; value: BigNumber } };
          fees: { [key: string]: { amount: BigNumber; value: BigNumber } };
        };
        expenses: { [key: string]: { amount: BigNumber; value: BigNumber } };
        feesDistributed: BigNumber;
      }
    | undefined
  >(
    `${cacheItem}${blockStart && blockStart.number}${blockEnd && blockEnd.number}${rates && Object.keys(rates).length}`,
    async () => {
      if (blockStart?.number && blockEnd?.number && rates) {
        try {
          const loanFeesStart = await bnJs.FeeHandler.getLoanFeesAccrued(blockStart.number);
          const loanFeesEnd = await bnJs.FeeHandler.getLoanFeesAccrued(blockEnd.number);

          const fundFeesStart = await bnJs.FeeHandler.getStabilityFundFeesAccrued(blockStart.number);
          const fundFeesEnd = await bnJs.FeeHandler.getStabilityFundFeesAccrued(blockEnd.number);

          //swap fees
          const bnUSDFeesStart = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.bnUSD.address, blockStart.number);
          const bnUSDFeesEnd = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.bnUSD.address, blockEnd.number);

          const sICXFeesStart = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.sICX.address, blockStart.number);
          const sICXFeesEnd = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.sICX.address, blockEnd.number);

          const balnFeesStart = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.BALN.address, blockStart.number);
          const balnFeesEnd = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.BALN.address, blockEnd.number);

          const networkFeesStartRaw = await bnJs.DAOFund.getFeeEarnings(blockStart.number);
          const networkFeesEndRaw = await bnJs.DAOFund.getFeeEarnings(blockEnd.number);

          const liquidityStart = await bnJs.DAOFund.getBalnEarnings(blockStart.number);
          const liquidityEnd = await bnJs.DAOFund.getBalnEarnings(blockEnd.number);

          const networkFeesStart = Object.keys(networkFeesStartRaw).reduce((fees, contract) => {
            const currencyAmount = CurrencyAmount.fromRawAmount(
              SUPPORTED_TOKENS_MAP_BY_ADDRESS[contract],
              networkFeesStartRaw[contract],
            );
            fees[contract] = {
              value: new BigNumber(currencyAmount.toFixed()).times(rates[currencyAmount.currency.symbol!]),
              amount: new BigNumber(currencyAmount.toFixed()),
            };
            return fees;
          }, {});

          const networkFeesEnd = Object.keys(networkFeesEndRaw).reduce((fees, contract) => {
            const currencyAmount = CurrencyAmount.fromRawAmount(
              SUPPORTED_TOKENS_MAP_BY_ADDRESS[contract],
              networkFeesEndRaw[contract],
            );
            fees[contract] = {
              value: new BigNumber(currencyAmount.toFixed()).times(rates[currencyAmount.currency.symbol!]),
              amount: new BigNumber(currencyAmount.toFixed()),
            };
            return fees;
          }, {});

          const networkFeesIncome = Object.keys(networkFeesEnd).reduce((net, contract) => {
            if (networkFeesStart[contract]) {
              net[contract] = {
                value: networkFeesEnd[contract].value.minus(networkFeesStart[contract].value),
                amount: networkFeesEnd[contract].amount.minus(networkFeesStart[contract].amount),
              };
            } else {
              net[contract] = {
                value: networkFeesEnd[contract].value,
                amount: networkFeesEnd[contract].amount,
              };
            }
            return net;
          }, {} as { [key: string]: { value: BigNumber; amount: BigNumber } });

          const bnUSDIncome = new BigNumber(formatUnits(bnUSDFeesEnd)).minus(
            new BigNumber(formatUnits(bnUSDFeesStart)),
          );
          const sICXIncome = new BigNumber(formatUnits(sICXFeesEnd)).minus(new BigNumber(formatUnits(sICXFeesStart)));
          const balnIncome = new BigNumber(formatUnits(balnFeesEnd)).minus(new BigNumber(formatUnits(balnFeesStart)));
          const loansIncome = new BigNumber(formatUnits(loanFeesEnd)).minus(new BigNumber(formatUnits(loanFeesStart)));
          const fundIncome = new BigNumber(formatUnits(fundFeesEnd)).minus(new BigNumber(formatUnits(fundFeesStart)));
          const liquidityIncome = {
            amount: new BigNumber(formatUnits(liquidityEnd || 0)).minus(
              new BigNumber(formatUnits(liquidityStart || 0)),
            ),
            value: new BigNumber(formatUnits(liquidityEnd || 0))
              .minus(new BigNumber(formatUnits(liquidityStart || 0)))
              .times(rates['BALN']),
          };

          return {
            income: {
              loans: loansIncome,
              fund: fundIncome,
              liquidity: liquidityIncome,
              swaps: {
                BALN: {
                  amount: balnIncome,
                  value: balnIncome.times(rates['BALN']),
                },
                bnUSD: {
                  amount: bnUSDIncome,
                  value: bnUSDIncome,
                },
                sICX: {
                  amount: sICXIncome,
                  value: sICXIncome.times(rates['sICX']),
                },
              },
              fees: networkFeesIncome,
            },
            expenses: {
              BALN: {
                amount: balnIncome.times(PERCENTAGE_DISTRIBUTED),
                value: balnIncome.times(rates['BALN']).times(PERCENTAGE_DISTRIBUTED),
              },
              bnUSD: {
                amount: bnUSDIncome.plus(loansIncome).plus(fundIncome).times(PERCENTAGE_DISTRIBUTED),
                value: bnUSDIncome.plus(loansIncome).plus(fundIncome).times(PERCENTAGE_DISTRIBUTED),
              },
              sICX: {
                amount: sICXIncome.times(PERCENTAGE_DISTRIBUTED),
                value: sICXIncome.times(rates['sICX']).times(PERCENTAGE_DISTRIBUTED),
              },
            },
            feesDistributed: balnIncome
              .times(rates['BALN'])
              .times(PERCENTAGE_DISTRIBUTED)
              .plus(sICXIncome.times(rates['sICX']).times(PERCENTAGE_DISTRIBUTED))
              .plus(bnUSDIncome.plus(loansIncome).plus(fundIncome).times(PERCENTAGE_DISTRIBUTED)),
          };
        } catch (e) {
          console.error('Error calculating dao earnings: ', e);
        }
      }
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: undefined,
      refetchIntervalInBackground: undefined,
    },
  );
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
      if (SUPPORTED_TOKENS_MAP_BY_ADDRESS[address]) {
        t[SUPPORTED_TOKENS_MAP_BY_ADDRESS[address].symbol!] = BalancedJs.utils.toIcx(
          data[address]['total'],
          SUPPORTED_TOKENS_MAP_BY_ADDRESS[address].symbol!,
        );
      }
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
      return fees[token.symbol!] && rates[token.symbol!]
        ? sum.plus(fees[token.symbol!].times(rates[token.symbol!]))
        : sum;
    }, ZERO);
  }

  // baln marketcap
  const totalSupplyQuery = useBnJsContractQuery<string>(bnJs, 'BALN', 'totalSupply', []);
  let BALNMarketCap: BigNumber | undefined;
  if (totalSupplyQuery.isSuccess && ratesQuery.isSuccess && rates) {
    BALNMarketCap = BalancedJs.utils.toIcx(totalSupplyQuery.data).times(rates['BALN']);
  }

  const { data: platformDay } = usePlatformDayQuery();
  const earningsDataQuery = useEarningsDataQuery(getTimestampFrom(30), getTimestampFrom(0));

  //bBALN apy
  const assumedYearlyDistribution = earningsDataQuery?.data?.feesDistributed.times(12);
  const bBALNSupplyQuery = useBnJsContractQuery<string>(bnJs, 'BBALN', 'totalSupply', []);
  const bBALNSupply = bBALNSupplyQuery.isSuccess && new BigNumber(formatUnits(bBALNSupplyQuery.data));
  const bBALNAPY =
    assumedYearlyDistribution &&
    bBALNSupply &&
    rates &&
    assumedYearlyDistribution.div(bBALNSupply.times(rates['BALN']));

  const previousChunkAmount = 100;

  return {
    TVL: tvl,
    BALNMarketCap: BALNMarketCap?.integerValue().toNumber(),
    fees: totalFees?.integerValue().toNumber(),
    platformDay: platformDay,
    monthlyFeesTotal: earningsDataQuery?.data?.feesDistributed,
    bBALNAPY: bBALNAPY,
    balnPrice: rates && rates['BALN'],
    previousChunk:
      bBALNSupply &&
      earningsDataQuery?.data &&
      new BigNumber(previousChunkAmount).dividedBy(bBALNSupply).times(earningsDataQuery?.data?.feesDistributed),
    previousChunkAmount: previousChunkAmount,
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

  const totalBalnLockedQuery = useBnJsContractQuery<string>(bnJs, 'BBALN', 'getTotalLocked', []);
  const totalBBalnHoldersQuery = useBnJsContractQuery<string>(bnJs, 'BBALN', 'activeUsersCount', []);

  const dailyDistribution = dailyDistributionQuery.isSuccess
    ? BalancedJs.utils.toIcx(dailyDistributionQuery.data)
    : null;

  const totalBalnLocked = totalBalnLockedQuery.isSuccess && Number(totalBalnLockedQuery.data) / 10 ** 18;
  const totalBBalnHolders = totalBBalnHoldersQuery.isSuccess && Number(totalBBalnHoldersQuery.data);

  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: POLData } = usePOLData(now);
  const { data: holdingsData } = useDaoFundHoldings(now);

  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};

  const holdings = holdingsData
    ? Object.keys(holdingsData).reduce((total, contract) => {
        const token = holdingsData[contract].currency.wrapped;
        const curAmount = new BigNumber(holdingsData[contract].toFixed());
        if (rates[token.symbol!]) {
          return total + curAmount.times(rates[token.symbol!]).toNumber();
        } else {
          return total;
        }
      }, 0)
    : 0;

  const POLHoldings = POLData ? POLData.reduce((total, pool) => total + pool.liquidity.toNumber(), 0) : 0;

  return {
    dailyDistribution: dailyDistribution?.integerValue().toNumber(),
    daofund: holdings + POLHoldings,
    totalBALNLocked: totalBalnLocked,
    numOfHolders: totalBBalnHolders,
  };
};

export function useRewardsPercentDistribution(): UseQueryResult<RewardDistribution, Error> {
  return useQuery('rewardDistribution', async () => {
    const data: RewardDistributionRaw = await bnJs.Rewards.getDistributionPercentages();

    return {
      Base: Object.keys(data.Base).reduce((distributions, item) => {
        try {
          distributions[item] = new Fraction(data.Base[item], WEIGHT_CONST);
        } catch (e) {
          console.error(e);
        } finally {
          return distributions;
        }
      }, {}),
      Fixed: Object.keys(data.Fixed).reduce((distributions, item) => {
        try {
          distributions[item] = new Fraction(data.Fixed[item], WEIGHT_CONST);
        } catch (e) {
          console.error(e);
        } finally {
          return distributions;
        }
      }, {}),
      Voting: Object.keys(data.Voting).reduce((distributions, item) => {
        try {
          distributions[item] = new Fraction(data.Voting[item], WEIGHT_CONST);
        } catch (e) {
          console.error(e);
        } finally {
          return distributions;
        }
      }, {}),
    };
  });
}

export function useFlattenedRewardsDistribution(): UseQueryResult<Map<string, Fraction>, Error> {
  const { data: distribution } = useRewardsPercentDistribution();

  return useQuery(
    ['flattenedDistribution', distribution],
    () => {
      if (distribution) {
        return Object.values(distribution).reduce((flattened, dist) => {
          return Object.keys(dist).reduce((flattened, item) => {
            if (Object.keys(flattened).indexOf(item) >= 0) {
              flattened[item] = flattened[item].add(dist[item]);
            } else {
              flattened[item] = dist[item];
            }
            return flattened;
          }, flattened);
        }, {});
      }
    },
    {
      keepPreviousData: true,
    },
  );
}

export const useIncentivisedPairs = (): UseQueryResult<{ name: string; id: number; rewards: Fraction }[], Error> => {
  const { data: rewards } = useFlattenedRewardsDistribution();

  return useQuery(
    ['incentivisedPairs', rewards],
    async () => {
      if (rewards) {
        const lpData = await bnJs.StakedLP.getDataSources();
        const lpSources: string[] = ['sICX/ICX', ...lpData];

        const cds: CallData[] = lpSources.map(source => ({
          target: addresses[1].stakedLp,
          method: 'getSourceId',
          params: [source],
        }));

        const sourceIDs = await bnJs.Multicall.getAggregateData(cds);

        return lpSources.map((source, index) => ({
          name: source,
          id: index === 0 ? 1 : parseInt(sourceIDs[index], 16),
          rewards: rewards[source],
        }));
      }
    },
    {
      keepPreviousData: true,
    },
  );
};

export const useAllTokensHoldersQuery = () => {
  const endpoint = `https://tracker.icon.community/api/v1/transactions/token-holders/token-contract/`;

  const fetch = async () => {
    const tokens = SUPPORTED_TOKENS_LIST.filter(
      token => token.symbol !== 'ICX' || TOKENS_OMITTED_FROM_STATS.indexOf(token.symbol!) < 0,
    );

    const data: any[] = await Promise.all(
      tokens.map((token: Token) => axios.get(`${endpoint}${token.address}`).then(res => res.headers)),
    );

    const t = {};
    tokens.forEach((token: Token, index) => {
      t[token.symbol!] = data[index]['x-total-count'];
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
    SUPPORTED_TOKENS_LIST.sort((token0, token1) => {
      if (_tokens[token0.symbol!] && _tokens[token1.symbol!]) {
        return _tokens[token0.symbol!].name.localeCompare(_tokens[token1.symbol!].name);
      } else return 0;
    }).forEach(token => {
      if (_tokens[token.symbol!]) {
        const _token = _tokens[token.symbol!];
        const token1 = {
          info: token,
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
      }
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
    SUPPORTED_TOKENS_LIST.filter(token => TOKENS_OMITTED_FROM_STATS.indexOf(token.symbol!) < 0).forEach(
      token => (allTokens[token.symbol!].holders = holders[token.symbol!]),
    );
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
  const totalBnUSDQuery = useBnJsContractQuery<string>(bnJs, 'bnUSD', 'totalSupply', []);
  const totalBnUSD = totalBnUSDQuery.isSuccess ? BalancedJs.utils.toIcx(totalBnUSDQuery.data) : null;
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
    dailyRewards && totalBnUSD && rates['BALN']
      ? dailyRewards.times(365).times(rates['BALN']).div(totalBnUSD.times(rates['bnUSD']))
      : null;

  const borrowersQuery = useBnJsContractQuery<string>(bnJs, 'Loans', 'borrowerCount', []);
  const borrowers = borrowersQuery.isSuccess ? new BigNumber(borrowersQuery.data) : null;

  return {
    totalBnUSD: totalBnUSD?.toNumber(),
    loansAPY: loansAPY?.toNumber(),
    dailyRewards: dailyRewards?.toNumber(),
    borrowers: borrowers?.toNumber(),
  };
};

//gets only BALN apy, no fees included
export const useAllPairsAPY = () => {
  const dailyDistributionQuery = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const tvls = useAllPairsTVL();
  const { data: rates } = useRatesQuery();
  const { data: incentivisedPairs } = useIncentivisedPairs();

  if (tvls && rates && incentivisedPairs && dailyDistributionQuery.isSuccess) {
    const dailyDistribution = BalancedJs.utils.toIcx(dailyDistributionQuery.data);
    const t = {};
    SUPPORTED_PAIRS.forEach(pair => {
      const incentivisedPair = incentivisedPairs.find(incentivisedPair => incentivisedPair.name === pair.name);

      t[pair.name] =
        incentivisedPair &&
        dailyDistribution
          .times(new BigNumber(incentivisedPair.rewards.toFixed(4)))
          .times(365)
          .times(rates['BALN'])
          .div(tvls[pair.name])
          .toFixed(8);
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

export const useAllPairsDataQuery = (period: DataPeriod = '24h') => {
  return useQuery<{ [key: string]: { base: BigNumber; quote: BigNumber } }>(
    `useAllPairs${period}DataQuery`,
    async () => {
      const { data } = await axios.get(`${API_ENDPOINT}/stats/dex-pool-stats-${period}`);
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
          if (_fees[baseAddress]) {
            t[pair.name]['fees'] = {
              [pair.baseCurrencyKey]: {
                lp_fees: BalancedJs.utils.toIcx(_fees[baseAddress]['lp_fees'], pair.baseCurrencyKey),
                baln_fees: BalancedJs.utils.toIcx(_fees[baseAddress]['baln_fees'], pair.baseCurrencyKey),
              },
            };
          }
          if (_fees[quoteAddress]) {
            t[pair.name]['fees'] = t[pair.name]['fees']
              ? {
                  ...t[pair.name]['fees'],
                  [pair.quoteCurrencyKey]: {
                    lp_fees: BalancedJs.utils.toIcx(_fees[quoteAddress]['lp_fees'], pair.quoteCurrencyKey),
                    baln_fees: BalancedJs.utils.toIcx(_fees[quoteAddress]['baln_fees'], pair.quoteCurrencyKey),
                  },
                }
              : {
                  [pair.quoteCurrencyKey]: {
                    lp_fees: BalancedJs.utils.toIcx(_fees[quoteAddress]['lp_fees'], pair.quoteCurrencyKey),
                    baln_fees: BalancedJs.utils.toIcx(_fees[quoteAddress]['baln_fees'], pair.quoteCurrencyKey),
                  },
                };
          }
        }
      });
      return t;
    },
  );
};

export const useAllPairsData = (
  period: DataPeriod = '24h',
): { [key in string]: { volume: number; fees: number } } | undefined => {
  const dataQuery = useAllPairsDataQuery(period);
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
      const baseFees = data[pair.name]['fees'][pair.baseCurrencyKey]
        ? data[pair.name]['fees'][pair.baseCurrencyKey]['lp_fees']
            .plus(data[pair.name]['fees'][pair.baseCurrencyKey]['baln_fees'])
            .times(rates[pair.baseCurrencyKey])
        : new BigNumber(0);

      const quoteFees = data[pair.name]['fees'][pair.quoteCurrencyKey]
        ? data[pair.name]['fees'][pair.quoteCurrencyKey]['lp_fees']
            .plus(data[pair.name]['fees'][pair.quoteCurrencyKey]['baln_fees'])
            .times(rates[pair.quoteCurrencyKey])
        : new BigNumber(0);
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
  const data30day = useAllPairsData('30d');
  const participantQuery = useAllPairsParticipantQuery();

  const t: {
    [key: string]: PairInfo & {
      tvl: number;
      apy: number;
      feesApy: number;
      apyTotal: number;
      participant: number;
      volume?: number;
      fees?: number;
    };
  } = {};

  if (apys && participantQuery.isSuccess && tvls && data && data30day) {
    const participants = participantQuery.data;

    SUPPORTED_PAIRS.forEach(pair => {
      const feesApyConstant = pair.name === 'sICX/ICX' ? 0.7 : 0.5;
      const feesApy = data30day[pair.name] && (data30day[pair.name]['fees'] * 12 * feesApyConstant) / tvls[pair.name];

      t[pair.name] = {
        ...pair,
        tvl: tvls[pair.name],
        apy: apys[pair.name],
        feesApy: feesApy < 10000 ? feesApy : 0,
        participant: participants[pair.name],
        apyTotal: new BigNumber(apys[pair.name] || 0)
          .plus(
            new BigNumber(feesApy < 10000 ? data30day[pair.name]['fees'] * 12 * feesApyConstant : 0).div(
              new BigNumber(tvls[pair.name]) || 1,
            ),
          )
          .toNumber(),
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

export const useWhitelistedTokensList = () => {
  return useQuery<string[]>('whitelistedTokens', async () => {
    return await bnJs.StabilityFund.getAcceptedTokens();
  });
};

export function useFundLimits(): UseQueryResult<{ [key: string]: CurrencyAmount<Token> }> {
  const whitelistedTokenAddressesQuery = useWhitelistedTokensList();
  const whitelistedTokenAddresses = whitelistedTokenAddressesQuery.data ?? [];

  return useQuery<{ [key: string]: CurrencyAmount<Token> }>(
    `useFundLimitsQuery${whitelistedTokenAddresses.length}`,
    async () => {
      const cds: CallData[] = whitelistedTokenAddresses.map(address => {
        return {
          target: bnJs.StabilityFund.address,
          method: 'getLimit',
          params: [address],
        };
      });

      const data: string[] = await bnJs.Multicall.getAggregateData(cds);

      const limits = {};
      data.forEach((limit, index) => {
        const address = whitelistedTokenAddresses[index];
        const token = SUPPORTED_TOKENS_LIST.filter(token => token.address === address)[0];
        limits[address] = CurrencyAmount.fromRawAmount(token, limit);
      });

      return limits;
    },
  );
}

type Source = {
  balance: BigNumber;
  supply: BigNumber;
  workingBalance: BigNumber;
  workingSupply: BigNumber;
  apy: number;
};

type DaoBBALNData = {
  BBALNTotalSupply: BigNumber;
  BBALNDaoHolding: BigNumber;
  BALNDaoLocked: BigNumber;
  BALNLockEnd: Date;
  DAOSources: Source[];
  DAORewards: { baln: CurrencyAmount<Token>; fees: Map<string, CurrencyAmount<Token>> };
};

export function useDaoBBALNData(): UseQueryResult<DaoBBALNData, Error> {
  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;
  const feesDistributedIn = [bnJs.sICX.address, bnJs.bnUSD.address, bnJs.BALN.address];
  const allPairs = useAllPairs();

  return useQuery(
    `daoBBALNData${now}${!!allPairs}`,
    async () => {
      let daoBBALNData = {};

      //total bBALN supply
      const BBALNTotalSupplyRaw = await bnJs.BBALN.totalSupply();
      const BBALNTotalSupply = new BigNumber(formatUnits(BBALNTotalSupplyRaw));
      daoBBALNData['BBALNTotalSupply'] = BBALNTotalSupply;

      //dao bBALN holding
      const BBALNDaoHoldingRaw = await bnJs.BBALN.balanceOf(bnJs.DAOFund.address);
      const BBALNDaoHolding = new BigNumber(formatUnits(BBALNDaoHoldingRaw));
      daoBBALNData['BBALNDaoHolding'] = BBALNDaoHolding;

      //dao BALN locked
      const BALNDaoLockedRaw = await bnJs.BBALN.getLocked(bnJs.DAOFund.address);
      const BALNDaoLocked = new BigNumber(formatUnits(BALNDaoLockedRaw.amount));
      daoBBALNData['BALNDaoLocked'] = BALNDaoLocked;

      //dao lock end
      const BALNLockEnd = new Date(parseInt(BALNDaoLockedRaw.end, 16) / 1000);
      daoBBALNData['BALNLockEnd'] = BALNLockEnd;

      //dao sources
      const DAOSourcesRaw = await bnJs.Rewards.getBoostData(bnJs.DAOFund.address);
      const DAOSources = Object.keys(DAOSourcesRaw).reduce((sources, sourceName) => {
        if (new BigNumber(DAOSourcesRaw[sourceName].balance).isGreaterThan(0)) {
          const workingBalance = new BigNumber(DAOSourcesRaw[sourceName].workingBalance);
          const balance = new BigNumber(DAOSourcesRaw[sourceName].balance);
          const boost = workingBalance.dividedBy(balance);
          const feesApy = allPairs && allPairs[sourceName] ? allPairs[sourceName].feesApy : 0;
          const balnApy = allPairs && allPairs[sourceName] ? allPairs[sourceName].apy : 0;

          const apy = boost.times(balnApy).plus(feesApy).times(100).dp(2);

          sources[sourceName] = {
            balance: balance,
            supply: new BigNumber(DAOSourcesRaw[sourceName].supply),
            workingBalance: workingBalance,
            workingSupply: new BigNumber(DAOSourcesRaw[sourceName].workingSupply),
            apy: apy,
          };
        }
        return sources;
      }, {});
      daoBBALNData['DAOSources'] = DAOSources;

      //unclaimed dao network fees
      const rewardsFeesRaw = await bnJs.Dividends.getUnclaimedDividends(bnJs.DAOFund.address);
      const rewardsFees: { [address in string]: CurrencyAmount<Token> } = feesDistributedIn.reduce((fees, address) => {
        const currency = SUPPORTED_TOKENS_MAP_BY_ADDRESS[address];
        fees[address] = CurrencyAmount.fromRawAmount(currency, rewardsFeesRaw[address]);
        return fees;
      }, {});
      daoBBALNData['DAORewards'] = {};
      daoBBALNData['DAORewards']['fees'] = rewardsFees;

      //unclaimed baln rewards
      const rewardsBalnRaw = await bnJs.Rewards.getBalnHolding(bnJs.DAOFund.address);
      const rewardsBaln = CurrencyAmount.fromRawAmount(
        SUPPORTED_TOKENS_MAP_BY_ADDRESS[bnJs.BALN.address],
        rewardsBalnRaw,
      );
      daoBBALNData['DAORewards']['baln'] = rewardsBaln;

      return daoBBALNData as DaoBBALNData;
    },
    { keepPreviousData: true, refetchOnReconnect: false, refetchInterval: undefined },
  );
}
