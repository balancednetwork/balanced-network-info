import { Contract } from './contract';

export default class IRC2 extends Contract {
  name() {
    const callParams = this.paramsBuilder({
      method: 'name',
    });

    return this.call(callParams);
  }

  symbol() {
    const callParams = this.paramsBuilder({
      method: 'symbol',
    });

    return this.call(callParams);
  }

  decimals() {
    const callParams = this.paramsBuilder({
      method: 'decimals',
    });

    return this.call(callParams);
  }

  balanceOf(owner: string, blockHeight?: number) {
    const callParams = this.paramsBuilder({
      method: 'balanceOf',
      blockHeight: blockHeight,
      params: {
        _owner: owner,
      },
    });

    return this.call(callParams);
  }

  availableBalanceOf(owner: string) {
    const callParams = this.paramsBuilder({
      method: 'availableBalanceOf',
      params: {
        _owner: owner,
      },
    });

    return this.call(callParams);
  }

  totalSupply() {
    const callParams = this.paramsBuilder({
      method: 'totalSupply',
    });

    return this.call(callParams);
  }
}
