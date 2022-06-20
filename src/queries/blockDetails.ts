import { addresses } from '@balancednetwork/balanced-js';
import { Currency, CurrencyAmount } from '@balancednetwork/sdk-core';
import axios from 'axios';
import { useWhitelistedTokensList } from 'queries';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { SUPPORTED_TOKENS_LIST, NULL_CONTRACT_ADDRESS } from 'constants/tokens';

const API_ENDPOINT = 'https://tracker.v2.mainnet.sng.vultr.icon.community/api/v1/';

const SUPPORTED_TOKENS_LIST_WITHOUT_ICX = SUPPORTED_TOKENS_LIST.filter(
  token => token.address !== NULL_CONTRACT_ADDRESS,
);

const stabilityFundAddress = addresses[1].stabilityfund;
const daoFundAddress = addresses[1].daofund;

type BlockDetails = {
  timestamp: number;
  number: number;
};

const useBlockDetails = (timestamp: number) => {
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
