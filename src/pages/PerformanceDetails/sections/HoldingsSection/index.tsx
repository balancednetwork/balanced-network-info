import React, { useState } from 'react';

import { useHoldingsDataQuery, useRatesQuery, LAUNCH_DAY } from 'queries';
import DatePicker from 'react-datepicker';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import CurrencyIcon from 'components/CurrencyIcon';
import { BoxPanel } from 'components/Panel';
import { DatePickerWrap, displayValueOrLoader, getTotalHoldings } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';

import { GridItemToken, GridItemAssetTotal, GridItemHeader, ScrollHelper } from '../../index';
import { StyledSkeleton } from '../EarningSection';

import 'react-datepicker/dist/react-datepicker.css';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));

  const holdingsDataQueryCurrent = useHoldingsDataQuery();
  const holdingsDataQueryPast = useHoldingsDataQuery(
    selectedDate.valueOf() * 1000,
    `holdings-data-${selectedDate.valueOf()}`,
  );
  const { data: holdingsCurrent } = holdingsDataQueryCurrent;
  const { data: holdingsPast } = holdingsDataQueryPast;

  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  return (
    <BoxPanel bg="bg2" mb={10}>
      <Typography variant="h2">Holdings</Typography>
      <ScrollHelper>
        <BalanceGrid>
          <GridItemHeader>Asset</GridItemHeader>
          <GridItemHeader>
            {new Date().toLocaleDateString('en-US', {
              day: '2-digit',
            })}{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </GridItemHeader>
          <GridItemHeader>
            <DatePickerWrap>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="dd MMM yyyy"
                popperClassName="datepicker-popper-wrap"
                popperPlacement="bottom-end"
                minDate={new Date(LAUNCH_DAY / 1000)}
                maxDate={new Date().setDate(new Date().getDate() - 1)}
                popperModifiers={[
                  { name: 'offset', options: { offset: [20, -3] } },
                  {
                    name: 'preventOverflow',
                    options: {
                      rootBoundary: 'body',
                      tether: false,
                      altAxis: true,
                    },
                  },
                ]}
              />
            </DatePickerWrap>
          </GridItemHeader>
        </BalanceGrid>

        {holdingsCurrent &&
          Object.keys(holdingsCurrent).map(contract => {
            const contractInfo = holdingsCurrent[contract].info;
            const contractTokensCount = holdingsCurrent[contract].tokens.integerValue().toNumber();
            const contractTokensCountPast = holdingsPast && holdingsPast[contract]?.tokens.integerValue().toNumber();

            return (
              <BalanceGrid key={contract}>
                <GridItemToken>
                  <Flex alignItems="center">
                    <CurrencyIcon currencyKey={contractInfo.symbol} width={40} height={40} />
                    <Box ml={2}>
                      <Text color="text">{contractInfo.displayName}</Text>
                      <Text color="text" opacity={0.75}>
                        {contractInfo.symbol}
                      </Text>
                    </Box>
                  </Flex>
                </GridItemToken>
                <GridItemToken>
                  <Text color="text">
                    {displayValueOrLoader(contractTokensCount, rates && rates[contractInfo.symbol].toNumber())}
                    <Change percentage={2}>(**+2%)</Change>
                  </Text>
                  <Text color="text" opacity={0.75}>
                    {displayValueOrLoader(contractTokensCount, 1, 'number')}
                    {` ${contractInfo.symbol}`}
                  </Text>
                </GridItemToken>
                <GridItemToken>
                  <Text color="text">
                    {holdingsPast ? (
                      holdingsPast[contract] ? (
                        displayValueOrLoader(contractTokensCountPast, rates && rates[contractInfo.symbol].toNumber())
                      ) : (
                        '-'
                      )
                    ) : (
                      <StyledSkeleton width={120} />
                    )}
                  </Text>
                  <Text color="text" opacity={0.75}>
                    {holdingsPast ? (
                      holdingsPast[contract] &&
                      displayValueOrLoader(contractTokensCountPast, 1, 'number') + ' ' + contractInfo.symbol
                    ) : (
                      <StyledSkeleton width={120} />
                    )}
                  </Text>
                </GridItemToken>
              </BalanceGrid>
            );
          })}

        <BalanceGrid>
          <GridItemAssetTotal>Total</GridItemAssetTotal>
          <GridItemAssetTotal>{getTotalHoldings(holdingsCurrent)}</GridItemAssetTotal>
          <GridItemAssetTotal>{getTotalHoldings(holdingsCurrent)}</GridItemAssetTotal>
        </BalanceGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default HoldingsSection;
