import React from 'react';

import { Text } from 'rebass/styled-components';

import CurrencyIcon from 'components/CurrencyIcon';

import { TokenName, TokenDetails, TokenInfo, TokenDetailProps, LineBreak } from './ICXDetail';
import TokenMetrics from './TokenMetrics';

const SICXDetail = ({ token }: TokenDetailProps) => {
  return (
    <>
      <TokenName>
        <CurrencyIcon currencyKey={token.symbol} width={75} height={75} />
        <Text>{token.name}</Text>
      </TokenName>
      <TokenDetails>
        <TokenInfo>
          {`Staked ICX (sICX) is ICX you can move around in a liquid state and still earn staking rewards. Every sICX you hold entitles you to a share of the ICX staking pool, and the value increases over time based on the ICON reward rate.`}
          <LineBreak />
          {`With sICX, you can unstake faster than traditional ICX unstaking. Pay a 1% premium to swap sICX for ICX, or unstake from the wallet section to join the unstaking queue, which could take anywhere from 5 minutes, up to the regular ICX unstaking time of ~7 days.`}
        </TokenInfo>
        <TokenMetrics token={token} />
      </TokenDetails>
    </>
  );
};

export default SICXDetail;
