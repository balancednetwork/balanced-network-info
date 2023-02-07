import { Granularity } from './types';

export const GRANULARITY_MILLISECONDS: { [key in Granularity]: number } = {
  day: 86400000,
  week: 604800000,
  month: 2628000000,
};
