import React, { useState } from 'react';

import { Currency } from '@balancednetwork/sdk-core';
import BigNumber from 'bignumber.js';
import { useRatesQuery, LAUNCH_DAY } from 'queries';
import { useDaoFundHoldings } from 'queries/blockDetails';
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

export const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: 12fr 11fr 11fr;
  align-items: stretch;
  min-width: 600px;
`;

export const Change = styled.span<{ percentage: Number }>`
  ${({ percentage, theme }) => percentage > 0 && `color: ${theme.colors.primaryBright}`}
  ${({ percentage, theme }) => percentage < 0 && `color: ${theme.colors.alert}`}
`;

export const DatePickerInput = ({ ...props }) => <input type="text" {...props} readOnly />;

const HoldingsSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));

  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  let totalCurrent = 0;
  let totalPast = 0;

  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: daoFundHoldings } = useDaoFundHoldings(now);
  const { data: historicDaoFundHoldings } = useDaoFundHoldings(selectedDate.valueOf());

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

        {daoFundHoldings &&
          Object.keys(daoFundHoldings).map(contract => {
            const contractInfo = daoFundHoldings[contract].currency.wrapped;
            const contractBalance = new BigNumber(daoFundHoldings[contract].toFixed());
            const contractHistoricBalance =
              historicDaoFundHoldings &&
              historicDaoFundHoldings[contract] &&
              new BigNumber(historicDaoFundHoldings[contract].toFixed());
            const percentageChange =
              contractHistoricBalance &&
              new BigNumber(100).minus(contractHistoricBalance.times(100).div(contractBalance)).toNumber();

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
                      <CurrencyLogo currency={contractInfo as Currency} size="40px" />
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
                      <Change percentage={percentageChange ?? 0}>{formatPercentage(percentageChange)}</Change>
                    </Text>
                    <Text color="text" opacity={0.75}>
                      <DisplayValueOrLoader value={contractBalance} currencyRate={1} format={'number'} />
                      {` ${contractInfo.symbol}`}
                    </Text>
                  </GridItemToken>
                  <GridItemToken>
                    <Text color="text">
                      {historicDaoFundHoldings ? (
                        historicDaoFundHoldings[contract].greaterThan(0) ? (
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
                      {historicDaoFundHoldings ? (
                        historicDaoFundHoldings[contract].greaterThan(0) ? (
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
            {daoFundHoldings ? (
              <DisplayValueOrLoader value={totalCurrent} currencyRate={1} />
            ) : (
              <StyledSkeleton width={120} />
            )}
          </GridItemAssetTotal>
          <GridItemAssetTotal>
            {historicDaoFundHoldings ? (
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

export default HoldingsSection;
