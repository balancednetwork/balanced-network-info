import React from 'react';

import { useAllTokens, Token } from 'queries';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Footer from 'components/Footer';
import Header from 'components/Header';
import { CurrencyKey } from 'constants/currency';
import { tokenInfo } from 'constants/tokenInfo';
import { getCurrencyKeyIcon } from 'utils';
import { getFormattedNumber } from 'utils/formatter';

const Container = styled(Box)`
  /* disable margin collapse */
  display: flex;
  flex-direction: column;
  max-width: 1280px;
  min-height: 100vh;
  margin-left: auto;
  margin-right: auto;
  padding-left: 40px;
  padding-right: 40px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding-left: 5%;
    padding-right: 5%;
  `}
`;

const Divider = styled(Box)`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-bottom: 20px;
  margin-top: 80px;
`;

const Breadcrumbs = styled(Flex)`
  padding: 40px 0 70px;
  font-size: 20px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}
`;

const BreadcrumbsLink = styled(Link)`
  text-decoration: none;
  position: relative;
  color: #2fccdc;
  padding-bottom: 3px;
  margin-bottom: -9px;
  &:hover {
    &:after {
      width: 100%;
    }
  }
  &:after {
    content: '';
    display: block;
    height: 3px;
    margin-top: 3px;
    background-image: linear-gradient(120deg, #2ca9b7, #1b648f);
    border-radius: 3px;
    transition: width 0.3s ease, background-color 0.3s ease;
    width: 0;
  }
`;

const BreadcrumbsSeparator = styled(Text)`
  color: #fff;
  font-size: 16px;
  line-height: 26px;
  padding: 0 12px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
    line-height: 18px;
  `}
`;

const TokenName = styled(Flex)`
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

const TokenDetails = styled(Box)`
  display: grid;
  grid-template-columns: [info] auto [stats] 400px;
  grid-gap: 50px;
  padding-top: 60px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
  `}
`;

const BreadcrumbsCurrent = styled(Text)`
  color: #fff;
`;

const TokenInfo = styled(Text)`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 35px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 18px;
    line-height: 32px;
  `}
`;

const StyledLink = styled(Link)`
  color: #2fccdc;
  text-decoration: none;
`;

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

export function TokenPage({
  match: {
    params: { ticker },
  },
}) {
  const allTokens = useAllTokens();
  const symbol: string[] | undefined = allTokens && Object.keys(allTokens).filter(key => key.toLowerCase() === ticker);
  const token: Token | undefined = allTokens && symbol && allTokens[symbol[0]];

  return (
    <Container>
      <Helmet>
        <title>{token ? `${token.name}` : `Unknown token name `}</title>
      </Helmet>
      <Header />
      <Breadcrumbs>
        <BreadcrumbsLink to="/">Stats</BreadcrumbsLink>
        <BreadcrumbsSeparator>{'>'}</BreadcrumbsSeparator>
        {token ? (
          <BreadcrumbsCurrent>{token.name}</BreadcrumbsCurrent>
        ) : (
          <BreadcrumbsCurrent>{ticker}</BreadcrumbsCurrent>
        )}
      </Breadcrumbs>
      {token ? (
        <>
          <TokenName>
            <CurrencyIcon currencyKey={token.symbol} />
            <Text>{token.name}</Text>
          </TokenName>
          <TokenDetails>
            <TokenInfo
              dangerouslySetInnerHTML={{ __html: tokenInfo[token.symbol] && tokenInfo[token.symbol] }}
            ></TokenInfo>
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
                  <TokenStatsItemLabel>Total supply</TokenStatsItemLabel>
                  <TokenStatsItemValue>–</TokenStatsItemValue>
                </TokenStatsItem>
                <TokenStatsItem>
                  <TokenStatsItemLabel>Circulating supply</TokenStatsItemLabel>
                  <TokenStatsItemValue>{getFormattedNumber(token.totalSupply, 'number')}</TokenStatsItemValue>
                </TokenStatsItem>
                <TokenStatsItem>
                  <TokenStatsItemLabel>24h volume</TokenStatsItemLabel>
                  <TokenStatsItemValue>–</TokenStatsItemValue>
                </TokenStatsItem>
              </TokenStats>
            </Box>
          </TokenDetails>
        </>
      ) : (
        <Text fontSize={20}>
          {ticker} is invalid token name, see <StyledLink to="/">stats page</StyledLink> for more info.
        </Text>
      )}
      <Divider />
      <Footer />
    </Container>
  );
}

function CurrencyIcon({ currencyKey }: { currencyKey: CurrencyKey }) {
  const Icon = getCurrencyKeyIcon(currencyKey);

  return <Icon width={75} height={75} />;
}
