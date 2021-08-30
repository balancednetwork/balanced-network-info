import React from 'react';

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Footer from 'components/Footer';
import Header from 'components/Header';
import { Container, Divider } from 'pages/StatsPage';
import { Typography } from 'theme';

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
        Financial statementss
      </Typography>

      <Divider />
      <Footer />
    </Container>
  );
}
