import { Fraction } from '@balancednetwork/sdk-core';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useBnJsContractQuery, useIncentivisedPairs } from 'queries';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import { formatUnits } from 'utils';

const API_ENDPOINT = 'https://balanced.icon.community/api/v1/';

export type ContractMethodsDataType = {
  address: string;
  timestamp: number;
  updateInterval: number;
  method: string;
  days_since_launch: number;
  date: string;
  contract_name: string;
  value: number;
};

export const useContractMethodsDataQuery = (
  contract: string,
  method: string,
  skip: number = 0,
  limit: number = 1000,
  days_ago?: number,
  start_timestamp?: number,
  end_timestamp?: number,
) => {
  return useQuery<ContractMethodsDataType[]>(
    `historicalQuery|${skip}|${limit}|${contract}|${method}|${days_ago}|${start_timestamp}|${end_timestamp}`,
    async () => {
      const { data } = await axios.get(
        `${API_ENDPOINT}contract-methods?skip=${skip}&limit=${limit}&address=${contract}&method=${method}${
          days_ago ? `&days_ago=${days_ago}` : ''
        }${start_timestamp ? `&start_timestamp=${start_timestamp}` : ''}${
          end_timestamp ? `&end_timestamp=${end_timestamp}` : ''
        }`,
      );

      return data.map(item => {
        item.timestamp *= 1_000;
        return item;
      });
    },
  );
};

export function useAllTokens() {
  const MIN_LIQUIDITY_TO_INCLUDE = 500;

  return useQuery(
    `allTokens`,
    async () => {
      const response = await axios.get(`${API_ENDPOINT}tokens`);

      if (response.status === 200) {
        return response.data
          .map(item => {
            item['market_cap'] = item.total_supply * item.price;
            return item;
          })
          .filter(item => item['liquidity'] > MIN_LIQUIDITY_TO_INCLUDE || item['address'] === 'ICX');
      }
    },
    {
      keepPreviousData: true,
    },
  );
}

export function useAllTokensByAddress() {
  const { data: allTokens, isSuccess: allTokensSuccess } = useAllTokens();

  return useQuery(
    `allTokensByAddress`,
    () => {
      return allTokens.reduce((tokens, item) => {
        tokens[item['address']] = item;
        return tokens;
      }, {});
    },
    {
      keepPreviousData: true,
      enabled: allTokensSuccess,
    },
  );
}

export type Pair = {
  id: string;
  name: string;
  baseAddress: string;
  quoteAddress: string;
  baseSymbol: string;
  quoteSymbol: string;
  liquidity: number;
  fees24h: number;
  fees30d: number;
  volume24h: number;
  volume30d: number;
  feesApy: number;
  balnApy?: number;
  totalSupply: number;
};

export function useAllPairs() {
  const MIN_LIQUIDITY_TO_INCLUDE = 1000;

  return useQuery<Pair[]>(
    `allPairs`,
    async () => {
      const response = await axios.get(`${API_ENDPOINT}pools`);

      if (response.status === 200) {
        try {
          const pairs = response.data.map(item => {
            const liquidity = item['base_supply'] * item['base_price'] + item['quote_supply'] * item['quote_price'];
            const fees24hProviders =
              item['base_lp_fees_24h'] * item['base_price'] + item['quote_lp_fees_24h'] * item['quote_price'];
            const fees24hBaln =
              item['base_baln_fees_24h'] * item['base_price'] + item['quote_baln_fees_24h'] * item['quote_price'];
            const fees30dProviders =
              item['base_lp_fees_30d'] * item['base_price'] + item['quote_lp_fees_30d'] * item['quote_price'];
            const fees30dBaln =
              item['base_baln_fees_30d'] * item['base_price'] + item['quote_baln_fees_30d'] * item['quote_price'];
            const volume24h =
              item['base_volume_24h'] * item['base_price'] + item['quote_volume_24h'] * item['quote_price'];
            const volume30d =
              item['base_volume_30d'] * item['base_price'] + item['quote_volume_30d'] * item['quote_price'];

            const fees24h = fees24hProviders + fees24hBaln;
            const fees30d = fees30dProviders + fees30dBaln;
            const feesApy = liquidity > 0 ? (fees30dProviders * 12) / liquidity : 0;

            const pair: Pair = {
              id: item['pool_id'],
              name: item['name'],
              baseAddress: item['base_address'],
              quoteAddress: item['quote_address'],
              baseSymbol: item['base_symbol'],
              quoteSymbol: item['quote_symbol'],
              liquidity,
              fees24h: fees24h || 0,
              fees30d: fees30d || 0,
              volume24h,
              volume30d,
              feesApy: feesApy || 0,
              totalSupply: item['total_supply'],
            };

            return pair;
          });

          return pairs.filter(item => item.liquidity >= MIN_LIQUIDITY_TO_INCLUDE || item.name === 'sICX/ICX');
        } catch (e) {
          console.error('Error while working with fetched pools data: ', e);
        }
      }
    },
    {
      keepPreviousData: true,
      refetchInterval: 4000,
    },
  );
}

export function useAllPairsIncentivised() {
  const { data: allPairs } = useAllPairs();
  const { data: allTokens } = useAllTokensByAddress();
  const { data: incentivisedPairs } = useIncentivisedPairs();
  const { data: dailyDistributionRaw } = useBnJsContractQuery<string>(bnJs, 'Rewards', 'getEmission', []);
  const balnPrice: number = allTokens ? allTokens[bnJs.BALN.address].price : 0;
  const dailyDistribution = dailyDistributionRaw && new BigNumber(formatUnits(dailyDistributionRaw, 18, 4));

  return useQuery<Pair[] | undefined>(
    `allPairsIncentivised-${allPairs ? allPairs.length : 0}-${incentivisedPairs ? incentivisedPairs.length : 0}-${
      dailyDistribution ? dailyDistribution.toFixed(2) : 0
    }-${balnPrice}`,
    () => {
      if (allPairs) {
        return allPairs.map(item => {
          const incentivisedPair =
            incentivisedPairs && incentivisedPairs.find(incentivisedPair => incentivisedPair.id === parseInt(item.id));

          if (incentivisedPair && dailyDistribution) {
            const stakedRatio =
              incentivisedPair.id !== 1
                ? new Fraction(incentivisedPair.totalStaked, item['totalSupply'])
                : new Fraction(1);
            item['balnApy'] = dailyDistribution
              .times(new BigNumber(incentivisedPair.rewards.toFixed(4)))
              .times(365)
              .times(balnPrice)
              .div(new BigNumber(stakedRatio.toFixed(18)).times(item.liquidity))
              .toNumber();
            item['stakedRatio'] = stakedRatio;

            return item;
          }
          return item;
        });
      }
    },
    {
      keepPreviousData: true,
    },
  );
}

export function useAllPairsIncentivisedById() {
  const { data: allPairs } = useAllPairsIncentivised();

  return useQuery<{ [key in string]: Pair } | undefined>(
    `allPairsIncentivisedById-${allPairs ? allPairs.length : 0}`,
    () => {
      if (allPairs) {
        return allPairs.reduce((allPairs, item) => {
          allPairs[item['id']] = item;
          return allPairs;
        }, {});
      }
    },
    {
      keepPreviousData: true,
    },
  );
}

export function useAllPairsIncentivisedByName() {
  const { data: allPairs } = useAllPairsIncentivised();

  return useQuery<{ [key in string]: Pair } | undefined>(
    `allPairsIncentivisedByName-${allPairs ? allPairs.length : 0}`,
    () => {
      if (allPairs) {
        return allPairs.reduce((allPairs, item) => {
          allPairs[item['name']] = item;
          return allPairs;
        }, {});
      }
    },
    {
      keepPreviousData: true,
    },
  );
}

export function useAllPairsById() {
  const { data: allPairs, isSuccess: allPairsSuccess } = useAllPairs();

  return useQuery<{ [key in string]: Pair } | undefined>(
    'allPairsById',
    () => {
      if (allPairs) {
        return allPairs.reduce((allPairs, item) => {
          allPairs[item['id']] = item;
          return allPairs;
        }, {});
      }
    },
    {
      keepPreviousData: true,
      enabled: allPairsSuccess,
    },
  );
}
export function useAllPairsByName() {
  const { data: allPairs, isSuccess: allPairsSuccess } = useAllPairs();

  return useQuery<{ [key in string]: Pair } | undefined>(
    'allPairsByName',
    () => {
      if (allPairs) {
        return allPairs.reduce((allPairs, item) => {
          allPairs[item['name']] = item;
          return allPairs;
        }, {});
      }
    },
    {
      keepPreviousData: true,
      enabled: allPairsSuccess,
    },
  );
}

export const useAllPairsTotal = () => {
  const { data: allPairs, isSuccess: allPairsSuccess } = useAllPairs();

  return useQuery<{ tvl: number; volume: number; fees: number } | undefined>(
    'pairsTotal',
    () => {
      if (allPairs) {
        return Object.values(allPairs).reduce(
          (total, pair) => {
            total.tvl += pair.liquidity;
            total.volume += pair.volume24h ? pair.volume24h : 0;
            total.fees += pair.fees24h ? pair.fees24h : 0;
            return total;
          },
          { tvl: 0, volume: 0, fees: 0 },
        );
      }
    },
    {
      keepPreviousData: true,
      enabled: allPairsSuccess,
    },
  );
};

export function useTokenPrices() {
  const { data: allTokens, isSuccess: allTokensSuccess } = useAllTokens();

  return useQuery<{ [key in string]: BigNumber }>(
    `tokenPrices${allTokens}`,
    () => {
      return allTokens.reduce((tokens, item) => {
        tokens[item['symbol']] = new BigNumber(item.price);
        return tokens;
      }, {});
    },
    {
      keepPreviousData: true,
      enabled: allTokensSuccess,
    },
  );
}

function trimStartingZeroValues(array: any[]): any[] {
  if (array) {
    return array.filter((item, index) => item && array[Math.min(index + 1, array.length - 1)].value !== 0);
  } else {
    return [];
  }
}

function setTimeToMs(array: any[]): any[] {
  return array.map(item => {
    item.timestamp *= 1_000;
    return item;
  });
}

type CollateralData = {
  series: { [key in string]: { timestamp: number; value: number; IUSDC?: number; USDS?: number; BUSD?: number }[] };
  current: { [key in string]: { amount: number; value: number } };
};

export function useAllCollateralData() {
  const { data: tokenPrices, isSuccess: isTokenQuerySuccess } = useTokenPrices();

  return useQuery(
    `allCollateralDataBE`,
    async () => {
      if (tokenPrices) {
        const result: CollateralData = {
          series: {},
          current: {},
        };
        const responseSICX = await axios.get(
          `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=loans_sICX_balance`,
        );
        const responseETH = await axios.get(
          `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=loans_ETH_balance`,
        );
        const responseBTCB = await axios.get(
          `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=loans_BTCB_balance`,
        );
        const responseFundBUSD = await axios.get(
          `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=stability_BUSD_balance`,
        );
        const responseFundIUSDC = await axios.get(
          `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=stability_IUSDC_balance`,
        );
        const responseFundUSDS = await axios.get(
          `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=stability_USDS_balance`,
        );

        try {
          const seriesSICX = setTimeToMs(trimStartingZeroValues(responseSICX.data));
          const seriesETH = setTimeToMs(trimStartingZeroValues(responseETH.data));
          const seriesBTCB = setTimeToMs(trimStartingZeroValues(responseBTCB.data));
          const seriesFundBUSD = setTimeToMs(trimStartingZeroValues(responseFundBUSD.data));
          const seriesFundIUSDC = setTimeToMs(trimStartingZeroValues(responseFundIUSDC.data));
          const seriesFundUSDS = setTimeToMs(trimStartingZeroValues(responseFundUSDS.data));

          const seriesFundBUSDReversed = seriesFundBUSD.slice().reverse();
          const seriesFundIUSDCReversed = seriesFundIUSDC.slice().reverse();
          const seriesFundUSDSReversed = seriesFundUSDS.slice().reverse();

          const seriesFundTotalReversed = seriesFundUSDSReversed.map((item, index) => {
            let currentTotal = item.value;

            if (seriesFundIUSDCReversed[index] && seriesFundIUSDCReversed[index].timestamp === item.timestamp) {
              currentTotal += seriesFundIUSDCReversed[index].value;
            }

            if (seriesFundBUSDReversed[index] && seriesFundBUSDReversed[index].timestamp === item.timestamp) {
              currentTotal += seriesFundBUSDReversed[index].value;
            }

            return {
              timestamp: item.timestamp,
              value: Math.floor(currentTotal),
            };
          });

          const seriesFundTotalStacked = seriesFundIUSDCReversed.map((item, index) => {
            const combinedItem = {
              timestamp: item.timestamp,
              IUSDC: item.value,
              value: 0,
            };

            if (seriesFundUSDSReversed[index]) {
              combinedItem['USDS'] = seriesFundUSDSReversed[index].value;
            }

            if (seriesFundBUSDReversed[index]) {
              combinedItem['BUSD'] = seriesFundBUSDReversed[index].value;
            }

            return combinedItem;
          });

          const seriesSICXReversed = seriesSICX.slice().reverse();
          const seriesETHReversed = seriesETH.slice().reverse();
          const seriesBTCBReversed = seriesBTCB.slice().reverse();

          const seriesTotalReversed = seriesSICXReversed.map((item, index) => {
            let currentTotal = tokenPrices['sICX'].times(item.value);

            if (seriesETHReversed[index]) {
              currentTotal = currentTotal.plus(tokenPrices['ETH'].times(seriesETHReversed[index].value));
            }

            if (seriesBTCBReversed[index]) {
              currentTotal = currentTotal.plus(tokenPrices['BTCB'].times(seriesBTCBReversed[index].value));
            }

            if (seriesFundTotalReversed[index]) {
              currentTotal = currentTotal.plus(seriesFundTotalReversed[index].value);
            }

            return {
              timestamp: item.timestamp,
              value: Math.floor(currentTotal.toNumber()),
            };
          });

          result.series['sICX'] = seriesSICX;
          result.series['ETH'] = seriesETH;
          result.series['BTCB'] = seriesBTCB;
          result.series['fundBUSD'] = seriesFundBUSD;
          result.series['fundIUSDC'] = seriesFundIUSDC;
          result.series['fundUSDS'] = seriesFundUSDS;
          result.series['fundTotal'] = seriesFundTotalReversed.reverse();
          result.series['fundTotalStacked'] = seriesFundTotalStacked.reverse();
          result.series['total'] = seriesTotalReversed.reverse();

          result.current['sICX'] = {
            amount: seriesSICX[seriesSICX.length - 1].value,
            value: tokenPrices['sICX'].times(seriesSICX[seriesSICX.length - 1].value).toNumber(),
          };
          result.current['ETH'] = {
            amount: seriesETH[seriesETH.length - 1].value,
            value: tokenPrices['ETH'].times(seriesETH[seriesETH.length - 1].value).toNumber(),
          };
          result.current['BTCB'] = {
            amount: seriesBTCB[seriesBTCB.length - 1].value,
            value: tokenPrices['BTCB'].times(seriesBTCB[seriesBTCB.length - 1].value).toNumber(),
          };
          result.current['fundTotal'] = {
            amount: result.series['fundTotal'][result.series['fundTotal'].length - 1].value,
            value: result.series['fundTotal'][result.series['fundTotal'].length - 1].value,
          };
          result.current['total'] = {
            amount: result.series['total'][result.series['total'].length - 1].value,
            value: result.series['total'][result.series['total'].length - 1].value,
          };

          return result;
        } catch (e) {
          console.error(e);
        }
      }
    },
    {
      enabled: isTokenQuerySuccess,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );
}

export function useCollateralDataFor(daysBack: number) {
  const { data: collateralData, isSuccess: collateralDataQuerySuccess } = useAllCollateralData();

  function trimDays(array) {
    if (array.length <= daysBack) {
      return array;
    } else {
      return array.slice().slice(1 - (daysBack + 1));
    }
  }

  return useQuery(
    `collateralDataFor-${daysBack}-days`,
    () => {
      if (daysBack === -1) {
        return collateralData;
      } else {
        if (collateralData) {
          const copy = JSON.parse(JSON.stringify(collateralData));
          const trimmedSeries = Object.keys(copy.series).reduce((trimmed, current) => {
            trimmed[current] = trimDays(copy.series[current]);
            return trimmed;
          }, {});
          copy.series = trimmedSeries;
          return copy;
        }
      }
    },
    {
      enabled: collateralDataQuerySuccess,
      keepPreviousData: true,
    },
  );
}

export function useAllDebtData() {
  return useQuery('allDebtDataBE', async () => {
    const responseSICX = await axios.get(
      `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=loans_collateral_debt_sICX_bnusd`,
    );
    const responseETH = await axios.get(
      `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=loans_collateral_debt_ETH_bnusd`,
    );
    const responseBTCB = await axios.get(
      `${API_ENDPOINT}contract-methods?skip=0&limit=1000&contract_name=loans_collateral_debt_BTCB_bnusd`,
    );
    const responseTotal = await axios.get(
      `${API_ENDPOINT}contract-methods?skip=0&limit=1000&address=${bnJs.bnUSD.address}&method=totalSupply`,
    );

    try {
      const seriesSICX = responseSICX.data && setTimeToMs(trimStartingZeroValues(responseSICX.data));
      const seriesETH = responseSICX.data && setTimeToMs(trimStartingZeroValues(responseETH.data));
      const seriesBTCB = responseSICX.data && setTimeToMs(trimStartingZeroValues(responseBTCB.data));
      const seriesTotal = responseTotal.data && setTimeToMs(trimStartingZeroValues(responseTotal.data));

      return {
        sICX: seriesSICX,
        ETH: seriesETH,
        BTCB: seriesBTCB,
        [predefinedCollateralTypes.ALL]: seriesTotal,
      };
    } catch (e) {
      console.error(e);
    }
  });
}

export function useDebtDataFor(daysBack: number) {
  const { data: debtData, isSuccess: debtDataQuerySuccess } = useAllDebtData();

  function trimDays(array) {
    if (array.length <= daysBack) {
      return array;
    } else {
      return array.slice().slice(1 - (daysBack + 1));
    }
  }

  return useQuery(
    `collateralDebtFor-${daysBack}-days`,
    () => {
      if (daysBack === -1) {
        return debtData;
      } else {
        if (debtData) {
          let copy = JSON.parse(JSON.stringify(debtData));
          const trimmedSeries = Object.keys(copy).reduce((trimmed, current) => {
            trimmed[current] = trimDays(copy[current]);
            return trimmed;
          }, {});
          copy = trimmedSeries;
          return copy;
        }
      }
    },
    {
      enabled: debtDataQuerySuccess,
      keepPreviousData: true,
    },
  );
}
