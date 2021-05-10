import addresses from '../addresses';
import ContractSettings from '../contractSettings';
import { Contract } from './contract';

export default class Daofund extends Contract {
  constructor(contractSettings: ContractSettings) {
    super(contractSettings);
    this.address = addresses[this.nid].daofund;
  }

  getBalances(params: { _base: string; _quote: string }) {
    const callParams = this.paramsBuilder({
      method: 'getBalances',
      params,
    });

    return this.call(callParams);
  }
}
