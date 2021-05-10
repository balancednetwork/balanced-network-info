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
  grid-template-columns: 2fr repeat(3, 1fr);

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

const tokensInfo: {
  [key: string]: {
    name: string;
    symbol: string;
  };
} = {
  BALN: {
    name: 'Balance Tokens',
    symbol: 'BALN',
  },
  bnUSD: {
    name: 'Balanced Dollars',
    symbol: 'bnUSD',
  },
  ICX: {
    name: 'ICON',
    symbol: 'ICX',
  },
  sICX: {
    name: 'Staked ICX',
    symbol: 'sICX',
  },
};

export default function TokenSection() {
  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5}>
        Token
      </Typography>

      <List>
        <DashGrid>
          <HeaderText>ASSET</HeaderText>
          <HeaderText>HOLDERS</HeaderText>
          <HeaderText>PRICE (24H)</HeaderText>
          <HeaderText>MARKETCAP</HeaderText>
        </DashGrid>

        {Object.values(tokensInfo).map((token, index, arr) => (
          <div key={token.symbol}>
            <DashGrid my={4}>
              <DataText>
                <Flex alignItems="center">
                  <CurrencyIcon currencyKey={token.symbol} />
                  <Box ml={2}>
                    <Text>{token.name}</Text>
                    <Text>{token.symbol}</Text>
                  </Box>
                </Flex>
              </DataText>
              <DataText>-</DataText>
              <DataText>-</DataText>
              <DataText>-</DataText>
            </DashGrid>

            {index !== arr.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </BoxPanel>
  );
}

function CurrencyIcon({ currencyKey }: { currencyKey: CurrencyKey }) {
  const Icon = getCurrencyKeyIcon(currencyKey);

  return <Icon width={40} height={40} />;
}
