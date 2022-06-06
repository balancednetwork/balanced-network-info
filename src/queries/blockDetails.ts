import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useWhitelistedTokensList } from 'queries';
import { useQuery } from 'react-query';

import bnJs from 'bnJs';
import { SUPPORTED_TOKENS_LIST } from 'constants/tokens';
import { Token } from 'types/balanced-sdk-core';

const API_ENDPOINT = 'https://tracker.v2.mainnet.sng.vultr.icon.community/api/v1/';

const stabilityFundAddress = 'cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6';

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

export const useStabilityFundHoldings = (timestamp: number) => {
  const { data: addresses } = useWhitelistedTokensList();
  const { data: blockDetails } = useBlockDetails(timestamp);
  const whitelistedTokens = addresses || [];
  const blockHeight = blockDetails?.number;

  return useQuery<{ [key: string]: { balance: BigNumber; info: Token } }>(
    `stabilityFundHoldings${whitelistedTokens.length}${blockHeight}`,
    async () => {
      const balances: Array<{ info: Token; balance: BigNumber }> = await Promise.all(
        whitelistedTokens.map(async address => {
          const token = SUPPORTED_TOKENS_LIST.filter(token => token.address === address)[0];
          const contract = bnJs.getContract(address);
          const decimals = await contract.decimals();
          const balance = await contract.balanceOf(stabilityFundAddress, blockHeight);
          return {
            info: token,
            balance: new BigNumber(balance).div(new BigNumber(10).pow(new BigNumber(decimals))),
          };
        }),
      );
      const holdings = {};
      balances.forEach(token => (holdings[token.info.address] = token));
      return holdings;
    },
  );
};
