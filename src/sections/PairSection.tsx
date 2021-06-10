import React from 'react';

import { useAllPairs } from 'queries';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import { CurrencyKey } from 'constants/currency';
import { Typography } from 'theme';
import { getCurrencyKeyIcon } from 'utils';
import { getFormattedNumber } from 'utils/formatter';

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

export default function PairSection() {
  const allPairs = useAllPairs();

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

        {allPairs &&
          Object.values(allPairs).map((pair, index, arr) => (
            <div key={pair.poolId}>
              <DashGrid my={2}>
                <DataText>
                  <Flex alignItems="center">
                    <PoolIcon baseCurrencyKey={pair.baseCurrencyKey} quoteCurrencyKey={pair.quoteCurrencyKey} />
                    <Text ml={2}>{`${pair.baseCurrencyKey} / ${pair.quoteCurrencyKey}`}</Text>
                  </Flex>
                </DataText>
                <DataText>{getFormattedNumber(pair.apy, 'percent0')}</DataText>
                <DataText>{getFormattedNumber(pair.participant, 'number')}</DataText>
                <DataText>{getFormattedNumber(pair.tvl, 'currency0')}</DataText>
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
        <BaseIcon width={25} height={25} />
      </IconWrapper>
      <IconWrapper ml={-2}>
        <QuoteIcon width={25} height={25} />
      </IconWrapper>
    </PoolIconWrapper>
  );
}
