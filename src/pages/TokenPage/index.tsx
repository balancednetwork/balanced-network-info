import React from 'react';

import { useAllTokens } from 'queries';
import { Helmet } from 'react-helmet-async';
import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

import Footer from 'components/Footer';
import Header from 'components/Header';

import { Token } from '../../queries';

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
      {token ? <div>showing info {token.name}</div> : <div>Unknown token - {ticker}</div>}
      <Divider />
      <Footer />
    </Container>
  );
}
