import axios from 'axios';
import { useQuery } from 'react-query';

const API_ENDPOINT = 'https://tracker.v2.mainnet.sng.vultr.icon.community/api/v1/';

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
