import React, { useState } from 'react';

import BigNumber from 'bignumber.js';
import { useHoldingsDataQuery, useRatesQuery, LAUNCH_DAY, ONE_DAY } from 'queries';
import DatePicker from 'react-datepicker';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { BoxPanel } from 'components/Panel';
import CurrencyLogo from 'components/shared/CurrencyLogo';
import { DatePickerWrap, DisplayValueOrLoader, formatPercentage } from 'pages/PerformanceDetails/utils';
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
  ${({ percentage, theme }) => percentage > 0 && `color: ${theme.colors.primaryBright}`}
  ${({ percentage, theme }) => percentage < 0 && `color: ${theme.colors.alert}`}
`;

const DatePickerInput = ({ ...props }) => <input type="text" {...props} readOnly />;

const HoldingsSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));

  const { data: holdingsCurrent } = useHoldingsDataQuery();
  const { data: holdingsPast } = useHoldingsDataQuery(
    selectedDate.valueOf() * 1000,
    `holdings-data-${selectedDate.valueOf()}`,
  );

  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  let totalCurrent = 0;
  let totalPast = 0;

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
                minDate={new Date((LAUNCH_DAY + ONE_DAY) / 1000)}
                maxDate={new Date().setDate(new Date().getDate() - 1)}
                customInput={<DatePickerInput />}
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
          Object.keys(holdingsCurrent).map((addr: string) => {
            const token = holdingsCurrent[addr].currency;
            const curAmount = new BigNumber(holdingsCurrent[addr].toFixed());
            const prevAmount = holdingsPast && holdingsPast[addr] && new BigNumber(holdingsPast[addr].toFixed());
            const percentageChange =
              prevAmount && new BigNumber(100).minus(prevAmount.times(100).div(curAmount)).toNumber();

            if (rates && curAmount) {
              totalCurrent += curAmount.times(rates[token.symbol!]).toNumber();
            }
            if (rates && prevAmount) {
              totalPast += prevAmount.times(rates[token.symbol!]).toNumber();
            }

            return (
              <BalanceGrid key={token.symbol}>
                <GridItemToken>
                  <Flex alignItems="center">
                    <CurrencyLogo currency={token} size="40px" />
                    <Box ml={2}>
                      <Text color="text">{token.name}</Text>
                      <Text color="text" opacity={0.75}>
                        {token.symbol}
                      </Text>
                    </Box>
                  </Flex>
                </GridItemToken>
                <GridItemToken>
                  <Text color="text">
                    <DisplayValueOrLoader
                      value={curAmount.toNumber()}
                      currencyRate={rates && rates[token.symbol!].toNumber()}
                    />
                    <Change percentage={percentageChange ?? 0}>{formatPercentage(percentageChange)}</Change>
                  </Text>
                  <Text color="text" opacity={0.75}>
                    <DisplayValueOrLoader value={curAmount.toNumber()} currencyRate={1} format={'number'} />
                    {` ${token?.symbol}`}
                  </Text>
                </GridItemToken>
                <GridItemToken>
                  <Text color="text">
                    {holdingsPast ? (
                      holdingsPast[addr] ? (
                        <DisplayValueOrLoader
                          value={prevAmount?.toNumber()!}
                          currencyRate={rates && rates[token?.symbol!].toNumber()}
                        />
                      ) : (
                        '-'
                      )
                    ) : (
                      <StyledSkeleton width={120} />
                    )}
                  </Text>
                  <Text color="text" opacity={0.75}>
                    {holdingsPast ? (
                      holdingsPast[addr] ? (
                        <>
                          <DisplayValueOrLoader value={prevAmount?.toNumber()} currencyRate={1} format={'number'} />
                          {` ${token.symbol}`}
                        </>
                      ) : null
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
          <GridItemAssetTotal>
            <DisplayValueOrLoader value={totalCurrent === 0 ? undefined : totalCurrent} currencyRate={1} />
          </GridItemAssetTotal>
          <GridItemAssetTotal>
            <DisplayValueOrLoader value={totalPast === 0 ? undefined : totalPast} currencyRate={1} />
          </GridItemAssetTotal>
        </BalanceGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default HoldingsSection;
