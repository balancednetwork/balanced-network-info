import React from 'react';

import { Token } from 'queries';
// import { collateralInfo } from 'queries/index';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import CurrencyIcon from 'components/CurrencyIcon';
// import { getFormattedNumber } from 'utils/formatter';

import TokenMetrics from './TokenMetrics';

export const TokenName = styled(Flex)`
  font-size: 60px;
  color: #fff;
  line-height: 60px;
  position: relative;
  font-weight: 700;
  align-items: center;

  @keyframes loadup {
    from {
      width: 0;
    }
    to {
      width: 125px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
     font-size: 30px;
    line-height: 37px;
  `}

  img,
  svg {
    margin-right: 20px;
  }

  &:after {
    content: '';
    display: block;
    height: 5px;
    margin-top: 25px;
    background-image: linear-gradient(120deg, #2ca9b7, #1b648f);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 100%;
    animation: loadup 1s ease forwards;
  }
`;

export const TokenDetails = styled(Box)`
  display: grid;
  grid-template-columns: [info] auto [stats] 400px;
  grid-gap: 50px;
  padding-top: 60px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
  `}
`;

export const TokenInfo = styled(Text)`
  color: rgba(255, 255, 255, 0.75);
  font-size: 18px;
  line-height: 32px;
`;

export interface TokenDetailProps {
  token: Token;
}

const ICXDetail = ({ token }: TokenDetailProps) => {
  return (
    <>
      <TokenName>
        <CurrencyIcon currencyKey={token.symbol} width={75} height={75} />
        <Text>{token.name}</Text>
      </TokenName>
      <TokenDetails>
        <TokenInfo>
          {`ICON is a decentralized blockchain network focused on interoperability, and ICX is the native cryptocurrency. If you stake ICX in a supported wallet, you'll earn regular staking rewards, based on ICON's variable reward rate (currently 10.41% per year).`}
          <LineBreak />
          {`On Balanced, you can use ICX as collateral to borrow synthetic assets, like Balanced Dollars.`}
          {/* {collateralInfo.stakingAPY ? getFormattedNumber(collateralInfo.stakingAPY, 'percent2') : '-'} */}
        </TokenInfo>
        <TokenMetrics token={token} />
      </TokenDetails>
    </>
  );
};

export const LineBreak = () => (
  <>
    <br />
    <br />
  </>
);

export default ICXDetail;
