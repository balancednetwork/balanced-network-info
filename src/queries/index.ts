import { addresses, BalancedJs, CallData } from '@balancednetwork/balanced-js';
import { CurrencyAmount, Token, Fraction } from '@balancednetwork/sdk-core';
import BigNumber from 'bignumber.js';
import { useQuery, UseQueryResult } from 'react-query';

import bnJs from 'bnJs';
import { SUPPORTED_PAIRS } from 'constants/pairs';
import QUERY_KEYS from 'constants/queryKeys';
import { SUPPORTED_TOKENS_LIST, SUPPORTED_TOKENS_MAP_BY_ADDRESS } from 'constants/tokens';
import { getTimestampFrom } from 'pages/PerformanceDetails/utils';
import { useSupportedCollateralTokens } from 'store/collateral/hooks';
import { formatUnits } from 'utils';

import {
  API_ENDPOINT,
  TokenStats,
  useAllCollateralData,
  useAllPairsIncentivisedByName,
  useAllPairsTotal,
  useAllTokensByAddress,
  useTokenPrices,
} from './backendv2';
import { useBlockDetails } from './blockDetails';
import axios from 'axios';

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
  price_24h: number;
  price_24h_change: number;
  total_supply: number;
  market_cap: number;
  liquidity: number;
  logo_uri?: string;
  address: string;
};

// type DataPeriod = '24h' | '30d';

const PERCENTAGE_DISTRIBUTED_OLD = new BigNumber(0.6);
const PERCENTAGE_DISTRIBUTED = new BigNumber(0.3);
const OLD_FEES_DISTRIBUTION_SWITCH_DATE = new Date('February 22, 2023 05:13:26').getTime() * 1_000;
const FEES_SWITCH_BLOCK_HEIGHT = 62242760;

export const LAUNCH_DAY = 1619398800000000;
export const ONE_DAY = 86400000000;

export const useEarningsDataQuery = (
  start: number = LAUNCH_DAY,
  end: number = new Date().valueOf() * 1_000,
  cacheItem: string = 'earnings-data',
) => {
  const { data: blockStart } = useBlockDetails(start);
  const { data: blockEnd } = useBlockDetails(end);
  const { data: rates } = useTokenPrices();

  return useQuery<
    | {
        income: {
          loans: BigNumber;
          fund: BigNumber;
          swaps: { [key: string]: { amount: BigNumber; value: BigNumber } };
        };
        expenses: { [key: string]: { amount: BigNumber; value: BigNumber } };
        feesDistributed: BigNumber;
      }
    | undefined
  >(
    `${cacheItem}${blockStart && blockStart.number}${blockEnd && blockEnd.number}${rates && Object.keys(rates).length}`,
    async () => {
      if (blockStart?.number && blockEnd?.number && rates) {
        // const networkFeesStartRaw = await bnJs.DAOFund.getFeeEarnings(blockStart.number);
        // const networkFeesEndRaw = await bnJs.DAOFund.getFeeEarnings(blockEnd.number);

        // const liquidityStart = await bnJs.DAOFund.getBalnEarnings(blockStart.number);
        // const liquidityEnd = await bnJs.DAOFund.getBalnEarnings(blockEnd.number);

        // const networkFeesStart = Object.keys(networkFeesStartRaw).reduce((fees, contract) => {
        //   const currencyAmount = CurrencyAmount.fromRawAmount(
        //     SUPPORTED_TOKENS_MAP_BY_ADDRESS[contract],
        //     networkFeesStartRaw[contract],
        //   );
        //   fees[contract] = {
        //     value: new BigNumber(currencyAmount.toFixed()).times(rates[currencyAmount.currency.symbol!]),
        //     amount: new BigNumber(currencyAmount.toFixed()),
        //   };
        //   return fees;
        // }, {});

        // const networkFeesEnd = Object.keys(networkFeesEndRaw).reduce((fees, contract) => {
        //   const currencyAmount = CurrencyAmount.fromRawAmount(
        //     SUPPORTED_TOKENS_MAP_BY_ADDRESS[contract],
        //     networkFeesEndRaw[contract],
        //   );
        //   fees[contract] = {
        //     value: new BigNumber(currencyAmount.toFixed()).times(rates[currencyAmount.currency.symbol!]),
        //     amount: new BigNumber(currencyAmount.toFixed()),
        //   };
        //   return fees;
        // }, {});

        // const networkFeesIncome = Object.keys(networkFeesEnd).reduce((net, contract) => {
        //   if (networkFeesStart[contract]) {
        //     net[contract] = {
        //       value: networkFeesEnd[contract].value.minus(networkFeesStart[contract].value),
        //       amount: networkFeesEnd[contract].amount.minus(networkFeesStart[contract].amount),
        //     };
        //   } else {
        //     net[contract] = {
        //       value: networkFeesEnd[contract].value,
        //       amount: networkFeesEnd[contract].amount,
        //     };
        //   }
        //   return net;
        // }, {} as { [key: string]: { value: BigNumber; amount: BigNumber } });

        // const liquidityIncome = {
        //   amount: new BigNumber(formatUnits(liquidityEnd || 0)).minus(new BigNumber(formatUnits(liquidityStart || 0))),
        //   value: new BigNumber(formatUnits(liquidityEnd || 0))
        //     .minus(new BigNumber(formatUnits(liquidityStart || 0)))
        //     .times(rates['BALN']),
        // };

        if (
          blockStart.timestamp < OLD_FEES_DISTRIBUTION_SWITCH_DATE &&
          OLD_FEES_DISTRIBUTION_SWITCH_DATE < blockEnd.timestamp
        ) {
          // Split earning periods to before and after distribution ratio switch
          try {
            const loanFeesStartBefore = await bnJs.FeeHandler.getLoanFeesAccrued(blockStart.number);
            const loanFeesEndBefore = await bnJs.FeeHandler.getLoanFeesAccrued(FEES_SWITCH_BLOCK_HEIGHT);
            const loanFeesStartAfter = await bnJs.FeeHandler.getLoanFeesAccrued(FEES_SWITCH_BLOCK_HEIGHT + 1);
            const loanFeesEndAfter = await bnJs.FeeHandler.getLoanFeesAccrued(blockEnd.number);

            const fundFeesStartBefore = await bnJs.FeeHandler.getStabilityFundFeesAccrued(blockStart.number);
            const fundFeesEndBefore = await bnJs.FeeHandler.getStabilityFundFeesAccrued(FEES_SWITCH_BLOCK_HEIGHT);
            const fundFeesStartAfter = await bnJs.FeeHandler.getStabilityFundFeesAccrued(FEES_SWITCH_BLOCK_HEIGHT + 1);
            const fundFeesEndAfter = await bnJs.FeeHandler.getStabilityFundFeesAccrued(blockEnd.number);

            //swap fees
            const bnUSDFeesStartBefore = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.bnUSD.address,
              blockStart.number,
            );
            const bnUSDFeesEndBefore = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.bnUSD.address,
              FEES_SWITCH_BLOCK_HEIGHT,
            );
            const bnUSDFeesStartAfter = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.bnUSD.address,
              FEES_SWITCH_BLOCK_HEIGHT + 1,
            );
            const bnUSDFeesEndAfter = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.bnUSD.address,
              blockEnd.number,
            );

            const sICXFeesStartBefore = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.sICX.address,
              blockStart.number,
            );
            const sICXFeesEndBefore = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.sICX.address,
              FEES_SWITCH_BLOCK_HEIGHT,
            );
            const sICXFeesStartAfter = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.sICX.address,
              FEES_SWITCH_BLOCK_HEIGHT + 1,
            );
            const sICXFeesEndAfter = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.sICX.address,
              blockEnd.number,
            );

            const balnFeesStartBefore = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.BALN.address,
              blockStart.number,
            );
            const balnFeesEndBefore = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.BALN.address,
              FEES_SWITCH_BLOCK_HEIGHT,
            );
            const balnFeesStartAfter = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.BALN.address,
              FEES_SWITCH_BLOCK_HEIGHT + 1,
            );
            const balnFeesEndAfter = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.BALN.address,
              blockEnd.number,
            );

            const bnUSDIncomeBefore = new BigNumber(formatUnits(bnUSDFeesEndBefore)).minus(
              new BigNumber(formatUnits(bnUSDFeesStartBefore)),
            );
            const bnUSDIncomeAfter = new BigNumber(formatUnits(bnUSDFeesEndAfter)).minus(
              new BigNumber(formatUnits(bnUSDFeesStartAfter)),
            );
            const sICXIncomeBefore = new BigNumber(formatUnits(sICXFeesEndBefore)).minus(
              new BigNumber(formatUnits(sICXFeesStartBefore)),
            );
            const sICXIncomeAfter = new BigNumber(formatUnits(sICXFeesEndAfter)).minus(
              new BigNumber(formatUnits(sICXFeesStartAfter)),
            );
            const balnIncomeBefore = new BigNumber(formatUnits(balnFeesEndBefore)).minus(
              new BigNumber(formatUnits(balnFeesStartBefore)),
            );
            const balnIncomeAfter = new BigNumber(formatUnits(balnFeesEndAfter)).minus(
              new BigNumber(formatUnits(balnFeesStartAfter)),
            );
            const loansIncomeBefore = new BigNumber(formatUnits(loanFeesEndBefore)).minus(
              new BigNumber(formatUnits(loanFeesStartBefore)),
            );
            const loansIncomeAfter = new BigNumber(formatUnits(loanFeesEndAfter)).minus(
              new BigNumber(formatUnits(loanFeesStartAfter)),
            );
            const fundIncomeBefore = new BigNumber(formatUnits(fundFeesEndBefore)).minus(
              new BigNumber(formatUnits(fundFeesStartBefore)),
            );
            const fundIncomeAfter = new BigNumber(formatUnits(fundFeesEndAfter)).minus(
              new BigNumber(formatUnits(fundFeesStartAfter)),
            );

            return {
              income: {
                loans: loansIncomeBefore.plus(loansIncomeAfter),
                fund: fundIncomeBefore.plus(fundIncomeAfter),
                // liquidity: liquidityIncome,
                swaps: {
                  BALN: {
                    amount: balnIncomeBefore.plus(balnIncomeAfter),
                    value: balnIncomeBefore.plus(balnIncomeAfter).times(rates['BALN']),
                  },
                  bnUSD: {
                    amount: bnUSDIncomeBefore.plus(bnUSDIncomeAfter),
                    value: bnUSDIncomeBefore.plus(bnUSDIncomeAfter),
                  },
                  sICX: {
                    amount: sICXIncomeBefore.plus(sICXIncomeAfter),
                    value: sICXIncomeBefore.plus(sICXIncomeAfter).times(rates['sICX']),
                  },
                },
                // fees: networkFeesIncome,
              },
              expenses: {
                BALN: {
                  amount: balnIncomeBefore
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(balnIncomeAfter.times(PERCENTAGE_DISTRIBUTED)),
                  value: balnIncomeBefore
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(balnIncomeAfter.times(PERCENTAGE_DISTRIBUTED))
                    .times(rates['BALN']),
                },
                bnUSD: {
                  amount: bnUSDIncomeBefore
                    .plus(loansIncomeBefore)
                    .plus(fundIncomeBefore)
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(bnUSDIncomeAfter.plus(loansIncomeAfter).plus(fundIncomeAfter).times(PERCENTAGE_DISTRIBUTED)),
                  value: bnUSDIncomeBefore
                    .plus(loansIncomeBefore)
                    .plus(fundIncomeBefore)
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(bnUSDIncomeAfter.plus(loansIncomeAfter).plus(fundIncomeAfter).times(PERCENTAGE_DISTRIBUTED)),
                },
                sICX: {
                  amount: sICXIncomeBefore
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(sICXIncomeAfter.times(PERCENTAGE_DISTRIBUTED)),
                  value: sICXIncomeBefore
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(sICXIncomeAfter.times(PERCENTAGE_DISTRIBUTED))
                    .times(rates['sICX']),
                },
              },
              feesDistributed: balnIncomeBefore
                .times(PERCENTAGE_DISTRIBUTED_OLD)
                .plus(balnIncomeAfter.times(PERCENTAGE_DISTRIBUTED))
                .times(rates['BALN'])
                .plus(
                  sICXIncomeBefore
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(sICXIncomeAfter.times(PERCENTAGE_DISTRIBUTED))
                    .times(rates['sICX']),
                )
                .plus(
                  bnUSDIncomeBefore
                    .plus(loansIncomeBefore)
                    .plus(fundIncomeBefore)
                    .times(PERCENTAGE_DISTRIBUTED_OLD)
                    .plus(bnUSDIncomeAfter.plus(loansIncomeAfter).plus(fundIncomeAfter).times(PERCENTAGE_DISTRIBUTED)),
                ),
            };
          } catch (e) {
            console.error('Error calculating dao earnings: ', e);
          }
        } else {
          //Calculate earning periods without distribution ratio switch
          try {
            const loanFeesStart = await bnJs.FeeHandler.getLoanFeesAccrued(blockStart.number);
            const loanFeesEnd = await bnJs.FeeHandler.getLoanFeesAccrued(blockEnd.number);

            const fundFeesStart = await bnJs.FeeHandler.getStabilityFundFeesAccrued(blockStart.number);
            const fundFeesEnd = await bnJs.FeeHandler.getStabilityFundFeesAccrued(blockEnd.number);

            //swap fees
            const bnUSDFeesStart = await bnJs.FeeHandler.getSwapFeesAccruedByToken(
              bnJs.bnUSD.address,
              blockStart.number,
            );
            const bnUSDFeesEnd = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.bnUSD.address, blockEnd.number);

            const sICXFeesStart = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.sICX.address, blockStart.number);
            const sICXFeesEnd = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.sICX.address, blockEnd.number);

            const balnFeesStart = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.BALN.address, blockStart.number);
            const balnFeesEnd = await bnJs.FeeHandler.getSwapFeesAccruedByToken(bnJs.BALN.address, blockEnd.number);

            const bnUSDIncome = new BigNumber(formatUnits(bnUSDFeesEnd)).minus(
              new BigNumber(formatUnits(bnUSDFeesStart)),
            );
            const sICXIncome = new BigNumber(formatUnits(sICXFeesEnd)).minus(new BigNumber(formatUnits(sICXFeesStart)));
            const balnIncome = new BigNumber(formatUnits(balnFeesEnd)).minus(new BigNumber(formatUnits(balnFeesStart)));
            const loansIncome = new BigNumber(formatUnits(loanFeesEnd)).minus(
              new BigNumber(formatUnits(loanFeesStart)),
            );
            const fundIncome = new BigNumber(formatUnits(fundFeesEnd)).minus(new BigNumber(formatUnits(fundFeesStart)));

            return {
              income: {
                loans: loansIncome,
                fund: fundIncome,
                // liquidity: liquidityIncome,
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
                // fees: networkFeesIncome,
              },
              expenses: {
                BALN: {
                  amount: balnIncome.times(
                    OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                      ? PERCENTAGE_DISTRIBUTED_OLD
                      : PERCENTAGE_DISTRIBUTED,
                  ),
                  value: balnIncome
                    .times(rates['BALN'])
                    .times(
                      OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                        ? PERCENTAGE_DISTRIBUTED_OLD
                        : PERCENTAGE_DISTRIBUTED,
                    ),
                },
                bnUSD: {
                  amount: bnUSDIncome
                    .plus(loansIncome)
                    .plus(fundIncome)
                    .times(
                      OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                        ? PERCENTAGE_DISTRIBUTED_OLD
                        : PERCENTAGE_DISTRIBUTED,
                    ),
                  value: bnUSDIncome
                    .plus(loansIncome)
                    .plus(fundIncome)
                    .times(
                      OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                        ? PERCENTAGE_DISTRIBUTED_OLD
                        : PERCENTAGE_DISTRIBUTED,
                    ),
                },
                sICX: {
                  amount: sICXIncome.times(
                    OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                      ? PERCENTAGE_DISTRIBUTED_OLD
                      : PERCENTAGE_DISTRIBUTED,
                  ),
                  value: sICXIncome
                    .times(rates['sICX'])
                    .times(
                      OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                        ? PERCENTAGE_DISTRIBUTED_OLD
                        : PERCENTAGE_DISTRIBUTED,
                    ),
                },
              },
              feesDistributed: balnIncome
                .times(rates['BALN'])
                .times(
                  OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                    ? PERCENTAGE_DISTRIBUTED_OLD
                    : PERCENTAGE_DISTRIBUTED,
                )
                .plus(
                  sICXIncome
                    .times(rates['sICX'])
                    .times(
                      OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                        ? PERCENTAGE_DISTRIBUTED_OLD
                        : PERCENTAGE_DISTRIBUTED,
                    ),
                )
                .plus(
                  bnUSDIncome
                    .plus(loansIncome)
                    .plus(fundIncome)
                    .times(
                      OLD_FEES_DISTRIBUTION_SWITCH_DATE > blockStart.timestamp
                        ? PERCENTAGE_DISTRIBUTED_OLD
                        : PERCENTAGE_DISTRIBUTED,
                    ),
                ),
            };
          } catch (e) {
            console.error('Error calculating dao earnings: ', e);
          }
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

export const useStatsTVL = () => {
  const { data: pairsTotal } = useAllPairsTotal();
  const { data: collateralInfo } = useCollateralInfo();

  if (pairsTotal && collateralInfo) {
    return pairsTotal.tvl + collateralInfo.collateralData.current.total.value;
  }
};

export const usePlatformDayQuery = () => {
  return useQuery<number>(QUERY_KEYS.PlatformDay, async () => {
    const res = await bnJs.Governance.getDay();
    return parseInt(res, 16);
  });
};

export const useOverviewInfo = () => {
  const { data: allTokens } = useAllTokensByAddress();
  const tvl = useStatsTVL();

  const balnPrice = allTokens && allTokens[bnJs.BALN.address].price;
  const BALNMarketCap =
    allTokens && new BigNumber(allTokens[bnJs.BALN.address].price * allTokens[bnJs.BALN.address].total_supply);

  const { data: platformDay } = usePlatformDayQuery();
  const earningsDataQuery = useEarningsDataQuery(getTimestampFrom(30), getTimestampFrom(0));

  //bBALN apy
  const assumedYearlyDistribution = earningsDataQuery?.data?.feesDistributed.times(12);
  const bBALNSupplyQuery = useBnJsContractQuery<string>(bnJs, 'BBALN', 'totalSupply', []);
  const bBALNSupply = bBALNSupplyQuery.isSuccess && new BigNumber(formatUnits(bBALNSupplyQuery.data));
  const bBALNAPY =
    assumedYearlyDistribution &&
    bBALNSupply &&
    balnPrice &&
    assumedYearlyDistribution.div(bBALNSupply.times(balnPrice));

  const previousChunkAmount = 1000;

  const earnedPastMonth =
    earningsDataQuery.isSuccess && earningsDataQuery.data
      ? earningsDataQuery.data.income.loans
          .plus(earningsDataQuery.data.income.fund)
          // .plus(earningsDataQuery.data.income.liquidity.value)
          // .plus(
          //   Object.values(earningsDataQuery.data.income.fees).reduce(
          //     (total, fee) => total.plus(fee.value),
          //     new BigNumber(0),
          //   ),
          // )
          .plus(
            Object.values(earningsDataQuery.data.income.swaps).reduce(
              (total, swap) => total.plus(swap.value),
              new BigNumber(0),
            ),
          )
      : undefined;

  return {
    TVL: tvl,
    BALNMarketCap: BALNMarketCap?.integerValue().toNumber(),
    earned: earnedPastMonth?.toNumber(),
    platformDay: platformDay,
    monthlyFeesTotal: earningsDataQuery?.data?.feesDistributed,
    bBALNAPY: bBALNAPY,
    balnPrice: new BigNumber(balnPrice || 0),
    previousChunk:
      bBALNSupply &&
      earningsDataQuery?.data &&
      new BigNumber(previousChunkAmount).dividedBy(bBALNSupply).times(earningsDataQuery?.data?.feesDistributed),
    previousChunkAmount: previousChunkAmount,
  };
};

export const useGovernanceInfo = () => {
  const { data: platformDay } = usePlatformDayQuery();
  const proposalSampleSize = 20;

  return useQuery(`governanceOverview-${platformDay ? platformDay : 0}`, async () => {
    if (platformDay) {
      const eligibleVotersRaw = await bnJs.BBALN.activeUsersCount();
      const eligibleVoters = parseInt(eligibleVotersRaw);
      const totalProposalsRaw = await bnJs.Governance.getTotalProposal();
      const totalProposals = parseInt(totalProposalsRaw);
      const latestProposals = await bnJs.Governance.getProposals(
        totalProposals - (proposalSampleSize - 1),
        proposalSampleSize,
      );
      const activeProposals = latestProposals.filter(
        proposal =>
          platformDay &&
          proposal.status === 'Active' &&
          parseInt(proposal['start day'], 16) <= platformDay &&
          parseInt(proposal['end day'], 16) > platformDay,
      ).length;

      const participations = latestProposals
        .filter(proposal => proposal.status !== 'Active' && proposal.status !== 'Cancelled')
        .sort((a, b) => b.id - a.id)
        .splice(0, 10)
        .map(proposal => {
          const votedYes = parseInt(proposal['for'], 16);
          const votedNo = parseInt(proposal['against'], 16);
          return (votedYes + votedNo) / 10 ** 18;
        })
        .filter(participation => participation > 0);

      const participationRate =
        participations.reduce((total, participation) => total + participation, 0) / participations.length;

      return {
        activeProposals,
        totalProposals,
        participationRate,
        eligibleVoters,
      };
    }
  });
};

export function useLatestProposals() {
  return useQuery(`latestProposals`, async () => {
    const totalProposalsRaw = await bnJs.Governance.getTotalProposal();
    const totalProposals = parseInt(totalProposalsRaw);
    const latestProposals = await bnJs.Governance.getProposals(totalProposals - 9, 10);
    return latestProposals
      .filter(proposal => proposal.status !== 'Cancelled')
      .sort((a, b) => b.id - a.id)
      .splice(0, 3);
  });
}

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

export const useIncentivisedPairs = (): UseQueryResult<
  { name: string; id: number; rewards: Fraction; totalStaked: number }[],
  Error
> => {
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

        const sourcesTotalStaked = await Promise.all(
          sourceIDs.map(
            async (source, index) => await bnJs.StakedLP.totalStaked(index === 0 ? 1 : parseInt(source, 16)),
          ),
        );

        return lpSources.map((source, index) => ({
          name: source,
          id: index === 0 ? 1 : parseInt(sourceIDs[index], 16),
          rewards: rewards[source],
          totalStaked: parseInt((sourcesTotalStaked[index] as string) ?? '0x0', 16),
        }));
      }
    },
    {
      keepPreviousData: true,
    },
  );
};

export const useCollateralInfo = () => {
  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;
  const rateQuery = useBnJsContractQuery<string>(bnJs, 'Staking', 'getTodayRate', []);
  const rate = rateQuery.isSuccess ? BalancedJs.utils.toIcx(rateQuery.data) : null;
  const { data: collateralData, isSuccess: collateralDataQuerySuccess } = useAllCollateralData();

  return useQuery(
    `collateralInfoAt${now}`,
    async () => {
      if (collateralData) {
        const IISSInfo = await bnJs.IISS.getIISSInfo();
        const PRepsInfo = await bnJs.IISS.getPReps();

        const totalDelegated = PRepsInfo ? new BigNumber(PRepsInfo?.totalDelegated) : undefined;
        const stakingAPY =
          IISSInfo && totalDelegated
            ? new BigNumber(IISSInfo?.variable.Iglobal)
                .times(new BigNumber(IISSInfo.variable.Ivoter).times(12))
                .div(totalDelegated.times(100))
                .toNumber()
            : undefined;

        return {
          collateralData,
          rate: rate?.toNumber(),
          stakingAPY: stakingAPY,
        };
      }
    },
    {
      enabled: collateralDataQuerySuccess,
      keepPreviousData: true,
    },
  );
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

  const { data: tokenPrices } = useTokenPrices();

  const loansAPY =
    dailyRewards && totalBnUSD && tokenPrices
      ? dailyRewards.times(365).times(tokenPrices['BALN']).div(totalBnUSD.times(tokenPrices['bnUSD']))
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

export function useFundInfo() {
  const fiveMinPeriod = 1000 * 300;
  const now = Math.floor(new Date().getTime() / fiveMinPeriod) * fiveMinPeriod;
  const { data: blockThen, isSuccess: blockHeightSuccess } = useBlockDetails(
    new Date(now).setDate(new Date().getDate() - 30),
  );

  return useQuery(
    'fundInfo',
    async () => {
      const feeIn = await bnJs.StabilityFund.getFeeIn();
      const feeOut = await bnJs.StabilityFund.getFeeOut();

      const fundFeesNow = await bnJs.FeeHandler.getStabilityFundFeesAccrued();
      const fundFeesThen = await bnJs.FeeHandler.getStabilityFundFeesAccrued(blockThen?.number);

      return {
        feeIn: Number(formatUnits(feeIn, 18, 2)),
        feeOut: Number(formatUnits(feeOut, 18, 2)),
        feesGenerated: new BigNumber(formatUnits(fundFeesNow))
          .minus(new BigNumber(formatUnits(fundFeesThen)))
          .toNumber(),
      };
    },
    {
      enabled: blockHeightSuccess,
      keepPreviousData: true,
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
  const { data: allPairs, isSuccess: allPairsQuerySuccess } = useAllPairsIncentivisedByName();

  return useQuery(
    `daoBBALNData${now}`,
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
          const feesApy = allPairs && allPairs[sourceName] ? allPairs[sourceName].feesApy || 0 : 0;
          const balnApy = allPairs && allPairs[sourceName] ? allPairs[sourceName].balnApy || 0 : 0;

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
    { keepPreviousData: true, refetchOnReconnect: false, refetchInterval: undefined, enabled: allPairsQuerySuccess },
  );
}

export function useBorrowersInfo() {
  const { data: collateralTokens, isSuccess: collateralTokensSuccess } = useSupportedCollateralTokens();

  return useQuery<{ [key in string]: number }, Error>(
    `borrowersInfo`,
    async () => {
      if (collateralTokens) {
        const collateralSymbols = Object.keys(collateralTokens);
        const collateralAddresses = Object.values(collateralTokens);

        const cds: CallData[] = collateralAddresses.map(address => ({
          target: bnJs.Loans.address,
          method: 'getBorrowerCount',
          params: [address],
        }));

        const data = await bnJs.Multicall.getAggregateData(cds);

        let total = 0;
        const result = data.reduce((borrowersInfo, item, index) => {
          const borrowers = parseInt(item, 16);
          borrowersInfo[collateralSymbols[index]] = borrowers;
          total += borrowers;
          return borrowersInfo;
        }, {} as { [key in string]: number });

        result['total'] = total;

        return result;
      }
    },
    {
      keepPreviousData: true,
      enabled: collateralTokensSuccess,
    },
  );
}

type WithdrawalsFloorDataType = {
  percentageFloor: BigNumber;
  floorTimeDecayInHours: BigNumber;
  assetFloorData: { floor: BigNumber; current: BigNumber; token: TokenStats }[];
};

export function useWithdrawalsFloorCollateralData(): UseQueryResult<WithdrawalsFloorDataType> {
  const { data: collateralTokens, isSuccess: collateralTokensSuccess } = useSupportedCollateralTokens();
  const { data: allTokens, isSuccess: tokensSuccess } = useAllTokensByAddress();

  return useQuery(
    `withdrawalsFloorData-${collateralTokens && Object.keys(collateralTokens).length}-tokens`,
    async () => {
      if (collateralTokens && allTokens) {
        const collateralAddresses = Object.values(collateralTokens);

        const percentageFloorCallData = {
          target: bnJs.Loans.address,
          method: 'getFloorPercentage',
          params: [],
        };

        const floorTimeDelayCallData = {
          target: bnJs.Loans.address,
          method: 'getTimeDelayMicroSeconds',
          params: [],
        };

        const cds: CallData[] = [
          percentageFloorCallData,
          floorTimeDelayCallData,
          ...collateralAddresses.map(address => ({
            target: bnJs.Loans.address,
            method: 'getCurrentFloor',
            params: [address],
          })),
        ];

        const data = await bnJs.Multicall.getAggregateData(cds);

        const percentageFloor = new BigNumber(data[0]).div(10000);
        const floorTimeDecayInHours = new BigNumber(data[1]).div(1000 * 1000 * 60 * 60);

        const currentCollateralCds: CallData[] = collateralAddresses.map(address => ({
          target: address,
          method: 'balanceOf',
          params: [bnJs.Loans.address],
        }));

        const currentData = await bnJs.Multicall.getAggregateData(currentCollateralCds);

        const assetFloorData = data
          .slice(2)
          .map((item, index) => {
            const token = allTokens[collateralAddresses[index]];
            return {
              floor: new BigNumber(item).div(10 ** token.decimals),
              current: new BigNumber(currentData[index]).div(10 ** token.decimals),
              token,
            };
          })
          .filter(item => item.floor.isGreaterThan(0))
          .sort((a, b) => (a.floor.isGreaterThan(b.floor) ? -1 : 1));

        return {
          percentageFloor,
          floorTimeDecayInHours,
          assetFloorData,
        };
      }
    },
    {
      keepPreviousData: true,
      refetchInterval: 5000,
      enabled: collateralTokensSuccess && tokensSuccess,
    },
  );
}

export function useWithdrawalsFloorDEXData(): UseQueryResult<WithdrawalsFloorDataType> {
  const { data: allTokens, isSuccess: tokensSuccess } = useAllTokensByAddress();

  return useQuery(
    `withdrawalsFloorDEXData-${tokensSuccess ? 'tokens' : ''}`,
    async () => {
      const tokens = [bnJs.BALN.address, bnJs.sICX.address, bnJs.bnUSD.address];

      if (allTokens) {
        const percentageFloorCallData = {
          target: bnJs.Dex.address,
          method: 'getFloorPercentage',
          params: [],
        };

        const floorTimeDelayCallData = {
          target: bnJs.Dex.address,
          method: 'getTimeDelayMicroSeconds',
          params: [],
        };

        const cds: CallData[] = [
          percentageFloorCallData,
          floorTimeDelayCallData,
          ...tokens.map(address => ({
            target: bnJs.Dex.address,
            method: 'getCurrentFloor',
            params: [address],
          })),
        ];

        const data = await bnJs.Multicall.getAggregateData(cds);

        const percentageFloor = new BigNumber(data[0]).div(10000);
        const floorTimeDecayInHours = new BigNumber(data[1]).div(1000 * 1000 * 60 * 60);

        const currentAssetCds: CallData[] = tokens.map(address => ({
          target: address,
          method: 'balanceOf',
          params: [bnJs.Dex.address],
        }));

        const currentData = await bnJs.Multicall.getAggregateData(currentAssetCds);

        const assetFloorData = data
          .slice(2)
          .map((item, index) => {
            const token = allTokens[tokens[index]];
            return {
              floor: new BigNumber(item).div(10 ** token.decimals),
              current: new BigNumber(currentData[index]).div(10 ** token.decimals),
              token,
            };
          })
          .sort((a, b) => (a.floor.isGreaterThan(b.floor) ? -1 : 1));

        return {
          percentageFloor,
          floorTimeDecayInHours,
          assetFloorData,
        };
      }
    },
    {
      keepPreviousData: true,
      refetchInterval: 5000,
      enabled: tokensSuccess,
    },
  );
}

export function useWithdrawalsFloorStabilityFundData(): UseQueryResult<WithdrawalsFloorDataType> {
  const { data: supportedTokens, isSuccess: supportedTokensSuccess } = useWhitelistedTokensList();

  return useQuery(
    `withdrawalsFloorData-${supportedTokens && Object.keys(supportedTokens).length}`,
    async () => {
      if (supportedTokens) {
        const { data: allTokens } = await axios.get(`${API_ENDPOINT}tokens`);

        const percentageFloorCallData = {
          target: bnJs.StabilityFund.address,
          method: 'getFloorPercentage',
          params: [],
        };

        const floorTimeDelayCallData = {
          target: bnJs.StabilityFund.address,
          method: 'getTimeDelayMicroSeconds',
          params: [],
        };

        const cds: CallData[] = [
          percentageFloorCallData,
          floorTimeDelayCallData,
          ...supportedTokens.map(address => ({
            target: bnJs.StabilityFund.address,
            method: 'getCurrentFloor',
            params: [address],
          })),
        ];

        const data = await bnJs.Multicall.getAggregateData(cds);

        const percentageFloor = new BigNumber(data[0]).div(10000);
        const floorTimeDecayInHours = new BigNumber(data[1]).div(1000 * 1000 * 60 * 60);

        const currentFundAssetsCds: CallData[] = supportedTokens.map(address => ({
          target: address,
          method: 'balanceOf',
          params: [bnJs.StabilityFund.address],
        }));

        const currentData = await bnJs.Multicall.getAggregateData(currentFundAssetsCds);

        const assetFloorData = data
          .slice(2)
          .map((item, index) => {
            const token = allTokens.find(token => token.address === supportedTokens[index]);
            return {
              floor: token ? new BigNumber(item).div(10 ** token.decimals) : new BigNumber(0),
              current: token ? new BigNumber(currentData[index]).div(10 ** token.decimals) : new BigNumber(0),
              token,
            };
          })
          .filter(item => item.floor.isGreaterThan(0))
          .sort((a, b) => (a.floor.isGreaterThan(b.floor) ? -1 : 1));

        return {
          percentageFloor,
          floorTimeDecayInHours,
          assetFloorData,
        };
      }
    },
    {
      keepPreviousData: true,
      refetchInterval: 5000,
      enabled: supportedTokensSuccess,
    },
  );
}
