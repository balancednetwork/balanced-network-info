/**
 * Asynchronously loads the component for HomePage
 */

import { lazyLoad } from 'utils/loadable';

export const TokenPage = lazyLoad(
  () => import('./index'),
  module => module.TokenPage,
);
