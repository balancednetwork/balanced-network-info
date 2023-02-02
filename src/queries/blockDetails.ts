import { addresses } from '@balancednetwork/balanced-js';
import { Currency, CurrencyAmount } from '@balancednetwork/sdk-core';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useRatesQuery, useWhitelistedTokensList } from 'queries';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { SUPPORTED_PAIRS } from 'constants/pairs';
import { SUPPORTED_TOKENS_LIST, NULL_CONTRACT_ADDRESS, SUPPORTED_TOKENS_MAP_BY_ADDRESS } from 'constants/tokens';

const API_ENDPOINT = 'https://tracker.icon.community/api/v1/';

const SUPPORTED_TOKENS_LIST_WITHOUT_ICX = SUPPORTED_TOKENS_LIST.filter(
  token => token.address !== NULL_CONTRACT_ADDRESS,
);

const stabilityFundAddress = addresses[1].stabilityfund;
const daoFundAddress = addresses[1].daofund;

type BlockDetails = {
  timestamp: number;
  number: number;
};

export const useBlockDetails = (timestamp: number) => {
  const getBlock = async (): Promise<BlockDetails> => {
    const { data } = await axios.get(`${API_ENDPOINT}blocks/timestamp/${timestamp * 1000}`);
    return data;
  };
  return useQuery<BlockDetails>(`getBlock${timestamp}`, getBlock);
};

export const useDaoFundHoldings = (timestamp: number) => {
  const { data: blockDetails } = useBlockDetails(timestamp);
  const blockHeight = blockDetails?.number;

  return useQuery<{ [key: string]: CurrencyAmount<Currency> }>(`daoFundHoldings${blockHeight}`, async () => {
    const currencyAmounts: CurrencyAmount<Currency>[] = await Promise.all(
      SUPPORTED_TOKENS_LIST_WITHOUT_ICX.map(async token => {
        try {
          const contract = bnJs.getContract(token.address);
          const balance = await contract.balanceOf(daoFundAddress, blockHeight);
          return CurrencyAmount.fromRawAmount(token, balance);
        } catch (e) {
          console.error(e);
          return CurrencyAmount.fromRawAmount(token, 0);
        }
      }),
    );
    const holdings = {};
    currencyAmounts.forEach(currencyAmount => (holdings[currencyAmount.currency.wrapped.address] = currencyAmount));
    return holdings;
  });
};

export const useStabilityFundHoldings = (timestamp: number) => {
  const { data: addresses } = useWhitelistedTokensList();
  const { data: blockDetails } = useBlockDetails(timestamp);
  const whitelistedTokens = addresses || [];
  const blockHeight = blockDetails?.number;

  return useQuery<{ [key: string]: CurrencyAmount<Currency> }>(
    `stabilityFundHoldings${whitelistedTokens.length}${blockHeight}`,
    async () => {
      const currencyAmounts: CurrencyAmount<Currency>[] = await Promise.all(
        whitelistedTokens.map(async address => {
          const token = SUPPORTED_TOKENS_LIST.filter(token => token.address === address)[0];
          const contract = bnJs.getContract(address);
          const balance = await contract.balanceOf(stabilityFundAddress, blockHeight);
          return CurrencyAmount.fromRawAmount(token, balance);
        }),
      );
      const holdings = {};
      currencyAmounts.forEach(currencyAmount => (holdings[currencyAmount.currency.wrapped.address] = currencyAmount));
      return holdings;
    },
  );
};

export const usePOLData = (timestamp: number) => {
  const { data: rates } = useRatesQuery();
  const { data: blockDetails } = useBlockDetails(timestamp);
  const blockHeight = blockDetails?.number;
  const pools = [2];

  return useQuery(`POLData${blockHeight}with-${rates && Object.keys(rates).length}-rates`, async () => {
    const poolDataSets = await Promise.all(
      pools.map(async poolID => {
        const balance = await bnJs.StakedLP.balanceOf(bnJs.DAOFund.address, poolID, blockHeight);
        const poolStats = await bnJs.Dex.getPoolStats(poolID, blockHeight);

        return {
          poolID,
          balance,
          poolStats,
        };
      }),
    );

    return poolDataSets.map(dataSet => {
      if (rates && SUPPORTED_TOKENS_MAP_BY_ADDRESS[dataSet.poolStats['quote_token']]) {
        const LPBalanceDAO = new BigNumber(dataSet.balance).div(10 ** 18);
        const LPBalanceTotal = new BigNumber(dataSet.poolStats['total_supply']).div(10 ** 18);
        const DAOFraction = LPBalanceDAO.div(LPBalanceTotal);
        const quoteAmount = new BigNumber(dataSet.poolStats['quote']).div(
          10 ** parseInt(dataSet.poolStats['quote_decimals'], 16),
        );
        const baseAmount = new BigNumber(dataSet.poolStats['base']).div(
          10 ** parseInt(dataSet.poolStats['base_decimals'], 16),
        );
        const quoteValue = quoteAmount.times(
          rates[SUPPORTED_TOKENS_MAP_BY_ADDRESS[dataSet.poolStats['quote_token']].symbol!],
        );
        const poolLiquidity = quoteValue.times(2);
        const poolData = {
          id: dataSet.poolID,
          liquidity: poolLiquidity.div(LPBalanceTotal).times(LPBalanceDAO),
          pair: SUPPORTED_PAIRS.find(pair => pair.id === dataSet.poolID),
          DAOQuoteAmount: quoteAmount.times(DAOFraction),
          DAOBaseAmount: baseAmount.times(DAOFraction),
        };
        return poolData;
      } else {
        return {
          id: null,
          liquidity: new BigNumber(0),
          pair: null,
          DAOQuoteAmount: new BigNumber(0),
          DAOBaseAmount: new BigNumber(0),
        };
      }
    });
  });
};
