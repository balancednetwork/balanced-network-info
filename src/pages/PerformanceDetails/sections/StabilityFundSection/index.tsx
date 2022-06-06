import React, { useState } from 'react';

import BigNumber from 'bignumber.js';
import { useRatesQuery, LAUNCH_DAY, ONE_DAY } from 'queries';
import { useStabilityFundHoldings } from 'queries/blockDetails';
import DatePicker from 'react-datepicker';
import { Box, Flex, Text } from 'rebass/styled-components';

import CurrencyIcon from 'components/CurrencyIcon';
import { BoxPanel } from 'components/Panel';
import { DatePickerWrap, DisplayValueOrLoader, formatPercantage } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';

import { GridItemToken, GridItemAssetTotal, GridItemHeader, ScrollHelper } from '../../index';
import { StyledSkeleton } from '../EarningSection';
import { BalanceGrid, Change, DatepickerInput } from '../HoldingsSection';

import 'react-datepicker/dist/react-datepicker.css';

const StabilityFundSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));

  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  let totalCurrent = 0;
  let totalPast = 0;

  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: stabilityFundHoldings } = useStabilityFundHoldings(now);
  const { data: historicStabilityFundHoldings } = useStabilityFundHoldings(selectedDate.valueOf());

  return (
    <BoxPanel bg="bg2" mb={10}>
      <Typography variant="h2">Stability fund</Typography>
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
                minDate={new Date((LAUNCH_DAY + ONE_DAY * 382) / 1000)}
                maxDate={new Date().setDate(new Date().getDate() - 1)}
                customInput={<DatepickerInput />}
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

        {stabilityFundHoldings &&
          Object.keys(stabilityFundHoldings).map(contract => {
            const contractInfo = stabilityFundHoldings[contract].info;
            const contractBalance = stabilityFundHoldings[contract].balance;
            const contractHistoricBalance = new BigNumber(
              historicStabilityFundHoldings ? historicStabilityFundHoldings[contract].balance : 0,
            );
            const percentageChange = historicStabilityFundHoldings
              ? 100 - contractHistoricBalance.times(100).div(contractBalance).toNumber()
              : 0;

            if (rates && contractBalance) {
              totalCurrent += contractBalance.times(rates[contractInfo.symbol!]).toNumber();
            }
            if (rates && contractHistoricBalance) {
              totalPast += contractHistoricBalance.times(rates[contractInfo.symbol!]).toNumber();
            }

            return (
              contractBalance.isGreaterThan(0) && (
                <BalanceGrid key={contract}>
                  <GridItemToken>
                    <Flex alignItems="center">
                      <CurrencyIcon currencyKey={contractInfo.symbol!} width={40} height={40} />
                      <Box ml={2}>
                        <Text color="text">{contractInfo.name}</Text>
                        <Text color="text" opacity={0.75}>
                          {contractInfo.symbol}
                        </Text>
                      </Box>
                    </Flex>
                  </GridItemToken>
                  <GridItemToken>
                    <Text color="text">
                      <DisplayValueOrLoader
                        value={contractBalance}
                        currencyRate={rates && rates[contractInfo.symbol!].toNumber()}
                      />
                      <Change percentage={percentageChange}>{formatPercantage(percentageChange)}</Change>
                    </Text>
                    <Text color="text" opacity={0.75}>
                      <DisplayValueOrLoader value={contractBalance} currencyRate={1} format={'number'} />
                      {` ${contractInfo.symbol}`}
                    </Text>
                  </GridItemToken>
                  <GridItemToken>
                    <Text color="text">
                      {historicStabilityFundHoldings ? (
                        historicStabilityFundHoldings[contract] ? (
                          <DisplayValueOrLoader
                            value={contractHistoricBalance}
                            currencyRate={rates && rates[contractInfo.symbol!].toNumber()}
                          />
                        ) : (
                          '-'
                        )
                      ) : (
                        <StyledSkeleton width={120} />
                      )}
                    </Text>
                    <Text color="text" opacity={0.75}>
                      {historicStabilityFundHoldings ? (
                        historicStabilityFundHoldings[contract] ? (
                          <>
                            <DisplayValueOrLoader value={contractHistoricBalance} currencyRate={1} format={'number'} />
                            {` ${contractInfo.symbol}`}
                          </>
                        ) : null
                      ) : (
                        <StyledSkeleton width={120} />
                      )}
                    </Text>
                  </GridItemToken>
                </BalanceGrid>
              )
            );
          })}

        <BalanceGrid>
          <GridItemAssetTotal>Total</GridItemAssetTotal>
          <GridItemAssetTotal>
            {stabilityFundHoldings ? (
              <DisplayValueOrLoader value={totalCurrent} currencyRate={1} />
            ) : (
              <StyledSkeleton width={120} />
            )}
          </GridItemAssetTotal>
          <GridItemAssetTotal>
            {historicStabilityFundHoldings ? (
              <DisplayValueOrLoader value={totalPast} currencyRate={1} />
            ) : (
              <StyledSkeleton width={120} />
            )}
          </GridItemAssetTotal>
        </BalanceGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default StabilityFundSection;
