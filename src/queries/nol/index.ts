import BigNumber from 'bignumber.js';
import bnJs from 'bnJs';
import { getTimestampFrom } from 'pages/PerformanceDetails/utils';
import { useAllPairs, useAllTokensByAddress } from 'queries/backendv2';
import { useBlockDetails } from 'queries/blockDetails';
import { UseQueryResult, useQuery } from 'react-query';
import { CHART_COLORS } from 'sections/BALNSection/queries';

// const NOL_LP_CHART_COLORS = {
//   'sICX/bnUSD': '#2ca9b7',
//   'AVAX/bnUSD': '#E84142',
//   'BNB/bnUSD': '#F1B90A',
// };

function useNOLPools(): UseQueryResult<string[] | undefined> {
  return useQuery('nolPools', async () => {
    const orders = await bnJs.NOL.getOrders();
    return orders.map(order => order.pid);
  });
}

export function useNetworkOwnedLiquidityData(): UseQueryResult<
  | {
      chartData: { label: string; value: BigNumber; fill: string }[];
      tvl: BigNumber;
    }
  | undefined
> {
  const { data: allPairs, isSuccess: allPairsQuerySuccess } = useAllPairs();
  const { data: allTokens, isSuccess: allTokensQuerySuccess } = useAllTokensByAddress();
  const { data: poolIDs, isSuccess: poolIDsQuerySuccess } = useNOLPools();

  return useQuery(
    `networkOwnedLiquidity`,
    async () => {
      if (!allPairs || !allTokens || !poolIDs) return;

      const poolDataSets = await Promise.all(
        poolIDs.map(async poolID => {
          const balanceUnstaked = await bnJs.Dex.balanceOf(bnJs.NOL.address, parseInt(poolID, 16));
          const balanceStaked = await bnJs.StakedLP.balanceOf(bnJs.NOL.address, parseInt(poolID, 16));
          const poolStats = await bnJs.Dex.getPoolStats(parseInt(poolID, 16));

          return {
            poolID,
            balance: new BigNumber(balanceUnstaked).plus(new BigNumber(balanceStaked)).div(10 ** 18),
            poolStats,
          };
        }),
      );

      const nolData = poolDataSets.map(dataSet => {
        const networkLP = dataSet.balance;
        const totalLP = new BigNumber(dataSet.poolStats['total_supply']).div(10 ** 18);
        const networkFraction = networkLP.div(totalLP);
        const quoteAmount = new BigNumber(dataSet.poolStats['quote']).div(
          10 ** parseInt(dataSet.poolStats['quote_decimals'], 16),
        );
        const baseAmount = new BigNumber(dataSet.poolStats['base']).div(
          10 ** parseInt(dataSet.poolStats['base_decimals'], 16),
        );
        const quoteValue = quoteAmount.times(allTokens ? allTokens[dataSet.poolStats['quote_token']].price : 1);
        const poolLiquidity = quoteValue.times(2);
        const poolData = {
          id: dataSet.poolID,
          liquidity: poolLiquidity.div(totalLP).times(networkLP),
          pair: allPairs?.find(pair => parseInt(pair.id) === parseInt(dataSet.poolID)),
          DAOQuoteAmount: quoteAmount.times(networkFraction),
          DAOBaseAmount: baseAmount.times(networkFraction),
        };

        return poolData;
      });

      return {
        chartData: nolData.map((data, index) => ({
          name: data.pair?.name,
          value: data.liquidity.toNumber(),
          fill: CHART_COLORS[index] || CHART_COLORS[CHART_COLORS.length - 1],
        })),
        tvl: nolData.reduce((acc, data) => acc.plus(data.liquidity), new BigNumber(0)),
      };
    },
    {
      keepPreviousData: true,
      enabled: allPairsQuerySuccess && allTokensQuerySuccess && poolIDsQuerySuccess,
    },
  );
}

export function usePastMonthSupply(): UseQueryResult<any> {
  const { data: blockDetails } = useBlockDetails(getTimestampFrom(30));
  const blockHeight = blockDetails?.number;
  const { data: allTokens } = useAllTokensByAddress();
  const ICXPrice = allTokens?.ICX.price;

  return useQuery(
    'pastMonthSupply',
    async () => {
      if (!blockHeight || !ICXPrice) return;

      try {
        const supplyNow = await bnJs.NOL.getInvestedEmissions();
        const supplyThen = await bnJs.NOL.getInvestedEmissions(blockHeight);

        return new BigNumber(supplyNow)
          .minus(supplyThen || 0)
          .div(10 ** 18)
          .times(ICXPrice);
      } catch (e) {
        console.error('Failed to fetch invested emissions', e);
      }
    },
    {
      keepPreviousData: true,
      enabled: !!blockHeight && !!ICXPrice,
    },
  );
}
