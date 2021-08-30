/**
 * Asynchronously loads the component for HomePage
 */

import { lazyLoad } from 'utils/loadable';

export const FinancialStatementsPage = lazyLoad(
  () => import('./index'),
  module => module.FinancialStatements,
);
