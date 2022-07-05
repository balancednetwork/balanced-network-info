import axios from 'axios';
import { useQuery } from 'react-query';

const API_ENDPOINT = 'https://balanced.icon.community/api/v1/historical';

export type HistoricalDataType = {
  address: string;
  timestamp: number;
  updateInterval: number;
  method: string;
  days_since_launch: number;
  date: string;
  contract_name: string;
  value: number;
};

export const useHistoricalDataQuery = (
  contract: string,
  method: string,
  skip: number = 0,
  limit: number = 1000,
  days_ago?: number,
  start_timestamp?: number,
  end_timestamp?: number,
) => {
  return useQuery<HistoricalDataType[]>(
    `historicalQuery|${skip}|${limit}|${contract}|${method}|${days_ago}|${start_timestamp}|${end_timestamp}`,
    async () => {
      const { data } = await axios.get(
        `${API_ENDPOINT}?skip=${skip}&limit=${limit}&address=${contract}&method=${method}${
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
