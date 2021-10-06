import BigNumber from 'bignumber.js';

export interface ContractInfo {
  symbol: string;
  displayName: string;
}

export interface ContractData {
  info: ContractInfo;
  tokens: BigNumber;
}

export interface PerformaceData {
  days_counted: number;
  expenses: ContractData[];
  income: {
    loans_fees: BigNumber;
    swap_fees: ContractData[];
  };
}
