import axios from 'axios';
import { useQuery } from 'react-query';

const API_ENDPOINT = 'https://balanced.icon.community/api/v1/';

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

export function useAllTokens(mapBy?: 'symbol' | 'address') {
  return useQuery(`allTokens${mapBy}`, async () => {
    const response = await axios.get(`${API_ENDPOINT_VULTR}tokens`);

    if (response.status === 200) {
      if (mapBy) {
        return response.data.reduce((allTokens, item) => {
          allTokens[item[mapBy]] = item;
          return allTokens;
        }, {});
      } else {
        return response.data;
      }
    }
  });
}
