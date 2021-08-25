import React from 'react';

import { Text } from 'rebass/styled-components';

import CurrencyIcon from 'components/CurrencyIcon';

import { TokenName, TokenDetails, TokenInfo, TokenDetailProps } from './ICXDetail';
import TokenMetrics from './TokenMetrics';

const BALNDetail = ({ token }: TokenDetailProps) => {
  return (
    <>
      <TokenName>
        <CurrencyIcon currencyKey={token.symbol} width={75} height={75} />
        <Text>{token.name}</Text>
      </TokenName>
      <TokenDetails>
        <TokenInfo>{`The Balance Token (BALN) is the Balanced governance token. When staked, it entitles the holder to voting rights and a share of the network fees. You can earn Balance Tokens by using Balanced: either take out a loan, or supply liquidity to the exchange.
            <br /><br />
            The Balance Token supply increases daily: 100,000 BALN is distributed each day for the first 60 days, then it tapers by 0.5% a day until it reaches 1,250 (<2% inflation).`}</TokenInfo>
        <TokenMetrics token={token} />
      </TokenDetails>
    </>
  );
};

export default BALNDetail;
