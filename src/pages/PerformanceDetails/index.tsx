import React from 'react';

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Footer from 'components/Footer';
import Header from 'components/Header';
import { Container, Divider } from 'pages/StatsPage';
import { Typography } from 'theme';

import EarningsSection from './sections/EarningSection';
import HoldingsSection from './sections/HoldingsSection';

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

export const GridItem = styled.div`
  text-align: right;
  &:nth-of-type(3n + 1) {
    text-align: left;
  }
`;

export const ScrollHelper = styled.div`
  max-width: 100;
  overflow-x: auto;
`;

export const GridItemHeader = styled(GridItem)`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 3px;
  color: #ffffff;
  padding: 25px 0 20px;
`;

export const GridItemStrong = styled(GridItem)`
  padding-bottom: 10px;
  font-weight: 700;
  color: #ffffff;

  &:nth-of-type(3n + 1) {
    padding-left: 25px;
  }
`;

export const GridItemLight = styled(GridItem)`
  padding-bottom: 15px;

  &:nth-of-type(3n + 1) {
    padding-left: 50px;
  }
`;

export const GridItemSubtotal = styled(GridItemStrong)`
  border-top: 1px solid #304a68;
  border-bottom: 1px solid #304a68;
  padding-top: 9px;

  &:nth-of-type(3n + 1) {
    padding-left: 0;
  }
`;

export const GridItemTotal = styled(GridItemSubtotal)`
  border-bottom: 0;
`;

export const GridItemToken = styled(GridItem)`
  padding: 20px 0;
  border-bottom: 1px solid #304a68;
`;

export const GridItemAssetTotal = styled(GridItemTotal)`
  border-top: 0;
  padding-top: 20px;
`;

export const TextWithArrow = styled.span`
  color: #2fccdc;
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &:after {
    content: '';
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 7px solid #2fccdc;
    display: inline-flex;
    margin-left: 6px;
    margin-top: 3px;
  }
`;

export function PerformanceDetails() {
  return (
    <Container>
      <Helmet>
        <title>Performance details | Balanced</title>
      </Helmet>

      <Header />

      <Breadcrumbs>
        <BreadcrumbsLink to="/">Stats</BreadcrumbsLink>
        <BreadcrumbsSeparator>{'>'}</BreadcrumbsSeparator>
        <BreadcrumbsCurrent>Performance details</BreadcrumbsCurrent>
      </Breadcrumbs>

      <Typography fontWeight="bold" fontSize={[45, 45, 60]} color="#fff">
        Performance details
      </Typography>
      <Perex>
        Track Balanced's performance over time. All $ values are in USD, based on the current price of each asset.
      </Perex>

      <EarningsSection />

      <HoldingsSection />

      <Divider />
      <Footer />
    </Container>
  );
}
