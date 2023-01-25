import React, { useState } from 'react';

import { Currency } from '@balancednetwork/sdk-core';
import BigNumber from 'bignumber.js';
import { useRatesQuery, LAUNCH_DAY } from 'queries';
import { useDaoFundHoldings, usePOLData } from 'queries/blockDetails';
import DatePicker from 'react-datepicker';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { BoxPanel } from 'components/Panel';
import CurrencyLogo from 'components/shared/CurrencyLogo';
import PoolLogo from 'components/shared/PoolLogo';
import { DatePickerWrap, DisplayValueOrLoader, formatPercentage } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';

import { GridItemToken, GridItemAssetTotal, GridItemHeader, ScrollHelper } from '../../index';
import { StyledSkeleton } from '../EarningSection';

import 'react-datepicker/dist/react-datepicker.css';

export const BalanceGrid = styled.div<{ minWidth?: number }>`
  display: grid;
  grid-template-columns: 35% 32.5% 32.5%;
  align-items: stretch;
  ${({ minWidth }) => `min-width: ${minWidth || 600}px`};
`;

export const Change = styled.span<{ percentage: Number }>`
  font-size: 14px;
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

  let totalCurrentPOL = 0;
  let totalPastPOL = 0;

  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: holdingsCurrent } = useDaoFundHoldings(now);
  const { data: holdingsPast } = useDaoFundHoldings(selectedDate.valueOf());

  const { data: POLCurrent } = usePOLData(now);
  const { data: POLPast } = usePOLData(selectedDate.valueOf());

  const gridWidth = 850;

  return (
    <BoxPanel bg="bg2" mb={10}>
      <Typography variant="h2">Holdings</Typography>
      <ScrollHelper>
        <BalanceGrid minWidth={gridWidth}>
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
        {holdingsCurrent &&
          Object.keys(holdingsCurrent).map(contract => {
            const token = holdingsCurrent[contract].currency.wrapped;
            const curAmount = new BigNumber(holdingsCurrent[contract].toFixed());
            const prevAmount =
              holdingsPast && holdingsPast[contract] && new BigNumber(holdingsPast[contract].toFixed());
            const percentageChange =
              prevAmount && curAmount.isGreaterThan(prevAmount)
                ? new BigNumber(100).minus(prevAmount.times(100).div(curAmount)).toNumber()
                : prevAmount && prevAmount.isGreaterThan(0)
                ? curAmount.div(prevAmount).minus(1).times(100).toNumber()
                : 0;

            if (rates && curAmount) {
              totalCurrent += curAmount.times(rates[token.symbol!]).toNumber();
            }
            if (rates && prevAmount) {
              totalPast += prevAmount.times(rates[token.symbol!]).toNumber();
            }

            return (
              curAmount.isGreaterThan(0) && (
                <BalanceGrid key={contract} minWidth={gridWidth}>
                  <GridItemToken>
                    <Flex alignItems="center">
                      <CurrencyLogo currency={token as Currency} size="40px" />
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
                      <DisplayValueOrLoader value={curAmount} currencyRate={rates && rates[token.symbol!].toNumber()} />
                      <Change percentage={percentageChange ?? 0}>{formatPercentage(percentageChange)}</Change>
                    </Text>
                    <Text color="text" opacity={0.75}>
                      <DisplayValueOrLoader value={curAmount} currencyRate={1} format={'number'} />
                      {` ${token.symbol}`}
                    </Text>
                  </GridItemToken>
                  <GridItemToken>
                    <Text color="text">
                      {holdingsPast ? (
                        holdingsPast[contract].greaterThan(0) ? (
                          <DisplayValueOrLoader
                            value={prevAmount}
                            currencyRate={rates && rates[token.symbol!].toNumber()}
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
                        holdingsPast[contract].greaterThan(0) ? (
                          <>
                            <DisplayValueOrLoader value={prevAmount} currencyRate={1} format={'number'} />
                            {` ${token.symbol}`}
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
        <BalanceGrid minWidth={gridWidth}>
          <GridItemAssetTotal>Subtotal</GridItemAssetTotal>
          <GridItemAssetTotal>
            {holdingsCurrent ? (
              <DisplayValueOrLoader value={totalCurrent} currencyRate={1} />
            ) : (
              <StyledSkeleton width={120} />
            )}
          </GridItemAssetTotal>
          <GridItemAssetTotal>
            {holdingsPast ? (
              <DisplayValueOrLoader value={totalPast} currencyRate={1} />
            ) : (
              <StyledSkeleton width={120} />
            )}
          </GridItemAssetTotal>
        </BalanceGrid>

        <BalanceGrid minWidth={gridWidth}>
          <GridItemHeader>Pool</GridItemHeader>
        </BalanceGrid>
        {POLCurrent &&
          POLCurrent.map(currentPool => {
            const poolPast = POLPast?.find(pool => pool.id === currentPool.id);
            const percentageChange =
              poolPast && currentPool.liquidity.isGreaterThan(poolPast.liquidity)
                ? new BigNumber(100).minus(poolPast.liquidity.times(100).div(currentPool.liquidity)).toNumber()
                : poolPast && poolPast.liquidity.isGreaterThan(0)
                ? currentPool.liquidity.div(poolPast.liquidity).minus(1).times(100).toNumber()
                : 0;

            totalCurrentPOL += currentPool.liquidity.toNumber();
            if (poolPast) {
              totalPastPOL += poolPast.liquidity.toNumber();
            }

            return (
              currentPool.liquidity.isGreaterThan(0) && (
                <BalanceGrid minWidth={gridWidth} key={currentPool.id}>
                  <GridItemToken>
                    {currentPool.pair && (
                      <Flex alignItems="center">
                        <Box sx={{ minWidth: '95px' }}>
                          <PoolLogo
                            baseCurrency={currentPool.pair.baseToken}
                            quoteCurrency={currentPool.pair.quoteToken}
                          />
                        </Box>
                        <Text
                          ml={2}
                        >{`${currentPool.pair.baseCurrencyKey} / ${currentPool.pair.quoteCurrencyKey}`}</Text>
                      </Flex>
                    )}
                  </GridItemToken>
                  <GridItemToken>
                    <Text color="text">
                      <DisplayValueOrLoader value={currentPool.liquidity} currencyRate={1} />
                      <Change percentage={percentageChange ?? 0}>{formatPercentage(percentageChange)}</Change>
                    </Text>
                    <Text color="text2">{`${currentPool.DAOBaseAmount.toFormat(0)} ${
                      currentPool.pair?.baseCurrencyKey
                    } / ${currentPool.DAOQuoteAmount.toFormat(0)} ${currentPool.pair?.quoteCurrencyKey}`}</Text>
                  </GridItemToken>
                  <GridItemToken>
                    {POLPast && poolPast ? (
                      poolPast.liquidity.isGreaterThan(0) ? (
                        <>
                          <Text color="text">
                            <DisplayValueOrLoader value={poolPast.liquidity} currencyRate={1} />
                          </Text>
                          <Text color="text2">{`${poolPast.DAOBaseAmount.toFormat(0)} ${
                            poolPast.pair?.baseCurrencyKey
                          } / ${poolPast.DAOQuoteAmount.toFormat(0)} ${poolPast.pair?.quoteCurrencyKey}`}</Text>
                        </>
                      ) : (
                        '-'
                      )
                    ) : (
                      <StyledSkeleton width={120} />
                    )}
                  </GridItemToken>
                </BalanceGrid>
              )
            );
          })}
        <BalanceGrid minWidth={gridWidth}>
          <GridItemAssetTotal>Total</GridItemAssetTotal>
          <GridItemAssetTotal>
            {holdingsCurrent ? (
              <DisplayValueOrLoader value={totalCurrent + totalCurrentPOL} currencyRate={1} />
            ) : (
              <StyledSkeleton width={120} />
            )}
          </GridItemAssetTotal>
          <GridItemAssetTotal>
            {holdingsPast ? (
              <DisplayValueOrLoader value={totalPast + totalPastPOL} currencyRate={1} />
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
