import React from 'react';

import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import { CurrencyKey } from 'constants/currency';
import { Typography } from 'theme';
import { getCurrencyKeyIcon } from 'utils';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 2fr repeat(5, 1fr);

  > * {
    justify-content: flex-end;
    &:first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }
`;

const DataText = styled(Flex)`
  display: flex;
  font-size: 16px;
  color: #ffffff;
  align-items: center;
  line-height: 1.4;
`;

const HeaderText = styled(Flex)`
  display: flex;
  font-size: 14px;
  color: #d5d7db;
  letter-spacing: 3px;
  text-transform: uppercase;
  align-items: center;
`;

export default function ExchangeSection() {
  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5}>
        Exchange
      </Typography>

      <List>
        <DashGrid>
          <HeaderText>POOL</HeaderText>
          <HeaderText>APY</HeaderText>
          <HeaderText>PARTICIPANTS</HeaderText>
          <HeaderText>LIQUIDITY</HeaderText>
          <HeaderText>VOLUME (24H)</HeaderText>
          <HeaderText>FEES (24H)</HeaderText>
        </DashGrid>

        <DashGrid my={2}>
          <DataText>
            <Flex alignItems="center">
              <PoolIcon baseCurrencyKey="sICX" quoteCurrencyKey={'bnUSD'} />
              <Text ml={2}>sICX/bnUSD</Text>
            </Flex>
          </DataText>
          <DataText>285%</DataText>
          <DataText>846</DataText>
          <DataText>$1,712,318</DataText>
          <DataText>$1,712,318</DataText>
          <DataText>$1,712,318</DataText>
        </DashGrid>

        <Divider />

        <DashGrid my={2}>
          <DataText>
            <Flex alignItems="center">
              <PoolIcon baseCurrencyKey="sICX" quoteCurrencyKey={'bnUSD'} />
              <Text ml={2}>sICX/bnUSD</Text>
            </Flex>
          </DataText>
          <DataText>285%</DataText>
          <DataText>846</DataText>
          <DataText>$1,712,318</DataText>
          <DataText>$1,712,318</DataText>
          <DataText>$1,712,318</DataText>
        </DashGrid>

        <Divider />

        <DashGrid my={2}>
          <DataText>
            <Flex alignItems="center">
              <PoolIcon baseCurrencyKey="sICX" quoteCurrencyKey={'bnUSD'} />
              <Text ml={2}>sICX/bnUSD</Text>
            </Flex>
          </DataText>
          <DataText>285%</DataText>
          <DataText>846</DataText>
          <DataText>$1,712,318</DataText>
          <DataText>$1,712,318</DataText>
          <DataText>$1,712,318</DataText>
        </DashGrid>
      </List>
    </BoxPanel>
  );
}

const IconWrapper = styled(Box)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgb(12, 42, 77);
  background-color: rgb(20, 74, 104);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PoolIconWrapper = styled(Box)`
  display: flex;
`;

function PoolIcon({
  baseCurrencyKey,
  quoteCurrencyKey,
}: {
  baseCurrencyKey: CurrencyKey;
  quoteCurrencyKey: CurrencyKey;
}) {
  const BaseIcon = getCurrencyKeyIcon(baseCurrencyKey);
  const QuoteIcon = getCurrencyKeyIcon(quoteCurrencyKey);

  return (
    <PoolIconWrapper>
      <IconWrapper>
        <BaseIcon width={30} height={30} />
      </IconWrapper>
      <IconWrapper ml={-2}>
        <QuoteIcon width={30} height={30} />
      </IconWrapper>
    </PoolIconWrapper>
  );
}
