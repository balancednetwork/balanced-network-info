import React from 'react';

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Footer from 'components/Footer';
import Header from 'components/Header';
import { BoxPanel } from 'components/Panel';
import { Container, Divider } from 'pages/StatsPage';
import { Typography } from 'theme';

const Breadcrumbs = styled(Flex)`
  padding: 40px 0 50px;
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

const Perex = styled(Text)`
  font-size: 18px;
  line-height: 32px;
  max-width: 600px;
`;

export function FinancialStatements() {
  return (
    <Container>
      <Helmet>
        <title>Financial Statements | Balanced</title>
      </Helmet>

      <Header />

      <Breadcrumbs>
        <BreadcrumbsLink to="/">Stats</BreadcrumbsLink>
        <BreadcrumbsSeparator>{'>'}</BreadcrumbsSeparator>
        <BreadcrumbsCurrent>Financial statements</BreadcrumbsCurrent>
      </Breadcrumbs>

      <Typography fontWeight="bold" fontSize={[45, 45, 60]} color="#fff">
        Financial statements
      </Typography>
      <Perex>
        Track Balanced's finances over time. All $ values are in USD, based on the current price of each asset.
      </Perex>

      <BoxPanel bg="bg2" mt={10} mb={10}>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant="h2">Income statement</Typography>
          <Text>Income earned</Text>
        </Flex>
      </BoxPanel>

      <BoxPanel bg="bg2" mb={10}>
        <Typography variant="h2">Balance sheets</Typography>
      </BoxPanel>

      <Divider />
      <Footer />
    </Container>
  );
}
