import axios from 'axios';
import { BlockDetails } from 'queries/blockDetails';
import { useQuery, UseQueryResult } from 'react-query';

import bnJs from 'bnJs';

import { HistoryForParams } from './types';
import { GRANULARITY_MILLISECONDS } from './utils';

const API_ENDPOINT = 'https://tracker.icon.community/api/v1/';

const getBlock = async (timestamp): Promise<BlockDetails> => {
  const { data } = await axios.get(`${API_ENDPOINT}blocks/timestamp/${timestamp * 1000}`);
  return data;
};

export default function useHistoryFor(params: HistoryForParams): UseQueryResult {
  const { contract, method, methodParams = [], granularity, uniqueID, startTime, endTime, transformation } = params;

  return useQuery(
    `useHistoryFor-${contract}-${method}-${uniqueID}-${granularity}-${startTime}-${endTime}}`,
    async () => {
      let timestamps: number[] = [];
      let currentTimestamp = startTime;
      while (currentTimestamp < endTime) {
        timestamps.push(currentTimestamp);
        currentTimestamp += GRANULARITY_MILLISECONDS[granularity];
      }

      const blockHeights = await Promise.all(timestamps.map(timestamp => getBlock(timestamp)));

      try {
        const cx = bnJs[contract];
        const dataSet = await Promise.all(
          blockHeights.map(async blockHeight => {
            const params = methodParams.map(param => (param.isNumber ? Number(param.value) : param.value));
            const data = await cx[method](...params, blockHeight.number);
            return {
              //maybe add templating for the return object
              timestamp: Math.floor(blockHeight.timestamp / 1000),
              value: transformation(data),
            };
          }),
        );

        return dataSet;
      } catch (e) {
        console.error('useHistory fetch error: ', e);
      }
    },
    {
      keepPreviousData: true,
    },
  );
}
