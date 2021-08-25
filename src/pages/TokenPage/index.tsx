import React from 'react';

import { useAllTokens, Token } from 'queries';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Footer from 'components/Footer';
import Header from 'components/Header';
import BALNDetail from 'components/TokenDetails/BALNDetail';
import BnUSDDetail from 'components/TokenDetails/BnUSDDetail';
import ICXDetail from 'components/TokenDetails/ICXDetail';
import SICXDetail from 'components/TokenDetails/SICXDetail';
import { Container, Divider } from 'pages/StatsPage';

const TokenDetails = {
  ICX: ICXDetail,
  sICX: SICXDetail,
  bnUSD: BnUSDDetail,
  BALN: BALNDetail,
};

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

const BreadcrumbsCurrent = styled(Text)`
  color: #fff;
`;

const StyledLink = styled(Link)`
  color: #2fccdc;
  text-decoration: none;
`;

export function TokenPage({
  match: {
    params: { ticker },
  },
}) {
  const allTokens = useAllTokens();
  const symbol: string[] | undefined = allTokens && Object.keys(allTokens).filter(key => key.toLowerCase() === ticker);
  const token: Token | undefined = allTokens && symbol && allTokens[symbol[0]];
  const TokenDetail = TokenDetails[token ? token.symbol : ''];

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
        <TokenDetail token={token} />
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
