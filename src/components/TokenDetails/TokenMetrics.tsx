import React from 'react';

import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { getFormattedNumber } from 'utils/formatter';

import { TokenDetailProps } from './ICXDetail';

const TokenStats = styled(Box)`
  background: #144a68;
  padding: 35px;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 50px;
  grid-row-gap: 30px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 40px;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
    text-align: center;
  `}
`;

const TokenStatsItem = styled(Box)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-bottom: 25px;
    
    &:last-of-type {
      margin-bottom: 0;
    }
  `}
`;

const TokenStatsItemLabel = styled(Box)`
  margin-bottom: 5px;
`;

const TokenStatsItemValue = styled(Box)`
  font-size: 20px;
  color: #fff;
`;

const TokenMetrics = ({ token }: TokenDetailProps) => {
  return (
    <Box>
      <TokenStats>
        <TokenStatsItem>
          <TokenStatsItemLabel>Ticker</TokenStatsItemLabel>
          <TokenStatsItemValue>{token.symbol}</TokenStatsItemValue>
        </TokenStatsItem>
        <TokenStatsItem>
          <TokenStatsItemLabel>Price</TokenStatsItemLabel>
          <TokenStatsItemValue>{getFormattedNumber(token.price, 'currency2')}</TokenStatsItemValue>
        </TokenStatsItem>
        <TokenStatsItem>
          <TokenStatsItemLabel>Marketcap</TokenStatsItemLabel>
          <TokenStatsItemValue>{getFormattedNumber(token.marketCap, 'currency0')}</TokenStatsItemValue>
        </TokenStatsItem>
        <TokenStatsItem>
          <TokenStatsItemLabel>Circulating supply</TokenStatsItemLabel>
          <TokenStatsItemValue>{getFormattedNumber(token.totalSupply, 'number')}</TokenStatsItemValue>
        </TokenStatsItem>
      </TokenStats>
    </Box>
  );
};

export default TokenMetrics;
