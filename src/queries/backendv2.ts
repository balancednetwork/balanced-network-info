import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useBnJsContractQuery, useIncentivisedPairs } from 'queries';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { formatUnits } from 'utils';

// const API_ENDPOINT = 'https://balanced.icon.community/api/v1/';
const API_ENDPOINT = 'https://balanced.TEMPORARY_OFF';
const API_ENDPOINT_VULTR = 'https://balanced.mainnet.sng.vultr.icon.community/api/v1/';

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
  const MIN_MARKETCAP_TO_INCLUDE = 5000;

  return useQuery(
    `allTokens`,
    async () => {
      const response = await axios.get(`${API_ENDPOINT_VULTR}tokens`);

      if (response.status === 200) {
        return response.data
          .map(item => {
            item['market_cap'] = item.total_supply * item.price;
            return item;
          })
          .filter(item => item['market_cap'] > MIN_MARKETCAP_TO_INCLUDE);
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
  liquidity: number;
  fees24h: number;
  fees30d: number;
  volume24h: number;
  volume30d: number;
  feesApy: number;
  balnApy?: number;
};

export function useAllPairs() {
  const { data: allTokens, isSuccess: allTokensSuccess } = useAllTokensByAddress();
  const { data: incentivisedPairs, isSuccess: incentivisedPairsSuccess } = useIncentivisedPairs();
  const { data: dailyDistributionRaw, isSuccess: dailyDistributionSuccess } = useBnJsContractQuery<string>(
    bnJs,
    'Rewards',
    'getEmission',
    [],
  );

  const MIN_LIQUIDITY_TO_INCLUDE = 1000;

  return useQuery<Pair[]>(
    `allPairs-${incentivisedPairs && incentivisedPairs.length}-${dailyDistributionRaw}`,
    async () => {
      const response = await axios.get(`${API_ENDPOINT_VULTR}pools`);

      if (response.status === 200 && incentivisedPairs && dailyDistributionRaw && allTokens) {
        const dailyDistribution = new BigNumber(formatUnits(dailyDistributionRaw, 18, 4));
        const balnPrice: number = allTokens[bnJs.BALN.address].price;

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

            const incentivisedPair = incentivisedPairs.find(incentivisedPair => incentivisedPair.name === item.name);

            const pair: Pair = {
              id: item['pool_id'],
              name: item['name'],
              baseAddress: item['base_address'],
              quoteAddress: item['quote_address'],
              liquidity,
              fees24h,
              fees30d,
              volume24h,
              volume30d,
              feesApy,
            };

            if (incentivisedPair) {
              pair['balnApy'] = dailyDistribution
                .times(new BigNumber(incentivisedPair.rewards.toFixed(4)))
                .times(365)
                .times(balnPrice)
                .div(liquidity)
                .toNumber();
            }

            return pair;
          });

          return pairs.filter(item => item.liquidity >= MIN_LIQUIDITY_TO_INCLUDE);
        } catch (e) {
          console.error('Error while working with fetched pools data: ', e);
        }
      }
    },
    {
      keepPreviousData: true,
      enabled: incentivisedPairsSuccess && dailyDistributionSuccess && allTokensSuccess,
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
