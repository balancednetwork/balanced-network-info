import React from 'react';

import { Text } from 'rebass/styled-components';

import CurrencyIcon from 'components/CurrencyIcon';

import { TokenName, TokenDetails, TokenInfo, TokenDetailProps } from './ICXDetail';
import TokenMetrics from './TokenMetrics';

const BnUSDDetail = ({ token }: TokenDetailProps) => {
  return (
    <>
      <TokenName>
        <CurrencyIcon currencyKey={token.symbol} width={75} height={75} />
        <Text>{token.name}</Text>
      </TokenName>
      <TokenDetails>
        <TokenInfo>{`Balanced Dollars (bnUSD) is a stablecoin backed by ICX, tied to the value of 1 USD. It’s the first synthetic asset created on Balanced, and the first stablecoin for the ICON Network. It was created to replace ICX for payments, trades, and in-app purchases within the ICON ecosystem, and beyond.`}</TokenInfo>
        <TokenMetrics token={token} />
      </TokenDetails>
    </>
  );
};

export default BnUSDDetail;
