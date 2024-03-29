import { useMemo } from 'react';

import { addresses } from '@balancednetwork/balanced-js';
import BigNumber from 'bignumber.js';
import { useTokenPrices } from 'queries/backendv2';
import { useHoldings, usePOLData } from 'queries/blockDetails';
import { useQuery } from 'react-query';

import { CHART_COLORS } from 'sections/BALNSection/queries';

const daoFundAddress = addresses[1].daofund;

const CHART_TOKENS_COLORS = {
  sICX: '#2ca9b7',
  BALN: '#1694b8',
  bnUSD: '#217f94',
  BTCB: '#E9983D',
  ETH: '#3D3D3D',
  default: '#334764',
};

export function useDAOFundTotal(timestamp: number) {
  const { data: POLData, isSuccess: isPOLDataSuccess } = usePOLData(timestamp);
  const { data: holdingsData, isSuccess: isHoldingsDataSuccess } = useHoldings(timestamp, daoFundAddress);
  const { data: tokenPrices, isSuccess: isTokenPricesSuccess } = useTokenPrices();

  return useMemo(() => {
    const holdings =
      holdingsData && tokenPrices
        ? Object.keys(holdingsData).reduce((total, contract) => {
            const token = holdingsData[contract].currency.wrapped;
            const curAmount = new BigNumber(holdingsData[contract].toFixed());
            if (tokenPrices[token.symbol!]) {
              return total + curAmount.times(tokenPrices[token.symbol!]).toNumber();
            } else {
              return total;
            }
          }, 0)
        : 0;

    const POLHoldings = POLData ? POLData.reduce((total, pool) => total + pool.liquidity.toNumber(), 0) : 0;

    if (isPOLDataSuccess && isHoldingsDataSuccess && isTokenPricesSuccess) {
      return {
        holdings,
        POLHoldings,
        total: holdings + POLHoldings,
      };
    }
  }, [POLData, holdingsData, isHoldingsDataSuccess, isPOLDataSuccess, isTokenPricesSuccess, tokenPrices]);
}

export function useDAOFundHoldingsPieData() {
  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: tokenPrices, isSuccess: isTokenPricesSuccess } = useTokenPrices();
  const { data: holdingsData, isSuccess: isHoldingsDataSuccess } = useHoldings(now, daoFundAddress);

  return useQuery(
    `daoFundHoldingsPIE${now}-tokens${tokenPrices ? Object.keys(tokenPrices).length : 0}-${
      holdingsData ? Object.keys(holdingsData).length : 0
    }`,
    () => {
      const data =
        holdingsData && tokenPrices
          ? Object.keys(holdingsData)
              .filter(contract => {
                const token = holdingsData[contract].currency.wrapped;
                const curAmount = new BigNumber(holdingsData[contract].toFixed());
                if (tokenPrices[token.symbol!]) {
                  return curAmount.times(tokenPrices[token.symbol!]).toNumber() > 1000;
                } else {
                  return false;
                }
              })
              .map(contract => {
                const token = holdingsData[contract].currency.wrapped;
                const curAmount = new BigNumber(holdingsData[contract].toFixed());
                if (tokenPrices && tokenPrices[token.symbol!]) {
                  return {
                    name: token.symbol,
                    value: curAmount.times(tokenPrices[token.symbol!]).toNumber(),
                    fill: CHART_TOKENS_COLORS[token.symbol!] || CHART_TOKENS_COLORS.default,
                    amount: curAmount.toNumber(),
                  };
                } else {
                  return {};
                }
              })
          : [];

      const template = ['bnUSD', 'sICX', 'BALN'];
      return data.sort((a, b) => {
        const aIndex = template.indexOf(a.name!);
        const bIndex = template.indexOf(b.name!);

        if (aIndex === -1 && bIndex === -1) {
          return b.value! - a.value!;
        } else if (aIndex === -1) {
          return 1;
        } else if (bIndex === -1) {
          return -1;
        } else {
          return aIndex - bIndex;
        }
      });
    },
    {
      keepPreviousData: true,
      enabled: isTokenPricesSuccess && isHoldingsDataSuccess,
    },
  );
}

export function useDAOFundPOLPieData() {
  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: POLData, isSuccess: isPOLDataSuccess } = usePOLData(now);

  return useQuery(
    `daoFundHoldings${now}-tokens${POLData ? POLData.length : 0}-${POLData ? Object.keys(POLData).length : 0}`,
    () => {
      const data = POLData
        ? POLData.map((pool, index) => {
            return {
              name: pool?.pair?.name,
              value: pool.liquidity.toNumber(),
              fill: CHART_COLORS[index] || CHART_COLORS[CHART_COLORS.length - 1],
            };
          }).filter(pool => pool.value > 1000)
        : [];

      const template = ['sICX/bnUSD', 'ETH/bnUSD', 'BTCB/bnUSD', 'BALN'];
      return data.sort((a, b) => {
        const aIndex = template.indexOf(a.name!);
        const bIndex = template.indexOf(b.name!);

        if (aIndex === -1 && bIndex === -1) {
          return b.value! - a.value!;
        } else if (aIndex === -1) {
          return 1;
        } else if (bIndex === -1) {
          return -1;
        } else {
          return aIndex - bIndex;
        }
      });
    },
    {
      keepPreviousData: true,
      enabled: isPOLDataSuccess,
    },
  );
}
