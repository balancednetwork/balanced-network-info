import React from 'react';

import { useHoldingsDataQuery } from 'queries';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import CurrencyIcon from 'components/CurrencyIcon';
import { BoxPanel } from 'components/Panel';
import { Typography } from 'theme';

import { GridItemToken, GridItemAssetTotal, GridItemHeader, ScrollHelper } from '../../index';

const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: 12fr 11fr 11fr;
  align-items: stretch;
  min-width: 600px;
`;

const Change = styled.span<{ percentage: Number }>`
  ${({ percentage }) => percentage > 0 && `color: #2fccdc`}
  ${({ percentage }) => percentage < 0 && `color: red`}
`;

const HoldingsSection = () => {
  const holdingsDataQuery = useHoldingsDataQuery();
  const { data: holdings } = holdingsDataQuery;
  console.log(holdings);
  // if (holdings) {
  //   holdings.map(value => {
  //     console.log('=========');
  //     console.log('symbol: ', value.symbol);
  //     console.log('tokens: ', value.tokens.integerValue().toNumber());
  //     console.log('value: ', getFormattedNumber(value.value.integerValue().toNumber(), 'currency0'));
  //   });
  // }

  return (
    <BoxPanel bg="bg2" mb={10}>
      <Typography variant="h2">Holdings</Typography>
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
  );
};

export default HoldingsSection;
