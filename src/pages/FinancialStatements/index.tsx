import React from 'react';

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import CurrencyIcon from 'components/CurrencyIcon';
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

const IncomeGrid = styled.div`
  display: grid;
  grid-template-columns: 4fr 3fr 3fr;
  align-items: stretch;
  min-width: 700px;
`;

const GridItem = styled.div`
  text-align: right;
  &:nth-of-type(3n + 1) {
    text-align: left;
  }
`;

const GridItemHeader = styled(GridItem)`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 3px;
  color: #d5d7db;
  padding: 25px 0 20px;
`;

const GridItemStrong = styled(GridItem)`
  padding-bottom: 10px;
  font-weight: 700;

  &:nth-of-type(3n + 1) {
    padding-left: 25px;
  }
`;

const GridItemLight = styled(GridItem)`
  padding-bottom: 15px;

  &:nth-of-type(3n + 1) {
    padding-left: 50px;
  }
`;

const GridItemSubtotal = styled(GridItemStrong)`
  border-top: 1px solid #304a68;
  border-bottom: 1px solid #304a68;
  padding-top: 9px;

  &:nth-of-type(3n + 1) {
    padding-left: 0;
  }
`;

const GridItemTotal = styled(GridItemSubtotal)`
  border-bottom: 0;
`;

const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: 12fr 11fr 11fr;
  align-items: stretch;
  min-width: 600px;
`;

const GridItemToken = styled(GridItem)`
  padding: 20px 0;
  border-bottom: 1px solid #304a68;
`;

const Change = styled.span<{ percentage: Number }>`
  ${({ percentage }) => percentage > 0 && `color: #2fccdc`}
  ${({ percentage }) => percentage < 0 && `color: red`}
`;

const GridItemAssetTotal = styled(GridItemTotal)`
  border-top: 0;
  padding-top: 20px;
`;

const ScrollHelper = styled.div`
  max-width: 100;
  overflow-x: auto;
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
        <ScrollHelper>
          <IncomeGrid>
            <GridItemHeader>INCOME</GridItemHeader>
            <GridItemHeader>JUL 23 - AUG 22 2021</GridItemHeader>
            <GridItemHeader>JUN 23 - JUL 22 2021</GridItemHeader>

            <GridItemStrong>Loan fees</GridItemStrong>
            <GridItemStrong>$300,000.00</GridItemStrong>
            <GridItemStrong>$1,000,000.00</GridItemStrong>

            <GridItemLight>Balanced Dollars (bnUSD)</GridItemLight>
            <GridItemLight>300,000 ($300,000)</GridItemLight>
            <GridItemLight>1,000,000 ($1,000,000)</GridItemLight>

            <GridItemStrong>Swap fees</GridItemStrong>
            <GridItemStrong>$200,000.00</GridItemStrong>
            <GridItemStrong>$500,000.00</GridItemStrong>

            <GridItemLight>Balance Tokens (BALN)</GridItemLight>
            <GridItemLight>75,000</GridItemLight>
            <GridItemLight>90,000</GridItemLight>

            <GridItemLight>Balanced Dollars (bnUSD)</GridItemLight>
            <GridItemLight>50,000</GridItemLight>
            <GridItemLight>200,000</GridItemLight>

            <GridItemLight>Staked ICX (sICX)</GridItemLight>
            <GridItemLight>75,000</GridItemLight>
            <GridItemLight>50,000</GridItemLight>

            <GridItemSubtotal>Subtotal</GridItemSubtotal>
            <GridItemSubtotal>$500,000.00</GridItemSubtotal>
            <GridItemSubtotal>$1,500,000.00</GridItemSubtotal>

            <GridItemHeader>Expenses</GridItemHeader>
            <GridItemHeader></GridItemHeader>
            <GridItemHeader></GridItemHeader>

            <GridItemStrong>Network fee payout</GridItemStrong>
            <GridItemStrong>$300,000.00</GridItemStrong>
            <GridItemStrong>$900,000.00</GridItemStrong>

            <GridItemLight>Balance Tokens (BALN)</GridItemLight>
            <GridItemLight>60,000</GridItemLight>
            <GridItemLight>1,000,000</GridItemLight>

            <GridItemLight>Balanced Dollars (bnUSD)</GridItemLight>
            <GridItemLight>120,000</GridItemLight>
            <GridItemLight>360,000</GridItemLight>

            <GridItemLight>Staked ICX (sICX)</GridItemLight>
            <GridItemLight>80,000</GridItemLight>
            <GridItemLight>240,000</GridItemLight>

            <GridItemTotal>Total</GridItemTotal>
            <GridItemTotal>$200,000.00</GridItemTotal>
            <GridItemTotal>$600,000.00</GridItemTotal>
          </IncomeGrid>
        </ScrollHelper>
      </BoxPanel>

      <BoxPanel bg="bg2" mb={10}>
        <Typography variant="h2">Balance sheets</Typography>
        <ScrollHelper>
          <BalanceGrid>
            <GridItemHeader>Asset</GridItemHeader>
            <GridItemHeader>4 MAY 2021</GridItemHeader>
            <GridItemHeader>27 APRIL 2021</GridItemHeader>

            <GridItemToken>
              <Flex alignItems="center">
                <CurrencyIcon currencyKey={'BALN'} width={40} height={40} />
                <Box ml={2}>
                  <Text color="text">Balance Tokens</Text>
                  <Text color="text" opacity={0.75}>
                    BALN
                  </Text>
                </Box>
              </Flex>
            </GridItemToken>
            <GridItemToken>
              <Text color="text">
                $300,000 <Change percentage={2}>(+2%)</Change>
              </Text>
              <Text color="text" opacity={0.75}>
                300,000 BALN
              </Text>
            </GridItemToken>
            <GridItemToken>
              <Text color="text">$250,000</Text>
              <Text color="text" opacity={0.75}>
                250,000 BALN
              </Text>
            </GridItemToken>

            <GridItemToken>
              <Flex alignItems="center">
                <CurrencyIcon currencyKey={'bnUSD'} width={40} height={40} />
                <Box ml={2}>
                  <Text color="text">Balanced Dollars</Text>
                  <Text color="text" opacity={0.75}>
                    bnUSD
                  </Text>
                </Box>
              </Flex>
            </GridItemToken>
            <GridItemToken>
              <Text color="text">
                $250,000 <Change percentage={2}>(+12%)</Change>
              </Text>
              <Text color="text" opacity={0.75}>
                250,000 bnUSD
              </Text>
            </GridItemToken>
            <GridItemToken>
              <Text color="text">$1,000,000</Text>
              <Text color="text" opacity={0.75}>
                1,000,000 bnUSD
              </Text>
            </GridItemToken>

            <GridItemToken>
              <Flex alignItems="center">
                <CurrencyIcon currencyKey={'sICX'} width={40} height={40} />
                <Box ml={2}>
                  <Text color="text">Staked ICX</Text>
                  <Text color="text" opacity={0.75}>
                    sICX
                  </Text>
                </Box>
              </Flex>
            </GridItemToken>
            <GridItemToken>
              <Text color="text">
                $200,000 <Change percentage={2}>(+5%)</Change>
              </Text>
              <Text color="text" opacity={0.75}>
                200,000 sICX
              </Text>
            </GridItemToken>
            <GridItemToken>
              <Text color="text">$500,000</Text>
              <Text color="text" opacity={0.75}>
                500,000 sICX
              </Text>
            </GridItemToken>

            <GridItemAssetTotal>Total</GridItemAssetTotal>
            <GridItemAssetTotal>$800,000.00 </GridItemAssetTotal>
            <GridItemAssetTotal>$650,000.00</GridItemAssetTotal>
          </BalanceGrid>
        </ScrollHelper>
      </BoxPanel>

      <Divider />
      <Footer />
    </Container>
  );
}
