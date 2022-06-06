import ContractSettings from '../contractSettings';
import { Contract } from './contract';

export default class StabilityFund extends Contract {
  constructor(contractSettings: ContractSettings) {
    super(contractSettings);
    this.address = 'cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6';
  }

  getAcceptedTokens() {
    const callParams = this.paramsBuilder({
      method: 'getAcceptedTokens',
    });

    return this.call(callParams);
  }
}
